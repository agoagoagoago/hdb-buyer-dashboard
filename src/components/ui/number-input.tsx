"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: number;
  onValueChange: (value: number) => void;
  /** Optional prefix shown inside the field, e.g. "$" or "%". */
  prefix?: string;
}

/**
 * Numeric input that keeps an editable string buffer (so users can clear the field
 * or type freely) and reports a clamped number on change.
 */
export function NumberInput({ value, onValueChange, prefix, min, max, ...props }: NumberInputProps) {
  const [text, setText] = React.useState(String(value));
  const [prevValue, setPrevValue] = React.useState(value);

  // Adjust the buffer during render when the value changes externally (e.g. reset to sample).
  // Keep the buffer if it already represents the same number (preserves trailing ".", "0", etc.).
  if (value !== prevValue) {
    setPrevValue(value);
    if (Number(text) !== value) setText(String(value));
  }

  const commit = (raw: string) => {
    setText(raw);
    if (raw === "" || raw === "-") return;
    let n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (typeof min === "number") n = Math.max(n, Number(min));
    if (typeof max === "number") n = Math.min(n, Number(max));
    onValueChange(n);
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => setText(String(value))}
        className={prefix ? "pl-7" : undefined}
        {...props}
      />
    </div>
  );
}
