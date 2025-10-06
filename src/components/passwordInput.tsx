"use client";

import React, { forwardRef, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  ariaLabel?: string;
  error?: string;
  className?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ariaLabel, className = "", error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        <div className="relative w-full max-w-lg">
          <input
            {...props}
            ref={ref}
            type={showPassword ? "text" : "password"}
            aria-label={ariaLabel}
            className={`w-full px-4 py-2 border rounded-lg
                        focus:border-[#F27F2A] focus:ring-[#F27F2A]
                        focus:outline-none text-[#1A1A1A] transition-colors duration-200
                        ${error ? "border-red-500" : "border-gray-300"}
                        ${className}`}
          />

          {/* Toggle icon */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Error text */}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
