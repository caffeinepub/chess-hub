import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { PieceColor, PieceType } from "../chess/chess";

interface PromotionModalProps {
  open: boolean;
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

const WHITE_PIECES: { piece: PieceType; label: string; symbol: string }[] = [
  { piece: "Q", label: "Queen", symbol: "♕" },
  { piece: "R", label: "Rook", symbol: "♖" },
  { piece: "B", label: "Bishop", symbol: "♗" },
  { piece: "N", label: "Knight", symbol: "♘" },
];

const BLACK_PIECES: { piece: PieceType; label: string; symbol: string }[] = [
  { piece: "q", label: "Queen", symbol: "♛" },
  { piece: "r", label: "Rook", symbol: "♜" },
  { piece: "b", label: "Bishop", symbol: "♝" },
  { piece: "n", label: "Knight", symbol: "♞" },
];

export function PromotionModal({
  open,
  color,
  onSelect,
  onCancel,
}: PromotionModalProps) {
  const pieces = color === "white" ? WHITE_PIECES : BLACK_PIECES;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            className="relative bg-card rounded-xl shadow-2xl p-6 z-10"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="promotion.modal"
          >
            <h3 className="text-center font-bold text-lg mb-4 text-foreground">
              Choose Promotion
            </h3>
            <div className="flex gap-3">
              {pieces.map(({ piece, label, symbol }) => (
                <button
                  type="button"
                  key={piece}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-border hover:border-navy-dark hover:bg-muted transition-all"
                  onClick={() => onSelect(piece)}
                  data-ocid={`promotion.${label.toLowerCase()}_button`}
                >
                  <span className="text-5xl leading-none">{symbol}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
