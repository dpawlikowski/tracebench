#!/usr/bin/env node
/**
 * Lightweight module-boundary check (Phase A/B stand-in for @nx/enforce-module-boundaries).
 *
 * Rules (ARCHITECTURE.md):
 *   domain         → @tracebench/schemas only (no React/Next/fixtures)
 *   contracts      → no other @tracebench packages
 *   fixtures       → schemas only
 *   ui             → schemas optional; no domain/fixtures/evals/web/next
 *   agent-runtime  → domain, schemas, fixtures (no ui/web/next/react)
 *   evals          → schemas, fixtures, agent-runtime (Jev scorer port)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;

/** @type {{ name: string, dir: string, allow: string[], forbidBare: string[] }[]} */
const packages = [
  {
    name: "domain",
    dir: "packages/domain",
    allow: ["@tracebench/schemas"],
    forbidBare: ["react", "react-dom", "next"],
  },
  {
    name: "schemas",
    dir: "packages/schemas",
    allow: [],
    forbidBare: ["react", "react-dom", "next"],
  },
  {
    name: "fixtures",
    dir: "packages/fixtures",
    allow: ["@tracebench/schemas"],
    forbidBare: ["react", "react-dom", "next"],
  },
  {
    name: "ui",
    dir: "packages/ui",
    allow: ["@tracebench/schemas"],
    forbidBare: ["next"],
  },
  {
    name: "agent-runtime",
    dir: "packages/agent-runtime",
    allow: ["@tracebench/domain", "@tracebench/schemas", "@tracebench/fixtures"],
    forbidBare: ["react", "react-dom", "next"],
  },
  {
    name: "evals",
    dir: "packages/evals",
    allow: [
      "@tracebench/schemas",
      "@tracebench/fixtures",
      "@tracebench/agent-runtime",
    ],
    forbidBare: ["react", "react-dom", "next"],
  },
];

const importRe =
  /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".next") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs|cjs)$/.test(name)) out.push(p);
  }
  return out;
}

function workspacePkg(spec) {
  if (!spec.startsWith("@tracebench/")) return null;
  const parts = spec.split("/");
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
}

let failures = 0;

for (const pkg of packages) {
  const abs = join(root, pkg.dir);
  for (const file of walk(abs)) {
    const src = readFileSync(file, "utf8");
    for (const match of src.matchAll(importRe)) {
      const spec = match[1];
      if (!spec || spec.startsWith(".") || spec.startsWith("/")) continue;

      for (const bare of pkg.forbidBare) {
        if (spec === bare || spec.startsWith(`${bare}/`)) {
          console.error(`[boundary] ${pkg.name}: forbidden '${spec}' in ${relative(root, file)}`);
          failures++;
        }
      }

      const ws = workspacePkg(spec);
      if (ws && !pkg.allow.includes(ws)) {
        console.error(
          `[boundary] ${pkg.name}: '${ws}' not allowed (allow: ${pkg.allow.join(", ") || "∅"}) in ${relative(root, file)}`,
        );
        failures++;
      }
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-boundaries: ${failures} violation(s)`);
  process.exit(1);
}
console.log("check-boundaries: ok");
