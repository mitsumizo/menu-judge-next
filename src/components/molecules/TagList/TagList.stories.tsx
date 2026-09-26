import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TagList } from "./TagList";

const meta = {
  component: TagList,
  args: {
    label: "Ingredients",
    items: ["rice noodles", "shrimp"],
    emptyText: "Unknown",
  },
} satisfies Meta<typeof TagList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", {
      name: "Ingredients",
    });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  },
};

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Unknown")).toBeVisible();
    await expect(within(canvasElement).queryByRole("listitem")).toBeNull();
  },
};
