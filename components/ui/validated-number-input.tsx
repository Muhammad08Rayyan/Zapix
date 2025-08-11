"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ValidatedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  errorMessage?: string;
  className?: string;
}

export function ValidatedNumberInput({
  value,
  onChange,
  min = 0,
  max,
  allowDecimals = false,
  errorMessage = "Please enter a valid number",
  className,
  ...props
}: ValidatedNumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value || ''));
  const [error, setError] = useState<string>('');

  const validateNumber = (input: string) => {
    if (input === '') {
      setError('');
      onChange(0);
      return;
    }

    const numericValue = allowDecimals ? parseFloat(input) : parseInt(input);
    
    if (isNaN(numericValue)) {
      setError(errorMessage);
      return;
    }

    if (min !== undefined && numericValue < min) {
      setError(`Value must be at least ${min}`);
      return;
    }

    if (max !== undefined && numericValue > max) {
      setError(`Value must be at most ${max}`);
      return;
    }

    setError('');
    onChange(numericValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);
    validateNumber(input);
  };

  const handleBlur = () => {
    // On blur, format the input to show the actual numeric value
    if (inputValue && !error && !isNaN(Number(inputValue))) {
      const formattedValue = String(allowDecimals ? parseFloat(inputValue) : parseInt(inputValue));
      setInputValue(formattedValue);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={cn(
          error ? "border-red-500 focus-visible:ring-red-500" : "",
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}