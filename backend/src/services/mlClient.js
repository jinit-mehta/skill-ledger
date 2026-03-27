import fetch from "node-fetch";
import { config } from "../config.js";

export async function mlInfer(features) {
  const res = await fetch(config.mlInferUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ features })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ML service error: ${txt}`);
  }
  return res.json(); // {ml_score, fraud_prob, final_score, explanation}
}