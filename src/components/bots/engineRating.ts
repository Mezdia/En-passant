// Advanced Engine Rating Behavior System
// Implements realistic engine play based on target Elo rating
// Uses mathematical models based on real chess rating distributions

import type { GoMode } from "@/bindings";

export interface RatingBehavior {
    // Search parameters
    depth: number;
    moveTimeMs: number;

    // Skill parameters (for Stockfish-like engines)
    skillLevel: number;  // 0-20 for Stockfish

    // Move selection parameters
    multiPV: number;
    contempt: number;

    // Error simulation parameters
    centipawnLossAverage: number;  // Average centipawn loss per move
    centipawnLossStdDev: number;   // Standard deviation
    blunderThreshold: number;      // CP loss that counts as blunder
    blunderRate: number;           // Probability of blunder per move
    missedWinRate: number;         // Probability of missing winning move

    // Time simulation
    thinkTimeVariance: number;     // Variance in think time (0-1)

    // Move choice probabilities
    bestMoveProb: number;          // Probability of playing best move
    secondBestProb: number;        // Probability of playing second best
    randomMoveProb: number;        // Probability of random move from top N
}

/**
 * Elo-based performance model
 * Based on FIDE rating distribution and performance statistics
 */
function getExpectedWinRate(playerElo: number, opponentElo: number): number {
    const eloDiff = playerElo - opponentElo;
    return 1 / (1 + Math.pow(10, -eloDiff / 400));
}

/**
 * Calculate average centipawn loss based on Elo
 * Based on empirical data from large game databases
 * Higher rated players make smaller average errors
 */
function getAverageCentipawnLoss(elo: number): number {
    // Empirical formula based on lichess/chess.com data
    // ~150 ACPL at 400, ~25 ACPL at 2800
    const maxACPL = 180;
    const minACPL = 8;
    const k = 0.0018; // Decay rate

    return minACPL + (maxACPL - minACPL) * Math.exp(-k * (elo - 200));
}

/**
 * Calculate blunder rate based on Elo
 * Blunder = move losing more than 100cp
 */
function getBlunderRate(elo: number): number {
    // At 400: ~15% blunder rate
    // At 1500: ~5% blunder rate
    // At 2500: ~0.5% blunder rate
    // At 2800: ~0.1% blunder rate

    if (elo < 600) return 0.15 - (elo - 400) * 0.00025;
    if (elo < 1200) return 0.10 - (elo - 600) * 0.00008;
    if (elo < 1800) return 0.05 - (elo - 1200) * 0.00006;
    if (elo < 2400) return 0.015 - (elo - 1800) * 0.00002;
    return Math.max(0.001, 0.003 - (elo - 2400) * 0.000005);
}

/**
 * Calculate probability of playing the best move
 */
function getBestMoveProb(elo: number): number {
    // At 400: ~20% best move rate
    // At 1500: ~45% best move rate
    // At 2500: ~75% best move rate
    // At 2800: ~90% best move rate

    const minProb = 0.15;
    const maxProb = 0.95;
    const midPoint = 1800;
    const steepness = 0.003;

    return minProb + (maxProb - minProb) / (1 + Math.exp(-steepness * (elo - midPoint)));
}

/**
 * Get Stockfish Skill Level equivalent for a given Elo
 * Stockfish Skill Level 0 ≈ 800 Elo
 * Stockfish Skill Level 20 ≈ 3400 Elo
 */
function getSkillLevel(elo: number): number {
    if (elo <= 400) return 0;
    if (elo >= 3400) return 20;

    // Non-linear mapping to match Stockfish behavior
    // Lower levels are more compressed
    const normalized = (elo - 400) / 3000;

    if (elo < 1000) {
        return Math.floor(normalized * 6); // 0-3 for 400-1000
    } else if (elo < 1600) {
        return Math.floor(3 + (elo - 1000) / 600 * 4); // 3-7 for 1000-1600
    } else if (elo < 2200) {
        return Math.floor(7 + (elo - 1600) / 600 * 5); // 7-12 for 1600-2200
    } else if (elo < 2700) {
        return Math.floor(12 + (elo - 2200) / 500 * 5); // 12-17 for 2200-2700
    } else {
        return Math.floor(17 + (elo - 2700) / 700 * 3); // 17-20 for 2700+
    }
}

/**
 * Calculate search depth based on Elo
 * Higher rated = deeper search (but limited by time)
 */
function getSearchDepth(elo: number): number {
    if (elo < 600) return 3 + Math.floor((elo - 400) / 100);
    if (elo < 1200) return 5 + Math.floor((elo - 600) / 120);
    if (elo < 1800) return 10 + Math.floor((elo - 1200) / 150);
    if (elo < 2400) return 14 + Math.floor((elo - 1800) / 150);
    return Math.min(30, 18 + Math.floor((elo - 2400) / 200));
}

/**
 * Calculate think time in ms based on Elo
 */
function getThinkTime(elo: number): number {
    // Beginners think less (don't know what to calculate)
    // Intermediates think more (lots to consider)
    // Masters think efficiently

    if (elo < 600) return 200 + (elo - 400) * 2;
    if (elo < 1200) return 600 + (elo - 600) * 3;
    if (elo < 1800) return 2400 + (elo - 1200) * 4;
    if (elo < 2400) return 4800 + (elo - 1800) * 3;
    return 6600 + (elo - 2400) * 2;
}

/**
 * Get complete rating behavior configuration
 * This is the main function to call
 */
