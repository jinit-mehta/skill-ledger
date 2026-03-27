import { apiFetch, authHeaders } from "./api";
import { getToken } from "./auth";
import { getSigner } from "./wallet";

export async function prepareIssueTx(payload: {
  learner: string;
  credentialHash: string;
  level: number;
  category: number;
}) {
  const token = getToken();
  return apiFetch<{ to: string; data: string; value: string }>(`/institution/issue`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload)
  });
}

export async function sendPreparedTx(tx: { to: string; data: string; value: string }) {
  const signer = await getSigner();
  const resp = await signer.sendTransaction({
    to: tx.to,
    data: tx.data,
    value: BigInt(tx.value)
  });
  return resp.wait();
}