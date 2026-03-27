import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    req.user = jwt.verify(token, config.jwtSecret); // { address }
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}