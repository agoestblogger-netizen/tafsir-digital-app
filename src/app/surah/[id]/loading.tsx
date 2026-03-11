import * as React from "react";
import { ChevronLeft, Info } from "lucide-react";

export default function LoadingDetailSurah() {
  return (
    <main className="flex flex-col min-h-screen bg-page-warm px-6 pb-32">
      {/* Skeleton for Header */}
      <div className="flex flex-col gap-6 pt-6 pb-4">
        <div className="flex items-center justify-between pb-4 border-b gold-divider">
          <div className="w-10 h-10 rounded-full bg-secondary/50 animate-pulse flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gold/30" />
          </div>
          <div className="h-4 bg-secondary/50 rounded-md w-20 animate-pulse"></div>
          <div className="w-10 h-10 rounded-full bg-secondary/50 animate-pulse flex items-center justify-center">
             <Info className="w-5 h-5 text-gold/30" />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="h-10 bg-secondary/60 rounded-md w-48 animate-pulse mb-2"></div>
          <div className="h-4 bg-secondary/50 rounded-md w-32 animate-pulse mb-6"></div>
          
          <div className="h-12 bg-secondary/60 rounded-md w-64 animate-pulse mb-8"></div>
          
          <div className="card-premium p-6 rounded-3xl relative overflow-hidden w-full h-32 animate-pulse bg-white/40">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
             <div className="flex flex-col gap-2 mt-4">
               <div className="h-3 bg-secondary/40 rounded-md w-full"></div>
               <div className="h-3 bg-secondary/40 rounded-md w-5/6"></div>
               <div className="h-3 bg-secondary/40 rounded-md w-4/6"></div>
             </div>
          </div>
        </div>

        <div className="w-full h-14 rounded-2xl bg-secondary/60 animate-pulse shadow-md"></div>
      </div>

      <div className="flex flex-col items-center justify-center mt-6 mb-8 gap-2">
        <div className="h-3 bg-secondary/40 rounded-md w-48 animate-pulse"></div>
      </div>

      {/* Skeleton for Verses */}
      <div className="flex flex-col gap-6 relative z-10 w-full max-w-3xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-premium relative overflow-hidden rounded-3xl p-6 md:p-8 animate-pulse bg-white/40">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/40"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/60"></div>
              <div className="h-px flex-1 bg-secondary/40"></div>
            </div>

            <div className="flex flex-col items-end gap-3 mb-8">
              <div className="h-8 bg-secondary/60 rounded-md w-full md:w-3/4"></div>
              <div className="h-8 bg-secondary/60 rounded-md w-5/6 md:w-2/3"></div>
            </div>

            <div className="border-l-2 border-secondary/40 pl-6 py-2 flex flex-col gap-2">
              <div className="h-4 bg-secondary/40 rounded-md w-full"></div>
              <div className="h-4 bg-secondary/40 rounded-md w-4/5"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
