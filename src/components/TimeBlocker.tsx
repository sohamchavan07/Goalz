import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Shield, Coffee, FileText, Check, Play, Plus } from "lucide-react";
import type { TimeBlock, BlockType } from "@/stores/plannerStore";

const BLOCK_STYLES: Record<BlockType, { bg: string; border: string; icon: typeof Clock; label: string }> = {
  "deep-work": { bg: "bg-primary/10", border: "border-primary/30", icon: Shield, label: "Deep Work" },
  "meeting": { bg: "bg-meeting/10", border: "border-meeting/30", icon: Clock, label: "Meeting" },
  "break": { bg: "bg-success/10", border: "border-success/30", icon: Coffee, label: "Break" },
  "admin": { bg: "bg-accent/10", border: "border-accent/30", icon: FileText, label: "Admin" },
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5);

function formatHour(h: number) {
  const hr = Math.floor(h);
  const min = (h % 1) * 60;
  if (hr === 0 || hr === 24) return `12${min ? ":30" : ""} AM`;
  if (hr === 12) return `12${min ? ":30" : ""} PM`;
  return hr < 12 ? `${hr}${min ? ":30" : ""} AM` : `${hr - 12}${min ? ":30" : ""} PM`;
}

interface TimeBlockerProps {
  blocks: TimeBlock[];
  onToggleComplete: (id: string) => void;
  focusBlockId: string | null;
  onSetFocus: (id: string) => void;
  onAddBlock: (block: Omit<TimeBlock, "id">) => void;
  onDeleteBlock: (id: string) => void;
  meetingBuffer: boolean;
  bufferMinutes: number;
}

