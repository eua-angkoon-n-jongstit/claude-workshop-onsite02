import { execSync } from "node:child_process";
import "dotenv/config";

// Runs once before the integration suite: applies migrations to the
// disposable test DB (docker-compose.yml's test-db service must already be
// running — see package.json's test:integration script).
export default function setup() {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error(
      "DATABASE_URL_TEST must be set (see .env.example) to run integration tests",
    );
  }
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: testUrl, DIRECT_URL: testUrl },
  });
}
