export const queryKeys = {
  runs: ["runs"] as const,
  run: (id: string) => ["runs", id] as const,
  evals: ["evals"] as const,
  ops: ["ops"] as const,
  opsRun: (id: string) => ["ops", id] as const,
};
