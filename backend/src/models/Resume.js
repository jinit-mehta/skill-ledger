import { getPool } from "../db.js";

export async function createResume({
  ownerAddress,
  originalFilename,
  extractedText,
  features,
  encryptedIpfsCid,
  encryptedIpfsCidHash
}) {
  const pool = getPool();

  const [result] = await pool.query(
    `INSERT INTO resumes
      (owner_address, original_filename, extracted_text, features_json, encrypted_ipfs_cid, encrypted_ipfs_cid_hash)
     VALUES
      (:owner, :fn, :text, :features, :cid, :cidHash)`,
    {
      owner: ownerAddress.toLowerCase(),
      fn: originalFilename || null,
      text: extractedText || null,
      features: JSON.stringify(features || {}),
      cid: encryptedIpfsCid || null,
      cidHash: encryptedIpfsCidHash || null
    }
  );

  return Number(result.insertId);
}

export async function getResumeById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM resumes WHERE id = :id LIMIT 1`,
    { id: Number(id) }
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    ownerAddress: r.owner_address,
    originalFilename: r.original_filename,
    extractedText: r.extracted_text,
    features: typeof r.features_json === "string" ? JSON.parse(r.features_json) : r.features_json,
    encryptedIpfsCid: r.encrypted_ipfs_cid,
    encryptedIpfsCidHash: r.encrypted_ipfs_cid_hash,
    createdAt: r.created_at
  };
}

export async function listResumesByOwner(ownerAddress) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, owner_address, original_filename, encrypted_ipfs_cid, encrypted_ipfs_cid_hash, created_at
     FROM resumes
     WHERE owner_address = :owner
     ORDER BY created_at DESC`,
    { owner: ownerAddress.toLowerCase() }
  );
  return rows.map(r => ({
    id: r.id,
    ownerAddress: r.owner_address,
    originalFilename: r.original_filename,
    encryptedIpfsCid: r.encrypted_ipfs_cid,
    encryptedIpfsCidHash: r.encrypted_ipfs_cid_hash,
    createdAt: r.created_at
  }));
}