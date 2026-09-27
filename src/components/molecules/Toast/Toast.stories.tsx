import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Toast } from "./Toast";

const meta = {
  component: Toast,
  args: {
    message: "24 dishes found",
    onClose: fn(),
    closeLabel: "Close notification",
    duration: 200,
  },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AutoDismiss: Story = {
  play: async ({ args, canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "24 dishes found",
    );
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
  },
};

export const CloseButton: Story = {
  args: { duration: 60_000 },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Close notification" }),
    );
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};
