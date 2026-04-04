import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Debug
console.log(
  "DB:",
  process.env.DATABASE_URL ? "Connected config loaded ✅" : "Missing ❌",
);
