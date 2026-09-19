import { defineConfig } from "checkly";
import { Frequency } from "checkly/constructs";

/**
 * Monitoring-as-Code scaffold for Tracebench.
 * Checkly account is OPTIONAL — this config is valid locally.
 *
 * Dry-run (needs login):  ENVIRONMENT_URL=… pnpm exec checkly test
 * Deploy:                 ENVIRONMENT_URL=… pnpm exec checkly deploy
 *
 * Target URL resolution (checks read the same env):
 *   ENVIRONMENT_URL  → preferred (Checkly deploy preview / CI)
 *   CHECKLY_BASE_URL → alias
 *   default          → http://127.0.0.1:3000 (local smoke only)
 *
 * Prod Demo Mode: https://tracebench.vercel.app
 * GitHub Pages hosts Storybook only — do not point these checks at
 * https://dpawlikowski.github.io/tracebench/ (not the full Next app).
 */
const config = defineConfig({
  projectName: "Tracebench",
  logicalId: "tracebench",
  repoUrl: "https://github.com/dpawlikowski/tracebench",
  checks: {
    frequency: Frequency.EVERY_10M,
    locations: ["eu-west-1", "us-east-1"],
    tags: ["tracebench", "portfolio"],
    runtimeId: "2024.02",
    checkMatch: "**/__checks__/**/*.check.ts",
    browserChecks: {
      testMatch: "**/__checks__/**/*.spec.ts",
    },
  },
  cli: {
    runLocation: "eu-west-1",
    reporters: ["list"],
  },
});

export default config;
