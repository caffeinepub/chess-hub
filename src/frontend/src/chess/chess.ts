// ============================================================
// Chess Engine - Complete Chess Rules Implementation
// ============================================================

export type PieceColor = "white" | "black";
export type PieceType =
  | "K"
  | "Q"
  | "R"
  | "B"
  | "N"
  | "P"
  | "k"
  | "q"
  | "r"
  | "b"
  | "n"
  | "p";
export type Square = PieceType | null;
export type Board = Square[][];

export interface ChessMove {
  from: [number, number];
  to: [number, number];
  piece: PieceType;
  captured?: PieceType;
  promotion?: PieceType;
  isCastle?: "kingside" | "queenside";
  isEnPassant?: boolean;
  san?: string; // Standard Algebraic Notation
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

export interface ChessState {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassantTarget: [number, number] | null; // [row, col] of the target square
  halfmoveClock: number;
  fullmoveNumber: number;
  moveHistory: ChessMove[];
  positionHistory: string[]; // FEN positions for threefold repetition
  gameStatus:
    | "playing"
    | "checkmate"
    | "stalemate"
    | "draw"
    | "resigned"
    | "timeout";
  winner: PieceColor | null;
  inCheck: boolean;
}

// ============================================================
// Piece Helpers
// ============================================================

export function isWhitePiece(p: PieceType): boolean {
  return p === p.toUpperCase();
}

export function isBlackPiece(p: PieceType): boolean {
  return p === p.toLowerCase() && p !== p.toUpperCase();
}

export function pieceColor(p: PieceType): PieceColor {
  return isWhitePiece(p) ? "white" : "black";
}

export function pieceType(p: PieceType): string {
  return p.toUpperCase();
}

export function isEnemy(p1: PieceType, p2: PieceType): boolean {
  return pieceColor(p1) !== pieceColor(p2);
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// ============================================================
// Initial Board Setup
// ============================================================

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  // Black pieces (row 0)
  board[0] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  board[1] = ["p", "p", "p", "p", "p", "p", "p", "p"];
  // White pieces (row 7)
  board[6] = ["P", "P", "P", "P", "P", "P", "P", "P"];
  board[7] = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  return board;
}

export function createInitialState(): ChessState {
  const board = createInitialBoard();
  const fenPos = boardToFenPosition(board);
  return {
    board,
    turn: "white",
    castling: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    moveHistory: [],
    positionHistory: [fenPos],
    gameStatus: "playing",
    winner: null,
    inCheck: false,
  };
}

// ============================================================
// FEN Utilities
// ============================================================

export function boardToFenPosition(board: Board): string {
  return board
    .map((row) => {
      let fen = "";
      let empty = 0;
      for (const sq of row) {
        if (sq === null) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          fen += sq;
        }
      }
      if (empty > 0) fen += empty;
      return fen;
    })
    .join("/");
}

export function stateToFen(state: ChessState): string {
  const pos = boardToFenPosition(state.board);
  const turn = state.turn === "white" ? "w" : "b";
  const { castling } = state;
  let castlingStr = "";
  if (castling.whiteKingside) castlingStr += "K";
  if (castling.whiteQueenside) castlingStr += "Q";
  if (castling.blackKingside) castlingStr += "k";
  if (castling.blackQueenside) castlingStr += "q";
  if (!castlingStr) castlingStr = "-";
  const ep = state.enPassantTarget
    ? colToFile(state.enPassantTarget[1]) +
      (8 - state.enPassantTarget[0]).toString()
    : "-";
  return `${pos} ${turn} ${castlingStr} ${ep} ${state.halfmoveClock} ${state.fullmoveNumber}`;
}

