import { apiFetch, authHeaders } from "./api";
import { getToken } from "./auth";

export type UploadResumeResponse = {
  resumeId: string;
  encryptedIpfsCid: string;
  encryptedIpfsCidHash: string;
  features: Record<string, number>;
};

export type ScoreResponse = {
  scoreId: string;
  ml_score: number;
  fraud_prob: number;
  final_score: number;
  explanation: any;
  encryptedIpfsCidHash: string;
};

export async function uploadResumePdf(file: File): Promise<UploadResumeResponse> {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);

  return apiFetch<UploadResumeResponse>(`/upload-resume`, {
    method: "POST",
    headers: { ...authHeaders(token) },
    body: fd
  });
}

export async function scoreResume(resumeId: string): Promise<ScoreResponse> {
  const token = getToken();
  return apiFetch<ScoreResponse>(`/score`, {
    method: "POST",
    headers: { "content-type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ resumeId })
  });
}

export async function getChainReputation(learner: string) {
  return apiFetch<{ learner: string; score: number; breakdown: any }>(`/reputation/${learner}`);
}

// Institution
export async function prepareCredentialIssuance(body: {
  learner: string;
  credentialHash: string;
  level: number;
  category: number;
}) {
  const token = getToken();
  return apiFetch<{ to: string; data: string; value: string }>("/institution/issue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });
}

export async function getInstitutionStats() {
  const token = getToken();
  return apiFetch<any>("/institution/stats", {
    headers: { ...authHeaders(token) }
  });
}

export async function getInstitutionRecent() {
  const token = getToken();
  return apiFetch<any>("/institution/recent", {
    headers: { ...authHeaders(token) }
  });
}

export async function getMyCredentials() {
  const token = getToken();
  return apiFetch<{ learner: string; credentials: any[] }>("/me/credentials", {
    headers: { ...authHeaders(token) }
  });
}