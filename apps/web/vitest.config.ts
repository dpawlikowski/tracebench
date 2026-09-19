import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Storybook stories-as-tests (browser / Playwright Chromium).
// Package unit tests stay under packages via root `pnpm test`.
export default defineConfig({
  resolve: {
    alias: {
      "@": dirname,
      "@tracebench/ui": path.resolve(dirname, "../../packages/ui/src"),
      "@tracebench/schemas": path.resolve(dirname, "../../packages/schemas/src"),
      "@tracebench/fixtures": path.resolve(dirname, "../../packages/fixtures/src"),
      "@tracebench/evals": path.resolve(dirname, "../../packages/evals/src"),
      "@tracebench/domain": path.resolve(dirname, "../../packages/domain/src"),
      "@tracebench/agent-runtime": path.resolve(
        dirname,
        "../../packages/agent-runtime/src",
      ),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "contracts",
          environment: "node",
          include: ["lib/contracts/**/*.test.ts"],
          setupFiles: [],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
            storybookUrl: "http://127.0.0.1:6006",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
