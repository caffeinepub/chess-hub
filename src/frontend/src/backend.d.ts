import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Subscription = string;
export interface Player {
    id: Principal;
    fullName: string;
    isSubscriber: boolean;
}
export type Time = bigint;
export type GameStatus = string;
export type FENString = string;
export type PlayerRole = string;
export interface GameSummary {
    status: GameStatus;
    turn: PlayerRole;
    gameId: bigint;
    currentPosition: FENString;
    black: string;
    white: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelGame(gameId: bigint): Promise<void>;
    createGame(boardSize: bigint, timeControl: bigint): Promise<bigint>;
    getActiveGames(): Promise<Array<GameSummary>>;
    getCallerPlayerStats(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getFinishedGames(): Promise<Array<GameSummary>>;
    getPlayerGameHistory(playerId: Principal): Promise<Array<bigint>>;
    getPlayers(): Promise<Array<Player>>;
    getUserSubscriptions(status: Subscription): Promise<Array<[Principal, Time]>>;
    grantSubscription(playerId: Principal, validUntil: Time): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    joinGame(gameId: bigint): Promise<void>;
    makeMove(gameId: bigint, fromRow: bigint, fromCol: bigint, toRow: bigint, toCol: bigint): Promise<void>;
    registerPlayer(fullName: string, email: string): Promise<void>;
    resignGame(gameId: bigint): Promise<void>;
    revokeSubscription(playerId: Principal): Promise<void>;
}
