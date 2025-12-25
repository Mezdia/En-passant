import { expect, test } from "vitest";
import {
  formatScore,
  getAccuracy,
  getAnnotation,
  getCPLoss,
  getWinProbability,
} from "../score";
import type { BestMoves } from "@/bindings";

test("should format a positive cp score correctly", () => {
  expect(formatScore({ type: "cp", value: 50 })).toBe("+0.50");
});

test("should format a negative cp score correctly", () => {
  expect(formatScore({ type: "cp", value: -50 })).toBe("-0.50");
});

test("should format a mate score correctly", () => {
  expect(formatScore({ type: "mate", value: 5 })).toBe("+M5");
  expect(formatScore({ type: "mate", value: -5 })).toBe("-M5");
});

test("should calculate the win probability correctly", () => {
  expect(getWinProbability({ type: "cp", value: 0 }, "white")).toBe(50);
  expect(getWinProbability({ type: "cp", value: 100 }, "white")).toBeCloseTo(
    59.1,
  );
  expect(getWinProbability({ type: "mate", value: 5 }, "white")).toBe(100);
  expect(getWinProbability({ type: "mate", value: -5 }, "white")).toBe(0);
});

test("should calculate the accuracy correctly (CAPS II)", () => {
  expect(
    getAccuracy({ type: "cp", value: 0 }, { type: "cp", value: 0 }, "white"),
  ).toBe(100);
  // Example: slight inaccuracy
  expect(
    getAccuracy({ type: "cp", value: 30 }, { type: "cp", value: 0 }, "white"),
  ).toBeGreaterThan(90);
  // Example: blunder
  expect(
    getAccuracy({ type: "cp", value: 200 }, { type: "cp", value: -200 }, "white"),
  ).toBeLessThan(50);
});

test("should annotate best move", () => {
  const bestMoves: BestMoves[] = [
    {
      score: { value: { type: "cp", value: 50 }, wdl: null },
      sanMoves: ["e4"],
      uciMoves: ["e2e4"],
      depth: 20,
      nodes: 1000,
      multipv: 1,
      nps: 1000,
    },
  ];
  expect(
    getAnnotation(
      bestMoves,
      { type: "cp", value: 50 },
      { type: "cp", value: 45 },
      "white",
      "e4",
      false,
    ),
  ).toBe("⭐");
});

test("should annotate blunder", () => {
  const bestMoves: BestMoves[] = [
    {
      score: { value: { type: "cp", value: 200 }, wdl: null },
      sanMoves: ["e4"],
      uciMoves: ["e2e4"],
      depth: 20,
      nodes: 1000,
      multipv: 1,
      nps: 1000,
    },
  ];
  expect(
    getAnnotation(
      bestMoves,
      { type: "cp", value: -200 }, // Big swing (~75% -> ~25% = ~50% delta)
      { type: "cp", value: 200 },
      "white",
      "h4",
      false,
    ),
  ).toBe("??");
});

test("should annotate missed win", () => {
  const bestMoves: BestMoves[] = [
    {
      score: { value: { type: "cp", value: 500 }, wdl: null }, // Winning
      sanMoves: ["e4"],
      uciMoves: ["e2e4"],
      depth: 20,
      nodes: 1000,
      multipv: 1,
      nps: 1000,
    },
  ];
  expect(
    getAnnotation(
      bestMoves,
      { type: "cp", value: 0 }, // Drawish
      { type: "cp", value: 500 }, // Was Winning
      "white",
      "Kh1",
      false,
    ),
  ).toBe("✖");
});

