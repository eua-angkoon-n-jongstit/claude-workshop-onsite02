import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/app/api/**/*.test.ts"],
    setupFiles: ["./src/test/setupTestEnv.ts"],
    globalSetup: ["./src/test/globalSetupIntegration.ts"],
    fileParallelism: false, // tests share one Postgres instance and mutate real rows
  },
});
