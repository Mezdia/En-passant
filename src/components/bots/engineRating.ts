// Advanced Engine Rating Behavior System
// Implements realistic engine play based on target Elo rating
// Uses mathematical models based on real chess rating distributions

import type { GoMode } from "@/bindings";

export interface RatingBehavior {
  // Search parameters
  depth: number;

  // Skill parameters (for Stockfish-like engines)
  skillLevel: number; // 0-20 for Stockfish
  uciElo?: number;    // UCI_Elo value for compatible engines

  // Move selection parameters
  multiPV: number;

  // Error simulation parameters
  blunderRate: number;
  blunderThreshold: number;
  missedMateRate: number;

  // Time simulation
  moveTimeMs: number;
  thinkTimeVariance: number; // 0-1
  complexPositionMultiplier: number;
}

/**
 * Get Stockfish Skill Level equivalent for a given Elo
 * Stockfish Skill Level 0 ≈ 800 Elo
 * Stockfish Skill Level 20 ≈ 3400 Elo
 */
function getSkillLevel(elo: number): number {
  if (elo <= 800) return 0;
  if (elo >= 3200) return 20;

  // Linearize for better distribution in human range
  if (elo < 1200) return Math.floor((elo - 800) / 100); // 0-4
  if (elo < 1600) return 4 + Math.floor((elo - 1200) / 100); // 4-8
  if (elo < 2000) return 8 + Math.floor((elo - 1600) / 100); // 8-12
  if (elo < 2400) return 12 + Math.floor((elo - 2000) / 100); // 12-16
  return 16 + Math.floor((elo - 2400) / 200); // 16-20
}

/**
 * Calculate search depth based on Elo
 * Limits calculation power for weaker bots
 */
function getSearchDepth(elo: number): number {
  if (elo <= 400) return 1;
  if (elo <= 800) return 2;
  if (elo <= 1200) return 4;
  if (elo <= 1500) return 6;
  if (elo <= 1800) return 10;
  if (elo <= 2100) return 14;
  if (elo <= 2400) return 18;
  return 22; // Master+
}

/**
 * Calculate base think time in ms based on Elo
 * Simulates human behavior: beginners play fast (impulsive), 
 * intermediates think longer, masters are efficient but deep.
 */
function getThinkTime(elo: number): number {
  if (elo < 600) return 1000;  // Fast, random moves
  if (elo < 1000) return 1500;
  if (elo < 1400) return 3000; // Checking for blunders takes specific time
  if (elo < 1800) return 5000;
  if (elo < 2200) return 8000; // Deep calculation
  if (elo < 2500) return 6000; // Efficient calculation
  return 4000; // Super GM intuition
}

/**
 * Get complete rating behavior configuration
 * This is the main function to call
 */
export function getRatingBehavior(targetElo: number): RatingBehavior {
  const elo = Math.max(200, Math.min(3500, targetElo));

  return {
    depth: getSearchDepth(elo),
    skillLevel: getSkillLevel(elo),
    uciElo: targetElo < 3000 ? targetElo : undefined, // Usage depends on engine capability

    multiPV: elo < 1500 ? 10 : elo < 2200 ? 5 : 3, // Lower rated bots need more bad options to choose from

    // Blunder config is handled by blunderInjection.ts logic mostly, 
    // but these values drive the engine configuration too.
    blunderRate: 0, // Handled externally now
    blunderThreshold: 0,
    missedMateRate: 0,

    moveTimeMs: getThinkTime(elo),
    thinkTimeVariance: 0.3 + (2500 - elo) / 5000,
    complexPositionMultiplier: 1.5,
  };
}

/**
 * Convert rating behavior to engine GoMode
 */