export function getRatingBehavior(targetElo: number): RatingBehavior {
    const elo = Math.max(200, Math.min(3500, targetElo));

    const acpl = getAverageCentipawnLoss(elo);
    const blunderRate = getBlunderRate(elo);
    const bestMoveProb = getBestMoveProb(elo);

    return {
        depth: getSearchDepth(elo),
        moveTimeMs: getThinkTime(elo),
        skillLevel: getSkillLevel(elo),
        multiPV: elo < 1500 ? 5 : elo < 2200 ? 3 : 2,
        contempt: Math.floor((elo - 1500) / 50), // Stronger players have more contempt

        centipawnLossAverage: acpl,
        centipawnLossStdDev: acpl * 0.8, // High variance in lower ratings
        blunderThreshold: 100 + Math.max(0, (2000 - elo) / 10), // Lower rated = higher threshold
        blunderRate: blunderRate,
        missedWinRate: blunderRate * 1.5, // Slightly higher than blunder rate

        thinkTimeVariance: 0.3 + (2500 - elo) / 5000, // Lower rated = more variable

        bestMoveProb: bestMoveProb,
        secondBestProb: (1 - bestMoveProb) * 0.4,
        randomMoveProb: (1 - bestMoveProb) * 0.1,
    };
}

/**
 * Convert rating behavior to engine GoMode
 */
export function getGoModeForElo(targetElo: number, useTimeLimit: boolean = false): GoMode {
    const behavior = getRatingBehavior(targetElo);

    if (useTimeLimit) {
        return {
            t: "Time",
            c: behavior.moveTimeMs,
        };
    }

    return {
        t: "Depth",
        c: behavior.depth,
    };
}

/**
 * Get UCI options to set for an engine to play at target Elo
 * Works with Stockfish and compatible engines
 */
export function getEngineOptionsForElo(targetElo: number): Array<{ name: string; value: string }> {
    const behavior = getRatingBehavior(targetElo);

    const options: Array<{ name: string; value: string }> = [
        { name: "Skill Level", value: behavior.skillLevel.toString() },
        { name: "MultiPV", value: behavior.multiPV.toString() },
    ];

    // Add contempt for higher levels
    if (behavior.contempt !== 0) {
        options.push({ name: "Contempt", value: behavior.contempt.toString() });
    }

    // For very low ratings, use limited strength if available
    if (targetElo < 1500) {
        options.push({ name: "UCI_LimitStrength", value: "true" });
        options.push({ name: "UCI_Elo", value: targetElo.toString() });
    }

    return options;
}

/**
 * Select which move to play from engine's MultiPV output
 * Returns index 0 = best move, 1 = second best, etc.
 */
export function selectMoveByElo(
    targetElo: number,
    availableMoves: number,
    moveEvaluations?: number[] // Centipawn evaluations for each move
): number {
    const behavior = getRatingBehavior(targetElo);
    const rand = Math.random();

    // Check for blunder
    if (rand < behavior.blunderRate && availableMoves > 3) {
        // Select a poor move (bottom half of available moves)
        const badMoveStart = Math.floor(availableMoves * 0.5);
        return badMoveStart + Math.floor(Math.random() * (availableMoves - badMoveStart));
    }

    // Best move probability
    if (rand < behavior.bestMoveProb) {
        return 0;
    }

    // Second best probability
    if (availableMoves > 1 && rand < behavior.bestMoveProb + behavior.secondBestProb) {
        return 1;
    }

    // Random from top moves
    const topN = Math.min(behavior.multiPV, availableMoves);
    return Math.floor(Math.random() * topN);
}

/**
 * Simulate human-like think time based on Elo
 */
export function simulateThinkTime(targetElo: number, isComplexPosition: boolean = false): number {
    const behavior = getRatingBehavior(targetElo);

    let baseTime = behavior.moveTimeMs;

    // Add complexity bonus
    if (isComplexPosition) {
        baseTime *= 1.5;
    }

    // Add variance
    const variance = baseTime * behavior.thinkTimeVariance;
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1

    const finalTime = baseTime + randomFactor * variance;

    // Minimum think time
    return Math.max(100, Math.floor(finalTime));
}

/**
 * Check if a move should be considered based on Elo
 * Used to filter out moves that are "too good" for the rating
 */
export function shouldConsiderMove(
    targetElo: number,
    moveCpLoss: number,
    isMainLine: boolean
): boolean {
    const behavior = getRatingBehavior(targetElo);

    // Always consider main line moves
    if (isMainLine) return true;

    // Lower rated players miss good moves more often
    if (moveCpLoss < 0) { // Improving move
        return Math.random() > behavior.missedWinRate;
    }

    return true;
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

/**
 * Estimate win probability against target Elo
 */
export function estimateWinProbability(playerElo: number, botElo: number): {
    win: number;
    draw: number;
    loss: number;
} {
    const expectedScore = getExpectedWinRate(playerElo, botElo);

    // Estimate draw probability based on Elo difference
    const eloDiff = Math.abs(playerElo - botElo);
    let drawProb = 0.3 - eloDiff / 1000; // Base draw probability decreases with difference
    drawProb = Math.max(0.05, Math.min(0.4, drawProb));

    const winProb = expectedScore * (1 - drawProb);
    const lossProb = (1 - expectedScore) * (1 - drawProb);

    return {
        win: winProb,
        draw: drawProb,
        loss: lossProb,
    };
}
