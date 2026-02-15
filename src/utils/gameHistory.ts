import { z } from "zod";

export type GameResult = "1-0" | "0-1" | "1/2-1/2" | "*";
export type GameParticipantType = "human" | "engine" | "bot";
export type GameHistorySource = "board" | "bot";

export const gameHistoryRecordSchema = z.object({
  id: z.string(),
  tabId: z.string().optional(),
  source: z.enum(["board", "bot"]),
  type: z.enum(["human", "engine", "bot"]),
  date: z.string(),
  result: z.enum(["1-0", "0-1", "1/2-1/2", "*"]),
  white: z.string(),
  black: z.string(),
  whiteType: z.enum(["human", "engine", "bot"]),
  blackType: z.enum(["human", "engine", "bot"]),
  movesCount: z.number(),
  pgn: z.string().optional(),
  variant: z.string().optional(),
  timeControl: z.string().optional(),
  engineName: z.string().optional(),
  botName: z.string().optional(),
  accuracy: z.number().optional(),
  whiteAccuracy: z.number().optional(),
  blackAccuracy: z.number().optional(),
});

export type GameHistoryRecord = z.infer<typeof gameHistoryRecordSchema>;

const STORAGE_KEY = "game_history";
const MAX_HISTORY = 2000;

function parseHistory(raw: string | null): GameHistoryRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: GameHistoryRecord[] = [];
    for (const item of parsed) {
      const res = gameHistoryRecordSchema.safeParse(item);
      if (res.success) valid.push(res.data);
    }
    return valid;
  } catch {
    return [];
  }
}

export function getGameHistory(): GameHistoryRecord[] {
  return parseHistory(localStorage.getItem(STORAGE_KEY));
}

export function saveGameHistory(record: GameHistoryRecord): void {
  const history = getGameHistory();
  const newHistory = [record, ...history];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.length = MAX_HISTORY;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function addGameHistory(records: GameHistoryRecord[]): void {
  if (records.length === 0) return;
  const history = getGameHistory();
  const newHistory = [...records, ...history];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.length = MAX_HISTORY;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function updateGameHistory(
  id: string,
  updates: Partial<GameHistoryRecord>,
): void {
  const history = getGameHistory();
  const idx = history.findIndex((item) => item.id === id);
  if (idx === -1) return;
  history[idx] = {
    ...history[idx],
    ...updates,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function updateGameHistoryByTab(
  tabId: string,
  updates: Partial<GameHistoryRecord>,
): void {
  const history = getGameHistory();
  const idx = history.findIndex((item) => item.tabId === tabId);
  if (idx === -1) return;
  history[idx] = {
    ...history[idx],
    ...updates,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteGameHistory(id: string): void {
  const history = getGameHistory();
  const newHistory = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function clearGameHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
