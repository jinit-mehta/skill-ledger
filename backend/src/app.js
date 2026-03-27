import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { ethers } from "ethers";

import { config } from "./config.js";
import { upload } from "./middleware/upload.js";
import { requireAuth } from "./middleware/auth.js";

import { getNonce, verifySiwe } from "./services/siwe.js";
import { extractPdfText } from "./services/pdf.js";
import { extractFeaturesFromResumeText } from "./services/features.js";
import { encryptJson } from "./services/crypto.js";
import { ipfsAdd } from "./services/ipfs.js";
import { mlInfer } from "./services/mlClient.js";
import { getIface, getReadContract } from "./services/chain.js";

// SQL Models
import { createResume, getResumeById, listResumesByOwner } from "./models/Resume.js";
import { createScore, listScoresByOwner } from "./models/Score.js";
import { listCredentialsByLearner, listCredentialsByIssuer, getInstitutionStats } from "./models/CredentialIndex.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

// --- SIWE ---
app.get("/siwe/nonce/:address", async (req, res, next) => {
  try {
    const address = (req.params.address || "").toLowerCase();
    if (!ethers.isAddress(address)) return res.status(400).json({ error: "bad address" });

    const nonce = await getNonce(address);
    res.json({ nonce });
  } catch (e) {
    next(e);
  }
});

// Utility: Extract address from PDF (for Employer verification)
app.post("/utility/extract-address", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "missing file" });
    const text = await extractPdfText(req.file.buffer);

    // Simple regex for ETH address
    const match = text.match(/0x[a-fA-F0-9]{40}/);
    const address = match ? match[0] : null;

    res.json({ address });
  } catch (e) {
    next(e);
  }
});

// Utility: Analyze PDF (Features + Score) without saving
app.post("/utility/analyze-pdf", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "missing file" });
    const text = await extractPdfText(req.file.buffer);
    const features = extractFeaturesFromResumeText(text);

    // Get ML score
    const ml = await mlInfer(features);

    // Check for address too
    const match = text.match(/0x[a-fA-F0-9]{40}/);
    const address = match ? match[0] : null;

    res.json({
      address,
      features,
      ml
    });
  } catch (e) {
    next(e);
  }
});

app.post("/verify-wallet", async (req, res, next) => {
  try {
    const schema = z.object({ message: z.string(), signature: z.string() });
    const { message, signature } = schema.parse(req.body);
    const out = await verifySiwe({ message, signature });
    res.json(out);
  } catch (e) {
    next(e);
  }
});

// --- Upload Resume ---
app.post("/upload-resume", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "missing file" });

    const ownerAddress = req.user.address.toLowerCase();
    const extractedText = await extractPdfText(req.file.buffer);
    const features = extractFeaturesFromResumeText(extractedText);

    const payload = {
      ownerAddress,
      filename: req.file.originalname,
      extractedText,
      features,
      createdAt: new Date().toISOString(),
    };

    // Encrypt + IPFS
    const encrypted = encryptJson(payload);
    const cid = await ipfsAdd(encrypted);

    // On-chain linkage hash (bytes32)
    const encryptedIpfsCidHash = ethers.keccak256(ethers.toUtf8Bytes(cid));

    // Save to MySQL
    const resumeId = await createResume({
      ownerAddress,
      originalFilename: req.file.originalname,
      extractedText,
      features,
      encryptedIpfsCid: cid,
      encryptedIpfsCidHash,
    });

    res.json({
      resumeId: String(resumeId),
      encryptedIpfsCid: cid,
      encryptedIpfsCidHash,
      features,
    });
  } catch (e) {
    next(e);
  }
});

// --- Score Resume ---
app.post("/score", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ resumeId: z.string() });
    const { resumeId } = schema.parse(req.body);

    const ownerAddress = req.user.address.toLowerCase();

    const resume = await getResumeById(resumeId);
    if (!resume) return res.status(404).json({ error: "resume not found" });
    if (resume.ownerAddress !== ownerAddress) return res.status(403).json({ error: "not yours" });

    const ml = await mlInfer(resume.features);

    const scoreId = await createScore({
      ownerAddress,
      resumeId: resume.id,
      mlScore: ml.ml_score,
      fraudProb: ml.fraud_prob,
      finalScore: ml.final_score,
      explanation: ml.explanation,
    });

    res.json({
      scoreId: String(scoreId),
      ml_score: ml.ml_score,
      fraud_prob: ml.fraud_prob,
      final_score: ml.final_score,
      explanation: ml.explanation,
      encryptedIpfsCidHash: resume.encryptedIpfsCidHash,
    });
  } catch (e) {
    next(e);
  }
});

