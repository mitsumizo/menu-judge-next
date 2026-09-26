import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Badge } from "./Badge";

const meta = { component: Badge, args: { children: "Main" } } satisfies Meta<
  typeof Badge
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Main")).toHaveAttribute(
      "data-tone",
      "primary",
    );
  },
};

export const Accent: Story = {
  args: { children: "$$", tone: "accent" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("$$")).toHaveAttribute(
      "data-tone",
      "accent",
    );
  },
};
