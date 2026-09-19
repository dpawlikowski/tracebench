import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ApprovalGate } from "./ApprovalGate";
import { liveRun } from "../../stories/fixtures";

const meta = {
  title: "HITL/ApprovalGate",
  component: ApprovalGate,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ApprovalGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PendingHighRisk: Story = {
  args: {
    run: liveRun,
    activeApprovalId: null,
    busy: false,
    error: null,
    onOpen: fn(),
    onClose: fn(),
    onDecide: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("approval-gate")).toBeVisible();
    await expect(canvas.getByText(/execute_payment/i)).toBeVisible();
    await userEvent.click(canvas.getByTestId("open-approval-ap_lv_2"));
    await expect(args.onOpen).toHaveBeenCalledWith("ap_lv_2");
  },
};

export const ModalOpen: Story = {
  args: {
    ...PendingHighRisk.args!,
    activeApprovalId: "ap_lv_2",
  },
  parameters: { layout: "fullscreen" },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const modal = body.getByTestId("approval-modal");
    await expect(modal).toBeInTheDocument();
    await expect(modal).toHaveAttribute("role", "dialog");
    await expect(body.getByTestId("modal-approve")).toBeInTheDocument();
    await expect(body.getByTestId("modal-deny")).toBeInTheDocument();
  },
};
