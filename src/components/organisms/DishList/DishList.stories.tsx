import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { padThai } from "../DishCard/fixtures";
import { DishList } from "./DishList";

const meta = {
  component: DishList,
  args: { dishes: [padThai] },
} satisfies Meta<typeof DishList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", {
      name: "Analysis results",
    });
    await expect(within(section).getByText("1 dish found")).toBeVisible();
    await expect(within(section).getAllByRole("article")).toHaveLength(1);
  },
};

export const Multiple: Story = {
  args: {
    dishes: [
      padThai,
      { ...padThai, translated_name: "Green Curry" },
      { ...padThai, translated_name: "Mango Sticky Rice" },
    ],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("3 dishes found")).toBeVisible();
    await expect(c.getAllByRole("article")).toHaveLength(3);
  },
};
