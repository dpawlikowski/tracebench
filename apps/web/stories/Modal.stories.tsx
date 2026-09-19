import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "@tracebench/ui";
import { expect, fn, within } from "storybook/test";

const meta = {
  title: "UI/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighRisk: Story = {
  args: {
    open: true,
    title: "Approve execute_payment?",
    danger: true,
    busy: false,
    confirmLabel: "Approve",
    denyLabel: "Deny",
    onClose: fn(),
    onConfirm: fn(),
    onDeny: fn(),
    children: (
      <p>
        High risk · irreversible tool. Confirm only if dual-control is satisfied.
      </p>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const modal = body.getByTestId("approval-modal");
    await expect(modal).toBeInTheDocument();
    await expect(modal).toHaveAttribute("aria-modal", "true");
    await expect(body.getByTestId("modal-approve")).toBeInTheDocument();
  },
};
