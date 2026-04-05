import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type {
  ChessMove,
  ChessState,
  PieceColor,
  PieceType,
} from "../chess/chess";
import {
  getLegalMovesForSquare,
  isInCheckBoard,
  pieceColor,
} from "../chess/chess";

// ============================================================
// SVG Chess Pieces
// ============================================================

const PIECE_SVG: Record<string, React.ReactNode> = {
  // White pieces
  K: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path
          d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
          fill="#fff"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <path
          d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-10.5 0c-4 3 0 8.5 0 8.5v7"
          fill="#fff"
        />
        <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
      </g>
    </svg>
  ),
  Q: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75" />
        <circle cx="14" cy="9" r="2.75" />
        <circle cx="22.5" cy="8" r="2.75" />
        <circle cx="31" cy="9" r="2.75" />
        <circle cx="39" cy="12" r="2.75" />
        <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.4-8.2-13.5L14 25 6.5 13.5 9 26z" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path d="M11 38.5a35 35 1 0 0 23 0" fill="none" strokeLinecap="butt" />
        <path
          d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0"
          fill="none"
          stroke="#000"
        />
      </g>
    </svg>
  ),
  R: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="#fff"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"
          strokeLinejoin="miter"
        />
        <path d="M14 29.5v-13h17v13H14z" strokeLinejoin="miter" />
        <path d="M9 9l5-3h17l5 3v5H9V9z" strokeLinejoin="miter" />
        <path d="M11 12h4v-3h5v3h5v-3h5v3h4" strokeLinecap="butt" />
      </g>
    </svg>
  ),
  B: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g fill="#fff" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </g>
        <path
          d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
          strokeLinejoin="miter"
        />
      </g>
    </svg>
  ),
  N: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff" />
        <path
          d="M24 18c.38 5.12-5.62 6.5-8 3.5 1.88-1.72 2.98-4.5 2-5.5"
          fill="#fff"
        />
        <path
          d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"
          fill="#000"
          stroke="#000"
        />
        <path
          d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 0 1 1 0z"
          fill="#000"
          stroke="#000"
          transform="rotate(30 14.5 15.5)"
        />
        <path d="M10 32c0 0 10-8 20-3" fill="none" />
      </g>
    </svg>
  ),
  P: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#fff"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  // Black pieces
  k: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter" />
        <path
          d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
          fill="#000"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <path
          d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-10.5 0c-4 3 0 8.5 0 8.5v7"
          fill="#000"
        />
        <path
          d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"
          stroke="#fff"
        />
      </g>
    </svg>
  ),
  q: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g fill="#000" stroke="#000" strokeWidth="1.5" strokeLinejoin="round">
        <circle cx="6" cy="12" r="2.75" />
        <circle cx="14" cy="9" r="2.75" />
        <circle cx="22.5" cy="8" r="2.75" />
        <circle cx="31" cy="9" r="2.75" />
        <circle cx="39" cy="12" r="2.75" />
        <path
          d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.4-8.2-13.5L14 25 6.5 13.5 9 26z"
          stroke="none"
        />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
        <path
          d="M11 38.5a35 35 1 0 0 23 0"
          fill="none"
          stroke="#ddd"
          strokeLinecap="butt"
        />
        <path
          d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0"
          fill="none"
          stroke="#ddd"
        />
      </g>
    </svg>
  ),
  r: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="#000"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"
          strokeLinejoin="miter"
        />
        <path d="M14 29.5v-13h17v13H14z" strokeLinejoin="miter" />
        <path d="M9 9l5-3h17l5 3v5H9V9z" strokeLinejoin="miter" />
        <path
          d="M11 12h4v-3h5v3h5v-3h5v3h4"
          strokeLinecap="butt"
          stroke="#ddd"
        />
      </g>
    </svg>
  ),
  b: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g fill="#000" strokeLinecap="butt">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </g>
        <path
          d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
          stroke="#ddd"
          strokeLinejoin="miter"
        />
      </g>
    </svg>
  ),
  n: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <g
        fill="none"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000" />
        <path
          d="M24 18c.38 5.12-5.62 6.5-8 3.5 1.88-1.72 2.98-4.5 2-5.5"
          fill="#000"
        />
        <path
          d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"
          fill="#ddd"
          stroke="#ddd"
        />
        <path
          d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 0 1 1 0z"
          fill="#ddd"
          stroke="#ddd"
          transform="rotate(30 14.5 15.5)"
        />
        <path d="M10 32c0 0 10-8 20-3" fill="none" stroke="#ddd" />
      </g>
    </svg>
  ),
  p: (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 45 45"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#000"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

// ============================================================
// Chess Board Component
// ============================================================

interface ChessBoardProps {
  gameState: ChessState;
  flipped: boolean;
  onMove: (move: ChessMove) => void;
  pendingPromotion: { from: [number, number]; to: [number, number] } | null;
  lastMove: ChessMove | null;
  isAIThinking?: boolean;
  playerColor?: PieceColor | "both";
}

export function ChessBoard({
  gameState,
  flipped,
  onMove,
  lastMove,
  isAIThinking,
  playerColor = "both",
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = React.useState<
    [number, number] | null
  >(null);
  const [legalMoves, setLegalMoves] = React.useState<ChessMove[]>([]);

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.gameStatus !== "playing") return;
    if (isAIThinking) return;

    // Check if it's the player's turn
    if (playerColor !== "both" && gameState.turn !== playerColor) return;

    const piece = gameState.board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      const [sr, sc] = selectedSquare;

      // Check if clicking a legal move destination
      const move = legalMoves.find((m) => m.to[0] === row && m.to[1] === col);
      if (move) {
        // Handle promotion - find all promotion moves for this destination
        const promotionMoves = legalMoves.filter(
          (m) => m.to[0] === row && m.to[1] === col && m.promotion,
        );
        if (promotionMoves.length > 0) {
          // Default to queen promotion
          const queenPromo = promotionMoves.find(
            (m) => m.promotion?.toUpperCase() === "Q",
          );
          onMove(queenPromo || promotionMoves[0]);
        } else {
          onMove(move);
        }
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking the same square, deselect
      if (sr === row && sc === col) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // If clicking own piece, re-select
      if (piece && pieceColor(piece) === gameState.turn) {
        const moves = getLegalMovesForSquare(gameState, row, col);
        setSelectedSquare([row, col]);
        setLegalMoves(moves);
        return;
      }

      // Deselect
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      // No square selected - try to select a piece
      if (piece && pieceColor(piece) === gameState.turn) {
        if (playerColor !== "both" && pieceColor(piece) !== playerColor) return;
        const moves = getLegalMovesForSquare(gameState, row, col);
        setSelectedSquare([row, col]);
        setLegalMoves(moves);
      }
    }
  };

  // Clear selection when a move happens (moveHistory changes)
  const moveHistoryLength = gameState.moveHistory.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: moveHistoryLength is intentionally the only dep
  React.useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [moveHistoryLength]);

  const boardRows = flipped
    ? [0, 1, 2, 3, 4, 5, 6, 7]
    : [7, 6, 5, 4, 3, 2, 1, 0];
  const boardCols = flipped
    ? [7, 6, 5, 4, 3, 2, 1, 0]
    : [0, 1, 2, 3, 4, 5, 6, 7];

  // Find king in check
  let checkKingSquare: [number, number] | null = null;
  if (gameState.inCheck) {
    const kingPiece = gameState.turn === "white" ? "K" : "k";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (gameState.board[r][c] === kingPiece) {
          checkKingSquare = [r, c];
        }
      }
    }
  }

  const squareSize = "min(9vw, 70px)";

  return (
    <div className="relative select-none">
      <div
        className="grid shadow-board rounded-sm overflow-hidden"
        style={{ gridTemplateColumns: "repeat(8, 1fr)", width: "fit-content" }}
      >
        {boardRows.map((displayRow, rowIdx) =>
          boardCols.map((displayCol, colIdx) => {
            const actualRow = flipped ? 7 - displayRow : displayRow;
            const actualCol = flipped ? 7 - displayCol : displayCol;
            const isLight = (actualRow + actualCol) % 2 === 0;
            const piece = gameState.board[actualRow][actualCol];
            const isSelected =
              selectedSquare?.[0] === actualRow &&
              selectedSquare?.[1] === actualCol;
            const isLegal = legalMoves.some(
              (m) => m.to[0] === actualRow && m.to[1] === actualCol,
            );
            const isLastMoveFrom =
              lastMove?.from[0] === actualRow &&
              lastMove?.from[1] === actualCol;
            const isLastMoveTo =
              lastMove?.to[0] === actualRow && lastMove?.to[1] === actualCol;
            const isInCheck =
              checkKingSquare?.[0] === actualRow &&
              checkKingSquare?.[1] === actualCol;
            const isCaptureLegal = isLegal && !!piece;

            let squareClass = isLight
              ? "chess-square-light"
              : "chess-square-dark";
            if (isSelected) squareClass = "chess-square-selected";
            else if (isInCheck) squareClass = "chess-square-check";
            else if (isLastMoveFrom || isLastMoveTo)
              squareClass += " chess-square-last-move";

            const showRankLabel = colIdx === 0;
            const showFileLabel = rowIdx === 7;
            const rankLabel = (8 - actualRow).toString();
            const fileLabel = String.fromCharCode(97 + actualCol);

            return (
              <button
                type="button"
                key={`${actualRow}-${actualCol}`}
                aria-label={`Square ${fileLabel}${rankLabel}`}
                className={`relative cursor-pointer ${squareClass} transition-colors duration-100 border-0 p-0 m-0 bg-transparent`}
                style={{ width: squareSize, height: squareSize }}
                onClick={() => handleSquareClick(actualRow, actualCol)}
              >
                {/* Rank label */}
                {showRankLabel && (
                  <span
                    className="absolute top-0.5 left-0.5 text-[9px] font-bold leading-none z-10 pointer-events-none"
                    style={{
                      color: isLight ? "#3F5F4F" : "#E9E2C7",
                      opacity: 0.85,
                    }}
                  >
                    {rankLabel}
                  </span>
                )}
                {/* File label */}
                {showFileLabel && (
                  <span
                    className="absolute bottom-0.5 right-0.5 text-[9px] font-bold leading-none z-10 pointer-events-none"
                    style={{
                      color: isLight ? "#3F5F4F" : "#E9E2C7",
                      opacity: 0.85,
                    }}
                  >
                    {fileLabel}
                  </span>
                )}

                {/* Legal move indicator */}
                {isLegal && !isCaptureLegal && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div
                      className="rounded-full"
                      style={{
                        width: "33%",
                        height: "33%",
                        backgroundColor: "rgba(91,143,217,0.45)",
                      }}
                    />
                  </div>
                )}
                {/* Capture indicator */}
                {isCaptureLegal && (
                  <div
                    className="absolute inset-0 z-20 pointer-events-none rounded-none"
                    style={{
                      background:
                        "radial-gradient(circle, transparent 55%, rgba(91,143,217,0.5) 56%)",
                    }}
                  />
                )}

                {/* Piece */}
                <AnimatePresence>
                  {piece && (
                    <motion.div
                      key={`piece-${actualRow}-${actualCol}-${piece}`}
                      className="absolute inset-0 p-[6%] z-30"
                      initial={{ scale: 0.85, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                    >
                      {PIECE_SVG[piece]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          }),
        )}
      </div>

      {/* AI Thinking overlay */}
      {isAIThinking && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-navy-dark/80 text-white text-sm font-semibold px-4 py-2 rounded-md backdrop-blur-sm">
            🤔 Thinking...
          </div>
        </div>
      )}
    </div>
  );
}
