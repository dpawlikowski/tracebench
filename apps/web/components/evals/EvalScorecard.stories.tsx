import type { Meta, StoryObj } from "@storybook/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { expect, within } from "storybook/test";
import { EvalScorecard } from "./EvalScorecard";
import { emptyReport, passCases, passReport } from "../../stories/fixtures";

const meta = {
  title: "Evals/EvalScorecard",
  component: EvalScorecard,
  decorators: [
    (Story) => (
      <NuqsTestingAdapter>
        <Story />
      </NuqsTestingAdapter>
    ),
  ],
} satisfies Meta<typeof EvalScorecard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    report: emptyReport,
    cases: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("empty-state")).toBeVisible();
  },
};

export const Pass: Story = {
  args: {
    report: passReport,
    cases: passCases,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("eval-table")).toBeInTheDocument();
    await expect(canvas.getByTestId("evals-result-filters")).toBeInTheDocument();
    await expect(canvas.getByText("eval_001")).toBeInTheDocument();
  },
};
