import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { TextInput } from "./TextInput";

const meta = {
  component: TextInput,
  args: { "aria-label": "API key" },
} satisfies Meta<typeof TextInput>;
export default meta;

export const Typing: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("API key");
    await userEvent.type(input, "sk-ant-test");
    await expect(input).toHaveValue("sk-ant-test");
  },
};
