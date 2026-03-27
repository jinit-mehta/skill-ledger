import crypto from "crypto";
import { getPool } from "../db.js";

function newNonce() {
  return crypto.randomBytes(16).toString("hex");
}

export async function upsertNonce(address) {
  const pool = getPool();
  const nonce = newNonce();
  const addr = address.toLowerCase();

  // Insert or update
  await pool.query(
    `INSERT INTO users (address, nonce)
     VALUES (:address, :nonce)
     ON DUPLICATE KEY UPDATE nonce = VALUES(nonce)`,
    { address: addr, nonce }
  );

  return nonce;
}

export async function getUserByAddress(address) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, address, nonce FROM users WHERE address = :address LIMIT 1`,
    { address: address.toLowerCase() }
  );
  return rows[0] || null;
}

export async function rotateNonce(address) {
  const pool = getPool();
  const nonce = newNonce();
  await pool.query(
    `UPDATE users SET nonce = :nonce WHERE address = :address`,
    { nonce, address: address.toLowerCase() }
  );
  return nonce;
}