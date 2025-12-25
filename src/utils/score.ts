import type { BestMoves, Score, ScoreValue } from "@/bindings";
import { minMax } from "@tiptap/react";
import type { Color } from "chessops";
import { match } from "ts-pattern";
import type { Annotation } from "./annotation";

export const INITIAL_SCORE: Score = {
  value: {
    type: "cp",
    value: 15,
  },
  wdl: null,
};

const CP_CEILING = 1000;

export function formatScore(score: ScoreValue, precision = 2): string {
  let scoreText = match(score.type)
    .with("cp", () => Math.abs(score.value / 100).toFixed(precision))
    .with("mate", () => `M${Math.abs(score.value)}`)
    .with("dtz", () => `DTZ${Math.abs(score.value)}`)
    .exhaustive();
  if (score.type !== "dtz") {
    if (score.value > 0) {
      scoreText = `+${scoreText}`;
    }
    if (score.value < 0) {
      scoreText = `-${scoreText}`;
    }
  }
  return scoreText;
}

export function getWinChance(centipawns: number) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
}

export function normalizeScore(score: ScoreValue, color: Color): number {
  let cp = score.value;
  if (color === "black") {
    cp *= -1;
  }
  if (score.type === "mate") {
    cp = CP_CEILING * Math.sign(cp);
  }
  return minMax(cp, -CP_CEILING, CP_CEILING);
}

function normalizeScores(
  prev: ScoreValue,
  next: ScoreValue,
  color: Color,
): { prevCP: number; nextCP: number } {
  return {
    prevCP: normalizeScore(prev, color),
    nextCP: normalizeScore(next, color),
  };
}

export function getAccuracy(
  prev: ScoreValue,
  next: ScoreValue,
  color: Color,
): number {
  // CAPS II like exponential decay
  // We use best move vs played move comparison ideally, but here we approximate with prev vs next evaluation
  // Ideally this should take the best move score vs played move score.
  // Given the function signature, we reuse the diff.
  const prevProb = getWinProbability(prev, color);
  const nextProb = getWinProbability(next, color);
  const delta = Math.max(0, (prevProb - nextProb) / 100);

  return 100 * Math.exp(-2 * delta);
}

export function getCPLoss(
  prev: ScoreValue,
  next: ScoreValue,
  color: Color,
): number {
  const { prevCP, nextCP } = normalizeScores(prev, next, color);

  return Math.max(0, prevCP - nextCP);
}


export type MoveClassification =
  | "book"
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"
  | "miss";

export const CLASSIFICATION_MAP: Record<MoveClassification, Annotation> = {
  brilliant: "!!",
  great: "!",
  best: "⭐",
  excellent: "✓",
  good: "○",
  inaccuracy: "?!",
  mistake: "?",
  blunder: "??",
  miss: "✖",
  book: "",
};

export function getWinProbability(score: ScoreValue, color: Color): number {
  if (score.type === "mate") {
    const mateValue = color === "black" ? -score.value : score.value;
    return mateValue > 0 ? 100 : 0;
  }
  const cp = Math.max(-1000, Math.min(1000, normalizeScore(score, color)));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function getExpectedPointsLoss(
  bestMoveScore: ScoreValue,
  playerMoveScore: ScoreValue,
  color: Color,
): number {
  const wpBest = getWinProbability(bestMoveScore, color);
  const wpPlayer = getWinProbability(playerMoveScore, color);
  return (wpBest - wpPlayer) / 100;
}

function getUniqueness(prevMoves: BestMoves[], color: Color): number {
  if (prevMoves.length < 2) return 0;
  const wpBest = getWinProbability(prevMoves[0].score.value, color);
  const wp2nd = getWinProbability(prevMoves[1].score.value, color);
  return (wpBest - wp2nd) / 100;
}

export function classifyMove(
  prevMoves: BestMoves[],
  currentEval: ScoreValue,
  prevEval: ScoreValue | null,
  color: Color,
  move: string,
  isSacrifice: boolean,
): MoveClassification {
  if (prevMoves.length === 0) return "book";

  const bestMoveScore = prevMoves[0].score.value;
  const delta = getExpectedPointsLoss(bestMoveScore, currentEval, color);
  const isBestMove = prevMoves[0].sanMoves[0] === move;
  const uniqueness = getUniqueness(prevMoves, color);

  const wasWinning = prevEval && getWinProbability(prevEval, color) > 80;
  const isNoLongerWinning = getWinProbability(currentEval, color) < 60;
  const hadForcedMate =
    prevEval?.type === "mate" &&
    (color === "white" ? prevEval.value > 0 : prevEval.value < 0);

  if (delta < 0.02) {
    if (isBestMove) {
      if (isSacrifice) return "brilliant";
      if (uniqueness > 0.1) return "great";
      return "best";
    }
    return "best"; // fallback if close enough but not exact match
  }

  if (delta < 0.05) return "excellent";
  if (delta < 0.1) return "good";
  if (delta < 0.2) return "inaccuracy";

  if (delta >= 0.35) {
    if ((wasWinning && isNoLongerWinning) || hadForcedMate) {
      return "miss";
    }
    return "blunder";
  }

  return "mistake";
}

export function getAnnotation(
  prevMoves: BestMoves[],
  currentEval: ScoreValue,
  prevEval: ScoreValue | null,
  color: Color,
  move: string,
  isSacrifice: boolean,
): Annotation {
  const classification = classifyMove(
    prevMoves,
    currentEval,
    prevEval,
    color,
    move,
    isSacrifice,
  );
  return CLASSIFICATION_MAP[classification];
}
