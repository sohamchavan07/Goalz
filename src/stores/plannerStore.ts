import { useState, useCallback } from "react";
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

const DEFAULT_BLOCKS: TimeBlock[] = [
  { id: "1", title: "Morning Deep Work", startHour: 6, duration: 2, type: "deep-work", completed: false },
  { id: "2", title: "Standup", startHour: 9, duration: 0.5, type: "meeting", completed: false },
  { id: "3", title: "Feature Development", startHour: 10, duration: 3, type: "deep-work", completed: false },
  { id: "4", title: "Lunch Break", startHour: 13, duration: 1, type: "break", completed: false },
  { id: "5", title: "Code Review", startHour: 14, duration: 1.5, type: "admin", completed: false },
  { id: "6", title: "Evening Deep Work", startHour: 16, duration: 2, type: "deep-work", completed: false },
];

const DEFAULT_PRIORITIES: Priority[] = [
  { id: "p1", text: "Ship authentication module", completed: false },
  { id: "p2", text: "Review PR #247", completed: false },
  { id: "p3", text: "Write API documentation", completed: false },
];

function dateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const todayKey = dateKey(new Date());

export function usePlannerStore() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [blocksByDate, setBlocksByDate] = useState<Record<string, TimeBlock[]>>({ [todayKey]: DEFAULT_BLOCKS });
  const [prioritiesByDate, setPrioritiesByDate] = useState<Record<string, Priority[]>>({ [todayKey]: DEFAULT_PRIORITIES });
  const [settings, setSettings] = useState<PlannerSettings>({ planningHour: 23, reviewHour: 4, meetingBuffer: false, bufferMinutes: 5 });
  const [focusBlockId, setFocusBlockId] = useState<string | null>("1");

  const key = dateKey(selectedDate);
  const blocks = blocksByDate[key] || [];
  const priorities = prioritiesByDate[key] || [
    { id: crypto.randomUUID(), text: "", completed: false },
    { id: crypto.randomUUID(), text: "", completed: false },
    { id: crypto.randomUUID(), text: "", completed: false },
  ];

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
