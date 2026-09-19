import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/domain/src/**/*.test.ts",
      "packages/schemas/src/**/*.test.ts",
    ],
  },
});
