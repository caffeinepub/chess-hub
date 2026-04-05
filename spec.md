# Chess Hub

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Full chess game playable in the browser (player vs player on same device, and player vs AI)
- Chessboard with all standard chess rules: legal move validation, check/checkmate/stalemate detection, castling, en passant, pawn promotion
- User registration and login system with player profiles, ELO-style rating
- Game lobby: see active matches and online players
- Move history panel with algebraic notation
- Player clocks (time controls: blitz, rapid, bullet)
- Captured pieces display
- Game analysis / review mode after game ends
- Resign and draw offer actions
- Top players leaderboard
- My latest games history

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan

### Backend (Motoko)
- User registry: register, login, profile (username, ELO rating, game history)
- Game state management: create game, join game, make move, get game state
- Game rules enforcement: validate moves, detect check/checkmate/stalemate
- Move history stored per game in algebraic notation
- Active games list and completed games history
- Leaderboard: top players sorted by rating
- Clock tracking: store time remaining per player, update on each move

### Frontend (React + TypeScript)
- Dark navy header with logo, navigation links, auth buttons
- Three-column layout: left panel (player info, clocks), center (chessboard), right (move history + actions)
- Interactive SVG chessboard with drag-and-drop or click-to-move
- Move highlighting: selected square (blue), valid destination dots/rings
- Player avatars, names, ratings display
- Turn indicator ("BLACK TO MOVE" / "WHITE TO MOVE")
- Game clocks with countdown timers
- Algebraic notation move list with White/Black tabs
- Action buttons: Analyze Game, Resign, Draw offer, Stop
- Bottom section: Active Matches lobby, Top Players Online, My Latest Games cards
- Registration/Login modal
- Responsive layout
