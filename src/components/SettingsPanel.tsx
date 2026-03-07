import { Settings, Moon, Sun, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { PlannerSettings } from "@/stores/plannerStore";
import type { RitualMode } from "@/hooks/useRitualTimer";

interface SettingsPanelProps {
  settings: PlannerSettings;
  onUpdate: (s: Partial<PlannerSettings>) => void;
  onForceRitual?: (mode: RitualMode) => void;
}

function formatHourLabel(h: number) {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
}

export function SettingsPanel({ settings, onUpdate, onForceRitual }: SettingsPanelProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Moon className="mr-1 inline h-3 w-3" /> Planning Ritual Time
            </label>
            <Select
              value={String(settings.planningHour)}
              onValueChange={v => onUpdate({ planningHour: Number(v) })}
            >
              <SelectTrigger className="mt-2 bg-secondary border-border font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)} className="font-mono text-sm">
                    {formatHourLabel(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <Sun className="mr-1 inline h-3 w-3" /> Review Ritual Time
            </label>
            <Select
              value={String(settings.reviewHour)}
              onValueChange={v => onUpdate({ reviewHour: Number(v) })}
            >
              <SelectTrigger className="mt-2 bg-secondary border-border font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)} className="font-mono text-sm">
                    {formatHourLabel(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Buffer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Timer className="mr-1 inline h-3 w-3" /> Meeting Buffer
              </label>
              <Switch
                checked={settings.meetingBuffer}
                onCheckedChange={v => onUpdate({ meetingBuffer: v })}
              />
            </div>
            {settings.meetingBuffer && (
              <Select
                value={String(settings.bufferMinutes)}
                onValueChange={v => onUpdate({ bufferMinutes: Number(v) })}
              >
                <SelectTrigger className="bg-secondary border-border font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="5" className="font-mono text-sm">5 min cool-down</SelectItem>
                  <SelectItem value="10" className="font-mono text-sm">10 min cool-down</SelectItem>
                </SelectContent>
              </Select>
            )}
            <p className="font-mono text-[10px] text-muted-foreground">
              Auto-adds buffer time between consecutive blocks.
            </p>
          </div>

          {/* Test Rituals */}
          {onForceRitual && (
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Test Rituals</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onForceRitual("planning")} className="font-mono text-xs flex-1">
                  <Moon className="mr-1 h-3 w-3" /> Planning
                </Button>
                <Button variant="outline" size="sm" onClick={() => onForceRitual("review")} className="font-mono text-xs flex-1">
                  <Sun className="mr-1 h-3 w-3" /> Review
                </Button>
              </div>
            </div>
          )}

          <p className="font-mono text-[10px] text-muted-foreground">
            Planning ritual prompts you to design tomorrow. Review ritual shows yesterday's summary.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}