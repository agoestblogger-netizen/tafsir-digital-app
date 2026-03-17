"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card"; // Keep CardContent, remove CardHeader/Title as they are not used in the final structure
import { Badge } from "@/components/ui/Badge";

export interface SurahProps {
  id: number;
  name: string;
  arab: string;
  translation: string;
  revelation: string;
  verses: number;
  pitch: string;
}

export function SurahCard({ surah }: { surah: SurahProps }) {
  return (
    <Link href={`/surah/${surah.id}`}>
      <motion.div whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }}>
        <Card className="hover:border-primary/50 transition-colors card-premium dark:bg-slate-800 dark:border-slate-700 relative overflow-hidden group">
          {/* Subtle gold decoration on left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 to-amber-500 opacity-60"></div>
          <CardContent className="p-4 md:p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary dark:bg-slate-700 text-primary dark:text-gray-300 font-semibold">
                  {surah.id}
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg text-foreground dark:text-gray-100 group-hover:text-primary transition-colors">
                    {surah.name}
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {surah.translation}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-arabic text-lg md:text-xl text-foreground dark:text-gray-200 font-medium">{surah.arab}</p>
              </div>
            </div>
            
            <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400 line-clamp-2 md:mb-4 mb-3 leading-relaxed">
              {surah.pitch}
            </p>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1">
                <BookOpen className="w-3 h-3" /> {surah.verses} Ayat
              </Badge>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {surah.revelation}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
