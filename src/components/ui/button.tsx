import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import Image from "next/image";

const buttonVariants = cva(
  // 🧩 Base común para todos los botones
  "inline-flex items-center justify-center gap-2 whitespace-nowrap  rounded-[6px] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gray-900 text-white shadow-sm hover:bg-gray-800 active:bg-gray-700 focus-visible:ring-gray-300",
        destructive:
          "bg-[#EF4444] text-white shadow-sm hover:bg-[#DC2626] active:bg-[#B91C1C] focus-visible:ring-red-200",
        outline:
          "border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-200",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-200",
        ghost:
          "text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-200",
        link: "text-primary underline-offset-4 hover:underline",
        google:
          "bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-50 active:bg-gray-100",
        primary:
          "bg-[#F27F2A] text-white shadow-sm hover:bg-[#E57225] active:bg-[#D8651F] focus-visible:ring-orange-200",
        dark: "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-700 focus-visible:ring-neutral-600",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-4 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {variant === "google" && (
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        )}

        {isLoading && (
          <div className="absolute left-4 flex items-center">
            <div
              className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
          </div>
        )}

        <span
          className={cn(
            "flex items-center gap-1",
            "transition-opacity duration-200",
            isLoading ? "opacity-70" : "opacity-100",
          )}
        >
          {children}
        </span>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
