import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module PlayerStats {
    public type PlayerStats = Text;
  };

  module Board {
    public type Piece = Text;
    public type Board = Text;
  };

  module Game {
    public type Game = Text;
    public type GameStatus = Text;
  };

  module PlayerRole {
    public type PlayerRole = Text;
  };

  module Subscription {
    public type Subscription = Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let playerStats = Map.empty<Principal, PlayerStats.PlayerStats>();
  let lobbies = Map.empty<Nat, Game.Game>();
  let runningGames = Map.empty<Nat, Game.Game>();
  let finishedGames = Map.empty<Nat, Game.Game>();
  let usersWithSubscription = Map.empty<Principal, Subscription.Subscription>();
  var nextGameId = 0;

  func calculateK(openingRating : Nat) : Nat {
    if (openingRating < 2100) { return 32 };
    if (openingRating < 2400) { return 24 };
    16;
  };

  public shared ({ caller }) func registerPlayer(fullName : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as players");
    };
    let newPlayerStats : PlayerStats.PlayerStats = "dummy";
    playerStats.add(caller, newPlayerStats);
  };

  public query ({ caller }) func getCallerPlayerStats() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view player stats");
    };
    switch (playerStats.get(caller)) {
      case (null) { Runtime.trap("Player not found") };
      case (?stats) { stats };
    };
  };

  public shared ({ caller }) func createGame(boardSize : Nat, timeControl : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create games");
    };
    switch (playerStats.get(caller)) {
      case (null) { Runtime.trap("Player not found") };
      case (?pStats) {
        if (boardSize <= 0 or boardSize > 19) {
          Runtime.trap("Invalid board size");
        };
        let newGameValue : Game.Game = "dummy";
        lobbies.add(nextGameId, newGameValue);
        let nextId = nextGameId;
        nextGameId += 1;
        nextId;
      };
    };
  };

  public shared ({ caller }) func cancelGame(gameId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel games");
    };
    switch (lobbies.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?lobby) {
        lobbies.remove(gameId);
      };
    };
  };

  // Join game from lobby
  public shared ({ caller }) func joinGame(gameId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join games");
    };
    switch (lobbies.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        lobbies.remove(gameId);
      };
    };
  };

  public shared ({ caller }) func resignGame(gameId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can resign games");
    };
    switch (runningGames.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?currentGame) {
        runningGames.remove(gameId);
        finishedGames.add(gameId, currentGame);
      };
    };
  };

  // Make a move in a game
  public shared ({ caller }) func makeMove(gameId : Nat, fromRow : Nat, fromCol : Nat, toRow : Nat, toCol : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can make moves");
    };
    switch (runningGames.get(gameId)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
      };
    };
  };

  public query ({ caller }) func getPlayerGameHistory(playerId : Principal) : async [Nat] {
    if (caller != playerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own game history");
    };
    switch (playerStats.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?pStats) {
        [1];
      };
    };
  };

  module GameSummary {
    public type GameSummary = {
      gameId : Nat;
      currentPosition : FENString;
      turn : PlayerRole.PlayerRole;
      status : Game.GameStatus;
      white : Text;
      black : Text;
    };

    public func compare(a : GameSummary, b : GameSummary) : Order.Order {
      Nat.compare(a.gameId, b.gameId);
    };
  };

  func principalOrAnonymousToText(principalOrNull : ?Principal) : Text {
    switch (principalOrNull) {
      case (null) { "Anonymous" };
      case (?principal) { principal.toText() };
    };
  };

  public query ({ caller }) func getActiveGames() : async [GameSummary.GameSummary] {
    runningGames.values().toArray().map(
      func(g) {
        {
          gameId = 0;
          currentPosition = "dummy";
          turn = "";
          status = "";
          white = "";
          black = "";
        };
      }
    ).sort();
  };

  func boardAsText(space : [Board.Piece]) : Text {
    "dummy";
  };

  // Queries list of all finished games for a player
  public query ({ caller }) func getFinishedGames() : async [GameSummary.GameSummary] {
    finishedGames.values().toArray().map(
      func(g) {
        {
          gameId = 0;
          currentPosition = "dummy";
          turn = "";
          status = "";
          white = "";
          black = "";
        };
      }
    ).sort();
  };

  public shared ({ caller }) func grantSubscription(playerId : Principal, validUntil : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant subscriptions");
    };
    usersWithSubscription.add(playerId, "dummy");
  };

  public shared ({ caller }) func revokeSubscription(playerId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke subscriptions");
    };
    usersWithSubscription.add(playerId, "dummy");
  };

  public query ({ caller }) func getUserSubscriptions(status : Subscription.Subscription) : async [(Principal, Time.Time)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can get user subscriptions");
    };
    [(Principal.fromText("aaaaa-aa"), 123456)];
  };

  type FullName = Text;

  // JSON Parser
  public type Player = {
    id : Principal;
    fullName : Text;
    isSubscriber : Bool;
  };

  public query ({ caller }) func getPlayers() : async [Player] {
    playerStats.toArray().map(
      func(tuple) {
        let (id, player) = tuple;
        {
          id;
          fullName = player;
          isSubscriber = usersWithSubscription.get(id) != null;
        };
      }
    );
  };

  public type FENString = Text;
  public type Piece = Board.Piece;
  public type Position = Board.Board;

  type Subscription = {
    #valid : Time.Time;
    #revoked;
  };

  type GameDto = {
    id : Nat;
    white : Principal;
    black : Principal;
    history : [Board.Board];
    currentPosition : Board.Board;
    status : {
      #pending;
      #active;
      #finished;
    };
  };

  type ListSubscribersRequest = {
    filterBy : {
      #valid;
      #revoked;
    };
  };

  type ListSubscribersResponse = {
    newSubscribers : [(Principal, Time.Time)];
    validSubscribers : [(Principal, Time.Time)];
    revokedSubscribers : [Principal];
  };
};
