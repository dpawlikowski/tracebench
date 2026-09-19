import { assign, fromCallback, fromPromise, setup } from "xstate";
import type { AgentRun } from "@tracebench/schemas";
import { createSseJsonParser, parseStreamFrame, timelineIdFromFrame } from "@/lib/sse";
import { postApproval } from "@/lib/api";

export type RunFlowContext = {
  run: AgentRun;
  visibleIds: string[];
  activeApprovalId: string | null;
  pendingDecision: "approved" | "denied" | null;
  error: string | null;
  speed: number;
};

export type RunFlowEvent =
  | { type: "REPLAY" }
  | { type: "SHOW_ALL" }
  | { type: "EVENT_VISIBLE"; id: string }
  | { type: "SNAPSHOT"; run: AgentRun }
  | { type: "REPLAY_DONE" }
  | { type: "REPLAY_ERROR"; message: string }
  | { type: "OPEN_APPROVAL"; approvalId: string }
  | { type: "CLOSE_APPROVAL" }
  | { type: "DECIDE"; decision: "approved" | "denied" }
  | { type: "SYNC_RUN"; run: AgentRun };

function pendingApprovals(run: AgentRun) {
  return run.approvals.filter((a) => a.status === "pending");
}

function isTerminal(status: AgentRun["status"]) {
  return (
    status === "succeeded" ||
    status === "failed" ||
    status === "cancelled" ||
    status === "denied"
  );
}

type ReplayInput = { run: AgentRun; speed: number };

