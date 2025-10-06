// src/components/Input.tsx
"use client";

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className = "", containerClassName = "", ...props },
    ref,
  ) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-1">
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg border-[#A4A4A4] 
            focus:border-[#F27F2A] focus:ring-[#F27F2A] 
            focus:outline-none text-[#1A1A1A] text-auto transition-colors duration-200
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}`}
        />
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
