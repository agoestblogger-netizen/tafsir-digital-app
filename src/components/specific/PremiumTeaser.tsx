"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function PremiumTeaser() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/30 to-background shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Crown className="w-24 h-24" />
        </div>
        
        <CardContent className="p-6 relative z-10">
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 mb-3 shadow-sm">
            <Sparkles className="w-3 h-3 mr-1" /> Premium
          </Badge>
          
          <h3 className="text-xl font-semibold mb-2">Buka Potensi Penuhmu</h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-[250px]">
            Dapatkan akses ke program hijrah 40 hari, tafsir mendalam neurosains, dan mentoring eksklusif.
          </p>
          
          <Button className="w-full flex items-center justify-center gap-2 rounded-xl group relative overflow-hidden bg-primary text-primary-foreground">
            <span className="relative z-10">Upgrade to Premium</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
