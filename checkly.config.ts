import { defineConfig } from "checkly";
import { Frequency } from "checkly/constructs";

/**
 * Monitoring-as-Code scaffold for Tracebench.
 * Checkly account is OPTIONAL — this config is valid locally.
 *
 * Dry-run (needs login):  pnpm exec checkly test
 * Deploy:                 pnpm exec checkly deploy
 *
 * Browser checks under __checks__/*.spec.ts reuse critical Playwright journey concepts
 * (homepage, runs list, health API). Point ENVIRONMENT_URL at a deployed instance.
 */
const config = defineConfig({
  projectName: "Tracebench",
  logicalId: "tracebench",
  repoUrl: "https://github.com/dominikpawlikowski/tracebench",
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
