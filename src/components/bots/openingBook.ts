import { Bot } from "./botData";

// Simple internal book for common lines
// Format: "FEN_fragment": ["uci_move1", "uci_move2"]
// We use a simplified key (moves list or reduced FEN)
// Actually, mapping FEN to moves is easiest for a stateless lookup.
// We'll use full FEN (without clock/move number) for lookup.

interface BookMove {
    uci: string;
    weight: number; // Higher = more likely
    minRating: number; // Only bots above this play it
    maxRating?: number; // Only bots below this play it (e.g. traps)
}

const COMMON_OPENINGS: Record<string, BookMove[]> = {
    // Start Position
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -": [
        { uci: "e2e4", weight: 50, minRating: 0 },
        { uci: "d2d4", weight: 35, minRating: 400 },
        { uci: "c2c4", weight: 10, minRating: 800 },
        { uci: "g1f3", weight: 5, minRating: 800 },
        { uci: "b1c3", weight: 5, minRating: 100 }, // Nc3/Van Geet
        { uci: "g2g3", weight: 5, minRating: 600 },
        { uci: "b2b3", weight: 5, minRating: 600 },
        { uci: "f2f3", weight: 1, minRating: 0, maxRating: 600 }, // Barnes Opening (bad)
        { uci: "h2h4", weight: 1, minRating: 0, maxRating: 500 }, // Kadas (bad)
    ],
    // King's Pawn (e4)
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -": [
        { uci: "e7e5", weight: 50, minRating: 0 },
        { uci: "c7c5", weight: 30, minRating: 600 }, // Sicilian
        { uci: "e7e6", weight: 10, minRating: 600 }, // French
        { uci: "c7c6", weight: 10, minRating: 600 }, // Caro-Kann
        { uci: "d7d6", weight: 5, minRating: 400 }, // Pirc
    ],
    // Queen's Pawn (d4)
    "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq -": [
        { uci: "d7d5", weight: 45, minRating: 0 },
        { uci: "g8f6", weight: 40, minRating: 500 }, // Indian Defenses
        { uci: "f7f5", weight: 10, minRating: 800 }, // Dutch
        { uci: "e7e6", weight: 5, minRating: 600 },
    ],
    // English Opening (c4)
    "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq -": [
        { uci: "e7e5", weight: 40, minRating: 0 }, // Symmetrical or King's English
        { uci: "c7c5", weight: 30, minRating: 600 }, // Symmetrical English
        { uci: "e7e6", weight: 15, minRating: 500 },
        { uci: "g8f6", weight: 15, minRating: 500 },
    ],
    // Ruy Lopez (e4 e5 Nf3 Nc6 Bb5)
    "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq -": [
        { uci: "a7a6", weight: 60, minRating: 600 }, // Morphy Defense
        { uci: "g8f6", weight: 30, minRating: 800 }, // Berlin
        { uci: "f7f5", weight: 5, minRating: 1200 }, // Schliemann
        { uci: "d7d6", weight: 5, minRating: 400 }, // Steinitz
    ],
    // Sicilian (e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3)
    "r1bqkb1r/pp1ppppp/2n2n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq -": [
        { uci: "a7a6", weight: 30, minRating: 1000 }, // Najdorf-ish setup
        { uci: "g7g6", weight: 30, minRating: 1000 }, // Dragon
        { uci: "e7e5", weight: 20, minRating: 800 },
        { uci: "e7e6", weight: 20, minRating: 1000 }, // Scheveningen/Taimanov
    ],
    // More positions can be added here
};

function getFenKey(fen: string): string {
    // Strip clock and move number
    return fen.split(" ").slice(0, 4).join(" ");
}

export function getBookMove(fen: string, rating: number): string | null {
    const key = getFenKey(fen);
    const moves = COMMON_OPENINGS[key];

    if (!moves) return null;

    // Filter by rating
    const validMoves = moves.filter(m =>
        rating >= m.minRating &&
        (m.maxRating === undefined || rating <= m.maxRating)
    );

    if (validMoves.length === 0) return null;

    // Weighted random selection
    const totalWeight = validMoves.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    for (const move of validMoves) {
        random -= move.weight;
        if (random <= 0) {
            return move.uci;
        }
    }

    return validMoves[0].uci;
}
