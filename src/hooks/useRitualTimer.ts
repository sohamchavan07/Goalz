import { useState, useEffect, useCallback } from "react";
import type { PlannerSettings } from "@/stores/plannerStore";

export type RitualMode = "none" | "planning" | "review";

export function useRitualTimer(settings: PlannerSettings) {
  const [activeRitual, setActiveRitual] = useState<RitualMode>("none");
  const [dismissed, setDismissed] = useState<{ planning: string; review: string }>({
    planning: "",
    review: "",
  });

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hour = now.getHours();
      const dateKey = now.toDateString();

      if (hour === settings.planningHour && dismissed.planning !== dateKey) {
        setActiveRitual("planning");
      } else if (hour === settings.reviewHour && dismissed.review !== dateKey) {
        setActiveRitual("review");
      } else if (activeRitual !== "none") {
        // Only auto-dismiss if the hour has passed
        if (activeRitual === "planning" && hour !== settings.planningHour) {
          setActiveRitual("none");
        }
        if (activeRitual === "review" && hour !== settings.reviewHour) {
          setActiveRitual("none");
        }
      }
    };

    check();
    const interval = setInterval(check, 30_000); // check every 30s
    return () => clearInterval(interval);
  }, [settings.planningHour, settings.reviewHour, dismissed, activeRitual]);

  const dismissRitual = useCallback((mode: "planning" | "review") => {
    const dateKey = new Date().toDateString();
    setDismissed(prev => ({ ...prev, [mode]: dateKey }));
    setActiveRitual("none");
  }, []);

  // Manual trigger for testing
  const forceRitual = useCallback((mode: RitualMode) => {
    setActiveRitual(mode);
  }, []);

  return { activeRitual, dismissRitual, forceRitual };
}
