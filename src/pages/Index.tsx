import React, { useState } from "react";
// Removed duplicate import of addDays
import { getDailyMotivationalQuote } from "@/lib/motivationalQuotes";
import { motion, AnimatePresence } from "framer-motion";
import { Crosshair, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday, startOfToday } from "date-fns";
import { FocusBanner } from "@/components/FocusBanner";
import { TopPriorities } from "@/components/TopPriorities";
import { TimeBlocker } from "@/components/TimeBlocker";
import { StatusBar } from "@/components/StatusBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AddBlockDialog } from "@/components/AddBlockDialog";
import { PlanningOverlay } from "@/components/PlanningOverlay";
import { ReviewOverlay } from "@/components/ReviewOverlay";
import { StickyTaskHeader } from "@/components/StickyTaskHeader";
import { NotificationToast } from "@/components/NotificationToast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/stores/plannerStore";
import { useRitualTimer } from "@/hooks/useRitualTimer";
import { useNotifications } from "@/hooks/useNotifications";

const Index = () => {
  const store = usePlannerStore();
  const displayDate = format(store.selectedDate, "EEEE, MMMM d");
  const { activeRitual, dismissRitual, forceRitual } = useRitualTimer(store.settings);
  const { permission, requestPermission, pendingAction, dismissAction } = useNotifications(store.blocks);
  const [showAddBlockForTomorrow, setShowAddBlockForTomorrow] = useState(false);

  const dailyQuote = getDailyMotivationalQuote();

  return (
    <div className="min-h-screen bg-transparent perspective-container flex flex-col">
      {/* Motivational Quote Banner */}
      <div className="w-full bg-gradient-to-r from-primary/80 to-accent/80 text-white text-center py-2 px-4 font-mono text-sm shadow-md mb-2 animate-fade-in">
        <span role="img" aria-label="motivation">💡</span> {dailyQuote}
      </div>
      {/* Sticky Current Task Header */}
      <StickyTaskHeader
        blocks={store.blocks}
        notificationPermission={permission}
        onRequestNotifications={requestPermission}
      />

      <div className="mx-auto max-w-5xl px-2 py-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-primary border border-primary/20">
              <Crosshair className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <CalendarIcon className="h-3 w-3" />
                    {isToday(store.selectedDate) ? `Today · ${displayDate}` : displayDate}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={store.selectedDate}
                    onSelect={(d) => d && store.setSelectedDate(d)}
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date < startOfToday()}
                  />
                </PopoverContent>
              </Popover>
              <button onClick={() => store.setSelectedDate(addDays(store.selectedDate, 1))} className="rounded p-0.5 hover:bg-secondary">
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </button>
              {!isToday(store.selectedDate) && (
                <button onClick={() => store.setSelectedDate(new Date())} className="ml-1 rounded px-1.5 py-0.5 font-mono text-[9px] text-primary hover:bg-primary/10">
                  Today
                </button>
              )}
              <h1 className="text-gradient text-xl sm:text-2xl font-display font-bold tracking-tight mt-2 sm:mt-0">GOALZ</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hover-lift">
              <AddBlockDialog
                onAdd={block => {
                  // If block.date is set, update the store's selectedDate before adding
                  if (block.date) {
                    store.setSelectedDate(block.date);
                  }
                  store.addBlock(block);
                }}
                defaultDate={store.selectedDate}
              />
            </div>
            <div className="hover-lift">
              <SettingsPanel
                settings={store.settings}
                onUpdate={store.updateSettings}
                onForceRitual={forceRitual}
              />
            </div>
          </div>
        </motion.header>

        {/* Focus Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <FocusBanner block={store.currentFocusBlock} />
        </motion.div>

        {/* Status Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <StatusBar blocks={store.blocks} priorities={store.priorities} />
        </motion.div>

        {/* Main Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-8 lg:grid-cols-[1fr_1.6fr]"
        >
          <TopPriorities
            priorities={store.priorities}
            onToggle={store.togglePriority}
            onUpdate={store.updatePriority}
            onAdd={store.addPriority}
            onRemove={store.removePriority}
            onReorder={store.reorderPriorities}
          />
          <TimeBlocker
            blocks={store.blocks}
            onToggleComplete={store.toggleBlockComplete}
            focusBlockId={store.focusBlockId}
            onSetFocus={store.setFocusBlockId}
            onAddBlock={store.addBlock}
            onDeleteBlock={store.removeBlock}
            meetingBuffer={store.settings.meetingBuffer}
            bufferMinutes={store.settings.bufferMinutes}
          />
        </motion.div>
      </div>

      {/* Ritual Overlays */}
      <AnimatePresence>
        {activeRitual === "planning" && (
          <PlanningOverlay
            priorities={store.priorities}
            onUpdatePriority={store.updatePriority}
            onDismiss={() => dismissRitual("planning")}
          />
        )}
        {activeRitual === "review" && (
          <ReviewOverlay
            blocks={store.blocks}
            priorities={store.priorities}
            onDismiss={() => dismissRitual("review")}
          />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <NotificationToast
        notification={pendingAction}
        onStart={(id) => {
          if (pendingAction?.type === "plan-tomorrow") {
            setShowAddBlockForTomorrow(true);
          } else if (id) {
            store.setFocusBlockId(id);
          }
          dismissAction();
        }}
        onSnooze={dismissAction}
      />

      {/* Add Block Dialog for Tomorrow */}
      {showAddBlockForTomorrow && (
        <AddBlockDialog
          onAdd={block => {
            const tomorrow = addDays(new Date(), 1);
            store.setSelectedDate(tomorrow);
            // Remove date property before passing to addBlock
            const { date, ...rest } = block;
            store.addBlock(rest);
            setShowAddBlockForTomorrow(false);
          }}
          defaultDate={addDays(new Date(), 1)}
        />
      )}

      {/* Footer */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-40 flex justify-center w-full pointer-events-none">
        <div className="bg-card/80 rounded-lg px-4 py-1 shadow font-mono text-xs text-muted-foreground pointer-events-auto">
          Made by{' '}
          <a
            href="https://www.sohamchavan.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline ml-1"
          >
            SOHAM
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
