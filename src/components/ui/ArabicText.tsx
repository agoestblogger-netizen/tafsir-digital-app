import * as React from "react";
import { cn } from "@/lib/utils";

export interface ArabicTextProps {
  arab: string;
  latin?: string;
  terjemah?: string;
  referensi?: string;
  arabSize?: "sm" | "md" | "lg" | "xl";
  showDivider?: boolean;
  className?: string;
}

const arabSizeMap: Record<NonNullable<ArabicTextProps["arabSize"]>, string> = {
  sm: "text-xl leading-[2.2]",
  md: "text-2xl leading-[2.4]",
  lg: "text-3xl leading-[2.6]",
  xl: "text-4xl leading-[2.8]",
};

export function ArabicText({
  arab,
  latin,
  terjemah,
  referensi,
  arabSize = "md",
  showDivider = false,
  className,
}: ArabicTextProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* 1. Teks Arab */}
      <p
        className={cn(
          "font-amiri text-right",
          arabSizeMap[arabSize]
        )}
        style={{ color: "var(--gold-light)", direction: "rtl" }}
        dir="rtl"
      >
        {arab}
      </p>

      {/* 2. Transliterasi */}
      {latin && (
        <p
          className="font-cairo text-right text-sm leading-[1.8] italic"
          style={{ color: "var(--teal-200)", opacity: 0.85 }}
        >
          {latin}
        </p>
      )}

      {/* 3. Divider */}
      {showDivider && (latin || terjemah) && (
        <div className="arabic-divider" />
      )}

      {/* 4. Terjemahan */}
      {terjemah && (
        <p
          className="font-cairo text-left text-sm leading-relaxed"
          style={{ color: "var(--text1)" }}
        >
          {terjemah}
        </p>
      )}

      {/* 5. Referensi */}
      {referensi && (
        <p
          className="font-cairo text-xs font-bold mt-1"
          style={{ color: "var(--gold)" }}
        >
          — {referensi}
        </p>
      )}
    </div>
  );
}
