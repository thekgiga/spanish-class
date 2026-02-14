import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatRSD, parseRSD } from "@/lib/utils";

interface PriceInputFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export default function PriceInputField({
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  min = 0,
  max = 100000,
}: PriceInputFieldProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      // Show formatted value when not focused
      setDisplayValue(value > 0 ? formatRSD(value) : "");
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused
    setDisplayValue(value > 0 ? value.toString() : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Parse and update value
    const parsed = parseRSD(displayValue);
    const clamped = Math.min(Math.max(parsed, min), max);
    onChange(clamped);
    setDisplayValue(clamped > 0 ? formatRSD(clamped) : "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    if (isFocused) {
      // Allow only digits when focused
      const digitsOnly = input.replace(/\D/g, "");
      setDisplayValue(digitsOnly);

      // Update value in real-time (optional)
      const parsed = parseInt(digitsOnly, 10) || 0;
      const clamped = Math.min(Math.max(parsed, min), max);
      onChange(clamped);
    } else {
      setDisplayValue(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }

    // Ensure that it is a number and stop the keypress if not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
      (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-12"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-gray-500 text-sm">RSD</span>
      </div>
    </div>
  );
}
