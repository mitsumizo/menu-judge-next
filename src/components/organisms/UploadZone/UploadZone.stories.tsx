import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { makeImageFile } from "@/testing/images";
import { UploadZone } from "./UploadZone";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

function selectFile(input: HTMLInputElement, file: File) {
  const transfer = new DataTransfer();
  transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function dragEvent(type: "dragover" | "dragleave" | "drop", file?: File) {
  const transfer = new DataTransfer();
  if (file) transfer.items.add(file);
  return new DragEvent(type, {
    dataTransfer: transfer,
    bubbles: true,
    cancelable: true,
  });
}

const meta = {
  component: UploadZone,
  args: { file: null, onFileChange: fn(), accept: ACCEPT },
  render: function Render(args) {
    const [file, setFile] = useState<File | null>(args.file);
    return (
      <UploadZone
        {...args}
        file={file}
        onFileChange={(next) => {
          setFile(next);
          args.onFileChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof UploadZone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ChooseFromLibrary: Story = {
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    const file = await makeImageFile({ width: 40, height: 30 });
    selectFile(c.getByLabelText<HTMLInputElement>("Choose photo"), file);
    await waitFor(() => expect(args.onFileChange).toHaveBeenCalledWith(file));
    await expect(await c.findByRole("img", { name: "menu.png" })).toBeVisible();
  },
};

export const CameraInputUsesRearCamera: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText("Take photo");
    await expect(input).toHaveAttribute("capture", "environment");
    await expect(input).toHaveAttribute("accept", ACCEPT);
  },
};

export const DropAPhoto: Story = {
  play: async ({ args, canvasElement }) => {
    const zone = within(canvasElement).getByRole("group", {
      name: "Drop a menu photo here",
    });
    const file = await makeImageFile({
      width: 40,
      height: 30,
      name: "dropped.png",
    });

    zone.dispatchEvent(dragEvent("dragover", file));
    await waitFor(() => expect(zone).toHaveAttribute("data-dragging", "true"));
    zone.dispatchEvent(dragEvent("drop", file));

    await waitFor(() => expect(args.onFileChange).toHaveBeenCalledWith(file));
    await expect(zone).toHaveAttribute("data-dragging", "false");
  },
};

export const DragLeaveClearsHighlight: Story = {
  play: async ({ canvasElement }) => {
    const zone = within(canvasElement).getByRole("group", {
      name: "Drop a menu photo here",
    });
    zone.dispatchEvent(dragEvent("dragover"));
    await waitFor(() => expect(zone).toHaveAttribute("data-dragging", "true"));
    zone.dispatchEvent(dragEvent("dragleave"));
    await waitFor(() => expect(zone).toHaveAttribute("data-dragging", "false"));
  },
};

export const RemoveSelectedPhoto: Story = {
  play: async ({ args, canvasElement }) => {
    const c = within(canvasElement);
    selectFile(
      c.getByLabelText<HTMLInputElement>("Choose photo"),
      await makeImageFile({ width: 40, height: 30 }),
    );
    await userEvent.click(
      await c.findByRole("button", { name: "Remove photo" }),
    );
    await expect(args.onFileChange).toHaveBeenLastCalledWith(null);
    await expect(c.queryByRole("img")).toBeNull();
  },
};