export function TimeBlocker({ blocks, onToggleComplete, focusBlockId, onSetFocus, onAddBlock, onDeleteBlock, meetingBuffer, bufferMinutes }: TimeBlockerProps) {
  const deepWorkHours = blocks.filter(b => b.type === "deep-work").reduce((s, b) => s + b.duration, 0);
  const meetingHours = blocks.filter(b => b.type === "meeting").reduce((s, b) => s + b.duration, 0);

  // Check if a block has a following block (for buffer display)
  const hasFollowingBlock = (block: TimeBlock) => {
    const endTime = block.startHour + block.duration;
    return blocks.some(b => b.id !== block.id && b.startHour === endTime);
  };

  return (
    <div className="floating-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary glow-text-primary" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Time Blocks
          </h2>
        </div>
        <div className="flex gap-4 font-mono-premium text-xs font-bold uppercase tracking-widest">
          <span className="text-primary">{deepWorkHours}h deep</span>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-meeting">{meetingHours}h meetings</span>
        </div>
      </div>

      {/* Anti-Meeting Guard */}
      {meetingHours > 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 font-display text-xs text-destructive font-bold uppercase tracking-wider">
          <Shield className="h-3 w-3 animate-pulse" />
          Warning: {meetingHours}h of meetings. Consider declining some.
        </div>
      )}

      {/* Meeting Buffer indicator */}
      {meetingBuffer && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-display text-[10px] text-primary font-bold uppercase tracking-widest">
          <Coffee className="h-3 w-3" />
          {bufferMinutes}min buffer enabled between blocks
        </div>
      )}

      <div className="relative">
        {HOURS.map(hour => {
          const block = blocks.find(b => b.startHour === hour);
          const isOccupied = blocks.some(b => hour > b.startHour && hour < b.startHour + b.duration);

          if (isOccupied) return null;

          return (
            <div key={hour} className="flex min-h-[50px]">
              <div className="w-16 shrink-0 pr-4 pt-2 text-right font-mono-premium text-[10px] text-muted-foreground/40 uppercase font-bold">
                {formatHour(hour)}
              </div>
              <div className="flex-1 border-l border-white/5 pl-4">
                {block ? (
                  <>
                    <TimeBlockItem
                      block={block}
                      isFocused={block.id === focusBlockId}
                      onToggle={() => onToggleComplete(block.id)}
                      onFocus={() => onSetFocus(block.id)}
                      onDelete={() => onDeleteBlock(block.id)}
                    />
                    {meetingBuffer && hasFollowingBlock(block) && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 bg-white/5">
                        <Coffee className="h-3 w-3 text-muted-foreground/40" />
                        <span className="font-display text-[9px] text-muted-foreground/40 uppercase font-bold tracking-widest">{bufferMinutes}min buffer interval</span>
                      </div>
                    )}
                  </>
                ) : (
                  <EmptySlot hour={hour} onAddBlock={onAddBlock} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptySlot({ hour, onAddBlock }: { hour: number; onAddBlock: (block: Omit<TimeBlock, "id">) => void }) {
  const [hovering, setHovering] = useState(false);

  const quickAdd = (type: BlockType) => {
    const titles: Record<BlockType, string> = {
      "deep-work": "Deep Work",
      meeting: "Meeting",
      break: "Break",
      admin: "Admin",
    };
    onAddBlock({ title: titles[type], startHour: hour, duration: 1, type, completed: false });
  };

  return (
    <div
      className="group relative h-[1px] mt-4 bg-border/20 cursor-pointer hover:h-8 hover:mt-1 hover:bg-secondary/30 hover:rounded hover:border hover:border-dashed hover:border-border/50 transition-all flex items-center justify-center"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering && (
        <div className="flex items-center gap-1">
          <button onClick={() => quickAdd("deep-work")} className="rounded px-1.5 py-0.5 font-mono text-[9px] text-primary hover:bg-primary/10" title="Deep Work">
            <Shield className="h-3 w-3" />
          </button>
          <button onClick={() => quickAdd("meeting")} className="rounded px-1.5 py-0.5 font-mono text-[9px] text-meeting hover:bg-meeting/10" title="Meeting">
            <Clock className="h-3 w-3" />
          </button>
          <button onClick={() => quickAdd("break")} className="rounded px-1.5 py-0.5 font-mono text-[9px] text-success hover:bg-success/10" title="Break">
            <Coffee className="h-3 w-3" />
          </button>
          <button onClick={() => quickAdd("admin")} className="rounded px-1.5 py-0.5 font-mono text-[9px] text-accent hover:bg-accent/10" title="Admin">
            <FileText className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function TimeBlockItem({
  block,
  isFocused,
  onToggle,
  onFocus,
  onDelete,
}: {
  block: TimeBlock;
  isFocused: boolean;
  onToggle: () => void;
  onFocus: () => void;
  onDelete: () => void;
}) {
  const [isLaunching, setIsLaunching] = useState(false);
  const style = BLOCK_STYLES[block.type];
  const Icon = style.icon;
  const height = Math.max(36, block.duration * 56);

  const handleToggle = () => {
    if (!block.completed) {
      setIsLaunching(true);
      setTimeout(() => {
        onToggle();
        setIsLaunching(false);
      }, 700);
    } else {
      setIsLaunching(true);
      setTimeout(() => {
        onToggle();
        // Remove block after completion
        if (typeof onFocus === 'function') {
          onFocus(); // Use onFocus as a remove handler if available
        }
        setIsLaunching(false);
      }, 700);
    }
  };
  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      className={`group mb-2 flex items-start gap-3 rounded-xl border px-4 py-3 transition-all ${style.bg} ${style.border} ${isFocused ? "glow-primary ring-1 ring-primary/30" : ""
        } ${block.completed ? "opacity-40 grayscale-[0.5]" : "hover:border-primary/40"} hover-lift shadow-lg ${isLaunching ? "animate-launch" : ""}`}
      style={{ minHeight: height }}
    >
      <button onClick={handleToggle} className="mt-1 shrink-0">
        <div className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all ${block.completed ? "border-success bg-success" : "border-muted-foreground/30 hover:border-primary"
          }`}>
          {block.completed && <Check className="h-3 w-3 text-success-foreground" />}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">{style.label}</span>
        </div>
        <p className={`font-display font-semibold text-base mt-0.5 ${block.completed ? "line-through text-muted-foreground/60" : "text-foreground"}`}>
          {block.title}
        </p>
        <span className="font-mono-premium text-[10px] text-muted-foreground/60 mt-1 block uppercase tracking-wider">
          {formatHour(block.startHour)} – {formatHour(block.startHour + block.duration)} · {block.duration}h
        </span>
      </div>
      <div className="flex flex-col gap-1 ml-2">
        {!isFocused && !block.completed && (
          <button
            onClick={onFocus}
            className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 p-1.5 rounded-lg border border-primary/20 hover:bg-primary/20"
            title="Set as current focus"
          >
            <Play className="h-3.5 w-3.5 text-primary" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/10 p-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/20 mt-1"
          title="Delete block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </motion.div>
  );
}
