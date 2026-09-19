import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Timeline } from "./Timeline";
import { allVisibleIds, liveRun, successRun } from "../../stories/fixtures";

const meta = {
  title: "Timeline/Timeline",
  component: Timeline,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyIdle: Story = {
  args: {
    run: liveRun,
    visibleEventIds: new Set(),
    isReplaying: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("timeline-empty")).toBeVisible();
  },
};

export const Streaming: Story = {
  args: {
    run: liveRun,
    visibleEventIds: new Set(liveRun.timeline.slice(0, 3).map((e) => e.id)),
    isReplaying: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("timeline")).toBeVisible();
    await expect(canvas.getByTestId("timeline-streaming")).toBeVisible();
  },
};

export const Complete: Story = {
  args: {
    run: successRun,
    visibleEventIds: allVisibleIds(successRun),
    isReplaying: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("timeline")).toBeVisible();
  },
};
