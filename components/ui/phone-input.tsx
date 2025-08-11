"use client";

import React, { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputComponentProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  required?: boolean;
  showValidation?: boolean;
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, PhoneInputComponentProps>(
  ({ value, onChange, placeholder = "Enter phone number", disabled, className, id, required = false, showValidation = false, ...props }, ref) => {
    const [error, setError] = useState<string>("");

    const handleChange = (newValue: string | undefined) => {
      setError("");
      
      if (required && (!newValue || newValue.trim() === "")) {
        setError("Phone number is required");
        onChange(newValue);
        return;
      }

      if (newValue && !isValidPhoneNumber(newValue)) {
        setError("Please enter a valid phone number");
      }
      
      onChange(newValue);
    };

    const isInvalid = showValidation && (error || (required && !value));

    return (
      <div className="space-y-1">
        <PhoneInput
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          defaultCountry="PK"
          countries={['PK', 'US', 'GB', 'CA', 'AU', 'IN', 'AE', 'SA']}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isInvalid && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          inputProps={{
            id,
            ref,
            ...props
          }}
        />
        {showValidation && error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
        {showValidation && !error && value && isValidPhoneNumber(value) && (
          <p className="text-xs text-green-500 mt-1">Valid phone number</p>
        )}
      </div>
    );
  }
);

PhoneInputComponent.displayName = "PhoneInputComponent";

export { PhoneInputComponent };