/**
 * Game implementation constants
 * 
 * This file tracks which games are fully implemented in the frontend.
 * Games in this list will route to their game-specific components.
 * Games not in this list will route to the Coming Soon page.
 */

export const IMPLEMENTED_GAMES = ['vocab-quiz'] as const;
type ImplementedGameCode = (typeof IMPLEMENTED_GAMES)[number];

/**
 * Checks if a game code is in the list of fully implemented games.
 * @param gameCode - The game code to check (e.g., "vocab-quiz", "word-scramble")
 * @returns true if the game is fully implemented, false otherwise
 */
export function isGameImplemented(gameCode: string): gameCode is ImplementedGameCode {
  return IMPLEMENTED_GAMES.includes(gameCode as ImplementedGameCode);
}

