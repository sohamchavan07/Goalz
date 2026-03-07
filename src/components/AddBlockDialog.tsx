import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BlockType, TimeBlock } from "@/stores/plannerStore";

interface AddBlockDialogProps {
  onAdd: (block: Omit<TimeBlock, "id">) => void;
}

export function AddBlockDialog({ onAdd }: AddBlockDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startHour, setStartHour] = useState("9");
  const [duration, setDuration] = useState("1");
  const [type, setType] = useState<BlockType>("deep-work");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), startHour: Number(startHour), duration: Number(duration), type, completed: false });
    setTitle("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/20 font-mono text-xs text-primary hover:bg-primary/10 hover:text-primary">
          <Plus className="mr-1 h-3 w-3" /> Add Block
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">New Time Block</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Block title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-secondary border-border font-mono text-sm"
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Start</label>
              <Select value={startHour} onValueChange={setStartHour}>
                <SelectTrigger className="bg-secondary border-border font-mono text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)} className="font-mono text-sm">
                      {i === 0 ? "12 AM" : i === 12 ? "12 PM" : i < 12 ? `${i} AM` : `${i-12} PM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-secondary border-border font-mono text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["0.5","1","1.5","2","2.5","3","4"].map(d => (
                    <SelectItem key={d} value={d} className="font-mono text-sm">{d}h</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase text-muted-foreground">Type</label>
              <Select value={type} onValueChange={v => setType(v as BlockType)}>
                <SelectTrigger className="bg-secondary border-border font-mono text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="deep-work" className="font-mono text-sm">Deep Work</SelectItem>
                  <SelectItem value="meeting" className="font-mono text-sm">Meeting</SelectItem>
                  <SelectItem value="break" className="font-mono text-sm">Break</SelectItem>
                  <SelectItem value="admin" className="font-mono text-sm">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full font-mono text-sm">Create Block</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
