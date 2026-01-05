import { parseUci } from "chessops";
import type { Position } from "chessops/chess";

/**
 * Advanced Blunder Injection System
 * Based on research from Maia Chess and Chess.com bot behaviors
 */

export interface MoveCandidate {
    uci: string;
    cp: number;      // Centipawn evaluation (relative to side to move)
    mate?: number;   // Mate in N (positive = winning, negative = losing) 
    pv: string[];
}

export interface BlunderConfig {
    blunderRate: number;      // 0-1 probability of making a blunder
    blunderThreshold: number; // Minimum CP loss to look for
    maxBlunder: number;       // Maximum CP loss (don't play losing moves if possible for high ratings)
    missedMateRate: number;   // Probability of missing a forced mate
    tacticalOversightRate: number; // Probability of missing a tactical shot
}

type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface BlunderDecision {
    selectedMoveIndex: number;
    isBlunder: boolean;
    type: 'best' | 'suboptimal' | 'blunder' | 'missed_mate';
    reason?: string;
}

/**
 * Determine the current game phase
 */
export function getGamePhase(pos: Position): GamePhase {
    const pieceCount = pos.board.occupied.size();

    // Simple heuristic
    if (pos.fullmoves < 10) return 'opening';
    if (pieceCount <= 10) return 'endgame';
    return 'middlegame';
}

/**
 * Select a move based on rating and available candidates
 */
export function selectMoveByRating(
    candidates: MoveCandidate[],
    rating: number,
    pos: Position,
    config: BlunderConfig
): BlunderDecision {
    // Edge case: Only one move or no candidates
    if (!candidates || candidates.length === 0) {
        return { selectedMoveIndex: 0, isBlunder: false, type: 'best' };
    }
    if (candidates.length === 1) {
        return { selectedMoveIndex: 0, isBlunder: false, type: 'best' };
    }

    // Sort candidates by score (descending for side to move)
    // Assuming candidates are already sorted by engine, but safety check:
    // Usually MultiPV returns sorted.

    const bestMove = candidates[0];
    const phase = getGamePhase(pos);

    // 1. Check for Forced Mate (Missing a win)
    if (bestMove.mate && bestMove.mate > 0) {
        // If we have a forced mate, low rated bots might miss it
        // Mate in 1 should rarely be missed even by beginners (unless very low rated)
        // Mate in 3+ is easily missed by intermediates

        // Adjusted probability based on mate depth
        const mateDepth = bestMove.mate;
        let missChance = config.missedMateRate;

        if (mateDepth === 1) missChance *= 0.1; // Rarely miss mate in 1
        else if (mateDepth <= 3) missChance *= 0.5;

        if (Math.random() < missChance) {
            // Pick a non-mating move if available, or a slower mate
            const nonMatingIndex = candidates.findIndex(m => !m.mate || m.mate > mateDepth);
            if (nonMatingIndex !== -1) {
                return {
                    selectedMoveIndex: nonMatingIndex,
                    isBlunder: true,
                    type: 'missed_mate',
                    reason: `Missed mate in ${mateDepth}`
                };
            }
        }
    }

    // 2. Determine if we should blunder this turn
    const shouldBlunder = Math.random() < config.blunderRate;

    if (shouldBlunder) {
        // We want to blunder. Find a move that loses CP within our target range.
        // Calculate CP loss relative to best move.

        const bestScore = bestMove.mate ? 10000 : bestMove.cp;

        // Filter moves that are blunders (loss > threshold)
        const blunderMoves = candidates
            .map((m, index) => {
                const currentScore = m.mate ? (m.mate > 0 ? 10000 - m.mate : -10000 - m.mate) : m.cp;
                const loss = bestScore - currentScore;
                return { index, loss, ...m };
            })
            .filter(m => m.loss >= config.blunderThreshold && m.loss <= config.maxBlunder);

        if (blunderMoves.length > 0) {
            // Pick a random blunder from the valid range
            // Weighted towards smaller blunders for higher ratings? 
            // For now, random selection from "reasonable" blunders to avoid completely weird moves
            // unless specifically low rated.

            const selected = blunderMoves[Math.floor(Math.random() * blunderMoves.length)];
            return {
                selectedMoveIndex: selected.index,
                isBlunder: true,
                type: 'blunder',
                reason: `CP Loss: ${selected.loss}`
            };
        }

        // If no specific blunder found in range, try to pick just "not the best" move
        // Fallthrough to suboptimal selection
    }

    // 3. Suboptimal Play (Small inaccuracies)
    // Higher ratings play top 1-3 moves. Lower ratings play top 1-5.

    // Probability of playing absolute best move scales with rating
    // Even if not blundering, we don't always play #1

    // Simple heuristic:
    // Rating 3000 -> 95% best move
    // Rating 1500 -> 50% best move
    // Rating 500  -> 20% best move

    const bestMoveProb = Math.min(0.95, Math.max(0.1, rating / 3200));

    if (Math.random() > bestMoveProb) {
        // Pick something else if valid
        // Don't pick a massive blunder here (unless we were supposed to blunder above)
        // Just pick a slightly worse move (e.g. 2nd or 3rd best)

        const validAlternatives = candidates.slice(1, Math.min(candidates.length, 3 + Math.floor((3000 - rating) / 500)));

        if (validAlternatives.length > 0) {
            // Filter out massive blunders (save those for the blunder logic)
            // We only want inaccuracies here
            const safeAlternatives = validAlternatives.filter((m, i) => {
                const score = m.mate ? 10000 : m.cp;
                const bestSc = bestMove.mate ? 10000 : bestMove.cp;
                return Math.abs(bestSc - score) < config.blunderThreshold; // Only small error
            });

            if (safeAlternatives.length > 0) {
                // Need to map back to original index
                const chosen = safeAlternatives[Math.floor(Math.random() * safeAlternatives.length)];
                const originalIndex = candidates.indexOf(chosen);
                return {
                    selectedMoveIndex: originalIndex,
                    isBlunder: false,
                    type: 'suboptimal',
                    reason: 'Natural inaccuracy'
                };
            }
        }
    }

    // Default: Play best move
    return {
        selectedMoveIndex: 0,
        isBlunder: false,
        type: 'best'
    };
}

