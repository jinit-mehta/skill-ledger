import { getReadContract } from "./chain.js";
import { upsertCredentialIndex, markRevoked } from "../models/CredentialIndex.js";

export async function startEventIndexer() {
  const c = getReadContract();

  c.on("CredentialIssued", async (tokenId, learner, issuer, credentialHash, level, category, issuedAt) => {
    try {
      await upsertCredentialIndex({
        tokenId: tokenId.toString(),
        learner,
        issuer,
        credentialHash,
        issuedAt: Number(issuedAt),
        revoked: false
      });
    } catch (e) {
      console.error("CredentialIssued index error:", e);
    }
  });

  c.on("CredentialRevoked", async (tokenId) => {
    try {
      await markRevoked(tokenId.toString());
    } catch (e) {
      console.error("CredentialRevoked index error:", e);
    }
  });

  console.log("Event indexer started");
}