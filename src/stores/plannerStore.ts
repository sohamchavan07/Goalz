import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";

export type BlockType = "deep-work" | "meeting" | "break" | "admin";



export interface TimeBlock {
  id: string;
  title: string;
  startHour: number;
  duration: number; // in hours (0.5 increments)
  type: BlockType;
  completed: boolean;
}

export interface Priority {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlannerSettings {
  planningHour: number; // 0-23
  reviewHour: number;   // 0-23
  meetingBuffer: boolean; // auto-add buffer between blocks
  bufferMinutes: number;  // 5 or 10
}


const DEFAULT_BLOCKS: TimeBlock[] = [];
const DEFAULT_PRIORITIES: Priority[] = [];

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}


const todayKey = dateKey(new Date());

export function usePlannerStore() {
  // --- Persistence helpers ---
  function loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function saveToStorage<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  // --- State with persistence ---
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const raw = localStorage.getItem("planner.selectedDate");
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });
  const [blocksByDate, setBlocksByDate] = useState<Record<string, TimeBlock[]>>(() =>
    loadFromStorage("planner.blocksByDate", { [todayKey]: DEFAULT_BLOCKS })
  );
  const [prioritiesByDate, setPrioritiesByDate] = useState<Record<string, Priority[]>>(() =>
    loadFromStorage("planner.prioritiesByDate", { [todayKey]: DEFAULT_PRIORITIES })
  );
  const [settings, setSettings] = useState<PlannerSettings>(() =>
    loadFromStorage("planner.settings", { planningHour: 23, reviewHour: 4, meetingBuffer: false, bufferMinutes: 5 })
  );
  const [focusBlockId, setFocusBlockId] = useState<string | null>(() =>
    loadFromStorage("planner.focusBlockId", "1")
  );

  const key = dateKey(selectedDate);
  const blocks = blocksByDate[key] || [];
  const priorities = prioritiesByDate[key] || [
    { id: crypto.randomUUID(), text: "", completed: false },
    { id: crypto.randomUUID(), text: "", completed: false },
    { id: crypto.randomUUID(), text: "", completed: false },
  ];

  // --- Persist state on change ---
  useEffect(() => {
    saveToStorage("planner.selectedDate", selectedDate.toISOString());
  }, [selectedDate]);
  useEffect(() => {
    saveToStorage("planner.blocksByDate", blocksByDate);
  }, [blocksByDate]);
  useEffect(() => {
    saveToStorage("planner.prioritiesByDate", prioritiesByDate);
  }, [prioritiesByDate]);
  useEffect(() => {
    saveToStorage("planner.settings", settings);
  }, [settings]);
  useEffect(() => {
    saveToStorage("planner.focusBlockId", focusBlockId);
  }, [focusBlockId]);

  const toggleBlockComplete = useCallback((id: string) => {
    setBlocksByDate(prev => ({ ...prev, [key]: (prev[key] || []).map(b => b.id === id ? { ...b, completed: !b.completed } : b) }));
  }, [key]);

  const togglePriority = useCallback((id: string) => {
    setPrioritiesByDate(prev => ({ ...prev, [key]: (prev[key] || []).map(p => p.id === id ? { ...p, completed: !p.completed } : p) }));
  }, [key]);

  const updatePriority = useCallback((id: string, text: string) => {
    setPrioritiesByDate(prev => ({ ...prev, [key]: (prev[key] || []).map(p => p.id === id ? { ...p, text } : p) }));
  }, [key]);

  const addPriority = useCallback(() => {
    setPrioritiesByDate(prev => ({ ...prev, [key]: [...(prev[key] || []), { id: crypto.randomUUID(), text: "", completed: false }] }));
  }, [key]);

  const removePriority = useCallback((id: string) => {
    setPrioritiesByDate(prev => ({ ...prev, [key]: (prev[key] || []).filter(p => p.id !== id) }));
  }, [key]);

  const reorderPriorities = useCallback((fromIndex: number, toIndex: number) => {
    setPrioritiesByDate(prev => {
      const list = [...(prev[key] || [])];
      const [item] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, item);
      return { ...prev, [key]: list };
    });
  }, [key]);

  const addBlock = useCallback((block: Omit<TimeBlock, "id">) => {
    setBlocksByDate(prev => ({ ...prev, [key]: [...(prev[key] || []), { ...block, id: crypto.randomUUID() }] }));
  }, [key]);

  const removeBlock = useCallback((id: string) => {
    setBlocksByDate(prev => ({ ...prev, [key]: (prev[key] || []).filter(b => b.id !== id) }));
  }, [key]);

  const updateSettings = useCallback((s: Partial<PlannerSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const currentFocusBlock = blocks.find(b => b.id === focusBlockId) || null;

  return {
    blocks, priorities, settings, currentFocusBlock, focusBlockId,
    selectedDate, setSelectedDate,
    toggleBlockComplete, togglePriority, updatePriority,
    addPriority, removePriority, reorderPriorities,
    addBlock, removeBlock, updateSettings, setFocusBlockId,
  };
}
