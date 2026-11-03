import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | undefined;

export function getSql(): NeonQueryFunction<false, false> {
  if (sqlClient) {
    return sqlClient;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to Neon PostgreSQL.");
  }

  sqlClient = neon(databaseUrl);
  return sqlClient;
}