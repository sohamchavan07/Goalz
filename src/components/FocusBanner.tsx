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
      className="relative overflow-hidden rounded-lg border border-primary/20 bg-card p-4 glow-primary"
    >
      <div
        className="absolute inset-0 bg-primary/5 transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Zap className="h-4 w-4 text-primary animate-pulse-glow" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Current Focus</p>
            <p className="font-mono font-semibold text-foreground">{block.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xl tabular-nums text-primary">
          <Timer className="h-4 w-4" />
          {hrs > 0 && <span>{hrs}h</span>}
          <span>{String(mins).padStart(2, "0")}m</span>
          <span className="text-sm text-muted-foreground">{String(secs).padStart(2, "0")}s</span>
        </div>
      </div>
    </motion.div>
  );
}
