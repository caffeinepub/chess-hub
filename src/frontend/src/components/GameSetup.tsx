import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

export type TimeControl = {
  label: string;
  seconds: number;
  type: "bullet" | "blitz" | "rapid" | "classic";
};

export const TIME_CONTROLS: TimeControl[] = [
  { label: "Bullet 1 min", seconds: 60, type: "bullet" },
  { label: "Blitz 3 min", seconds: 180, type: "blitz" },
  { label: "Rapid 10 min", seconds: 600, type: "rapid" },
  { label: "Classic 30 min", seconds: 1800, type: "classic" },
];

export type GameMode = "vs-ai" | "two-player" | "online";

interface GameSetupProps {
  onStartGame: (
    timeControl: TimeControl,
    mode: GameMode,
    playerColor: "white" | "black" | "random",
  ) => void;
  onCancel?: () => void;
}

interface ModeOption {
  value: GameMode;
  label: string;
}

interface ColorOption {
  value: "white" | "black" | "random";
  label: string;
}

const MODE_OPTIONS: ModeOption[] = [
  { value: "vs-ai", label: "🤖 vs Computer" },
  { value: "two-player", label: "👥 Two Players" },
];

const COLOR_OPTIONS: ColorOption[] = [
  { value: "white", label: "♔ White" },
  { value: "black", label: "♚ Black" },
  { value: "random", label: "🎲 Random" },
];

export function GameSetup({ onStartGame, onCancel }: GameSetupProps) {
  const [selectedTime, setSelectedTime] = React.useState<TimeControl>(
    TIME_CONTROLS[1],
  );
  const [selectedMode, setSelectedMode] = React.useState<GameMode>("vs-ai");
  const [selectedColor, setSelectedColor] = React.useState<
    "white" | "black" | "random"
  >("white");

  const handleStart = () => {
    const color =
      selectedColor === "random"
        ? Math.random() < 0.5
          ? "white"
          : "black"
        : selectedColor;
    onStartGame(selectedTime, selectedMode, color);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-card rounded-2xl shadow-2xl p-8 z-10 w-full max-w-md"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        data-ocid="gamesetup.modal"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">New Game</h2>

        {/* Game Mode */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Game Mode
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MODE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedMode === value
                    ? "border-navy-dark bg-navy-dark text-white"
                    : "border-border bg-card text-foreground hover:border-navy-mid"
                }`}
                onClick={() => setSelectedMode(value)}
                data-ocid={`gamesetup.${value}_button`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Control */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Time Control
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.label}
                type="button"
                className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedTime.label === tc.label
                    ? "border-navy-dark bg-navy-dark text-white"
                    : "border-border bg-card text-foreground hover:border-navy-mid"
                }`}
                onClick={() => setSelectedTime(tc)}
                data-ocid={`gamesetup.${tc.type}_button`}
              >
                {tc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection (only for vs AI) */}
        {selectedMode === "vs-ai" && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Play As
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedColor === value
                      ? "border-navy-dark bg-navy-dark text-white"
                      : "border-border bg-card text-foreground hover:border-navy-mid"
                  }`}
                  onClick={() => setSelectedColor(value)}
                  data-ocid={`gamesetup.color_${value}_button`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {onCancel && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              data-ocid="gamesetup.cancel_button"
            >
              Cancel
            </Button>
          )}
          <Button
            className="flex-1 bg-navy-dark hover:bg-navy-mid text-white"
            onClick={handleStart}
            data-ocid="gamesetup.start_button"
          >
            Start Game
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
