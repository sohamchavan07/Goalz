import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Check, Plus, X, GripVertical, Pencil } from "lucide-react";
import type { Priority } from "@/stores/plannerStore";

interface TopPrioritiesProps {
  priorities: Priority[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export function TopPriorities({ priorities, onToggle, onUpdate, onAdd, onRemove, onReorder }: TopPrioritiesProps) {
  const completed = priorities.filter(p => p.completed).length;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
            Priorities
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{completed}/{priorities.length}</span>
          <button
            onClick={onAdd}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {priorities.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`relative ${dragOverIndex === i ? "border-t-2 border-primary" : ""}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDragEnd={() => {
                if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
                  onReorder(dragIndex, dragOverIndex);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
            >
              <PriorityItem
                priority={p}
                index={i}
                isEditing={editingId === p.id}
                onStartEdit={() => setEditingId(p.id)}
                onEndEdit={() => setEditingId(null)}
                onToggle={() => onToggle(p.id)}
                onUpdate={(text) => onUpdate(p.id, text)}
                onRemove={() => onRemove(p.id)}
                isDragging={dragIndex === i}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {priorities.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Target className="h-6 w-6 text-muted-foreground/30" />
            <p className="font-mono text-xs text-muted-foreground">No priorities set</p>
            <button onClick={onAdd} className="font-mono text-xs text-primary hover:underline">
              Add your first priority
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityItem({
  priority: p,
  index: i,
  isEditing,
  onStartEdit,
  onEndEdit,
  onToggle,
  onUpdate,
  onRemove,
  isDragging,
}: {
  priority: Priority;
  index: number;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onRemove: () => void;
  isDragging: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(p.text);

  useEffect(() => { setDraft(p.text); }, [p.text]);
  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  const save = () => {
    onUpdate(draft.trim());
    onEndEdit();
  };

  return (
    <div
      className={`group flex w-full items-center gap-2 rounded-md border px-3 py-2.5 transition-all ${
        isDragging ? "opacity-40" : ""
      } ${
        p.completed
          ? "border-success/20 bg-success/5"
          : "border-border bg-secondary/30 hover:border-primary/30"
      }`}
    >
      {/* Drag handle */}
      <div className="cursor-grab opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {/* Checkbox */}
      <button onClick={onToggle} className="shrink-0">
        <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold transition-all ${
          p.completed
            ? "border-success bg-success text-success-foreground"
            : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
        }`}>
          {p.completed ? <Check className="h-3 w-3" /> : i + 1}
        </div>
      </button>

      {/* Text / Edit */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(p.text); onEndEdit(); } }}
            className="w-full bg-transparent font-mono text-sm text-foreground outline-none border-b border-primary/40 py-0.5"
            placeholder="Enter priority..."
          />
        ) : (
          <button onClick={onStartEdit} className="w-full text-left">
            <span className={`font-mono text-sm transition-all ${
              p.completed ? "text-muted-foreground line-through" : p.text ? "text-foreground" : "text-muted-foreground/50 italic"
            }`}>
              {p.text || "Click to edit..."}
            </span>
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <button onClick={onStartEdit} className="rounded p-1 hover:bg-secondary" title="Edit">
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
        <button onClick={onRemove} className="rounded p-1 hover:bg-destructive/10" title="Remove">
          <X className="h-3 w-3 text-destructive/70" />
        </button>
      </div>
    </div>
  );
}
