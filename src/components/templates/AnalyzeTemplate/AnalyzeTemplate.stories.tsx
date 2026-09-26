import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AnalyzeTemplate } from "./AnalyzeTemplate";

const meta = {
  component: AnalyzeTemplate,
  args: { header: <h1>Header slot</h1>, children: <p>Body slot</p> },
} satisfies Meta<typeof AnalyzeTemplate>;
export default meta;

export const Slots: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const main = within(canvasElement).getByRole("main");
    await expect(within(main).getByText("Header slot")).toBeVisible();
    await expect(within(main).getByText("Body slot")).toBeVisible();
  },
};
