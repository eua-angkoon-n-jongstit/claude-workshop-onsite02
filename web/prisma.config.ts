import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // migrations run against the direct (non-pooled) connection;
    // the app's runtime driver adapter uses DATABASE_URL (pooled) instead — see src/lib/prisma.ts
    url: process.env["DIRECT_URL"],
  },
});
