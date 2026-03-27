import fetch from "node-fetch";
import FormData from "form-data";
import { config } from "../config.js";

export async function ipfsAdd(buffer) {
  const fd = new FormData();
  // Pinata expects the file field to be named 'file'
  fd.append("file", buffer, { filename: "metadata.bin" });
  
  // Optional: Pinata metadata (to give the file a readable name in their dashboard)
  const metadata = JSON.stringify({
    name: "SkillLedger-Resume-Metadata",
  });
  fd.append("pinataMetadata", metadata);

  // Optional: Pinata options
  const options = JSON.stringify({
    cidVersion: 0,
  });
  fd.append("pinataOptions", options);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: config.ipfs.key,
      pinata_secret_api_key: config.ipfs.secret,
      // CRITICAL: Let FormData set the Content-Type with the boundary
      ...fd.getHeaders()
    },
    body: fd
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pinata IPFS error (${res.status}): ${txt}`);
  }

  const json = await res.json();
  return json.IpfsHash; // Pinata returns "IpfsHash"
}