import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { DishCard } from "./DishCard";
import { padThai } from "./fixtures";

const meta = { component: DishCard, args: { dish: padThai } } satisfies Meta<
  typeof DishCard
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("article");
    const c = within(card);
    await expect(c.getByRole("heading", { name: "Pad Thai" })).toBeVisible();
    await expect(c.getByText("ผัดไทย")).toBeVisible();
    await expect(c.getByText("Main")).toBeVisible();
    await expect(c.getByText("$$")).toBeVisible();
    await expect(
      c.getByRole("img", { name: "Spiciness: 2/5" }),
    ).toBeInTheDocument();
    await expect(
      c.getByRole("img", { name: "Sweetness: 3/5" }),
    ).toBeInTheDocument();
    await expect(
      within(c.getByRole("list", { name: "Allergens" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(2);
  },
};

export const MissingInfo: Story = {
  args: {
    dish: {
      ...padThai,
      ingredients: [],
      allergens: [],
      price_range: null,
      category: "other",
    },
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Price unknown")).toBeVisible();
    await expect(c.getByText("Other")).toBeVisible();
    await expect(c.getAllByText("Unknown")).toHaveLength(2);
  },
};