export function getGoModeForElo(
  targetElo: number,
  isMoveOverride = false, // If we want to force specific depth/nodes despite time
): GoMode {
  const behavior = getRatingBehavior(targetElo);

  // For very low rated bots, we MUST limit depth efficiently to prevent them from "seeing too much"
  // even if we pick bad moves later.

  if (targetElo < 1500) {
    return {
      t: "Depth",
      c: behavior.depth,
    };
  }

  // For stronger bots, use time or nodes to allow full strength within limits
  // But usually we just let them think for X ms or Depth X.
  // Depth is more consistent for bot levels than time (which depends on hardware).
  return {
    t: "Depth",
    c: behavior.depth,
  };
}

/**
 * Get compatible UCI options based on what the engine actually supports
 */
export function getCompatibleEngineOptions(
  targetElo: number,
  supportedOptions: string[],
): Array<{ name: string; value: string }> {
  const behavior = getRatingBehavior(targetElo);
  const options: Array<{ name: string; value: string }> = [];

  // 1. MultiPV is essential for our blunder injection system
  if (supportedOptions.includes("MultiPV")) {
    options.push({ name: "MultiPV", value: behavior.multiPV.toString() });
  }

  // 2. UCI_Elo (preferred for Strength limiting if available)
  if (
    supportedOptions.includes("UCI_LimitStrength") &&
    supportedOptions.includes("UCI_Elo") &&
    targetElo < 3200
  ) {
    options.push({ name: "UCI_LimitStrength", value: "true" });

    // HYBRID APPROACH:
    // Run engine at a capability slightly above the target Elo, then blunder inject.
    // E.g. for 500 Elo bot, run engine at 1200 Elo strength, then inject blunders.
    // This prevents the engine from finding "brilliant" tactical sacrifices that a 500 would never see,
    // while still giving us enough "reasonable" moves to choose from.

    const operationalElo = Math.min(3200, Math.max(1200, targetElo + 600));
    options.push({ name: "UCI_Elo", value: operationalElo.toString() });
    return options;
  }

  // 3. Skill Level (Standard Stockfish)
  if (supportedOptions.includes("Skill Level")) {
    // Similar hybrid approach: Request slightly higher skill than target
    const operationalSkill = Math.min(20, behavior.skillLevel + 5);
    options.push({ name: "Skill Level", value: operationalSkill.toString() });
  }

  return options;
}

/**
 * Get optimistic engine options when we can't query the engine capabilities.
 * Assumes a standard Stockfish-like engine.
 */
export function getEngineOptionsForElo(targetElo: number): Array<{ name: string; value: string }> {
  const behavior = getRatingBehavior(targetElo);
  const options: Array<{ name: string; value: string }> = [];

  options.push({ name: "MultiPV", value: behavior.multiPV.toString() });
  options.push({ name: "Skill Level", value: Math.min(20, behavior.skillLevel + 5).toString() });

  return options;
}

/**
 * Simulate human-like think time
 */
export function simulateThinkTime(
  targetElo: number,
  isComplexPosition = false,
): number {
  const behavior = getRatingBehavior(targetElo);
  let time = behavior.moveTimeMs;

  if (isComplexPosition) {
    time *= behavior.complexPositionMultiplier;
  }

  // Add variance
  const variance = behavior.moveTimeMs * behavior.thinkTimeVariance;
  const jitter = (Math.random() * 2 - 1) * variance;

  return Math.max(500, Math.floor(time + jitter));
}

/**
 * Get a human-readable description of the rating level
 */
export function getRatingDescription(elo: number): string {
  if (elo < 400) return "Absolute Beginner";
  if (elo < 600) return "Beginner";
  if (elo < 800) return "Novice";
  if (elo < 1000) return "Casual Player";
  if (elo < 1200) return "Club Player";
  if (elo < 1400) return "Intermediate";
  if (elo < 1600) return "Tournament Player";
  if (elo < 1800) return "Strong Club Player";
  if (elo < 2000) return "Expert";
  if (elo < 2200) return "National Master";
  if (elo < 2400) return "FIDE Master";
  if (elo < 2500) return "International Master";
  if (elo < 2700) return "Grandmaster";
  if (elo < 2800) return "Super Grandmaster";
  return "World Elite";
}
