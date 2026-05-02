import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "card";
}

function Skeleton({ className, variant = "line", ...props }: SkeletonProps) {
  const base =
    "relative overflow-hidden bg-[#0e1e2a] rounded-xl after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-[rgba(21,37,53,0.8)] after:to-transparent after:animate-[shimmer_1.5s_infinite]";

  const variants: Record<string, string> = {
    line:   "h-4 w-full rounded-full",
    circle: "rounded-full",
    card:   "rounded-2xl",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

// Convenience composites
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-[rgba(201,163,90,0.08)] bg-[#0a1520] p-5 flex flex-col gap-3", className)}
      {...props}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export { Skeleton, SkeletonCard };