export function parseFen(fen: string): ChessState {
  const parts = fen.split(" ");
  const rows = parts[0].split("/");
  const board: Board = [];
  for (const row of rows) {
    const boardRow: Square[] = [];
    for (const ch of row) {
      const n = Number.parseInt(ch);
      if (!Number.isNaN(n)) {
        for (let i = 0; i < n; i++) boardRow.push(null);
      } else {
        boardRow.push(ch as PieceType);
      }
    }
    board.push(boardRow);
  }

  const turn: PieceColor = parts[1] === "w" ? "white" : "black";
  const castlingStr = parts[2] || "-";
  const castling: CastlingRights = {
    whiteKingside: castlingStr.includes("K"),
    whiteQueenside: castlingStr.includes("Q"),
    blackKingside: castlingStr.includes("k"),
    blackQueenside: castlingStr.includes("q"),
  };

  let enPassantTarget: [number, number] | null = null;
  if (parts[3] && parts[3] !== "-") {
    const file = parts[3].charCodeAt(0) - 97;
    const rankNum = Number.parseInt(parts[3][1]);
    enPassantTarget = [8 - rankNum, file];
  }

  const state: ChessState = {
    board,
    turn,
    castling,
    enPassantTarget,
    halfmoveClock: Number.parseInt(parts[4] || "0"),
    fullmoveNumber: Number.parseInt(parts[5] || "1"),
    moveHistory: [],
    positionHistory: [boardToFenPosition(board)],
    gameStatus: "playing",
    winner: null,
    inCheck: false,
  };
  state.inCheck = isInCheckState(state, turn);
  return state;
}

function colToFile(col: number): string {
  return String.fromCharCode(97 + col);
}

// ============================================================
// Attack & Move Generation
// ============================================================

export function isSquareAttackedBy(
  board: Board,
  row: number,
  col: number,
  byColor: PieceColor,
): boolean {
  // Check pawn attacks
  const pawnDir = byColor === "white" ? 1 : -1;
  const pawnRow = row + pawnDir;
  for (const dc of [-1, 1]) {
    const pc = col + dc;
    if (isInBounds(pawnRow, pc)) {
      const p = board[pawnRow][pc];
      if (p && pieceType(p) === "P" && pieceColor(p) === byColor) return true;
    }
  }

  // Check knight attacks
  const knightMoves = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && pieceType(p) === "N" && pieceColor(p) === byColor) return true;
    }
  }

  // Check sliding pieces (rook/queen for straights, bishop/queen for diagonals)
  const straights = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  for (const [dr, dc] of straights) {
    let nr = row + dr;
    let nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (
          pieceColor(p) === byColor &&
          (pieceType(p) === "R" || pieceType(p) === "Q")
        )
          return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  const diagonals = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (const [dr, dc] of diagonals) {
    let nr = row + dr;
    let nc = col + dc;
    while (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (
          pieceColor(p) === byColor &&
          (pieceType(p) === "B" || pieceType(p) === "Q")
        )
          return true;
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Check king attacks
  for (const [dr, dc] of [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ]) {
    const nr = row + dr;
    const nc = col + dc;
    if (isInBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && pieceType(p) === "K" && pieceColor(p) === byColor) return true;
    }
  }

  return false;
}

export function isInCheckState(state: ChessState, color: PieceColor): boolean {
  return isInCheckBoard(state.board, color);
}

export function isInCheckBoard(board: Board, color: PieceColor): boolean {
  const kingPiece = color === "white" ? "K" : "k";
  let kingRow = -1;
  let kingCol = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === kingPiece) {
        kingRow = r;
        kingCol = c;
      }
    }
  }
  if (kingRow === -1) return false;
  const opponent: PieceColor = color === "white" ? "black" : "white";
  return isSquareAttackedBy(board, kingRow, kingCol, opponent);
}

function applyMoveToBoard(board: Board, move: ChessMove): Board {
  const newBoard: Board = board.map((row) => [...row]);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = newBoard[fr][fc];
  newBoard[tr][tc] = move.promotion || piece;
  newBoard[fr][fc] = null;

  // En passant capture
  if (move.isEnPassant) {
    const capturedPawnRow = fr; // Same row as moving pawn
    newBoard[capturedPawnRow][tc] = null;
  }

  // Castling - move rook
  if (move.isCastle === "kingside") {
    newBoard[tr][5] = newBoard[tr][7];
    newBoard[tr][7] = null;
  } else if (move.isCastle === "queenside") {
    newBoard[tr][3] = newBoard[tr][0];
    newBoard[tr][0] = null;
  }

  return newBoard;
}

