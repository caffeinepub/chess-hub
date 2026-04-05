import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Flag, HandshakeIcon, StopCircle } from "lucide-react";
import React from "react";
import type { ChessMove, PieceColor } from "../chess/chess";

interface MoveHistoryProps {
  moves: ChessMove[];
  gameStatus: string;
  onResign: () => void;
  onDraw: () => void;
  onAnalyze: () => void;
  onNewGame: () => void;
}

function groupMoves(
  moves: ChessMove[],
): Array<{ white?: ChessMove; black?: ChessMove; num: number }> {
  const pairs: Array<{ white?: ChessMove; black?: ChessMove; num: number }> =
    [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }
  return pairs;
}

export function MoveHistory({
  moves,
  gameStatus,
  onResign,
  onDraw,
  onAnalyze,
  onNewGame,
}: MoveHistoryProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const pairs = groupMoves(moves);
  const isPlaying = gameStatus === "playing";

  const movesLength = moves.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on new moves
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [movesLength]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Game History
        </h3>
      </div>

      {/* Move list */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full max-h-[340px]">
          <div ref={scrollRef} className="p-2">
            {pairs.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No moves yet
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {pairs.map((pair, idx) => (
                    <tr
                      key={pair.num}
                      className={`${
                        idx % 2 === 0 ? "bg-muted/30" : "bg-transparent"
                      } hover:bg-accent/10 transition-colors`}
                    >
                      <td className="py-1 px-2 text-muted-foreground font-medium w-8">
                        {pair.num}.
                      </td>
                      <td className="py-1 px-2 font-mono font-medium w-1/2">
                        <span className="text-foreground">
                          {pair.white?.san || ""}
                        </span>
                      </td>
                      <td className="py-1 px-2 font-mono font-medium w-1/2">
                        <span className="text-foreground">
                          {pair.black?.san || ""}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Action buttons */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={onAnalyze}
        >
          <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
          Analyze Game
        </Button>

        {isPlaying ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={onResign}
              data-ocid="game.resign_button"
            >
              <Flag className="w-3.5 h-3.5 mr-1" />
              Resign
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onDraw}
              data-ocid="game.draw_button"
            >
              <HandshakeIcon className="w-3.5 h-3.5 mr-1" />
              Draw
            </Button>
          </div>
        ) : (
          <Button
            className="w-full text-xs bg-navy-dark hover:bg-navy-mid text-white"
            size="sm"
            onClick={onNewGame}
            data-ocid="game.new_game_button"
          >
            New Game
          </Button>
        )}
      </div>
    </div>
  );
}
