import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Target, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Priority } from "@/stores/plannerStore";

interface PlanningOverlayProps {
  priorities: Priority[];
  onUpdatePriority: (id: string, text: string) => void;
  onDismiss: () => void;
}

export function PlanningOverlay({ priorities, onUpdatePriority, onDismiss }: PlanningOverlayProps) {
  const [step, setStep] = useState(0); // 0=intro, 1=set priorities, 2=done
  const [drafts, setDrafts] = useState(priorities.map(p => p.text));

  const handleSave = () => {
    priorities.forEach((p, i) => {
      if (drafts[i] && drafts[i] !== p.text) {
        onUpdatePriority(p.id, drafts[i]);
      }
    });
    setStep(2);
  };

  const allFilled = drafts.every(d => d.trim().length > 0);

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
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 glow-primary">
                <Moon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-mono text-xl font-bold text-foreground">Design Tomorrow</h2>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  It's time for your evening planning ritual. Set your top 3 priorities for tomorrow.
                </p>
              </div>
              <Button onClick={() => setStep(1)} className="font-mono">
                Begin <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="priorities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-mono text-lg font-bold text-foreground">Top 3 Priorities</h2>
              </div>
              <p className="font-mono text-xs text-muted-foreground">What are the 3 non-negotiable goals for tomorrow?</p>
              <div className="space-y-3">
                {drafts.map((draft, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 font-mono text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <Input
                      value={draft}
                      onChange={e => {
                        const next = [...drafts];
                        next[i] = e.target.value;
                        setDrafts(next);
                      }}
                      placeholder={`Priority ${i + 1}...`}
                      className="bg-secondary border-border font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSave} disabled={!allFilled} className="w-full font-mono">
                Lock In Priorities
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <div>
                <h2 className="font-mono text-xl font-bold text-foreground">Tomorrow is Designed</h2>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  Rest well. Your priorities are locked in.
                </p>
              </div>
              <Button variant="outline" onClick={onDismiss} className="font-mono">
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
