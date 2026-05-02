"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "gold" | "ghost" | "danger" | "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary:
        "bg-gradient-to-r from-[#0D4F3C] to-[#0A6B4F] border border-[#7a6030] text-[#E8F4EC] shadow-[0_4px_16px_rgba(13,79,60,0.35)] hover:shadow-[0_6px_20px_rgba(13,79,60,0.5)] hover:-translate-y-0.5",
      secondary:
        "bg-[#0a1520] border border-[rgba(201,163,90,0.15)] text-[#E8F4EC] hover:border-[rgba(201,163,90,0.3)]",
      gold:
        "bg-gradient-to-r from-[#C9A35A] to-[#E8C46A] text-[#060d12] font-bold shadow-[0_4px_16px_rgba(201,163,90,0.3)] hover:shadow-[0_6px_20px_rgba(201,163,90,0.45)] hover:-translate-y-0.5",
      ghost:
        "bg-transparent border border-[rgba(201,163,90,0.15)] text-[#8BAAA0] hover:border-[rgba(201,163,90,0.35)] hover:text-[#E8F4EC]",
      danger:
        "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
      // Legacy aliases
      default:
        "bg-gradient-to-r from-[#0D4F3C] to-[#0A6B4F] border border-[#7a6030] text-[#E8F4EC] shadow-[0_4px_16px_rgba(13,79,60,0.35)] hover:shadow-[0_6px_20px_rgba(13,79,60,0.5)]",
      outline:
        "border border-[rgba(201,163,90,0.25)] bg-transparent text-[#E8F4EC] hover:border-[rgba(201,163,90,0.5)]",
    };

    const sizes = {
      default: "h-12 px-6 py-2 rounded-xl",
      sm: "h-9 rounded-xl px-3 text-sm",
      lg: "h-14 rounded-xl px-8 text-lg",
      icon: "h-12 w-12 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-cairo font-bold text-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,163,90,0.4)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
