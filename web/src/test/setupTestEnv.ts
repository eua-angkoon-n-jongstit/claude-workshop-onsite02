import "dotenv/config";

// Integration tests must never touch the real Supabase project — point the
// app's runtime env vars at the disposable Postgres from docker-compose.yml
// before any test file imports the Prisma singleton.
const testUrl = process.env.DATABASE_URL_TEST;
if (testUrl) {
  process.env.DATABASE_URL = testUrl;
  process.env.DIRECT_URL = testUrl;
}
