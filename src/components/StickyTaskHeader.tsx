import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Timer, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeBlock } from "@/stores/plannerStore";

interface StickyTaskHeaderProps {
  blocks: TimeBlock[];
  notificationPermission: NotificationPermission;
  onRequestNotifications: () => void;
}

export function StickyTaskHeader({ blocks, notificationPermission, onRequestNotifications }: StickyTaskHeaderProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const currentBlock = blocks.find(
    b => !b.completed && currentHour >= b.startHour && currentHour < b.startHour + b.duration
  );

  if (!currentBlock) return null;

  const endTime = currentBlock.startHour + currentBlock.duration;
  const remainingHours = endTime - currentHour;
  const remainingSeconds = Math.max(0, Math.floor(remainingHours * 3600));
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        exit={{ y: -64 }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl shadow-2xl"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <Zap className="h-4 w-4 text-primary animate-pulse-glow glow-text-primary" />
            </div>
            <div>
                <p className="font-display text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">Orbital Sector</p>
                <p className="font-display text-xs sm:text-sm font-bold text-foreground tracking-tight truncate max-w-[120px] sm:max-w-none">{currentBlock.title}</p>
            </div>
          </div>
            <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2.5 font-mono-premium tabular-nums text-primary glow-text-primary">
                <Timer className="h-4 w-4" />
                <span className="text-sm sm:text-base font-bold tracking-tight">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            {notificationPermission !== "granted" && (
              <Button variant="ghost" size="icon" onClick={onRequestNotifications} className="h-8 w-8 hover:bg-white/5 hover-lift" title="Enable notifications">
                <BellOff className="h-4 w-4 text-muted-foreground/60" />
              </Button>
            )}
            {notificationPermission === "granted" && (
              <Bell className="h-4 w-4 text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
