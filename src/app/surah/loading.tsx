import * as React from "react";
import { Compass, Search } from "lucide-react";
import { InputField } from "@/components/ui/InputField";

export default function LoadingSurahList() {
  return (
    <main className="flex flex-col min-h-screen bg-page-warm pb-24">
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary animate-pulse mb-2 shadow-sm">
          <Compass className="w-6 h-6 text-primary/50" />
        </div>
        <div className="h-8 bg-secondary/60 animate-pulse rounded-md w-40 mb-1"></div>
        <div className="h-4 bg-secondary/50 animate-pulse rounded-md w-3/4"></div>
      </header>

      <div className="relative mt-2">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground/50" />
        </div>
        <InputField 
          placeholder="Loading surah..." 
          className="pl-12 bg-white/50"
          disabled
        />
      </div>

      <div className="flex flex-col gap-4 mt-4 relative z-10">
        {/* Sage Green Skeleton Loaders */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card-premium relative overflow-hidden h-[160px] p-5 rounded-2xl animate-pulse bg-white/40">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/40"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-xl bg-secondary/60"></div>
                <div className="flex flex-col gap-2 w-1/2">
                  <div className="h-5 bg-secondary/70 rounded-md w-3/4"></div>
                  <div className="h-3 bg-secondary/50 rounded-md w-1/2"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-secondary/60 rounded-md"></div>
            </div>
            
            <div className="flex flex-col gap-2 mb-4 mt-6">
              <div className="h-3 bg-secondary/40 rounded-md w-full"></div>
              <div className="h-3 bg-secondary/40 rounded-md w-4/5"></div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <div className="w-20 h-5 bg-secondary/50 rounded-full"></div>
              <div className="w-20 h-5 bg-secondary/50 rounded-full border border-primary/10"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
