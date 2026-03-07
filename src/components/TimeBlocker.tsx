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
  meetingBuffer: boolean;
  bufferMinutes: number;
}

export function TimeBlocker({ blocks, onToggleComplete, focusBlockId, onSetFocus, onAddBlock, meetingBuffer, bufferMinutes }: TimeBlockerProps) {
  const deepWorkHours = blocks.filter(b => b.type === "deep-work").reduce((s, b) => s + b.duration, 0);
  const meetingHours = blocks.filter(b => b.type === "meeting").reduce((s, b) => s + b.duration, 0);

  // Check if a block has a following block (for buffer display)
  const hasFollowingBlock = (block: TimeBlock) => {
    const endTime = block.startHour + block.duration;
    return blocks.some(b => b.id !== block.id && b.startHour === endTime);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
            Time Blocks
          </h2>
        </div>
        <div className="flex gap-3 font-mono text-xs">
          <span className="text-primary">{deepWorkHours}h deep</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-meeting">{meetingHours}h meetings</span>
        </div>
      </div>

      {/* Anti-Meeting Guard */}
      {meetingHours > 2 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
          <Shield className="h-3 w-3" />
          Warning: {meetingHours}h of meetings. Consider declining some.
        </div>
      )}

      {/* Meeting Buffer indicator */}
      {meetingBuffer && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-[10px] text-primary">
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
            <div key={hour} className="flex min-h-[40px]">
              <div className="w-14 shrink-0 pr-3 pt-1 text-right font-mono text-[10px] text-muted-foreground/60">
                {formatHour(hour)}
              </div>
              <div className="flex-1 border-l border-border/50 pl-3">
                {block ? (
                  <>
                    <TimeBlockItem
                      block={block}
                      isFocused={block.id === focusBlockId}
                      onToggle={() => onToggleComplete(block.id)}
                      onFocus={() => onSetFocus(block.id)}
                    />
                    {meetingBuffer && hasFollowingBlock(block) && (
                      <div className="mb-1 flex items-center gap-1.5 rounded border border-dashed border-muted-foreground/20 px-2 py-1">
                        <Coffee className="h-2.5 w-2.5 text-muted-foreground/40" />
                        <span className="font-mono text-[9px] text-muted-foreground/40">{bufferMinutes}min buffer</span>
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
}: {
  block: TimeBlock;
  isFocused: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  const style = BLOCK_STYLES[block.type];
  const Icon = style.icon;
  const height = Math.max(36, block.duration * 56);

  return (
    <motion.div
      whileHover={{ x: 2 }}
      className={`group mb-1 flex items-start gap-2 rounded-md border px-3 py-2 transition-all ${style.bg} ${style.border} ${
        isFocused ? "glow-primary-sm ring-1 ring-primary/30" : ""
      } ${block.completed ? "opacity-50" : ""}`}
      style={{ minHeight: height }}
    >
      <button onClick={onToggle} className="mt-0.5 shrink-0">
        <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
          block.completed ? "border-success bg-success" : "border-muted-foreground/30 hover:border-primary"
        }`}>
          {block.completed && <Check className="h-2.5 w-2.5 text-success-foreground" />}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{style.label}</span>
        </div>
        <p className={`font-mono text-sm ${block.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {block.title}
        </p>
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatHour(block.startHour)} – {formatHour(block.startHour + block.duration)} · {block.duration}h
        </span>
      </div>
      {!isFocused && !block.completed && (
        <button
          onClick={onFocus}
          className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Set as current focus"
        >
          <Play className="h-3 w-3 text-primary" />
        </button>
      )}
    </motion.div>
  );
}
