import { Shield, CheckCircle2, Calendar, BarChart3 } from "lucide-react";
import type { TimeBlock, Priority } from "@/stores/plannerStore";

interface StatusBarProps {
  blocks: TimeBlock[];
  priorities: Priority[];
}

export function StatusBar({ blocks, priorities }: StatusBarProps) {
  const deepHours = blocks.filter(b => b.type === "deep-work").reduce((s, b) => s + b.duration, 0);
  const completedBlocks = blocks.filter(b => b.completed).length;
  const completedPriorities = priorities.filter(p => p.completed).length;
  const totalBlocks = blocks.length;

  const stats = [
    { icon: Shield, label: "Deep Work", value: `${deepHours}h`, color: "text-primary" },
    { icon: CheckCircle2, label: "Tasks Done", value: `${completedBlocks}/${totalBlocks}`, color: "text-success" },
    { icon: Calendar, label: "Priorities", value: `${completedPriorities}/3`, color: "text-accent" },
    { icon: BarChart3, label: "Focus Score", value: `${Math.round((deepHours / 8) * 100)}%`, color: "text-warning" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="floating-card p-5 hover-lift">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color} glow-text-primary`} />
            <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</span>
          </div>
          <p className={`mt-2 font-mono-premium text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
