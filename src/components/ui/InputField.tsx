import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border font-cairo text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[#4a6a5a]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(201,163,90,0.4)] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          "bg-[#0e1e2a] border-[rgba(201,163,90,0.2)] text-[#E8F4EC]",
          "px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
InputField.displayName = "InputField";

export { InputField };
