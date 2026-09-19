import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, Button } from "@tracebench/ui";
import { expect, within } from "storybook/test";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No runs yet",
    description: "Seeded OpsAgent runs appear here once fixtures load.",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("empty-state")).toBeVisible();
  },
};

export const WithAction: Story = {
  args: {
    title: "No cases match this filter",
    description: "Clear the filter to see the full suite.",
    action: <Button variant="secondary">Clear filter</Button>,
  },
};
