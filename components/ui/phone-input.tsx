"use client";

import React from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputComponentProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const PhoneInputComponent = React.forwardRef<HTMLInputElement, PhoneInputComponentProps>(
  ({ value, onChange, placeholder = "Enter phone number", disabled, className, id, ...props }, ref) => {
    return (
      <PhoneInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        defaultCountry="PK"
        countries={['PK', 'US', 'GB', 'CA', 'AU', 'IN', 'AE', 'SA']}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        inputProps={{
          id,
          ref,
          ...props
        }}
      />
    );
  }
);

PhoneInputComponent.displayName = "PhoneInputComponent";

export { PhoneInputComponent };