/**
 * Get blunder configuration for a specific rating
 */
export function getBlunderConfig(rating: number): BlunderConfig {
    if (rating < 300) {
        return {
            blunderRate: 0.50,
            blunderThreshold: 50, // Even small losses are common
            maxBlunder: 1000,     // Can hang queen
            missedMateRate: 0.60,
            tacticalOversightRate: 0.80
        };
    }
    if (rating < 500) {
        return {
            blunderRate: 0.40,
            blunderThreshold: 100,
            maxBlunder: 900,
            missedMateRate: 0.50,
            tacticalOversightRate: 0.70
        };
    }
    if (rating < 800) {
        return {
            blunderRate: 0.30,
            blunderThreshold: 150,
            maxBlunder: 600, // Hangs minor pieces/rooks
            missedMateRate: 0.30,
            tacticalOversightRate: 0.50
        };
    }
    if (rating < 1200) {
        return {
            blunderRate: 0.20,
            blunderThreshold: 150,
            maxBlunder: 400, // Minor pieces
            missedMateRate: 0.15,
            tacticalOversightRate: 0.30
        };
    }
    if (rating < 1600) {
        return {
            blunderRate: 0.12,
            blunderThreshold: 150,
            maxBlunder: 300,
            missedMateRate: 0.05,
            tacticalOversightRate: 0.15
        };
    }
    if (rating < 2000) {
        return {
            blunderRate: 0.08,
            blunderThreshold: 200, // Strategic errors
            maxBlunder: 300,
            missedMateRate: 0.01,
            tacticalOversightRate: 0.05
        };
    }
    if (rating < 2400) {
        return {
            blunderRate: 0.04,
            blunderThreshold: 220,
            maxBlunder: 300,
            missedMateRate: 0.001,
            tacticalOversightRate: 0.01
        };
    }
    // Master +
    return {
        blunderRate: 0.01,
        blunderThreshold: 300,
        maxBlunder: 500,
        missedMateRate: 0.00,
        tacticalOversightRate: 0.00
    };
}