export function generatePseudoLegalMoves(
  state: ChessState,
  row: number,
  col: number,
): ChessMove[] {
  const piece = state.board[row][col];
  if (!piece) return [];
  const color = pieceColor(piece);
  const moves: ChessMove[] = [];
  const pt = pieceType(piece);

  const addMove = (tr: number, tc: number, opts: Partial<ChessMove> = {}) => {
    const captured = state.board[tr][tc] || undefined;
    moves.push({ from: [row, col], to: [tr, tc], piece, captured, ...opts });
  };

  const addSlidingMoves = (dirs: number[][]) => {
    for (const [dr, dc] of dirs) {
      let nr = row + dr;
      let nc = col + dc;
      while (isInBounds(nr, nc)) {
        const target = state.board[nr][nc];
        if (target) {
          if (isEnemy(piece, target)) addMove(nr, nc);
          break;
        }
        addMove(nr, nc);
        nr += dr;
        nc += dc;
      }
    }
  };

  switch (pt) {
    case "P": {
      const dir = color === "white" ? -1 : 1;
      const startRow = color === "white" ? 6 : 1;
      const promotionRow = color === "white" ? 0 : 7;

      // Forward one
      const nr1 = row + dir;
      if (isInBounds(nr1, col) && !state.board[nr1][col]) {
        if (nr1 === promotionRow) {
          for (const promo of (color === "white"
            ? ["Q", "R", "B", "N"]
            : ["q", "r", "b", "n"]) as PieceType[]) {
            moves.push({
              from: [row, col],
              to: [nr1, col],
              piece,
              promotion: promo,
            });
          }
        } else {
          addMove(nr1, col);
        }
        // Forward two from start
        const nr2 = row + 2 * dir;
        if (
          row === startRow &&
          isInBounds(nr2, col) &&
          !state.board[nr2][col]
        ) {
          addMove(nr2, col);
        }
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const nc = col + dc;
        if (isInBounds(nr1, nc)) {
          const target = state.board[nr1][nc];
          if (target && isEnemy(piece, target)) {
            if (nr1 === promotionRow) {
              for (const promo of (color === "white"
                ? ["Q", "R", "B", "N"]
                : ["q", "r", "b", "n"]) as PieceType[]) {
                moves.push({
                  from: [row, col],
                  to: [nr1, nc],
                  piece,
                  captured: target,
                  promotion: promo,
                });
              }
            } else {
              addMove(nr1, nc);
            }
          }
          // En passant
          if (
            state.enPassantTarget &&
            state.enPassantTarget[0] === nr1 &&
            state.enPassantTarget[1] === nc
          ) {
            const capturedPiece = state.board[row][nc];
            moves.push({
              from: [row, col],
              to: [nr1, nc],
              piece,
              captured: capturedPiece || undefined,
              isEnPassant: true,
            });
          }
        }
      }
      break;
    }

    case "N": {
      for (const [dr, dc] of [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ]) {
        const nr = row + dr;
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          const target = state.board[nr][nc];
          if (!target || isEnemy(piece, target)) addMove(nr, nc);
        }
      }
      break;
    }

    case "B":
      addSlidingMoves([
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
      break;
    case "R":
      addSlidingMoves([
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]);
      break;
    case "Q":
      addSlidingMoves([
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]);
      break;

    case "K": {
      for (const [dr, dc] of [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ]) {
        const nr = row + dr;
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          const target = state.board[nr][nc];
          if (!target || isEnemy(piece, target)) addMove(nr, nc);
        }
      }

      // Castling
      const opponent: PieceColor = color === "white" ? "black" : "white";
      const castleRow = color === "white" ? 7 : 0;
      if (
        row === castleRow &&
        col === 4 &&
        !isSquareAttackedBy(state.board, row, col, opponent)
      ) {
        // Kingside
        const canKS =
          color === "white"
            ? state.castling.whiteKingside
            : state.castling.blackKingside;
        if (
          canKS &&
          !state.board[castleRow][5] &&
          !state.board[castleRow][6] &&
          state.board[castleRow][7] === (color === "white" ? "R" : "r") &&
          !isSquareAttackedBy(state.board, castleRow, 5, opponent) &&
          !isSquareAttackedBy(state.board, castleRow, 6, opponent)
        ) {
          moves.push({
            from: [row, col],
            to: [castleRow, 6],
            piece,
            isCastle: "kingside",
          });
        }
        // Queenside
        const canQS =
          color === "white"
            ? state.castling.whiteQueenside
            : state.castling.blackQueenside;
        if (
          canQS &&
          !state.board[castleRow][3] &&
          !state.board[castleRow][2] &&
          !state.board[castleRow][1] &&
          state.board[castleRow][0] === (color === "white" ? "R" : "r") &&
          !isSquareAttackedBy(state.board, castleRow, 3, opponent) &&
          !isSquareAttackedBy(state.board, castleRow, 2, opponent)
        ) {
          moves.push({
            from: [row, col],
            to: [castleRow, 2],
            piece,
            isCastle: "queenside",
          });
        }
      }
      break;
    }
  }

  return moves;
}

