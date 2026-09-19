import type { ToolDefinition } from "@tracebench/schemas";

export const TOOL_CATALOG: ToolDefinition[] = [
  {
    name: "search_docs",
    description: "Search internal ops & policy documentation",
    risk: "low",
    irreversible: false,
    requiresApproval: false,
    category: "read",
  },
  {
    name: "list_accounts",
    description: "List merchant / ledger accounts with balances",
    risk: "low",
    irreversible: false,
    requiresApproval: false,
    category: "read",
  },
  {
    name: "draft_email",
    description: "Draft an outbound email to a counterparty",
    risk: "medium",
    irreversible: false,
    requiresApproval: true,
    category: "communicate",
  },
  {
    name: "write_file",
    description: "Write a file to the ops shared workspace",
    risk: "medium",
    irreversible: false,
    requiresApproval: true,
    category: "write",
  },
  {
    name: "execute_payment",
    description: "Execute an irreversible payment / transfer",
    risk: "high",
    irreversible: true,
    requiresApproval: true,
    category: "execute",
  },
  {
    name: "deploy_config",
    description: "Deploy configuration to production services",
    risk: "high",
    irreversible: true,
    requiresApproval: true,
    category: "execute",
  },
];

export function getTool(name: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find((t) => t.name === name);
}
