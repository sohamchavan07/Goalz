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
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        exit={{ y: -60 }}
        className="fixed top-0 left-0 right-0 z-40 border-b border-primary/20 bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-primary animate-pulse-glow" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Current Task</p>
              <p className="font-mono text-sm font-semibold text-foreground">{currentBlock.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-mono tabular-nums text-primary">
              <Timer className="h-3.5 w-3.5" />
              <span className="text-sm font-bold">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
            </div>
            {notificationPermission !== "granted" && (
              <Button variant="ghost" size="icon" onClick={onRequestNotifications} className="h-8 w-8" title="Enable notifications">
                <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            {notificationPermission === "granted" && (
              <Bell className="h-3.5 w-3.5 text-success" />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