export function getLegalMovesForSquare(
  state: ChessState,
  row: number,
  col: number,
): ChessMove[] {
  const piece = state.board[row][col];
  if (!piece) return [];
  const color = pieceColor(piece);
  if (color !== state.turn) return [];

  const pseudoLegal = generatePseudoLegalMoves(state, row, col);
  return pseudoLegal.filter((move) => {
    const newBoard = applyMoveToBoard(state.board, move);
    return !isInCheckBoard(newBoard, color);
  });
}

export function getAllLegalMoves(state: ChessState): ChessMove[] {
  const moves: ChessMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece && pieceColor(piece) === state.turn) {
        moves.push(...getLegalMovesForSquare(state, r, c));
      }
    }
  }
  return moves;
}

// ============================================================
// Apply Move & Update State
// ============================================================

export function applyMove(state: ChessState, move: ChessMove): ChessState {
  const newBoard = applyMoveToBoard(state.board, move);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  const piece = move.piece;
  const color = pieceColor(piece);
  const opponent: PieceColor = color === "white" ? "black" : "white";

  // Update castling rights
  const newCastling = { ...state.castling };
  if (pieceType(piece) === "K") {
    if (color === "white") {
      newCastling.whiteKingside = false;
      newCastling.whiteQueenside = false;
    } else {
      newCastling.blackKingside = false;
      newCastling.blackQueenside = false;
    }
  }
  if (pieceType(piece) === "R") {
    if (fr === 7 && fc === 7) newCastling.whiteKingside = false;
    if (fr === 7 && fc === 0) newCastling.whiteQueenside = false;
    if (fr === 0 && fc === 7) newCastling.blackKingside = false;
    if (fr === 0 && fc === 0) newCastling.blackQueenside = false;
  }
  // If a rook is captured on its starting square
  if (tr === 7 && tc === 7) newCastling.whiteKingside = false;
  if (tr === 7 && tc === 0) newCastling.whiteQueenside = false;
  if (tr === 0 && tc === 7) newCastling.blackKingside = false;
  if (tr === 0 && tc === 0) newCastling.blackQueenside = false;

  // En passant target
  let enPassantTarget: [number, number] | null = null;
  if (pieceType(piece) === "P" && Math.abs(tr - fr) === 2) {
    enPassantTarget = [(fr + tr) / 2, fc];
  }

  // Half/full move clocks
  const halfmoveClock =
    pieceType(piece) === "P" || move.captured ? 0 : state.halfmoveClock + 1;
  const fullmoveNumber =
    color === "black" ? state.fullmoveNumber + 1 : state.fullmoveNumber;

  // Generate SAN for this move
  const san = generateSAN(state, move);
  const moveWithSan = { ...move, san };

  // Check if opponent is in check/checkmate/stalemate
  const newStatePartial: ChessState = {
    board: newBoard,
    turn: opponent,
    castling: newCastling,
    enPassantTarget,
    halfmoveClock,
    fullmoveNumber,
    moveHistory: [...state.moveHistory, moveWithSan],
    positionHistory: [...state.positionHistory, boardToFenPosition(newBoard)],
    gameStatus: "playing",
    winner: null,
    inCheck: false,
  };

  const opponentMoves = getAllLegalMoves(newStatePartial);
  const opponentInCheck = isInCheckBoard(newBoard, opponent);

  newStatePartial.inCheck = opponentInCheck;

  if (opponentMoves.length === 0) {
    if (opponentInCheck) {
      newStatePartial.gameStatus = "checkmate";
      newStatePartial.winner = color;
    } else {
      newStatePartial.gameStatus = "stalemate";
    }
  } else if (halfmoveClock >= 100) {
    // 50-move rule
    newStatePartial.gameStatus = "draw";
  } else {
    // Check threefold repetition
    const currentPos = boardToFenPosition(newBoard);
    const count = newStatePartial.positionHistory.filter(
      (p) => p === currentPos,
    ).length;
    if (count >= 3) {
      newStatePartial.gameStatus = "draw";
    }
  }

  return newStatePartial;
}

