import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Header } from "./Header";

const meta = { component: Header } satisfies Meta<typeof Header>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole("heading", { level: 1, name: "Menu Judge" }),
    ).toBeVisible();
    await expect(c.getByText("Understand any restaurant menu")).toBeVisible();
  },
};
