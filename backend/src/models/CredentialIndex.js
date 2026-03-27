import { getPool } from "../db.js";

export async function upsertCredentialIndex({
  tokenId,
  learner,
  issuer,
  credentialHash,
  issuedAt,
  revoked
}) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO credential_index
      (token_id, learner, issuer, credential_hash, issued_at, revoked)
     VALUES
      (:tokenId, :learner, :issuer, :credentialHash, :issuedAt, :revoked)
     ON DUPLICATE KEY UPDATE
      learner=VALUES(learner),
      issuer=VALUES(issuer),
      credential_hash=VALUES(credential_hash),
      issued_at=VALUES(issued_at),
      revoked=VALUES(revoked)`,
    {
      tokenId: String(tokenId),
      learner: learner.toLowerCase(),
      issuer: issuer.toLowerCase(),
      credentialHash,
      issuedAt: Number(issuedAt),
      revoked: revoked ? 1 : 0
    }
  );
}

export async function markRevoked(tokenId) {
  const pool = getPool();
  await pool.query(
    `UPDATE credential_index SET revoked=1 WHERE token_id = :tokenId`,
    { tokenId: String(tokenId) }
  );
}

export async function listCredentialsByLearner(learner) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT token_id, learner, issuer, credential_hash, issued_at, revoked, updated_at
     FROM credential_index
     WHERE learner = :learner
     ORDER BY issued_at DESC`,
    { learner: learner.toLowerCase() }
  );
  return rows;
}

export async function listCredentialsByIssuer(issuer) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT token_id, learner, issuer, credential_hash, issued_at, revoked
     FROM credential_index
     WHERE issuer = :issuer
     ORDER BY issued_at DESC
     LIMIT 50`,
    { issuer: issuer.toLowerCase() }
  );
  return rows;
}

export async function getInstitutionStats(issuer) {
  const pool = getPool();
  // Count issued
  const [[{ count: issuedCount }]] = await pool.query(
    `SELECT COUNT(*) as count FROM credential_index WHERE issuer = :issuer`,
    { issuer: issuer.toLowerCase() }
  );

  // Count unique learners
  const [[{ count: learnerCount }]] = await pool.query(
    `SELECT COUNT(DISTINCT learner) as count FROM credential_index WHERE issuer = :issuer`,
    { issuer: issuer.toLowerCase() }
  );

  return { issuedCount, learnerCount };
}