import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import RouteError from "@/app/[locale]/error";

const meta = {
  title: "Pages/RouteError",
  component: RouteError,
  args: { error: new Error("boom"), reset: fn() },
} satisfies Meta<typeof RouteError>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole("heading", { name: "Something went wrong" }),
    ).toBeVisible();
    await expect(canvasElement).not.toHaveTextContent("boom");
    await userEvent.click(c.getByRole("button", { name: "Try again" }));
    await expect(args.reset).toHaveBeenCalledTimes(1);
  },
};
