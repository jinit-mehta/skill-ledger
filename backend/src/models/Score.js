import { getPool } from "../db.js";

export async function createScore({
  ownerAddress,
  resumeId,
  mlScore,
  fraudProb,
  finalScore,
  explanation
}) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO scores
      (owner_address, resume_id, ml_score, fraud_prob, final_score, explanation_json)
     VALUES
      (:owner, :resumeId, :mlScore, :fraudProb, :finalScore, :explain)`,
    {
      owner: ownerAddress.toLowerCase(),
      resumeId: Number(resumeId),
      mlScore,
      fraudProb,
      finalScore,
      explain: JSON.stringify(explanation || {})
    }
  );
  return Number(result.insertId);
}

export async function listScoresByOwner(ownerAddress) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, owner_address, resume_id, ml_score, fraud_prob, final_score, explanation_json, created_at
     FROM scores
     WHERE owner_address = :owner
     ORDER BY created_at DESC`,
    { owner: ownerAddress.toLowerCase() }
  );
  return rows.map(r => ({
    id: r.id,
    ownerAddress: r.owner_address,
    resumeId: r.resume_id,
    mlScore: r.ml_score,
    fraudProb: r.fraud_prob,
    finalScore: r.final_score,
    explanation: typeof r.explanation_json === "string" ? JSON.parse(r.explanation_json) : r.explanation_json,
    createdAt: r.created_at
  }));
}