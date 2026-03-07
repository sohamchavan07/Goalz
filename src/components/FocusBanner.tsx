import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Timer } from "lucide-react";
import type { TimeBlock } from "@/stores/plannerStore";

interface FocusBannerProps {
  block: TimeBlock | null;
}

export function FocusBanner({ block }: FocusBannerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!block) return;
    setElapsed(0);
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [block?.id]);

  if (!block) return null;

  const totalSeconds = block.duration * 3600;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-6 floating-card glow-primary"
    >
      <div
        className="absolute inset-0 bg-primary/20 glowing-progress transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary animate-pulse-glow glow-text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground font-bold">Current Focus</p>
            <p className="font-display font-bold text-lg text-foreground tracking-tight">{block.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono-premium text-2xl tabular-nums text-primary glow-text-primary">
          <Timer className="h-5 w-5" />
          {hrs > 0 && <span>{hrs}h</span>}
          <span>{String(mins).padStart(2, "0")}m</span>
          <span className="text-sm text-muted-foreground/60">{String(secs).padStart(2, "0")}s</span>
        </div>
      </div>
    </motion.div>
  );
}
