import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { padThai } from "../DishCard/fixtures";
import { AnalyzeForm } from "./AnalyzeForm";

type Action = ComponentProps<typeof AnalyzeForm>["action"];

const png = () =>
  new File([new Uint8Array(10)], "menu.png", { type: "image/png" });

const succeed = fn<Action>(async () => ({ ok: true, dishes: [padThai] }));

// userEvent.upload は input.files を見かけ上差し替えるだけで、実ブラウザの FormData には載らない。
// DataTransfer で本物のファイル一覧を設定する。
function selectFile(input: HTMLInputElement, file: File) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

const meta = {
  component: AnalyzeForm,
  args: { action: succeed },
  beforeEach: () => {
    localStorage.clear();
    succeed.mockClear();
  },
} satisfies Meta<typeof AnalyzeForm>;
export default meta;
type Story = StoryObj<typeof meta>;

async function fillAndSubmit(
  canvasElement: HTMLElement,
  file: File,
  apiKey = "sk-ant-x",
) {
  const c = within(canvasElement);
  if (apiKey) await userEvent.type(c.getByLabelText("Claude API key"), apiKey);
  selectFile(c.getByLabelText<HTMLInputElement>(/Menu photo/), file);
  await userEvent.click(c.getByRole("button", { name: "Analyze menu" }));
}

export const Success: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, png());
    await waitFor(() => expect(succeed).toHaveBeenCalledTimes(1));
    const formData = succeed.mock.calls[0][1];
    await expect(formData.get("apiKey")).toBe("sk-ant-x");
    await expect(formData.get("locale")).toBe("en");
    await expect(formData.get("image")).toBeInstanceOf(File);
    await expect(
      await within(canvasElement).findByRole("heading", { name: "Pad Thai" }),
    ).toBeVisible();
    await expect(localStorage.getItem("menu-judge:api-key")).toBe("sk-ant-x");
  },
};

export const RestoresSavedKey: Story = {
  beforeEach: () => {
    localStorage.setItem("menu-judge:api-key", "sk-ant-saved");
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByDisplayValue("sk-ant-saved"),
    ).toBeInTheDocument();
  },
};

export const ServerError: Story = {
  args: { action: fn<Action>(async () => ({ ok: false, code: "NOT_A_MENU" })) },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, png());
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent(
      "No dishes were found. Please make sure the photo shows a menu.",
    );
  },
};

export const MissingApiKeyIsBlockedInBrowser: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, png(), "");
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("Please enter your Claude API key.");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const TooLargeFileIsBlockedInBrowser: Story = {
  play: async ({ canvasElement }) => {
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });
    await fillAndSubmit(canvasElement, big);
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("up to 3.75MB");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const ActionFailureKeepsPageUsable: Story = {
  args: {
    action: fn<Action>(async () => {
      throw new TypeError("Failed to fetch");
    }),
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, png());
    const c = within(canvasElement);
    await expect(await c.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    await expect(c.getByRole("button", { name: "Analyze menu" })).toBeEnabled();
  },
};

const notAMenu = fn<Action>(async () => ({ ok: false, code: "NOT_A_MENU" }));

export const RetryKeepsSelectedPhoto: Story = {
  args: { action: notAMenu },
  beforeEach: () => {
    notAMenu.mockClear();
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, png());
    const c = within(canvasElement);
    await c.findByRole("alert");
    await expect(
      c.getByLabelText<HTMLInputElement>(/Menu photo/).files,
    ).toHaveLength(1);

    await userEvent.click(c.getByRole("button", { name: "Analyze menu" }));
    await waitFor(() => expect(notAMenu).toHaveBeenCalledTimes(2));
    await expect(notAMenu.mock.calls[1][1].get("image")).toBeInstanceOf(File);
    // 前回の結果（料理一覧）をサーバーへ送り返さない
    await expect(notAMenu.mock.calls[1][0]).toBeNull();
  },
};
