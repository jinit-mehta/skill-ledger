import { ethers } from "ethers";
import { config } from "../config.js";

export const skillLedgerAbi = [
  "event CredentialIssued(uint256 indexed tokenId,address indexed learner,address indexed issuer,bytes32 credentialHash,uint16 level,uint16 category,uint64 issuedAt)",
  "event CredentialRevoked(uint256 indexed tokenId,address indexed issuer,uint64 revokedAt)",
  "function verifyCredential(uint256 tokenId) view returns (bool,address,address,bytes32,uint64)",
  "function reputationScore(address learner) view returns (uint256)",
  "function reputationBreakdown(address learner) view returns (uint256,uint256,uint256,uint256)",
  "function credentialsOf(address learner) view returns (uint256[] memory)",
  "function issueCredential(address learner, bytes32 credentialHash, uint16 level, uint16 category) returns (uint256)"
];

export function getProvider() {
  return new ethers.JsonRpcProvider(config.chain.rpc);
}

export function getReadContract() {
  return new ethers.Contract(config.chain.contractAddress, skillLedgerAbi, getProvider());
}

export function getIface() {
  return new ethers.Interface(skillLedgerAbi);
}