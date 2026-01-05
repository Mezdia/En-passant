
import { z } from "zod";

export const botGameRecordSchema = z.object({
    id: z.string(),
    botId: z.string(),
    botName: z.string(),
    botRating: z.number(),
    playerSide: z.enum(['white', 'black']),
    result: z.enum(['1-0', '0-1', '1/2-1/2', '*']),
    pgn: z.string(),
    date: z.string(), // ISO string
    gameMode: z.string(),
    movesCount: z.number(),
});

export type BotGameRecord = z.infer<typeof botGameRecordSchema>;

const STORAGE_KEY = "bot_game_history";

export function getBotGameHistory(): BotGameRecord[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // Validate / migrate if needed
        // For now returning as is, assuming valid
        return parsed as BotGameRecord[];
    } catch (e) {
        console.error("Failed to load bot game history", e);
        return [];
    }
}

export function saveBotGame(record: BotGameRecord): void {
    const history = getBotGameHistory();
    // Add new game to start
    const newHistory = [record, ...history];

    // Limit to last 1000 games to save space?
    if (newHistory.length > 1000) {
        newHistory.length = 1000;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function clearBotHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function deleteBotGame(gameId: string): void {
    const history = getBotGameHistory();
    const newHistory = history.filter(g => g.id !== gameId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}
