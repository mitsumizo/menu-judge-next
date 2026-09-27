import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { decodeSize, makeImageFile } from "@/testing/images";
import { padThai } from "../DishCard/fixtures";
import { AnalyzeForm } from "./AnalyzeForm";

type Action = ComponentProps<typeof AnalyzeForm>["action"];

const photo = () => makeImageFile({ width: 64, height: 48 });

const succeed = fn<Action>(async () => ({ ok: true, dishes: [padThai] }));

// userEvent.upload は input.files を見かけ上差し替えるだけなので、DataTransfer で本物のファイル一覧を設定する
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
  file: File | Promise<File>,
  apiKey = "sk-ant-x",
) {
  const c = within(canvasElement);
  if (apiKey) await userEvent.type(c.getByLabelText("Claude API key"), apiKey);
  selectFile(c.getByLabelText<HTMLInputElement>("Choose photo"), await file);
  await userEvent.click(c.getByRole("button", { name: "Analyze menu" }));
}

export const Success: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(
      canvasElement,
      makeImageFile({ width: 4000, height: 3000 }),
    );
    await waitFor(() => expect(succeed).toHaveBeenCalledTimes(1));
    const formData = succeed.mock.calls[0][1];
    await expect(formData.get("apiKey")).toBe("sk-ant-x");
    await expect(formData.get("locale")).toBe("en");
    const image = formData.get("image") as File;
    await expect(image.type).toBe("image/jpeg");
    await expect(await decodeSize(image)).toEqual({
      width: 1568,
      height: 1176,
    });
    await expect(
      await within(canvasElement).findByRole("heading", { name: "Pad Thai" }),
    ).toBeVisible();
    await expect(localStorage.getItem("menu-judge:api-key")).toBe("sk-ant-x");
    await expect(
      await within(canvasElement).findByRole("status"),
    ).toHaveTextContent("1 dish found");
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
    await fillAndSubmit(canvasElement, photo());
    const alert = await within(canvasElement).findByRole("alert");
    await expect(
      within(alert).getByRole("heading", { name: "No dishes found" }),
    ).toBeVisible();
    await expect(alert).toHaveTextContent(
      "No dishes were found. Please make sure the photo shows a menu.",
    );
  },
};

export const MissingApiKeyIsBlockedInBrowser: Story = {
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, photo(), "");
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("Please enter your Claude API key.");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const TooLargeFileIsBlockedInBrowser: Story = {
  play: async ({ canvasElement }) => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    await fillAndSubmit(canvasElement, big);
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("up to 10MB");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const NonImageFileIsRejected: Story = {
  play: async ({ canvasElement }) => {
    const pdf = new File([new TextEncoder().encode("%PDF-1.7")], "menu.pdf", {
      type: "application/pdf",
    });
    await fillAndSubmit(canvasElement, pdf);
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("We couldn't use this photo");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const UndecodableImageIsRejected: Story = {
  play: async ({ canvasElement }) => {
    const broken = new File(
      [new TextEncoder().encode("not an image")],
      "menu.jpg",
      { type: "image/jpeg" },
    );
    await fillAndSubmit(canvasElement, broken);
    await expect(
      await within(canvasElement).findByRole("alert"),
    ).toHaveTextContent("We couldn't use this photo");
    await expect(succeed).not.toHaveBeenCalled();
  },
};

export const SubmitIsLockedWhilePreparing: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByLabelText("Claude API key"), "sk-ant-x");
    selectFile(
      c.getByLabelText<HTMLInputElement>("Choose photo"),
      await makeImageFile({ width: 4000, height: 3000 }),
    );
    await userEvent.click(c.getByRole("button", { name: "Analyze menu" }));
    // 縮小中・解析中はボタンを押せない（連打しても送信は 1 回）
    await expect(
      c.getByRole("button", { name: /Preparing photo…|Analyzing…/ }),
    ).toBeDisabled();
    await c.findByRole("heading", { name: "Pad Thai" });
    await expect(succeed).toHaveBeenCalledTimes(1);
  },
};

export const ActionFailureKeepsPageUsable: Story = {
  args: {
    action: fn<Action>(async () => {
      throw new TypeError("Failed to fetch");
    }),
  },
  play: async ({ canvasElement }) => {
    await fillAndSubmit(canvasElement, photo());
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
    await fillAndSubmit(canvasElement, photo());
    const c = within(canvasElement);
    await c.findByRole("alert");
    await expect(c.getByRole("img", { name: "menu.png" })).toBeVisible();

    await userEvent.click(c.getByRole("button", { name: "Analyze menu" }));
    await waitFor(() => expect(notAMenu).toHaveBeenCalledTimes(2));
    await expect(notAMenu.mock.calls[1][1].get("image")).toBeInstanceOf(File);
    // 前回の結果（料理一覧）をサーバーへ送り返さない
    await expect(notAMenu.mock.calls[1][0]).toBeNull();
  },
};
