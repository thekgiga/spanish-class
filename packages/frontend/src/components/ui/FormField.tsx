/**
 * FormField Component
 *
 * Accessible form field with label, input, helper text, and error handling
 * WCAG 2.1 AA compliant with proper ARIA attributes
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

export interface FormFieldProps extends Omit<InputProps, "error"> {
  label: string;
  helperText?: string;
  error?: boolean | string;
  required?: boolean;
  id?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      helperText,
      error = false,
      required = false,
      id,
      className,
      ...inputProps
    },
    ref,
  ) => {
    // Generate unique ID if not provided
    const fieldId =
      id || `form-field-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${fieldId}-helper`;
    const errorMessageId = `${fieldId}-error`;

    const hasError = !!error;
    const errorMessage = typeof error === "string" ? error : helperText;

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={fieldId}
          className={cn(
            "text-small font-medium text-ink",
            inputProps.disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        <Input
          ref={ref}
          id={fieldId}
          required={required}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorMessageId : helperText ? helperTextId : undefined
          }
          error={typeof error === "string" ? error : undefined}
          {...inputProps}
        />

        {hasError && errorMessage && (
          <p
            id={errorMessageId}
            className="text-sm text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {errorMessage}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperTextId} className="text-caption text-ink-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export { FormField };
