import { useEffect, useRef, useCallback, useState } from "react";
import type { TimeBlock } from "@/stores/plannerStore";

export interface PendingNotification {
  blockId: string;
  title: string;
  type: "starting";
}

export function useNotifications(blocks: TimeBlock[]) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [pendingAction, setPendingAction] = useState<PendingNotification | null>(null);
  const firedRef = useRef<Set<string>>(new Set());

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;

    const check = () => {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;

      blocks.forEach(block => {
        const key = `${block.id}-${now.toDateString()}`;
        if (firedRef.current.has(key)) return;
        if (block.completed) return;

        // Fire if we're within 1 minute of start time
        const diff = Math.abs(currentHour - block.startHour);
        if (diff < 1 / 60) {
          firedRef.current.add(key);
          new Notification(`⏰ ${block.title}`, {
            body: `Your ${block.type.replace("-", " ")} block is starting now.`,
            icon: "/favicon.ico",
            tag: block.id,
          });
          setPendingAction({ blockId: block.id, title: block.title, type: "starting" });
        }
      });
    };

    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [blocks, permission]);

  const dismissAction = useCallback(() => setPendingAction(null), []);

  return { permission, requestPermission, pendingAction, dismissAction };
}
