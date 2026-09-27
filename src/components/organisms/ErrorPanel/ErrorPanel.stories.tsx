import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ANALYZE_ERROR_CODES } from "@/lib/analyze-result";
import { ErrorPanel } from "./ErrorPanel";

const meta = {
  component: ErrorPanel,
  args: { code: "NOT_A_MENU" },
} satisfies Meta<typeof ErrorPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NotAMenu: Story = {
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole("alert");
    await expect(
      within(alert).getByRole("heading", { name: "No dishes found" }),
    ).toBeVisible();
    await expect(alert).toHaveTextContent(
      "Please make sure the photo shows a menu.",
    );
  },
};

export const EveryCodeHasCopy: Story = {
  render: () => (
    <div>
      {ANALYZE_ERROR_CODES.map((code) => (
        <ErrorPanel key={code} code={code} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alerts = within(canvasElement).getAllByRole("alert");
    await expect(alerts).toHaveLength(ANALYZE_ERROR_CODES.length);
    for (const alert of alerts) {
      await expect(alert.textContent).not.toContain("Errors.");
      await expect(
        within(alert).getByRole("heading").textContent?.length,
      ).toBeGreaterThan(0);
    }
  },
};