const replayStream = fromCallback<RunFlowEvent, ReplayInput>(({ sendBack, input }) => {
  const ac = new AbortController();
  const { run, speed } = input;

  void (async () => {
    try {
      const res = await fetch(`/api/runs/${run.id}/stream?speed=${speed}`, {
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error("Stream unavailable");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const sse = createSseJsonParser();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const payloads = sse.push(decoder.decode(value, { stream: true }));
        for (const raw of payloads) {
          const parsed = parseStreamFrame(raw);
          if (parsed.kind !== "frame") continue;
          const { frame } = parsed;
          if (frame.type === "snapshot") {
            sendBack({ type: "SNAPSHOT", run: frame.run });
            continue;
          }
          if (frame.type === "error") {
            sendBack({ type: "REPLAY_ERROR", message: frame.message });
            continue;
          }
          const tid = timelineIdFromFrame(frame);
          if (tid) sendBack({ type: "EVENT_VISIBLE", id: tid });
        }
      }
      if (!ac.signal.aborted) sendBack({ type: "REPLAY_DONE" });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      try {
        for (const step of run.replayPlan) {
          if (ac.signal.aborted) return;
          await new Promise((r) => setTimeout(r, Math.round(step.delayMs / speed)));
          sendBack({ type: "EVENT_VISIBLE", id: step.eventId });
        }
        if (!ac.signal.aborted) {
          sendBack({
            type: "REPLAY_ERROR",
            message: e instanceof Error ? e.message : "Replay failed",
          });
          sendBack({ type: "REPLAY_DONE" });
        }
      } catch {
        if (!ac.signal.aborted) {
          sendBack({
            type: "REPLAY_ERROR",
            message: e instanceof Error ? e.message : "Replay failed",
          });
        }
      }
    }
  })();

  return () => ac.abort();
});

type DecideInput = {
  runId: string;
  approvalId: string;
  decision: "approved" | "denied";
};

const decideApprovalActor = fromPromise<AgentRun, DecideInput>(async ({ input }) => {
  return postApproval(input.runId, input.approvalId, input.decision);
});

export const runFlowMachine = setup({
  types: {
    context: {} as RunFlowContext,
    events: {} as RunFlowEvent,
    input: {} as { run: AgentRun; speed?: number },
  },
  actors: {
    replayStream,
    decideApprovalActor,
  },
  guards: {
    hasPending: ({ context }) => pendingApprovals(context.run).length > 0,
    isTerminal: ({ context }) => isTerminal(context.run.status),
    lastWasDenied: ({ context }) => context.pendingDecision === "denied",
  },
  actions: {
    clearVisible: assign({ visibleIds: () => [] as string[] }),
    showAll: assign({
      visibleIds: ({ context }) => context.run.timeline.map((e) => e.id),
      error: () => null,
    }),
    addVisible: assign({
      visibleIds: ({ context, event }) => {
        if (event.type !== "EVENT_VISIBLE") return context.visibleIds;
        if (context.visibleIds.includes(event.id)) return context.visibleIds;
        return [...context.visibleIds, event.id];
      },
    }),
    setRunFromSnapshot: assign({
      run: ({ context, event }) =>
        event.type === "SNAPSHOT" ? event.run : context.run,
    }),
    syncRun: assign({
      run: ({ context, event }) =>
        event.type === "SYNC_RUN" ? event.run : context.run,
    }),
    setActive: assign({
      activeApprovalId: ({ event }) =>
        event.type === "OPEN_APPROVAL" ? event.approvalId : null,
      error: () => null,
    }),
    clearActive: assign({
      activeApprovalId: () => null,
    }),
    stashDecision: assign({
      pendingDecision: ({ event }) =>
        event.type === "DECIDE" ? event.decision : null,
    }),
    setReplayError: assign({
      error: ({ event }) =>
        event.type === "REPLAY_ERROR" ? event.message : null,
    }),
    clearError: assign({ error: () => null }),
  },
}).createMachine({
  id: "runFlow",
  context: ({ input }) => ({
    run: input.run,
    visibleIds: [],
    activeApprovalId: null,
    pendingDecision: null,
    error: null,
    speed: input.speed ?? 1.4,
  }),
  initial: "idle",
  on: {
    SYNC_RUN: { actions: "syncRun" },
  },
  states: {
    idle: {
      always: [
        { guard: "hasPending", target: "awaitingApproval" },
        { guard: "isTerminal", target: "completed" },
      ],
      on: {
        REPLAY: { target: "replaying", actions: ["clearVisible", "clearError"] },
        SHOW_ALL: { actions: "showAll", target: "routeAfterReveal" },
      },
    },
    replaying: {
      invoke: {
        src: "replayStream",
        input: ({ context }) => ({ run: context.run, speed: context.speed }),
      },
      on: {
        EVENT_VISIBLE: { actions: "addVisible" },
        SNAPSHOT: { actions: "setRunFromSnapshot" },
        REPLAY_ERROR: { actions: "setReplayError" },
        REPLAY_DONE: { target: "routeAfterReveal" },
        SHOW_ALL: { actions: "showAll", target: "routeAfterReveal" },
        REPLAY: {
          target: "replaying",
          reenter: true,
          actions: ["clearVisible", "clearError"],
        },
      },
    },
    routeAfterReveal: {
      always: [
        { guard: "hasPending", target: "awaitingApproval" },
        { guard: "isTerminal", target: "completed" },
        { target: "idle" },
      ],
    },
    awaitingApproval: {
      on: {
        OPEN_APPROVAL: { actions: "setActive" },
        CLOSE_APPROVAL: { actions: "clearActive" },
        DECIDE: {
          guard: ({ context }) => !!context.activeApprovalId,
          target: "deciding",
          actions: "stashDecision",
        },
        REPLAY: { target: "replaying", actions: ["clearVisible", "clearError"] },
        SHOW_ALL: { actions: "showAll" },
      },
    },
    deciding: {
      invoke: {
        src: "decideApprovalActor",
        input: ({ context }) => {
          if (!context.activeApprovalId || !context.pendingDecision) {
            throw new Error("Missing approval decision");
          }
          return {
            runId: context.run.id,
            approvalId: context.activeApprovalId,
            decision: context.pendingDecision,
          };
        },
        onDone: [
          {
            guard: "lastWasDenied",
            target: "denied",
            actions: assign({
              run: ({ event }) => event.output,
              activeApprovalId: () => null,
              error: () => null,
            }),
          },
          {
            target: "approved",
            actions: assign({
              run: ({ event }) => event.output,
              activeApprovalId: () => null,
              error: () => null,
            }),
          },
        ],
        onError: {
          target: "error",
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error
                ? event.error.message
                : "Approval request failed",
          }),
        },
      },
    },
    approved: {
      always: [
        { guard: "hasPending", target: "awaitingApproval" },
        { guard: "isTerminal", target: "completed" },
        { target: "idle" },
      ],
    },
    denied: {
      always: [
        { guard: "hasPending", target: "awaitingApproval" },
        { guard: "isTerminal", target: "completed" },
        { target: "idle" },
      ],
    },
    completed: {
      on: {
        REPLAY: { target: "replaying", actions: ["clearVisible", "clearError"] },
        SHOW_ALL: { actions: "showAll" },
      },
    },
    error: {
      on: {
        REPLAY: { target: "replaying", actions: ["clearVisible", "clearError"] },
        SHOW_ALL: { actions: "showAll", target: "routeAfterReveal" },
        CLOSE_APPROVAL: {
          target: "awaitingApproval",
          actions: ["clearActive", "clearError"],
        },
        OPEN_APPROVAL: {
          target: "awaitingApproval",
          actions: "setActive",
        },
      },
    },
  },
});

export function visibleIdSet(ids: string[]): Set<string> {
  return new Set(ids);
}
