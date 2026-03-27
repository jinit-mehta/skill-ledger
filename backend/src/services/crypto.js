import crypto from "crypto";
import { config } from "../config.js";

function keyBytes() {
  const k = config.metadataEncKey;
  if (/^[0-9a-fA-F]{64}$/.test(k)) return Buffer.from(k, "hex");
  return Buffer.from(k, "base64");
}

// Format: iv(12) | tag(16) | ciphertext(N)
export function encryptJson(obj) {
  const iv = crypto.randomBytes(12);
  const key = keyBytes();

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptToJson(buf) {
  const key = keyBytes();
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}