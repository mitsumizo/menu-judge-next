import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { LevelMeter } from "./LevelMeter";

const meta = {
  component: LevelMeter,
  args: { icon: "🌶️", label: "Spiciness" },
} satisfies Meta<typeof LevelMeter>;
export default meta;
type Story = StoryObj<typeof meta>;

function activeCount(canvasElement: HTMLElement) {
  return canvasElement.querySelectorAll('[data-active="true"]').length;
}

export const Min: Story = {
  args: { level: 1 },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("img", { name: "Spiciness: 1/5" }),
    ).toBeInTheDocument();
    await expect(activeCount(canvasElement)).toBe(1);
  },
};

export const Max: Story = {
  args: { level: 5 },
  play: async ({ canvasElement }) => {
    await expect(activeCount(canvasElement)).toBe(5);
  },
};

export const Sweetness: Story = {
  args: { level: 3, icon: "🍬", label: "Sweetness" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("img", { name: "Sweetness: 3/5" }),
    ).toBeInTheDocument();
    await expect(activeCount(canvasElement)).toBe(3);
  },
};
