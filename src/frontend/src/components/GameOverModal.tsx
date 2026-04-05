import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { PieceColor } from "../chess/chess";

interface GameOverModalProps {
  open: boolean;
  gameStatus: string;
  winner: PieceColor | null;
  reason?: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

function getTitle(gameStatus: string, winner: PieceColor | null): string {
  switch (gameStatus) {
    case "checkmate":
      return winner === "white" ? "♔ White Wins!" : "♚ Black Wins!";
    case "stalemate":
      return "🤝 Stalemate — Draw!";
    case "draw":
      return "🤝 Draw!";
    case "resigned":
      return winner === "white"
        ? "♔ White Wins by Resignation"
        : "♚ Black Wins by Resignation";
    case "timeout":
      return winner === "white"
        ? "♔ White Wins on Time"
        : "♚ Black Wins on Time";
    default:
      return "Game Over";
  }
}

function getSubtitle(gameStatus: string): string {
  switch (gameStatus) {
    case "checkmate":
      return "Checkmate";
    case "stalemate":
      return "No legal moves available";
    case "draw":
      return "Drawn game";
    case "resigned":
      return "By resignation";
    case "timeout":
      return "Time expired";
    default:
      return "";
  }
}

export function GameOverModal({
  open,
  gameStatus,
  winner,
  onPlayAgain,
  onNewGame,
}: GameOverModalProps) {
  const title = getTitle(gameStatus, winner);
  const subtitle = getSubtitle(gameStatus);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            className="relative bg-card rounded-2xl shadow-2xl p-8 z-10 min-w-[320px] text-center"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            data-ocid="gameover.modal"
          >
            {/* Confetti/trophy icon */}
            <div className="text-6xl mb-3">
              {gameStatus === "checkmate"
                ? winner === "white"
                  ? "♔"
                  : "♚"
                : gameStatus === "stalemate" || gameStatus === "draw"
                  ? "⚖️"
                  : gameStatus === "timeout"
                    ? "⏰"
                    : "🏆"}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
            <p className="text-muted-foreground mb-6">{subtitle}</p>

            <div className="flex gap-3 justify-center">
              <Button
                className="bg-navy-dark hover:bg-navy-mid text-white px-6"
                onClick={onPlayAgain}
                data-ocid="gameover.play_again_button"
              >
                Play Again
              </Button>
              <Button
                variant="outline"
                onClick={onNewGame}
                data-ocid="gameover.new_game_button"
              >
                Setup
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
