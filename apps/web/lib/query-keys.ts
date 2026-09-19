export const queryKeys = {
  runs: ["runs"] as const,
  run: (id: string) => ["runs", id] as const,
  evals: ["evals"] as const,
};
