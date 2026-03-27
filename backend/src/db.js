import mysql from "mysql2/promise";
import { config } from "./config.js";

let pool;

/** Create a single shared pool */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      connectionLimit: 10,
      namedPlaceholders: true
    });
  }
  return pool;
}

export async function connectDb() {
  const p = getPool();
  await p.query("SELECT 1");
  console.log("MySQL connected");
}