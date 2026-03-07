import { motion } from "framer-motion";
import { Sun, Shield, CheckCircle2, Clock, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeBlock, Priority } from "@/stores/plannerStore";

interface ReviewOverlayProps {
  blocks: TimeBlock[];
  priorities: Priority[];
  onDismiss: () => void;
}

export function ReviewOverlay({ blocks, priorities, onDismiss }: ReviewOverlayProps) {
  const completedBlocks = blocks.filter(b => b.completed).length;
  const totalBlocks = blocks.length;
  const completionRate = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
  const deepWorkHours = blocks.filter(b => b.type === "deep-work").reduce((s, b) => s + (b.completed ? b.duration : 0), 0);
  const totalDeepWork = blocks.filter(b => b.type === "deep-work").reduce((s, b) => s + b.duration, 0);
  const completedPriorities = priorities.filter(p => p.completed).length;
  const meetingHours = blocks.filter(b => b.type === "meeting").reduce((s, b) => s + b.duration, 0);

  const stats = [
    { icon: BarChart3, label: "Completion", value: `${completionRate}%`, color: "text-primary", sub: `${completedBlocks}/${totalBlocks} blocks` },
    { icon: Shield, label: "Deep Work", value: `${deepWorkHours}h`, color: "text-primary", sub: `of ${totalDeepWork}h planned` },
    { icon: CheckCircle2, label: "Priorities", value: `${completedPriorities}/3`, color: "text-success", sub: completedPriorities === 3 ? "All done!" : "Keep pushing" },
    { icon: Clock, label: "Meetings", value: `${meetingHours}h`, color: "text-warning", sub: meetingHours > 2 ? "Too many" : "Under control" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Sun className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h2 className="font-mono text-xl font-bold text-foreground">Execution Summary</h2>
              <p className="font-mono text-xs text-muted-foreground">Yesterday's performance review</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(({ icon: Icon, label, value, color, sub }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              </div>
              <p className={`mt-1 font-mono text-2xl font-bold ${color}`}>{value}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Completed priorities */}
        <div className="mb-6 space-y-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Priority Results</h3>
          {priorities.map(p => (
            <div key={p.id} className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-sm ${
              p.completed ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {p.completed ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span className={p.completed ? "line-through" : ""}>{p.text}</span>
            </div>
          ))}
        </div>

        <Button onClick={onDismiss} className="w-full font-mono">
          Start Today
        </Button>
      </motion.div>
    </motion.div>
  );
}
