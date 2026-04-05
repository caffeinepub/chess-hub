import { useQuery } from "@tanstack/react-query";
import type { GameSummary, Player } from "../backend.d";
import { useActor } from "./useActor";

export function useActiveGames() {
  const { actor, isFetching } = useActor();
  return useQuery<GameSummary[]>({
    queryKey: ["activeGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveGames();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useFinishedGames() {
  const { actor, isFetching } = useActor();
  return useQuery<GameSummary[]>({
    queryKey: ["finishedGames"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFinishedGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlayerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["playerStats"],
    queryFn: async () => {
      if (!actor) return "{}";
      return actor.getCallerPlayerStats();
    },
    enabled: !!actor && !isFetching,
  });
}
