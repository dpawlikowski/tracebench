import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { MetricsRail } from "./MetricsRail";
import { successRun } from "../../stories/fixtures";

const meta = {
  title: "Metrics/MetricsRail",
  component: MetricsRail,
} satisfies Meta<typeof MetricsRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { run: successRun },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("metrics-rail")).toBeVisible();
    await expect(canvas.getByText(/Total cost/i)).toBeVisible();
  },
};