// --- Chain Reads (safe even if contract not deployed; will error if RPC/addr wrong) ---
app.get("/verify-credential/:tokenId", async (req, res, next) => {
  try {
    const c = getReadContract();
    const out = await c.verifyCredential(req.params.tokenId);
    res.json({
      valid: out[0],
      learner: out[1],
      issuer: out[2],
      credentialHash: out[3],
      issuedAt: Number(out[4]),
    });
  } catch (e) {
    next(e);
  }
});

app.get("/reputation/:learner", async (req, res, next) => {
  try {
    const learner = (req.params.learner || "").toLowerCase();
    if (!ethers.isAddress(learner)) return res.status(400).json({ error: "bad address" });

    const c = getReadContract();
    const [score, breakdown] = await Promise.all([
      c.reputationScore(learner),
      c.reputationBreakdown(learner),
    ]);

    res.json({
      learner,
      score: Number(score),
      breakdown: {
        base: Number(breakdown[0]),
        credentialPart: Number(breakdown[1]),
        contributionPart: Number(breakdown[2]),
        total: Number(breakdown[3]),
      },
    });
  } catch (e) {
    // If contract isn’t deployed yet, don’t kill employer view:
    res.json({ learner: req.params.learner, score: 0, breakdown: { base: 0, credentialPart: 0, contributionPart: 0, total: 0 } });
  }
});

// --- Institution: prepare calldata (frontend sends tx) ---
app.post("/institution/issue", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      learner: z.string(),
      credentialHash: z.string(),
      level: z.number().int().min(1).max(100),
      category: z.number().int().min(0).max(65535),
    });
    const body = schema.parse(req.body);

    if (!ethers.isAddress(body.learner)) return res.status(400).json({ error: "bad learner" });
    if (!/^0x[0-9a-fA-F]{64}$/.test(body.credentialHash)) return res.status(400).json({ error: "bad credentialHash bytes32" });

    const iface = getIface();
    const data = iface.encodeFunctionData("issueCredential", [
      body.learner,
      body.credentialHash,
      body.level,
      body.category,
    ]);

    res.json({ to: config.chain.contractAddress, data, value: "0x0" });
  } catch (e) {
    next(e);
  }
});

// --- Indexed credentials (from SQL event index table) ---
app.get("/indexed/credentials/:learner", async (req, res, next) => {
  try {
    const learner = (req.params.learner || "").toLowerCase();
    const creds = await listCredentialsByLearner(learner);
    res.json({ learner, credentials: creds });
  } catch (e) {
    next(e);
  }
});

// --- Institution Dashboard Data ---
app.get("/institution/stats", requireAuth, async (req, res, next) => {
  try {
    const issuer = req.user.address;
    const stats = await getInstitutionStats(issuer);
    // Mock courses count for now or derive
    res.json({
      ...stats, // issuedCount, learnerCount
      activeLearners: stats.learnerCount, // simple proxy
      totalCourses: 5, // Mock for now as we don't have courses table
      pendingIssuances: 0 // Mock
    });
  } catch (e) {
    next(e);
  }
});

app.get("/institution/recent", requireAuth, async (req, res, next) => {
  try {
    const issuer = req.user.address;
    const recents = await listCredentialsByIssuer(issuer);
    res.json({ recents });
  } catch (e) {
    next(e);
  }
});

// --- Me ---
app.get("/me/resumes", requireAuth, async (req, res, next) => {
  try {
    const resumes = await listResumesByOwner(req.user.address.toLowerCase());
    res.json({ resumes });
  } catch (e) {
    next(e);
  }
});

app.get("/me/scores", requireAuth, async (req, res, next) => {
  try {
    const scores = await listScoresByOwner(req.user.address.toLowerCase());
    res.json({ scores });
  } catch (e) {
    next(e);
  }
});