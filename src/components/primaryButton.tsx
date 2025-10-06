import React, { forwardRef } from "react";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (props, ref) => {
    const {
      children,
      className,
      disabled = false,
      isLoading = false,
      type = "button",
      ...rest
    } = props;

    // Clases base (layout, tipografía, transición) - CORREGIDAS
    const baseClasses = [
      "w-full",
      "text-lg",
      "inline-flex",
      "items-center",
      "justify-center",
      "rounded-lg",
      "py-2",
      "px-8",
      "font-semibold",
      "transition-all",
      "duration-200",
      "ease-in-out",
      "relative",
      "min-h-[32px]",
      "border-0",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-[#F27F2A]",
      "focus:ring-opacity-50",
    ].join(" ");

    // Clases para el estado habilitado - MEJORADAS
    const enabledClasses = [
      "bg-[#F27F2A]",
      "hover:bg-[#E57225]",
      "active:bg-[#D8651F]",
      "hover:scale-[1.02]",
      "active:scale-[0.98]",
      "text-white",
      "cursor-pointer",
    ].join(" ");

    // Clases para el estado deshabilitado - MEJORADAS
    const disabledClasses = [
      "bg-[#F27F2A]",
      "opacity-60",
      "cursor-not-allowed",
      "text-white",
    ].join(" ");

    // Fusionar clases dinámicamente
    const classes = [
      baseClasses,
      disabled || isLoading ? disabledClasses : enabledClasses,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...rest}
      >
        {/* Spinner cuando isLoading - MEJORADO */}
        {isLoading && (
          <div className="absolute left-4 flex items-center">
            <div
              className="animate-spin rounded-full w-5 border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
          </div>
        )}

        <span
          className={`
        transition-opacity duration-200
        ${isLoading ? "opacity-70" : "opacity-100"}
      `}
        >
          {children}
        </span>
      </button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
