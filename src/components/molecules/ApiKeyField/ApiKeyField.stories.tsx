import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ApiKeyField } from "./ApiKeyField";

const meta = {
  component: ApiKeyField,
  args: {
    value: "",
    onChange: fn(),
    label: "Claude API key",
    showLabel: "Show",
    hideLabel: "Hide",
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <ApiKeyField
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          args.onChange(v);
        }}
      />
    );
  },
} satisfies Meta<typeof ApiKeyField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HiddenByDefault: Story = {
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByLabelText("Claude API key");
    await expect(input).toHaveAttribute("type", "password");
    await expect(input).toHaveAttribute("name", "apiKey");
    await userEvent.type(input, "sk-ant");
    await expect(args.onChange).toHaveBeenLastCalledWith("sk-ant");
  },
};

export const ToggleVisibility: Story = {
  args: { value: "sk-ant-secret" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show" }));
    await expect(canvas.getByLabelText("Claude API key")).toHaveAttribute(
      "type",
      "text",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Hide" }));
    await expect(canvas.getByLabelText("Claude API key")).toHaveAttribute(
      "type",
      "password",
    );
  },
};
