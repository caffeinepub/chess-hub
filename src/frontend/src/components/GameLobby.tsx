import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, ArrowRight, Clock, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import type { GameSummary } from "../backend.d";

interface GameLobbyProps {
  activeGames: GameSummary[];
  finishedGames: GameSummary[];
  isLoading: boolean;
  onJoinGame?: (gameId: bigint) => void;
  onNewGame: () => void;
}

const MOCK_ACTIVE_MATCHES: Partial<GameSummary>[] = [
  {
    white: "Magnus C.",
    black: "Hikaru N.",
    status: "active",
    turn: "white",
    gameId: BigInt(1),
  },
  {
    white: "Fabiano C.",
    black: "Ian N.",
    status: "active",
    turn: "black",
    gameId: BigInt(2),
  },
  {
    white: "Alireza F.",
    black: "Wesley S.",
    status: "active",
    turn: "white",
    gameId: BigInt(3),
  },
];

const MOCK_TOP_PLAYERS = [
  { name: "GrandMaster_Alex", rating: 2840, online: true },
  { name: "ChessWizard_99", rating: 2750, online: true },
  { name: "NightKnight_77", rating: 2680, online: false },
  { name: "PawnStorm_Pro", rating: 2640, online: true },
  { name: "EndgameKing_", rating: 2590, online: false },
];

export function GameLobby({
  activeGames,
  finishedGames,
  isLoading: _isLoading,
  onJoinGame,
  onNewGame,
}: GameLobbyProps) {
  const displayActiveGames =
    activeGames.length > 0 ? activeGames : MOCK_ACTIVE_MATCHES;

  return (
    <section className="mt-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Matches Lobby */}
        <motion.div
          className="bg-card border border-border rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-ocid="lobby.active_matches.card"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Lobby: Active Matches
              </h3>
            </div>
            <Badge variant="secondary" className="text-xs">
              {displayActiveGames.length}
            </Badge>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-3 space-y-1">
              {displayActiveGames.length === 0 ? (
                <div
                  className="text-center text-muted-foreground text-sm py-8"
                  data-ocid="lobby.active_matches.empty_state"
                >
                  No active games
                </div>
              ) : (
                displayActiveGames.map((game, idx) => (
                  <div
                    key={
                      game.gameId !== undefined
                        ? String(game.gameId)
                        : `${game.white}-${game.black}`
                    }
                    className="flex items-center justify-between py-2 px-2 rounded hover:bg-muted/50 transition-colors group"
                    data-ocid={`lobby.active_matches.item.${idx + 1}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {game.white}{" "}
                        <span className="text-muted-foreground text-xs">
                          vs
                        </span>{" "}
                        {game.black}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {game.turn === "white" ? "♔" : "♚"} {game.turn}'s turn
                      </p>
                    </div>
                    {game.status === "waiting" && onJoinGame && game.gameId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs shrink-0 ml-2"
                        onClick={() => onJoinGame(game.gameId!)}
                      >
                        Join
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="px-4 py-3 border-t border-border">
            <Button
              variant="default"
              size="sm"
              className="w-full bg-navy-dark hover:bg-navy-mid text-white text-xs"
              onClick={onNewGame}
              data-ocid="lobby.new_game_button"
            >
              + New Game
            </Button>
          </div>
        </motion.div>

        {/* Top Players Online */}
        <motion.div
          className="bg-card border border-border rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          data-ocid="lobby.top_players.card"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Trophy className="w-4 h-4 text-gold" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Top Players Online
            </h3>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-3 space-y-1">
              {MOCK_TOP_PLAYERS.map((player, idx) => (
                <div
                  key={player.name}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                  data-ocid={`lobby.top_players.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground font-medium w-4">
                      {idx + 1}.
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        player.online ? "bg-green-400" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                    {player.rating}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="px-4 py-3 border-t border-border">
            <a
              href="https://caffeine.ai"
              className="text-xs text-navy-mid font-medium hover:underline flex items-center gap-1"
            >
              View Leaderboard <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* My Latest Games */}
        <motion.div
          className="bg-card border border-border rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          data-ocid="lobby.my_games.card"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              My Latest Games
            </h3>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-3 space-y-1">
              {finishedGames.length === 0 ? (
                <div
                  className="text-center text-muted-foreground text-sm py-8"
                  data-ocid="lobby.my_games.empty_state"
                >
                  No games yet. Start playing!
                </div>
              ) : (
                finishedGames.slice(0, 5).map((game, idx) => (
                  <div
                    key={String(game.gameId)}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                    data-ocid={`lobby.my_games.item.${idx + 1}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {game.white} vs {game.black}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {game.status}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${
                        game.status === "checkmate"
                          ? "text-destructive border-destructive/30"
                          : "text-muted-foreground"
                      }`}
                    >
                      {game.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <div className="px-4 py-3 border-t border-border">
            <a
              href="https://caffeine.ai"
              className="text-xs text-navy-mid font-medium hover:underline flex items-center gap-1"
            >
              View All Games <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
