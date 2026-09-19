"use client";

import { Button, Kbd } from "@tracebench/ui";
import { clearTourSeen, requestStartTour } from "@/lib/tour";

export function RestartTourButton() {
  return (
    <Button
      variant="secondary"
      data-testid="restart-tour"
      onClick={() => {
        clearTourSeen();
        requestStartTour();
      }}
    >
      Start product tour <Kbd className="ml-1">Tour</Kbd>
    </Button>
  );
}
