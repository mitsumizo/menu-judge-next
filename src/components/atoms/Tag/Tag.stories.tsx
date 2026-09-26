import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Tag } from "./Tag";

const meta = { component: Tag, args: { children: "shrimp" } } satisfies Meta<
  typeof Tag
>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("shrimp")).toBeVisible();
  },
};
