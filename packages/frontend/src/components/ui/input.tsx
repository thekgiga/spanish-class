import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-edu-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 border-edu-slate-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm text-edu-slate-800 font-medium",
              "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-semibold",
              "placeholder:text-edu-slate-400 placeholder:font-normal",
              "focus-visible:outline-none focus-visible:border-edu-blue-500 focus-visible:ring-4 focus-visible:ring-edu-blue-100",
              "hover:border-edu-slate-300",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-edu-slate-50",
              "transition-all duration-200",
              error &&
                "border-edu-red-400 focus-visible:border-edu-red-500 focus-visible:ring-edu-red-100",
              icon && "pl-11",
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-edu-red-600 font-medium flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
