import React from "react";
import type { Board, PieceColor, PieceType } from "../chess/chess";
import { ChessClock } from "./ChessClock";

interface PlayerPanelProps {
  name: string;
  rating?: number;
  color: PieceColor;
  isActive: boolean;
  timeMs: number;
  capturedPieces?: PieceType[];
  isFlipped?: boolean;
}

const CAPTURED_VALUES: Record<string, number> = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
};

function getCapturedByColor(
  captured: PieceType[],
  displayColor: PieceColor,
): PieceType[] {
  // Show pieces captured by this player (opponent's pieces)
  return captured.filter((p) => {
    const isUpper = p === p.toUpperCase();
    const isWhitePiece = isUpper;
    // If displayColor is white, show black pieces they captured (lowercase)
    return displayColor === "white" ? !isWhitePiece : isWhitePiece;
  });
}

const PIECE_UNICODE: Record<string, string> = {
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

export function PlayerPanel({
  name,
  rating,
  color,
  isActive,
  timeMs,
  capturedPieces = [],
  isFlipped: _isFlipped,
}: PlayerPanelProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const captured = getCapturedByColor(capturedPieces, color);

  // Calculate material advantage
  const materialScore = captured.reduce(
    (sum, p) => sum + (CAPTURED_VALUES[p.toUpperCase()] || 0),
    0,
  );

  // Group by type for display
  const capturedGroups: Record<string, number> = {};
  for (const p of captured) {
    const key = p.toUpperCase();
    capturedGroups[key] = (capturedGroups[key] || 0) + 1;
  }

  const avatarBg =
    color === "white"
      ? "bg-slate-100 border-2 border-slate-300"
      : "bg-navy-dark border-2 border-slate-600";
  const avatarText = color === "white" ? "text-navy-dark" : "text-white";

  return (
    <div className="flex flex-col gap-2">
      {/* Player info row */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarBg}`}
        >
          <span className={`text-sm font-bold ${avatarText}`}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-foreground truncate">
              {name}
            </span>
            {rating && (
              <span className="text-xs text-muted-foreground">({rating})</span>
            )}
          </div>
          {/* Captured pieces */}
          {captured.length > 0 && (
            <div className="flex items-center gap-0.5 flex-wrap">
              {Object.entries(capturedGroups).map(([type, count]) => (
                <React.Fragment key={type}>
                  {Array.from({ length: count }).map((_, idx) => {
                    const symbol =
                      PIECE_UNICODE[
                        color === "white" ? type.toLowerCase() : type
                      ];
                    const uniqueKey = `cap-${type}-${String(idx).padStart(2, "0")}`;
                    return (
                      <span
                        key={uniqueKey}
                        className="text-sm leading-none"
                        title={`Captured ${type}`}
                      >
                        {symbol}
                      </span>
                    );
                  })}
                </React.Fragment>
              ))}
              {materialScore > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{materialScore}
                </span>
              )}
            </div>
          )}
        </div>
        {isActive && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-500 font-medium">
              {color === "white" ? "White" : "Black"} to move
            </span>
          </div>
        )}
      </div>

      {/* Clock */}
      <ChessClock
        timeMs={timeMs}
        isActive={isActive}
        color={color}
        label={color === "white" ? "White" : "Black"}
      />
    </div>
  );
}
