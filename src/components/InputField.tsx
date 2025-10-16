import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, helperText, error, className, ...props }, ref) => {
    const baseClasses =
      "w-full rounded-md border px-3 py-2 text-sm transition focus:outline-none focus:ring-2";
    const borderClasses = error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:ring-blue-500";

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium",
              error ? "text-red-600" : "text-gray-800",
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            {...props}
            className={cn(
              "border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary pr-10", // <-- pr-10 para espacio del ícono
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
              className,
            )}
          />
          {error && (
            <AlertCircle
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
              size={18}
            />
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
