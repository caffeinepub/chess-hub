// ============================================================
// Chess AI - Minimax with Alpha-Beta Pruning
// ============================================================

import {
  type ChessMove,
  type ChessState,
  PIECE_VALUES,
  type PieceColor,
  applyMove,
  evaluateBoard,
  getAllLegalMoves,
  pieceType,
} from "./chess";

// ============================================================
// Move Ordering for better alpha-beta pruning
// ============================================================

function scoreMoveForOrdering(move: ChessMove): number {
  let score = 0;

  // Captures: MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
  if (move.captured) {
    const victimValue = PIECE_VALUES[pieceType(move.captured)] || 0;
    const attackerValue = PIECE_VALUES[pieceType(move.piece)] || 0;
    score += 10 * victimValue - attackerValue;
  }

  // Promotions
  if (move.promotion) {
    score += PIECE_VALUES[pieceType(move.promotion)] || 0;
  }

  return score;
}

function orderMoves(moves: ChessMove[]): ChessMove[] {
  return [...moves].sort(
    (a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a),
  );
}

// ============================================================
// Minimax with Alpha-Beta Pruning
// ============================================================

function minimax(
  state: ChessState,
  depth: number,
  alphaIn: number,
  betaIn: number,
  maximizingWhite: boolean,
  startTime: number,
  timeLimitMs: number,
): number {
  // Time check
  if (Date.now() - startTime > timeLimitMs) {
    return evaluateBoard(state.board);
  }

  if (state.gameStatus !== "playing") {
    if (state.gameStatus === "checkmate") {
      return state.turn === "black" ? 30000 : -30000;
    }
    return 0;
  }

  if (depth === 0) {
    return quiescenceSearch(
      state,
      alphaIn,
      betaIn,
      maximizingWhite,
      startTime,
      timeLimitMs,
    );
  }

  const moves = orderMoves(getAllLegalMoves(state));

  if (maximizingWhite) {
    let maxEval = Number.NEGATIVE_INFINITY;
    let alpha = alphaIn;
    for (const move of moves) {
      const newState = applyMove(state, move);
      const evalScore = minimax(
        newState,
        depth - 1,
        alpha,
        betaIn,
        false,
        startTime,
        timeLimitMs,
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (betaIn <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Number.POSITIVE_INFINITY;
  let beta = betaIn;
  for (const move of moves) {
    const newState = applyMove(state, move);
    const evalScore = minimax(
      newState,
      depth - 1,
      alphaIn,
      beta,
      true,
      startTime,
      timeLimitMs,
    );
    minEval = Math.min(minEval, evalScore);
    beta = Math.min(beta, evalScore);
    if (beta <= alphaIn) break;
  }
  return minEval;
}

// Quiescence search to avoid horizon effect
function quiescenceSearch(
  state: ChessState,
  alphaIn: number,
  betaIn: number,
  maximizingWhite: boolean,
  startTime: number,
  timeLimitMs: number,
): number {
  if (Date.now() - startTime > timeLimitMs) {
    return evaluateBoard(state.board);
  }

  const standPat = evaluateBoard(state.board);

  if (maximizingWhite) {
    if (standPat >= betaIn) return betaIn;
    const alpha = Math.max(alphaIn, standPat);

    const moves = getAllLegalMoves(state);
    const captures = moves.filter((m) => m.captured || m.promotion);
    const ordered = orderMoves(captures);
    let currentAlpha = alpha;

    for (const move of ordered) {
      const newState = applyMove(state, move);
      const evalScore = quiescenceSearch(
        newState,
        currentAlpha,
        betaIn,
        !maximizingWhite,
        startTime,
        timeLimitMs,
      );
      currentAlpha = Math.max(currentAlpha, evalScore);
      if (betaIn <= currentAlpha) break;
    }

    return currentAlpha;
  }

  if (standPat <= alphaIn) return alphaIn;
  const beta = Math.min(betaIn, standPat);

  const moves = getAllLegalMoves(state);
  const captures = moves.filter((m) => m.captured || m.promotion);
  const ordered = orderMoves(captures);
  let currentBeta = beta;

  for (const move of ordered) {
    const newState = applyMove(state, move);
    const evalScore = quiescenceSearch(
      newState,
      alphaIn,
      currentBeta,
      !maximizingWhite,
      startTime,
      timeLimitMs,
    );
    currentBeta = Math.min(currentBeta, evalScore);
    if (currentBeta <= alphaIn) break;
  }

  return currentBeta;
}

// ============================================================
// Public API
// ============================================================

export interface AIResult {
  move: ChessMove | null;
  score: number;
  depth: number;
}

export function getBestMove(
  state: ChessState,
  color: PieceColor,
  maxDepth = 3,
  timeLimitMs = 2000,
): AIResult {
  const startTime = Date.now();
  const maximizingWhite = color === "white";
  const moves = orderMoves(getAllLegalMoves(state));

  if (moves.length === 0) return { move: null, score: 0, depth: 0 };

  let bestMove = moves[0];
  let bestScore = maximizingWhite
    ? Number.NEGATIVE_INFINITY
    : Number.POSITIVE_INFINITY;

  // Iterative deepening
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (Date.now() - startTime > timeLimitMs * 0.8) break;

    let currentBestMove = moves[0];
    let currentBestScore = maximizingWhite
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;

    for (const move of moves) {
      if (Date.now() - startTime > timeLimitMs) break;

      const newState = applyMove(state, move);
      const score = minimax(
        newState,
        depth - 1,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        !maximizingWhite,
        startTime,
        timeLimitMs,
      );

      if (maximizingWhite) {
        if (score > currentBestScore) {
          currentBestScore = score;
          currentBestMove = move;
        }
      } else {
        if (score < currentBestScore) {
          currentBestScore = score;
          currentBestMove = move;
        }
      }
    }

    bestMove = currentBestMove;
    bestScore = currentBestScore;
  }

  return { move: bestMove, score: bestScore, depth: maxDepth };
}
