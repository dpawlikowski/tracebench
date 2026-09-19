"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  START_TOUR_EVENT,
  TOUR_STEPS,
  markTourSeen,
  shouldAutoStartTour,
} from "@/lib/tour";

const Joyride = dynamic(() => import("react-joyride").then((m) => m.Joyride), {
  ssr: false,
});

type Step = {
  target: string;
  content: string;
  title?: string;
  disableBeacon?: boolean;
};

/**
 * First-run product tour (React Joyride v3).
 * Auto-starts once unless Playwright/webdriver/?tour=0. Restart via Help / ⌘K.
 */
export function ProductTour() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  const steps: Step[] = useMemo(() => [...TOUR_STEPS], []);

  const start = useCallback(() => {
    setStepIndex(0);
    setRun(true);
  }, []);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(START_TOUR_EVENT, onStart);
    return () => window.removeEventListener(START_TOUR_EVENT, onStart);
  }, [start]);

  useEffect(() => {
    if (!shouldAutoStartTour()) return;
    const t = window.setTimeout(() => start(), 600);
    return () => window.clearTimeout(t);
  }, [start]);

  // Navigate to surfaces that host targets when advancing
  useEffect(() => {
    if (!run) return;
    const target = steps[stepIndex]?.target ?? "";
    if (target.includes("run-live") || target.includes("approval-gate")) {
      if (!pathname.startsWith("/runs/run_live_approve")) {
        router.push("/runs/run_live_approve");
      }
    } else if (target.includes("nav-evals") && !pathname.startsWith("/evals")) {
      // stay — nav target is always in shell
    } else if (target.includes("nav-runs") && pathname === "/") {
      // nav is in shell
    }
  }, [run, stepIndex, steps, pathname, router]);

  return (
    <Joyride
      run={run}
      steps={steps}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      onEvent={(data) => {
        const { type, index, status, action } = data as {
          type?: string;
          index?: number;
          status?: string;
          action?: string;
        };
        // Controlled mode: advance on next/prev/close
        if (type === "step:after") {
          if (action === "next" || action === "close") {
            const next = (index ?? 0) + 1;
            if (next >= steps.length) {
              setRun(false);
              markTourSeen();
            } else {
              setStepIndex(next);
            }
          } else if (action === "prev") {
            setStepIndex(Math.max(0, (index ?? 0) - 1));
          }
        }
        if (status === "finished" || status === "skipped") {
          setRun(false);
          markTourSeen();
        }
        if (action === "reset") {
          setStepIndex(0);
        }
      }}
      options={{
        primaryColor: "#5b9fd4",
        backgroundColor: "#121821",
        textColor: "#e8eef7",
        overlayColor: "rgba(0,0,0,0.55)",
        zIndex: 12000,
        skipBeacon: true,
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Done",
        next: "Next",
        skip: "Skip",
      }}
    />
  );
}
