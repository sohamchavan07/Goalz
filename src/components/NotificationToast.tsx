import { motion, AnimatePresence } from "framer-motion";
import { Bell, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingNotification } from "@/hooks/useNotifications";

interface NotificationToastProps {
  notification: PendingNotification | null;
  onStart: (blockId: string) => void;
  onSnooze: () => void;
}

export function NotificationToast({ notification, onStart, onSnooze }: NotificationToastProps) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-primary/30 bg-card p-5 shadow-lg glow-primary"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Block Starting</p>
              <p className="font-mono text-sm font-semibold text-foreground">{notification.title}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onStart(notification.blockId)}
                  className="font-mono text-xs"
                >
                  <Play className="mr-1 h-3 w-3" /> Start Task
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSnooze}
                  className="font-mono text-xs"
                >
                  <Clock className="mr-1 h-3 w-3" /> Snooze
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
