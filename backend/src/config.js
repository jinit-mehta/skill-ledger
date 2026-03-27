import dotenv from "dotenv";
dotenv.config();

function must(v, name) {
  if (v === undefined || v === null) throw new Error(`Missing env: ${name}`);
  return v;
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8080),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  jwtSecret: must(process.env.JWT_SECRET, "JWT_SECRET"),
  
  siwe: {
    domain: must(process.env.SIWE_DOMAIN, "SIWE_DOMAIN"),
    origin: must(process.env.SIWE_ORIGIN, "SIWE_ORIGIN")
  },
  
  chain: {
    rpc: must(process.env.CHAIN_RPC, "CHAIN_RPC"),
    chainId: Number(must(process.env.CHAIN_ID, "CHAIN_ID")),
    contractAddress: must(process.env.CONTRACT_ADDRESS, "CONTRACT_ADDRESS")
  },
  
  ipfs: {
    key: must(process.env.IPFS_PROJECT_ID, "IPFS_PROJECT_ID"),
    secret: must(process.env.IPFS_PROJECT_SECRET, "IPFS_PROJECT_SECRET")
  },
  
  metadataEncKey: must(process.env.METADATA_ENC_KEY, "METADATA_ENC_KEY"),
  mlInferUrl: must(process.env.ML_INFER_URL, "ML_INFER_URL"),
  
  mysql: {
    host: must(process.env.MYSQL_HOST, "MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT || 8889),
    user: must(process.env.MYSQL_USER, "MYSQL_USER"),
    // Allow empty password for MAMP default setup
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '',
    database: must(process.env.MYSQL_DATABASE, "MYSQL_DATABASE")
  }
};