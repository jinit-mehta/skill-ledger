import { SiweMessage } from "siwe";
import { apiFetch } from "./api";
import { setToken } from "./auth";
import { getSigner } from "./wallet";

/**
 * Performs the Sign-In with Ethereum (SIWE) flow
 * 1. Get nonce from backend
 * 2. Create message
 * 3. Sign message with wallet
 * 4. Verify on backend -> Get JWT
 */
export async function siweLogin(address: string, chainId: number) {
  try {
    // 1. Ask Backend for a Nonce
    const { nonce } = await apiFetch<{ nonce: string }>(`/siwe/nonce/${address}`);

    const domain = window.location.hostname;
    const origin = window.location.origin;

    // 2. Create the SIWE Message
    const msg = new SiweMessage({
      domain,
      address,
      statement: "Sign in to SkillLedger",
      uri: origin,
      version: "1",
      chainId,
      nonce,
    });

    // 3. Sign the message with MetaMask
    const signer = await getSigner();
    const prepared = msg.prepareMessage();
    const signature = await signer.signMessage(prepared);

    // 4. Send Signature to Backend to verify
    const out = await apiFetch<{ address: string; token: string }>(`/verify-wallet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: prepared, signature }),
    });

    // 5. Save the JWT token
    setToken(out.token);
    return out;
  } catch (error) {
    console.error("SIWE Login Failed:", error);
    throw error;
  }
}