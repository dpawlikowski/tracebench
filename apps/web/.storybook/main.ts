import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(dirname, "..");
const repoRoot = path.resolve(webRoot, "../..");

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(ts|tsx)",
    "../stories/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "msw-storybook-addon",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  async viteFinal(config) {
    // GitHub Pages project site: https://dpawlikowski.github.io/tracebench/
    const base = process.env.STORYBOOK_BASE_PATH;
    if (base) config.base = base.endsWith("/") ? base : `${base}/`;
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": webRoot,
      "@tracebench/ui": path.join(repoRoot, "packages/ui/src"),
      "@tracebench/schemas": path.join(repoRoot, "packages/schemas/src"),
      "@tracebench/fixtures": path.join(repoRoot, "packages/fixtures/src"),
      "@tracebench/evals": path.join(repoRoot, "packages/evals/src"),
      "@tracebench/domain": path.join(repoRoot, "packages/domain/src"),
      "@tracebench/agent-runtime": path.join(repoRoot, "packages/agent-runtime/src"),
    };
    return config;
  },
};

export default config;