// ============================================================
// SAN (Standard Algebraic Notation) Generator
// ============================================================

function generateSAN(state: ChessState, move: ChessMove): string {
  const pt = pieceType(move.piece);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;

  if (move.isCastle === "kingside") return "O-O";
  if (move.isCastle === "queenside") return "O-O-O";

  let san = "";
  const fileStr = colToFile(tc);
  const rankStr = (8 - tr).toString();

  if (pt === "P") {
    if (move.captured || move.isEnPassant) {
      san = `${colToFile(fc)}x${fileStr}${rankStr}`;
    } else {
      san = fileStr + rankStr;
    }
    if (move.promotion) {
      san += `=${move.promotion.toUpperCase()}`;
    }
  } else {
    san = pt;
    // Disambiguation
    const ambiguous = getAllLegalMoves(state).filter(
      (m) =>
        (m !== move &&
          pieceType(m.piece) === pt &&
          m.to[0] === tr &&
          m.to[1] === tc &&
          m.from[0] !== fr) ||
        m.from[1] !== fc,
    );
    // Simple disambiguation
    if (ambiguous.length > 0) {
      const sameFile = ambiguous.filter((m) => m.from[1] === fc);
      const sameRank = ambiguous.filter((m) => m.from[0] === fr);
      if (sameFile.length === 0) san += colToFile(fc);
      else if (sameRank.length === 0) san += (8 - fr).toString();
      else san += colToFile(fc) + (8 - fr).toString();
    }
    if (move.captured) san += "x";
    san += fileStr + rankStr;
  }

  // Check/checkmate indicator (approximate - check after move)
  const newBoard = applyMoveToBoard(state.board, move);
  const opponent: PieceColor =
    pieceColor(move.piece) === "white" ? "black" : "white";
  const opponentInCheck = isInCheckBoard(newBoard, opponent);
  if (opponentInCheck) {
    const opponentStateDraft: ChessState = {
      board: newBoard,
      turn: opponent,
      castling: state.castling,
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveNumber: 0,
      moveHistory: [],
      positionHistory: [],
      gameStatus: "playing",
      winner: null,
      inCheck: true,
    };
    const hasEscape = getAllLegalMoves(opponentStateDraft).length > 0;
    san += hasEscape ? "+" : "#";
  }

  return san;
}

// ============================================================
// Piece Value + Position Tables for AI
// ============================================================

export const PIECE_VALUES: Record<string, number> = {
  P: 100,
  N: 320,
  B: 330,
  R: 500,
  Q: 900,
  K: 20000,
};

// Piece-square tables (from white's perspective, row 0 = rank 8)
const PST: Record<string, number[][]> = {
  P: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  N: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  B: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  R: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  Q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  K: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

export function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const pt = pieceType(piece);
      const value = PIECE_VALUES[pt] || 0;
      const pstRow = isWhitePiece(piece) ? r : 7 - r;
      const pstBonus = PST[pt]?.[pstRow]?.[c] || 0;
      if (isWhitePiece(piece)) {
        score += value + pstBonus;
      } else {
        score -= value + pstBonus;
      }
    }
  }
  return score;
}

// Export colToFile for use elsewhere
export { colToFile };
