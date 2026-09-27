"use client";

import { useId, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { TextInput } from "@/components/atoms/TextInput/TextInput";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  showLabel: string;
  hideLabel: string;
};

export function ApiKeyField({
  value,
  onChange,
  label,
  showLabel,
  hideLabel,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-text-secondary text-sm">
        {label}
      </label>
      <div className="flex gap-2">
        <TextInput
          id={id}
          name="apiKey"
          type={visible ? "text" : "password"}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          variant="ghost"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? hideLabel : showLabel}
        </Button>
      </div>
    </div>
  );
}
