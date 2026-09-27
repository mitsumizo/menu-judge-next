import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DishListSkeleton } from "./DishListSkeleton";

const meta = { component: DishListSkeleton } satisfies Meta<
  typeof DishListSkeleton
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole("status", {
      name: "Analyzing menu…",
    });
    await expect(status).toHaveAttribute("aria-busy", "true");
    await expect(within(status).getAllByTestId("dish-skeleton")).toHaveLength(
      4,
    );
  },
};

export const CustomCount: Story = {
  args: { count: 2 },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByTestId("dish-skeleton"),
    ).toHaveLength(2);
  },
};
