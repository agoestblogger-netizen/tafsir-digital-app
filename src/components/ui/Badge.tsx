import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "sains" | "nabi" | "kultum" | "shahih" | "hasan";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    // Domain-specific variants
    sains:
      "bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.25)] text-[#38BDF8]",
    nabi:
      "bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]",
    kultum:
      "bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] text-[#8B5CF6]",
    shahih:
      "bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.25)] text-[#22c55e]",
    hasan:
      "bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]",
    // Legacy / generic variants
    default:
      "bg-[rgba(201,163,90,0.08)] border border-[rgba(201,163,90,0.2)] text-[#C9A35A]",
    secondary:
      "bg-[#0e1e2a] border border-[rgba(201,163,90,0.1)] text-[#8BAAA0]",
    destructive:
      "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-rose-400",
    outline:
      "border border-[rgba(201,163,90,0.2)] text-[#E8F4EC]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-cairo font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
