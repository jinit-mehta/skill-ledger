import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { getUserByAddress, rotateNonce, upsertNonce } from "../models/User.js";

export async function getNonce(address) {
  return upsertNonce(address);
}

export async function verifySiwe({ message, signature }) {
  const siwe = new SiweMessage(message);
  const fields = await siwe.verify({ signature });

  const addr = fields.data.address.toLowerCase();

  // Security checks
  if (fields.data.domain !== config.siwe.domain) {
    throw new Error("Domain mismatch");
  }
  if (fields.data.uri !== config.siwe.origin) {
    throw new Error("Origin mismatch");
  }

  const u = await getUserByAddress(addr);
  if (!u) throw new Error("User not found");
  if (fields.data.nonce !== u.nonce) throw new Error("Invalid nonce");

  await rotateNonce(addr);

  const token = jwt.sign({ address: addr }, config.jwtSecret, { expiresIn: "2h" });
  return { address: addr, token };
}