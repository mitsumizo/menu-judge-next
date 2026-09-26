import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { LevelRow } from "./LevelRow";

const meta = {
  component: LevelRow,
  args: { label: "Spiciness", level: 4, icon: "🌶️" },
} satisfies Meta<typeof LevelRow>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Spiciness")).toBeVisible();
    await expect(
      canvas.getByRole("img", { name: "Spiciness: 4/5" }),
    ).toBeInTheDocument();
  },
};
