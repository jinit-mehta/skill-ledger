import { ethers } from "ethers";

export async function connectWallet(): Promise<{ address: string; chainId: number }> {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(eth);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return { address, chainId: Number(network.chainId) };
}

export async function getSigner() {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(eth);
  return provider.getSigner();
}