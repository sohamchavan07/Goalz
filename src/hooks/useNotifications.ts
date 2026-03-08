import { useEffect, useRef, useCallback, useState } from "react";
import { addDays } from "date-fns";
import type { TimeBlock } from "@/stores/plannerStore";

export interface PendingNotification {
  blockId?: string;
  title: string;
  type: "starting" | "plan-tomorrow";
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

      // Block notifications (existing)
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

      // 11pm planning notification
      const planKey = `plan-tomorrow-${now.toDateString()}`;
      if (!firedRef.current.has(planKey)) {
        if (now.getHours() === 23 && now.getMinutes() < 2) {
          firedRef.current.add(planKey);
          new Notification("📝 Plan Tomorrow", {
            body: "What do you want to do tomorrow? Click to add tasks!",
            icon: "/favicon.ico",
            tag: "plan-tomorrow",
          });
          setPendingAction({ title: "Plan tomorrow's tasks", type: "plan-tomorrow" });
        }
      }

      // 8am completed tasks notification
      const completedKey = `completed-tasks-${now.toDateString()}`;
      if (!firedRef.current.has(completedKey)) {
        if (now.getHours() === 8 && now.getMinutes() < 2) {
          firedRef.current.add(completedKey);
          // Gather completed tasks for today
          const completedBlocks = blocks.filter(b => b.completed);
          if (completedBlocks.length > 0) {
            const taskList = completedBlocks.map(b => `• ${b.title}`).join("\n");
            new Notification("✅ Completed Tasks", {
              body: `Tasks completed so far today:\n${taskList}`,
              icon: "/favicon.ico",
              tag: "completed-tasks",
            });
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [blocks, permission]);

  const dismissAction = useCallback(() => setPendingAction(null), []);

  return { permission, requestPermission, pendingAction, dismissAction };
}
