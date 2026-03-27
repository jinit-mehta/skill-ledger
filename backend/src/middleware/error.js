export function errorHandler(err, req, res, next) {
  console.error("API error:", err);

  // If headers already sent
  if (res.headersSent) return next(err);

  const msg = typeof err?.message === "string" ? err.message : "server error";

  // Helpful MySQL errors
  if (msg.includes("ECONNREFUSED")) return res.status(500).json({ error: "MySQL connection refused", details: msg });
  if (msg.includes("ER_NO_SUCH_TABLE")) return res.status(500).json({ error: "MySQL table missing", details: msg });
  if (msg.includes("ER_BAD_DB_ERROR")) return res.status(500).json({ error: "MySQL database missing", details: msg });

  // Helpful Pinata errors
  if (msg.toLowerCase().includes("pinata")) return res.status(502).json({ error: "IPFS/Pinata error", details: msg });

  return res.status(500).json({ error: msg });
}