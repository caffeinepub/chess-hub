import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { FlipHorizontal, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { toast } from "sonner";

import { AuthModal } from "./components/AuthModal";
import { ChessBoard } from "./components/ChessBoard";
import { Footer } from "./components/Footer";
import { GameLobby } from "./components/GameLobby";
import { GameOverModal } from "./components/GameOverModal";
import {
  type GameMode,
  GameSetup,
  type TimeControl,
} from "./components/GameSetup";
import { Header } from "./components/Header";
import { MoveHistory } from "./components/MoveHistory";
import { PlayerPanel } from "./components/PlayerPanel";
import { PromotionModal } from "./components/PromotionModal";

import {
  type ChessMove,
  type ChessState,
  type PieceColor,
  type PieceType,
  applyMove,
  createInitialState,
  getLegalMovesForSquare,
} from "./chess/chess";
import { getBestMove } from "./chess/chessAI";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActiveGames, useFinishedGames } from "./hooks/useQueries";

// ============================================================
// Clock Management
// ============================================================

interface ClockState {
  white: number; // ms remaining
  black: number;
}

function initClock(seconds: number): ClockState {
  return { white: seconds * 1000, black: seconds * 1000 };
}

// ============================================================
// Main App
// ============================================================

export default function App() {
  // --- UI State ---
  const [activeSection, setActiveSection] = React.useState("play");
  const [showAuth, setShowAuth] = React.useState(false);
  const [showSetup, setShowSetup] = React.useState(true);
  const [boardFlipped, setBoardFlipped] = React.useState(false);

  // --- Game Config ---
  const [gameMode, setGameMode] = React.useState<GameMode>("vs-ai");
  const [playerColor, setPlayerColor] = React.useState<PieceColor>("white");
  const [timeControlSeconds, setTimeControlSeconds] = React.useState(180);

  // --- Chess State ---
  const [gameState, setGameState] =
    React.useState<ChessState>(createInitialState);
  const [clocks, setClocks] = React.useState<ClockState>(initClock(180));
  const [isAIThinking, setIsAIThinking] = React.useState(false);
  const [gameActive, setGameActive] = React.useState(false);

  // --- Promotion State ---
  const [pendingPromotion, setPendingPromotion] = React.useState<{
    from: [number, number];
    to: [number, number];
    color: PieceColor;
  } | null>(null);

  // --- Captured pieces ---
  const [capturedPieces, setCapturedPieces] = React.useState<PieceType[]>([]);

  // --- Backend ---
  const { data: activeGames = [] } = useActiveGames();
  const { data: finishedGames = [] } = useFinishedGames();
  const { identity } = useInternetIdentity();

  // --- Clock timer ---
  const clockIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const stopClock = React.useCallback(() => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  }, []);

  const startClock = React.useCallback(
    (turnColor: PieceColor) => {
      stopClock();
      clockIntervalRef.current = setInterval(() => {
        setClocks((prev) => {
          const next = { ...prev };
          if (turnColor === "white") {
            next.white = Math.max(0, prev.white - 100);
            if (next.white === 0) {
              stopClock();
              setGameState((gs) => {
                if (gs.gameStatus === "playing") {
                  return { ...gs, gameStatus: "timeout", winner: "black" };
                }
                return gs;
              });
              setGameActive(false);
            }
          } else {
            next.black = Math.max(0, prev.black - 100);
            if (next.black === 0) {
              stopClock();
              setGameState((gs) => {
                if (gs.gameStatus === "playing") {
                  return { ...gs, gameStatus: "timeout", winner: "white" };
                }
                return gs;
              });
              setGameActive(false);
            }
          }
          return next;
        });
      }, 100);
    },
    [stopClock],
  );

  // Stop clock when game ends
  React.useEffect(() => {
    if (gameState.gameStatus !== "playing") {
      stopClock();
      setGameActive(false);
    }
  }, [gameState.gameStatus, stopClock]);

  // Cleanup on unmount
  React.useEffect(() => () => stopClock(), [stopClock]);

  // --------------------------------------------------------
  // Start / Reset Game
  // --------------------------------------------------------

  const startGame = React.useCallback(
    (tc: TimeControl, mode: GameMode, color: PieceColor | "random") => {
      stopClock();
      const resolvedColor: PieceColor =
        color === "random" ? (Math.random() < 0.5 ? "white" : "black") : color;

      const newState = createInitialState();
      setGameState(newState);
      setClocks(initClock(tc.seconds));
      setTimeControlSeconds(tc.seconds);
      setGameMode(mode);
      setPlayerColor(resolvedColor);
      setCapturedPieces([]);
      setIsAIThinking(false);
      setShowSetup(false);
      setGameActive(true);
      setBoardFlipped(resolvedColor === "black");

      // Start the clock for white
      startClock("white");

      // If AI plays first (human is black), trigger AI move
      if (mode === "vs-ai" && resolvedColor === "black") {
        setTimeout(() => triggerAIMove(newState), 300);
      }
    },
    [stopClock, startClock],
  );

  const handleNewGame = React.useCallback(() => {
    stopClock();
    setShowSetup(true);
    setGameActive(false);
  }, [stopClock]);

  // --------------------------------------------------------
  // Apply a move
  // --------------------------------------------------------

  const handleMove = React.useCallback(
    (move: ChessMove) => {
      setGameState((prev) => {
        if (prev.gameStatus !== "playing") return prev;

        // Track captured pieces
        if (move.captured) {
          setCapturedPieces((cap) => [...cap, move.captured!]);
        }

        const newState = applyMove(prev, move);

        // Update clock
        const nextTurn = newState.turn;
        if (newState.gameStatus === "playing") {
          startClock(nextTurn);
        }

        return newState;
      });
    },
    [startClock],
  );

  // --------------------------------------------------------
  // AI Move
  // --------------------------------------------------------

  const triggerAIMove = React.useCallback(
    (state: ChessState) => {
      if (state.gameStatus !== "playing") return;
      setIsAIThinking(true);

      // Run AI in a timeout to not block UI
      setTimeout(() => {
        const result = getBestMove(state, state.turn, 3, 1500);
        setIsAIThinking(false);
        if (result.move) {
          handleMove(result.move);
        }
      }, 50);
    },
    [handleMove],
  );

  // Trigger AI after human moves
  React.useEffect(() => {
    if (!gameActive) return;
    if (gameMode !== "vs-ai") return;
    if (gameState.gameStatus !== "playing") return;
    if (isAIThinking) return;

    const isAITurn = gameState.turn !== playerColor;
    if (isAITurn) {
      const snapshot = gameState;
      const timer = setTimeout(() => triggerAIMove(snapshot), 200);
      return () => clearTimeout(timer);
    }
  }, [
    gameState,
    gameMode,
    playerColor,
    gameActive,
    isAIThinking,
    triggerAIMove,
  ]);

  // --------------------------------------------------------
  // Promotion
  // --------------------------------------------------------

  const handleBoardMove = React.useCallback(
    (move: ChessMove) => {
      // Check if this is a promotion move
      if (move.promotion) {
        // Check if there are multiple promotion options
        const [fr, fc] = move.from;
        const legalMoves = getLegalMovesForSquare(gameState, fr, fc);
        const promoMoves = legalMoves.filter(
          (m) =>
            m.to[0] === move.to[0] && m.to[1] === move.to[1] && m.promotion,
        );

        if (promoMoves.length > 1) {
          // Show promotion modal
          setPendingPromotion({
            from: move.from,
            to: move.to,
            color: gameState.turn,
          });
          return;
        }
      }
      handleMove(move);
    },
    [gameState, handleMove],
  );

  const handlePromotionSelect = React.useCallback(
    (piece: PieceType) => {
      if (!pendingPromotion) return;
      const { from, to } = pendingPromotion;
      const [fr, fc] = from;
      const legalMoves = getLegalMovesForSquare(gameState, fr, fc);
      const move = legalMoves.find(
        (m) => m.to[0] === to[0] && m.to[1] === to[1] && m.promotion === piece,
      );
      if (move) handleMove(move);
      setPendingPromotion(null);
    },
    [pendingPromotion, gameState, handleMove],
  );

  // --------------------------------------------------------
  // Game Actions
  // --------------------------------------------------------

  const handleResign = React.useCallback(() => {
    stopClock();
    setGameState((prev) => ({
      ...prev,
      gameStatus: "resigned",
      winner: prev.turn === "white" ? "black" : "white",
    }));
    setGameActive(false);
    toast.error("You resigned.");
  }, [stopClock]);

  const handleDraw = React.useCallback(() => {
    stopClock();
    setGameState((prev) => ({ ...prev, gameStatus: "draw", winner: null }));
    setGameActive(false);
    toast("Draw agreed.");
  }, [stopClock]);

  const handleFlipBoard = React.useCallback(() => {
    setBoardFlipped((f) => !f);
  }, []);

  // --------------------------------------------------------
  // Player names
  // --------------------------------------------------------
  const principal = identity?.getPrincipal().toString();
  const playerName = principal ? `${principal.slice(0, 8)}...` : "Player";
  const aiName = "Chess AI";

  const whitePlayer =
    gameMode === "vs-ai"
      ? playerColor === "white"
        ? playerName
        : aiName
      : "Player 1";
  const blackPlayer =
    gameMode === "vs-ai"
      ? playerColor === "black"
        ? playerName
        : aiName
      : "Player 2";

  // --------------------------------------------------------
  // Render
  // --------------------------------------------------------

  const lastMove =
    gameState.moveHistory[gameState.moveHistory.length - 1] || null;
  const isGameOver = gameState.gameStatus !== "playing";

  // Which player is shown top vs bottom depends on board flip
  const topColor: PieceColor = boardFlipped ? "white" : "black";
  const bottomColor: PieceColor = boardFlipped ? "black" : "white";
  const topName = topColor === "white" ? whitePlayer : blackPlayer;
  const bottomName = bottomColor === "white" ? whitePlayer : blackPlayer;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster position="top-right" richColors />

      <Header
        onRegister={() => setShowAuth(true)}
        onLogin={() => setShowAuth(true)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 w-full">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {/* 3-Column Layout */}
          <div className="flex gap-4 items-start justify-center">
            {/* LEFT: Player Panel */}
            <motion.div
              className="hidden lg:flex flex-col gap-3 w-[280px] flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top player */}
              <div className="bg-card border border-border rounded-lg p-4">
                <PlayerPanel
                  name={topName}
                  rating={topColor === "white" ? 1450 : 1800}
                  color={topColor}
                  isActive={gameState.turn === topColor && !isGameOver}
                  timeMs={topColor === "white" ? clocks.white : clocks.black}
                  capturedPieces={capturedPieces}
                />
              </div>

              {/* Turn indicator */}
              <div
                className={`text-center py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest ${
                  isGameOver
                    ? "bg-muted text-muted-foreground"
                    : "bg-navy-dark text-white"
                }`}
              >
                {isGameOver
                  ? gameState.gameStatus.replace(/([A-Z])/g, " $1").trim()
                  : `${gameState.turn} to move`}
                {gameState.inCheck && !isGameOver && " ⚠️ Check!"}
              </div>

              {/* Bottom player */}
              <div className="bg-card border border-border rounded-lg p-4">
                <PlayerPanel
                  name={bottomName}
                  rating={bottomColor === "white" ? 1450 : 1800}
                  color={bottomColor}
                  isActive={gameState.turn === bottomColor && !isGameOver}
                  timeMs={bottomColor === "white" ? clocks.white : clocks.black}
                  capturedPieces={capturedPieces}
                />
              </div>

              {/* Game Controls */}
              <div className="bg-card border border-border rounded-lg p-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleFlipBoard}
                  data-ocid="game.flip_board_button"
                >
                  <FlipHorizontal className="w-3.5 h-3.5 mr-1" />
                  Flip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleNewGame}
                  data-ocid="game.setup_button"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  New
                </Button>
              </div>
            </motion.div>

            {/* CENTER: Chess Board */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Mobile: Top player */}
              <div className="lg:hidden w-full bg-card border border-border rounded-lg p-3">
                <PlayerPanel
                  name={topName}
                  rating={topColor === "white" ? 1450 : 1800}
                  color={topColor}
                  isActive={gameState.turn === topColor && !isGameOver}
                  timeMs={topColor === "white" ? clocks.white : clocks.black}
                  capturedPieces={capturedPieces}
                />
              </div>

              {/* The Board */}
              <div className="bg-card border border-border rounded-lg p-3 shadow-board">
                <ChessBoard
                  gameState={gameState}
                  flipped={boardFlipped}
                  onMove={handleBoardMove}
                  pendingPromotion={
                    pendingPromotion
                      ? { from: pendingPromotion.from, to: pendingPromotion.to }
                      : null
                  }
                  lastMove={lastMove}
                  isAIThinking={isAIThinking}
                  playerColor={gameMode === "vs-ai" ? playerColor : "both"}
                />
              </div>

              {/* Mobile: Bottom player */}
              <div className="lg:hidden w-full bg-card border border-border rounded-lg p-3">
                <PlayerPanel
                  name={bottomName}
                  rating={bottomColor === "white" ? 1450 : 1800}
                  color={bottomColor}
                  isActive={gameState.turn === bottomColor && !isGameOver}
                  timeMs={bottomColor === "white" ? clocks.white : clocks.black}
                  capturedPieces={capturedPieces}
                />
              </div>

              {/* Mobile controls */}
              <div className="lg:hidden flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleFlipBoard}
                >
                  <FlipHorizontal className="w-3.5 h-3.5 mr-1" /> Flip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleNewGame}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> New Game
                </Button>
              </div>
            </motion.div>

            {/* RIGHT: Move History */}
            <motion.div
              className="hidden lg:block w-[220px] flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MoveHistory
                moves={gameState.moveHistory}
                gameStatus={gameState.gameStatus}
                onResign={handleResign}
                onDraw={handleDraw}
                onAnalyze={() => toast("Analysis coming soon!")}
                onNewGame={handleNewGame}
              />
            </motion.div>
          </div>

          {/* Mobile move history */}
          <div className="lg:hidden mt-4">
            <MoveHistory
              moves={gameState.moveHistory}
              gameStatus={gameState.gameStatus}
              onResign={handleResign}
              onDraw={handleDraw}
              onAnalyze={() => toast("Analysis coming soon!")}
              onNewGame={handleNewGame}
            />
          </div>

          {/* Game Lobby */}
          <GameLobby
            activeGames={activeGames}
            finishedGames={finishedGames}
            isLoading={false}
            onNewGame={handleNewGame}
          />
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showSetup && (
        <GameSetup
          onStartGame={startGame}
          onCancel={gameActive ? () => setShowSetup(false) : undefined}
        />
      )}

      <PromotionModal
        open={!!pendingPromotion}
        color={pendingPromotion?.color || "white"}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />

      <GameOverModal
        open={isGameOver && !showSetup}
        gameStatus={gameState.gameStatus}
        winner={gameState.winner}
        onPlayAgain={() => {
          startGame(
            { label: "", seconds: timeControlSeconds, type: "rapid" },
            gameMode,
            playerColor,
          );
        }}
        onNewGame={handleNewGame}
      />

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          toast.success("Welcome to Chess Hub!");
        }}
      />
    </div>
  );
}
