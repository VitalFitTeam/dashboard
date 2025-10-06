import React, { forwardRef } from "react";
import { colors } from "@/styles/styles";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"; // puedes agregar más variantes
  isLoading?: boolean;
  width?: string; // ej: "w-full", "w-32", etc.
  size?: "small" | "medium" | "large";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      isLoading = false,
      disabled = false,
      width = "w-full",
      size = "medium",
      className = "",
      type = "button",
      ...rest
    },
    ref,
  ) => {
    // Clases base
    const baseClasses = [
      "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-in-out relative border-0 focus:outline-none focus:ring-2 focus:ring-offset-1",
      width,
      size === "small"
        ? "text-sm py-1 px-3 min-h-[30px]"
        : size === "large"
          ? "text-lg py-3 px-8 min-h-[40px]"
          : "text-base py-2 px-6 min-h-[36px]",
    ].join(" ");

    // Clases dinámicas según estado
    const variantClasses: Record<string, string> = {
      primary: `${
        disabled || isLoading
          ? "opacity-60 cursor-not-allowed"
          : "hover:brightness-90 active:brightness-75 cursor-pointer"
      }`,
      secondary: `${
        disabled || isLoading
          ? "opacity-60 cursor-not-allowed bg-gray-200 text-gray-700"
          : "hover:bg-gray-300 active:bg-gray-400 cursor-pointer text-gray-800 bg-gray-100"
      }`,
    };

    // Inline style para colores dinámicos
    const style =
      variant === "primary"
        ? { backgroundColor: colors.primary, color: colors.complementary.white }
        : {};

    return (
      <button
        ref={ref}
        type={type}
        style={style}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...rest}
      >
        {/* Spinner */}
        {isLoading && (
          <div className="absolute left-4 flex items-center">
            <div
              className="animate-spin rounded-full w-5 border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
          </div>
        )}

        <span
          className={`${isLoading ? "opacity-70" : "opacity-100"} transition-opacity duration-200`}
        >
          {children}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
