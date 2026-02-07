import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
    parseUci,
    makeSquare,
    parseSquare,
    type SquareName
} from "chessops";
import { positionFromFen, swapMove } from "@/utils/chessops";
import { makeSan } from "chessops/san";
import { chessgroundDests } from "chessops/compat";
import { INITIAL_FEN, makeFen } from "chessops/fen";
import type { DrawShape } from "chessground/draw";
import { generateChess960Fen } from "@/utils/chess";

import {
    Button,
    Text,
    Avatar,
    Tooltip,
    Badge,
    Group,
    Stack,
    Loader,
    Modal,
    Paper,
    Progress,
    SegmentedControl,
    Slider,
    Switch,
    Divider,
    ScrollArea,
    Box,
    Card,
    ActionIcon,
    Tabs,
    Title,
} from "@mantine/core";
import {
    IconArrowBackUp,
    IconBulb,
    IconFlag,
    IconSettings,
    IconAnalyze,
    IconRotateClockwise,
    IconPlayerPlay,
    IconX,
    IconChevronRight,
    IconTarget,
    IconClock,
    IconRefresh,
    IconChartBar,
    IconEye,
    IconBrain,
    IconArrowRight,
    IconChevronLeft,
    IconCheck,
    IconX as IconClose,
    IconMessageCircle,
    IconArrowLeftRight,
    IconSwitch2,
    IconTrophy,
    IconMoodSad,
    IconMoodConfuzed,
    IconSparkles,
    IconChessKing,
    IconUser,
} from "@tabler/icons-react";

import { useTranslation } from "react-i18next";
import { Bot, BotPersonality } from "../bots/botData";
import { getRatingBehavior, simulateThinkTime } from "../bots/engineRating";
import { selectMoveByRating, getBlunderConfig } from "../bots/blunderInjection";
import { getBookMove } from "../bots/openingBook";
import { BotChatPanel, ChatMessage } from "./BotChatPanel";
import * as classes from "./BotGamePage.css";
import { arrowColors } from "../panels/analysis/BestMoves";

import { Chessground } from "@/chessground/Chessground";
import { commands } from "@/bindings";
import { saveBotGame } from "../bots/botGameHistory";
import { genID } from "@/utils/tabs";
import { activeTabAtom, botGameHistoryTriggerAtom, tabsAtom, enginesAtom } from "@/state/atoms";
import { createTab } from "@/utils/tabs";
import i18n from "i18next";
import { type LocalEngine, getBestMoves as localGetBestMoves } from "@/utils/engines";
import { normalizeScore } from "@/utils/score";
import { useThrottledEffect } from "@/utils/misc";

// Game mode types
type GameMode = 'competition' | 'friendly' | 'assisted' | 'custom';

// Custom settings interface matching BotsPage
interface CustomSettings {
    botChat: boolean;
    hints: boolean;
    evalBar: boolean;
    threatArrows: boolean;
    suggestionArrows: boolean;
    moveFeedback: boolean;
    showEngine: boolean;
    takebacks: boolean;
    timeControl: string;
    gameType: string;
}

// Game result types
type GameResult = 'win' | 'loss' | 'draw' | null;
type GameEndReason = 'checkmate' | 'stalemate' | 'resignation' | 'time' | 'agreement' | null;

// Game state interface
interface GameState {
    isGameOver: boolean;
    result: GameResult;
    endReason: GameEndReason;
    winner: 'white' | 'black' | null;
    moveCount: number;
    isAnalysisMode: boolean;
    gameStartTime: number;
    gameEndTime?: number;
}

// Time control state
interface TimeControlState {
    whiteTime: number;
    blackTime: number;
    isActive: boolean;
    lastUpdate: number;
}

// Engine evaluation state
interface EngineEvalState {
    cp: number;
    depth: number;
    wdl?: number;
    pv?: string;
}

// Move quality types
type MoveQuality = 'brilliant' | 'good' | 'ok' | 'mistake' | 'blunder';

const MODE_DEFAULTS: Record<
    Exclude<GameMode, "custom">,
    CustomSettings
> = {
    competition: {
        botChat: false,
        hints: false,
        evalBar: false,
        threatArrows: false,
        suggestionArrows: false,
        moveFeedback: false,
        showEngine: false,
        takebacks: false,
        timeControl: "none",
        gameType: "chess"
    },
    friendly: {
        botChat: true,
        hints: true,
        evalBar: false,
        threatArrows: false,
        suggestionArrows: false,
        moveFeedback: false,
        showEngine: false,
        takebacks: true,
        timeControl: "none",
        gameType: "chess"
    },
    assisted: {
        botChat: true,
        hints: true,
        evalBar: true,
        threatArrows: true,
        suggestionArrows: true,
        moveFeedback: true,
        showEngine: true,
        takebacks: true,
        timeControl: "10min",
        gameType: "chess"
    }
};

const settingsEqual = (a: CustomSettings, b: CustomSettings) =>
    a.botChat === b.botChat &&
    a.hints === b.hints &&
    a.evalBar === b.evalBar &&
    a.threatArrows === b.threatArrows &&
    a.suggestionArrows === b.suggestionArrows &&
    a.moveFeedback === b.moveFeedback &&
    a.showEngine === b.showEngine &&
    a.takebacks === b.takebacks &&
    a.timeControl === b.timeControl &&
    a.gameType === b.gameType;

// Helper function to get game mode from settings
const getGameModeFromSettings = (settings: CustomSettings): GameMode => {
    if (settingsEqual(settings, MODE_DEFAULTS.competition)) return "competition";
    if (settingsEqual(settings, MODE_DEFAULTS.friendly)) return "friendly";
    if (settingsEqual(settings, MODE_DEFAULTS.assisted)) return "assisted";
    return "custom";
};

// Helper function to apply game mode defaults
const applyGameModeDefaults = (mode: GameMode): Partial<CustomSettings> => {
    switch (mode) {
        case 'competition':
            return MODE_DEFAULTS.competition;
        case 'friendly':
            return MODE_DEFAULTS.friendly;
        case 'assisted':
            return MODE_DEFAULTS.assisted;
        case 'custom':
            return {
                // Keep custom settings as is
            };
        default:
            return {};
    }
};

export const BotGamePage: React.FC<{ bot: Bot; onExit: () => void }> = ({ bot, onExit }) => {
    const { t } = useTranslation();
    const activeTab = useAtomValue(activeTabAtom);
    const [, setTabs] = useAtom(tabsAtom);
    const [, setHistoryTrigger] = useAtom(botGameHistoryTriggerAtom);
    const [, setActiveTab] = useAtom(activeTabAtom);
    const engines = useAtomValue(enginesAtom);

    // Game State
    const [startFen, setStartFen] = useState<string>(INITIAL_FEN);
    const [fen, setFen] = useState<string>(INITIAL_FEN);
    const [userSide, setUserSide] = useState<"white" | "black">("white");
    const [isEngineThinking, setIsEngineThinking] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState<[SquareName, SquareName] | undefined>(undefined);
    const [enginePath, setEnginePath] = useState<string>("");
    const [engineName, setEngineName] = useState<string>("");
    const [gameMode, setGameMode] = useState<GameMode>('competition');

    // Custom settings state
    const [customSettings, setCustomSettings] = useState<CustomSettings>({
        botChat: false,
        hints: false,
        evalBar: false,
        threatArrows: false,
        suggestionArrows: false,
        moveFeedback: false,
        showEngine: false,
        takebacks: false,
        timeControl: "none",
        gameType: "chess",
    });

    // Game Management State
    const [gameState, setGameState] = useState<GameState>({
        isGameOver: false,
        result: null,
        endReason: null,
        winner: null,
        moveCount: 0,
        isAnalysisMode: false,
        gameStartTime: Date.now()
    });

    // Time control state
    const [timeControl, setTimeControlState] = useState<TimeControlState>({
        whiteTime: 0,
        blackTime: 0,
        isActive: false,
        lastUpdate: Date.now()
    });

    // Settings modal
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Show result screen
    const [showResultScreen, setShowResultScreen] = useState(false);

    // Analysis modal
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Game stats
    const [gameStats, setGameStats] = useState({
        totalMoves: 0,
        playerMoves: 0,
        botMoves: 0,
        gameDuration: 0,
        accuracy: 0,
        brilliantMoves: 0,
        goodMoves: 0,
        mistakes: 0,
        blunders: 0,
    });

    // Move feedback state
    const [moveFeedback, setMoveFeedbackState] = useState<{
        type: MoveQuality | null;
        evaluation: number | null;
        bestMove: string | null;
    }>({ type: null, evaluation: null, bestMove: null });

    // Position history for navigation
    const [gamePositionHistory, setGamePositionHistory] = useState<string[]>([INITIAL_FEN]);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

    // Engine evaluation display
    const [engineEval, setEngineEval] = useState<EngineEvalState | null>(null);

    // Previous evaluation for delta
    const [prevEngineEval, setPrevEngineEval] = useState<number | null>(null);

    // Candidate moves for arrows
    const [suggestionMoves, setSuggestionMoves] = useState<Array<{ uci: string; cp: number; mate?: number }>>([]);
    const [threatMoves, setThreatMoves] = useState<Array<{ uci: string; cp: number; mate?: number }>>([]);

    // Derived state using chessops
    const [pos, error] = useMemo(() => positionFromFen(fen), [fen]);
    const turnColor = pos?.turn || "white";

    // Calculate dests for Chessground
    const dests = useMemo(() => {
        if (!pos) return new Map();
        return chessgroundDests(pos);
    }, [pos]);

    // Get available engines
    const availableEngines = useMemo(() => {
        return engines.filter(e => e.type === "local" && e.loaded);
    }, [engines]);

    const analysisEngine = useMemo(() => {
        const localEngines = engines.filter((e): e is LocalEngine => e.type === "local");
        if (localEngines.length === 0) return null;
        if (enginePath) {
            return localEngines.find((e) => e.path === enginePath) ?? localEngines[0];
        }
        return localEngines[0];
    }, [engines, enginePath]);

    const sessionId = useMemo(() => {
        return activeTab ? `bot-game-${activeTab}` : "bot-game";
    }, [activeTab]);

    const moveTabId = `${sessionId}-move`;
    const evalTabId = `${sessionId}-eval`;
    const suggestionTabId = `${sessionId}-suggest`;
    const threatTabId = `${sessionId}-threat`;

    // Auto-select engine if none selected
    useEffect(() => {
        if (!enginePath && availableEngines.length > 0) {
            const firstEngine = availableEngines[0];
            // Use 'path' for local engines, 'name' as fallback
            const engineIdentifier = 'path' in firstEngine ? (firstEngine as any).path : firstEngine.name;
            setEnginePath(engineIdentifier);
            setEngineName(firstEngine.name);
        }
    }, [availableEngines, enginePath]);

    // Keep engine name in sync with path
    useEffect(() => {
        if (!enginePath) return;
        const matching = availableEngines.find((e) => {
            const localEngine = e as any;
            return localEngine.path === enginePath || e.name === enginePath;
        });
        if (matching) {
            setEngineName(matching.name);
        }
    }, [enginePath, availableEngines]);

    // Load game settings from session storage
    useEffect(() => {
        if (activeTab) {
            const settings = sessionStorage.getItem(`gameSettings_${activeTab}`);
            if (settings) {
                try {
                    const parsed = JSON.parse(settings);
                    console.log("[BotGamePage] Loaded game settings:", parsed);

                    if (parsed.engine) {
                        setEnginePath(parsed.engine);
                        console.log("[BotGamePage] Loaded engine path:", parsed.engine);
                    }
                    if (parsed.engineName) {
                        setEngineName(parsed.engineName);
                    }
                    if (parsed.gameMode) {
                        setGameMode(parsed.gameMode as GameMode);
                    }
                    if (parsed.playSide) {
                        let side: "white" | "black" = "white";
                        if (parsed.playSide === "random") {
                            side = Math.random() < 0.5 ? "white" : "black";
                        } else {
                            side = parsed.playSide;
                        }
                        console.log("[BotGamePage] User side:", side);
                        setUserSide(side);
                    }
                    
                    // Load custom settings
                    if (parsed.customSettings) {
                        const normalizedSettings = {
                            ...parsed.customSettings,
                            gameType:
                                parsed.customSettings.gameType === "960"
                                    ? "chess960"
                                    : parsed.customSettings.gameType,
                        };
                        setCustomSettings(prev => ({
                            ...prev,
                            ...normalizedSettings
                        }));
                        console.log("[BotGamePage] Loaded custom settings:", normalizedSettings);
                        
                        // Set game mode based on settings (or use provided gameMode)
                        setGameMode(parsed.gameMode || getGameModeFromSettings(normalizedSettings));
                    } else if (parsed.gameMode) {
                        // Apply defaults for non-custom modes
                        const defaults = applyGameModeDefaults(parsed.gameMode as GameMode);
                        setCustomSettings(prev => ({ ...prev, ...defaults }));
                    }
                } catch (e) {
                    console.error("[BotGamePage] Failed to parse game settings:", e);
                }
            }
        }
    }, [activeTab]);

    useEffect(() => {
        if (moveHistory.length > 0 || currentPositionIndex > 0) return;
        if ((customSettings.gameType === "chess960" || customSettings.gameType === "960") && startFen === INITIAL_FEN) {
            const newStartFen = generateChess960Fen();
            setStartFen(newStartFen);
            setFen(newStartFen);
            setGamePositionHistory([newStartFen]);
            setCurrentPositionIndex(0);
        }
        if (customSettings.gameType === "chess" && startFen !== INITIAL_FEN) {
            setStartFen(INITIAL_FEN);
            setFen(INITIAL_FEN);
            setGamePositionHistory([INITIAL_FEN]);
            setCurrentPositionIndex(0);
        }
    }, [customSettings.gameType, moveHistory.length, currentPositionIndex, startFen]);

    const createStartFen = useCallback((gameType: string) => {
        return gameType === "chess960" || gameType === "960"
            ? generateChess960Fen()
            : INITIAL_FEN;
    }, []);

    // Add message to chat
    const addMessage = useCallback((sender: "bot" | "user" | "system", text: string) => {
        if (!customSettings.botChat && sender === "bot") return;
        
        setMessages(prev => [...prev, {
            id: Math.random().toString(36),
            sender,
            text,
            timestamp: Date.now()
        }]);
    }, [customSettings.botChat]);

    const resetGameState = useCallback((newStartFen: string) => {
        setStartFen(newStartFen);
        setFen(newStartFen);
        setMoveHistory([]);
        setLastMove(undefined);
        setMessages([]);
        setGamePositionHistory([newStartFen]);
        setCurrentPositionIndex(0);
        setGameState({
            isGameOver: false,
            result: null,
            endReason: null,
            winner: null,
            moveCount: 0,
            isAnalysisMode: false,
            gameStartTime: Date.now()
        });
        setShowResultScreen(false);
        setShowAnalysisModal(false);
        setMoveFeedbackState({ type: null, evaluation: null, bestMove: null });
        setEngineEval(null);
        setPrevEngineEval(null);
        setSuggestionMoves([]);
        setThreatMoves([]);

        // Reset time control
        if (customSettings.timeControl !== "none") {
            const times: Record<string, number> = {
                "1min": 60,
                "3min": 180,
                "5min": 300,
                "10min": 600,
                "30min": 1800,
            };
            const seconds = times[customSettings.timeControl] || 0;
            setTimeControlState({
                whiteTime: seconds,
                blackTime: seconds,
                isActive: true,
                lastUpdate: Date.now()
            });
        } else {
            setTimeControlState(prev => ({ ...prev, isActive: false }));
        }

        // Re-initialize bot greeting
        setTimeout(() => {
            const greeting = bot.greeting ? t(bot.greeting) : t("Bots.DefaultGreeting");
            addMessage("bot", greeting);
        }, 300);
    }, [customSettings.timeControl, bot, addMessage, t]);

    // Initialize time control
    useEffect(() => {
        if (customSettings.timeControl !== "none") {
            const times: Record<string, number> = {
                "1min": 60,
                "3min": 180,
                "5min": 300,
                "10min": 600,
                "30min": 1800,
            };
            const seconds = times[customSettings.timeControl] || 0;
            setTimeControlState({
                whiteTime: seconds,
                blackTime: seconds,
                isActive: true,
                lastUpdate: Date.now()
            });
        } else {
            setTimeControlState(prev => ({ ...prev, isActive: false }));
        }
    }, [customSettings.timeControl]);

    // Time control tick
    useEffect(() => {
        if (!timeControl.isActive || gameState.isGameOver || customSettings.timeControl === "none") return;

        const interval = setInterval(() => {
            setTimeControlState(prev => {
                const now = Date.now();
                const elapsed = Math.floor((now - prev.lastUpdate) / 1000);
                
                if (turnColor === "white") {
                    const newWhiteTime = Math.max(0, prev.whiteTime - elapsed);
                    if (newWhiteTime === 0 && prev.whiteTime > 0) {
                        // Time's up for white
                        endGame('loss', 'time', 'black');
                        return { ...prev, whiteTime: 0, isActive: false };
                    }
                    return { ...prev, whiteTime: newWhiteTime, lastUpdate: now };
                } else {
                    const newBlackTime = Math.max(0, prev.blackTime - elapsed);
                    if (newBlackTime === 0 && prev.blackTime > 0) {
                        // Time's up for black
                        endGame('win', 'time', 'white');
                        return { ...prev, blackTime: 0, isActive: false };
                    }
                    return { ...prev, blackTime: newBlackTime, lastUpdate: now };
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeControl.isActive, gameState.isGameOver, turnColor, customSettings.timeControl]);

    // Initialization
    useEffect(() => {
        const greeting = bot.greeting ? t(bot.greeting) : t("Bots.DefaultGreeting");
        addMessage("bot", greeting);
    }, []);

    // Bot move trigger
    useEffect(() => {
        if (!pos || gameState.isGameOver || gameState.isAnalysisMode) return;
        if (!enginePath) {
            console.log("[BotGamePage] Waiting for engine path to load...");
            return;
        }

        const currentTurn = pos.turn === "white" ? "white" : "black";
        console.log("[BotGamePage] Turn check - currentTurn:", currentTurn, "userSide:", userSide, "isEngineThinking:", isEngineThinking);

        if (checkGameOver()) return;

        if (currentTurn !== userSide && !isEngineThinking) {
            console.log("[BotGamePage] Triggering bot move...");
            setTimeout(() => {
                makeBotMove();
            }, 300);
        }
    }, [fen, isEngineThinking, userSide, enginePath, gameState.isGameOver, gameState.isAnalysisMode, turnColor, pos]);

    // Get engine evaluation
    const buildAnalysisOptions = useCallback(() => {
        if (!analysisEngine) return [];
        const baseOptions = (analysisEngine.settings || []).map((s) => ({
            name: s.name,
            value: s.value?.toString() ?? "",
        }));
        if (
            (customSettings.gameType === "chess960" || customSettings.gameType === "960") &&
            !baseOptions.find((o) => o.name === "UCI_Chess960")
        ) {
            baseOptions.push({ name: "UCI_Chess960", value: "true" });
        }
        return baseOptions;
    }, [analysisEngine, customSettings.gameType]);

    const getAnalysisGoMode = useCallback(() => {
        if (analysisEngine?.go && analysisEngine.go.t !== "Infinite") {
            return analysisEngine.go;
        }
        const behavior = getRatingBehavior(bot.rating);
        return { t: "Depth", c: behavior.depth } as const;
    }, [analysisEngine, bot.rating]);

    const getEngineEvaluation = useCallback(async (targetFen?: string, targetPos?: typeof pos) => {
        if (!analysisEngine || gameState.isGameOver) {
            setEngineEval(null);
            return null;
        }
        const fenToUse = targetFen ?? fen;
        const posToUse = targetPos ?? pos;
        if (!posToUse) {
            setEngineEval(null);
            return null;
        }

        try {
            const result = await localGetBestMoves(
                analysisEngine,
                evalTabId,
                getAnalysisGoMode(),
                {
                    fen: fenToUse,
                    moves: [],
                    extraOptions: buildAnalysisOptions(),
                },
            );
            if (result) {
                const [, bestMoves] = result;
                if (bestMoves.length > 0) {
                    const best = bestMoves[0];
                    const cpValue = normalizeScore(best.score.value, posToUse.turn);
                    return {
                        cp: cpValue,
                        depth: best.depth,
                        wdl: best.score.wdl ?? undefined,
                        pv: best.uciMoves?.[0]
                    };
                }
            }
        } catch (e) {
            console.error("[BotGamePage] Engine eval error:", e);
        }

        return null;
    }, [analysisEngine, gameState.isGameOver, fen, pos, evalTabId, buildAnalysisOptions, getAnalysisGoMode]);

    // Update evaluation when position changes (analysis-style)
    useThrottledEffect(
        () => {
            if ((!customSettings.evalBar && !customSettings.showEngine && !customSettings.moveFeedback) || gameState.isGameOver) {
                setEngineEval(null);
                return;
            }
            getEngineEvaluation().then(evalResult => {
                if (evalResult) {
                    setEngineEval(evalResult);
                }
            });
        },
        100,
        [
            fen,
            customSettings.evalBar,
            customSettings.showEngine,
            customSettings.moveFeedback,
            gameState.isGameOver,
            getEngineEvaluation,
        ],
    );

    // Check if game is over
    const checkGameOver = useCallback(() => {
        if (!pos || gameState.isGameOver) return false;

        const hasMoves = dests.size > 0;
        const isCheck = pos.isCheck();

        if (!hasMoves) {
            const winner = pos.turn === "white" ? "black" : "white";
            const isPlayerWinner = winner === userSide;

            endGame(
                isPlayerWinner ? 'win' : 'loss',
                isCheck ? 'checkmate' : 'stalemate',
                winner
            );
            return true;
        }
        
        // Check for threefold repetition or fifty-move rule could be added here
        
        return false;
    }, [pos, gameState.isGameOver, dests, userSide]);

    // Format time for display
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get evaluation bar percentage
    const getEvalBarPercentage = useCallback((): { white: number; black: number } => {
        if (!engineEval) return { white: 50, black: 50 };
        
        // Convert centipawns to percentage
        // +10 cp = ~65% for white, -10 cp = ~35% for white
        let cp = engineEval.cp;
        if (cp > 30000) cp = 30000;
        if (cp < -30000) cp = -30000;
        
        const normalized = cp / 3000; // -1 to 1 range
        const whitePercent = 50 + (normalized * 45);
        
        return { white: Math.max(5, Math.min(95, whitePercent)), black: 100 - whitePercent };
    }, [engineEval]);

    const evalPercentages = getEvalBarPercentage();

    // End game function
    const endGame = (result: GameResult, endReason: GameEndReason, winner: 'white' | 'black') => {
        const gameEndTime = Date.now();
        const duration = Math.floor((gameEndTime - gameState.gameStartTime) / 1000);

        setGameStats(prev => ({
            ...prev,
            gameDuration: duration
        }));

        setGameState(prev => ({
            ...prev,
            isGameOver: true,
            result,
            endReason,
            winner,
            gameEndTime
        }));

        // Stop time control
        setTimeControlState(prev => ({ ...prev, isActive: false }));

        // Show result screen
        setTimeout(() => {
            setShowResultScreen(true);
            if (result === 'win') {
                triggerConfetti(true);
            }
        }, 1500);

        // Save game
        const gameResult = winner === userSide ? "1-0" : winner === null ? "1/2-1/2" : "0-1";
        saveGame(gameResult);
        setHistoryTrigger(prev => prev + 1);

        // Bot reaction message
        const reactionKey = result === 'win' ? bot.personality?.lossReaction : result === 'loss' ? bot.personality?.winReaction : null;
        if (reactionKey && customSettings.botChat) {
            setTimeout(() => {
                addMessage("bot", t(reactionKey));
            }, 500);
        }
    };

    // Calculate move quality based on evaluation delta
    const calculateMoveQuality = useCallback((evalBefore: number | null, evalAfter: number | null): MoveQuality => {
        if (evalBefore === null || evalAfter === null) {
            // Random fallback for positions without evaluation
            const random = Math.random();
            if (random > 0.85) return 'good';
            if (random > 0.6) return 'ok';
            if (random > 0.3) return 'mistake';
            return 'blunder';
        }

        const delta = evalAfter - evalBefore;
        
        // Positive delta means improvement for the player
        if (delta > 50) return 'brilliant';
        if (delta > 10) return 'good';
        if (delta > -20) return 'ok';
        if (delta > -80) return 'mistake';
        return 'blunder';
    }, []);

    // Update stats when move is made
    const updateStats = useCallback((quality: MoveQuality) => {
        setGameStats(prev => {
            const newStats = { ...prev };
            switch (quality) {
                case 'brilliant': newStats.brilliantMoves++; break;
                case 'good': newStats.goodMoves++; break;
                case 'mistake': newStats.mistakes++; break;
                case 'blunder': newStats.blunders++; break;
            }
            
            // Calculate new accuracy
            const totalRatedMoves = newStats.brilliantMoves + newStats.goodMoves + 
                                   newStats.mistakes + newStats.blunders;
            if (totalRatedMoves > 0) {
                const weightedScore = (newStats.brilliantMoves * 100) + 
                                     (newStats.goodMoves * 85) + 
                                     (newStats.mistakes * 50) + 
                                     (newStats.blunders * 0);
                newStats.accuracy = Math.round((weightedScore / (totalRatedMoves * 100)) * 100);
            }
            
            return newStats;
        });
    }, []);

    // Trigger confetti for wins
    const triggerConfetti = (show: boolean) => {
        if (!show) return;

        const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = classes.winConfetti;
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 50; i++) {
            const confettiPiece = document.createElement('div');
            confettiPiece.className = classes.confettiPiece;
            confettiPiece.style.left = Math.random() * 100 + 'vw';
            confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confettiPiece.style.animationDelay = Math.random() * 2 + 's';
            confettiPiece.style.animationDuration = (2 + Math.random() * 3) + 's';
            confettiContainer.appendChild(confettiPiece);
        }

        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    };

    // Save game to history
    const saveGame = (result: string) => {
        try {
            const pgnString = moveHistory.join(" ");

            saveBotGame({
                id: genID(),
                botId: bot.id,
                botName: bot.nameEnglish,
                botRating: bot.rating,
                playerSide: userSide,
                result: result as any,
                pgn: pgnString,
                date: new Date().toISOString(),
                gameMode: gameMode,
                movesCount: Math.ceil(moveHistory.length / 2),
            });
        } catch (e) {
            console.error("Failed to save game", e);
        }
    };

    // Handle user move
    const handleUserMove = useCallback((orig: SquareName, dest: SquareName) => {
        if (isEngineThinking || gameState.isGameOver || gameState.isAnalysisMode) return;
        if (!pos) return;

        const fromSq = parseSquare(orig)!;
        const toSq = parseSquare(dest)!;

        let promotion: string | undefined = undefined;
        const piece = pos.board.get(fromSq);

        if (piece?.role === 'pawn' && (dest[1] === '8' || dest[1] === '1')) {
            promotion = 'queen';
        }

        const move = {
            from: fromSq,
            to: toSq,
            promotion: promotion
        };

        const san = makeSan(pos, move as any);
        pos.play(move as any);
        const newFen = makeFen(pos.toSetup());

        // Add to position history
        setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
        setCurrentPositionIndex(prev => prev + 1);

        setFen(newFen);
        setLastMove([orig, dest]);
        setMoveHistory(prev => [...prev, san]);

        // Store evaluation before move for quality calculation
        const evalBefore = engineEval?.cp ?? null;

        // Update move feedback if enabled
        if (customSettings.moveFeedback) {
            // Get new evaluation after move
            getEngineEvaluation(newFen, pos).then(evalAfter => {
                const evalAfterCp = evalAfter?.cp ?? null;
                const quality = calculateMoveQuality(evalBefore, evalAfterCp);
                setMoveFeedbackState({ 
                    type: quality, 
                    evaluation: engineEval?.cp || null, 
                    bestMove: null 
                });
                
                // Show feedback message
                const feedbackMessages = {
                    'brilliant': t("Annotate.Brilliant"),
                    'good': t("Annotate.Good"),
                    'ok': t("Common.Ok"),
                    'mistake': t("Annotate.Mistake"),
                    'blunder': t("Annotate.Blunder")
                };
                addMessage("system", feedbackMessages[quality]);
                
                updateStats(quality);
            });
        } else {
            // Still update stats even without feedback
            const quality = calculateMoveQuality(evalBefore, evalBefore);
            updateStats(quality);
        }

        // Update stats
        setGameStats(prev => ({
            ...prev,
            totalMoves: prev.totalMoves + 1,
            playerMoves: prev.playerMoves + 1
        }));
    }, [isEngineThinking, gameState.isGameOver, gameState.isAnalysisMode, pos, engineEval, customSettings.moveFeedback, currentPositionIndex, calculateMoveQuality, updateStats, addMessage, getEngineEvaluation]);

    // Get best move from engine
    const getEngineBestMove = useCallback(async (currentFen: string, tabId: string, turnOverride?: "white" | "black") => {
        if (!enginePath) {
            console.warn("[BotGamePage] Engine path not loaded yet");
            return [];
        }

        const behavior = getRatingBehavior(bot.rating);
        const turnForSearch = turnOverride ?? (pos?.turn === "white" ? "white" : "black");

        try {
            const options = [
                { name: "MultiPV", value: Math.max(3, behavior.multiPV).toString() },
                { name: "Skill Level", value: "20" },
                { name: "UCI_LimitStrength", value: "false" },
            ];
            if (customSettings.gameType === "chess960" || customSettings.gameType === "960") {
                options.push({ name: "UCI_Chess960", value: "true" });
            }

            console.log("[BotGamePage] Calling getBestMoves with engine:", enginePath);

            const result = await commands.getBestMoves(
                turnForSearch,
                enginePath,
                tabId,
                { t: "Depth", c: behavior.depth },
                {
                    fen: currentFen,
                    extraOptions: options,
                    moves: []
                }
            );

            if (result.status === "error" || !result.data) {
                console.error("[BotGamePage] Engine returned error or no data");
                return [];
            }

            return result.data[1] || [];
        } catch (e) {
            console.error("[BotGamePage] Engine error", e);
            return [];
        }
    }, [enginePath, bot.rating, pos, customSettings.gameType]);

    const updateCandidateMoves = useCallback(async () => {
        if (!analysisEngine || !pos || gameState.isGameOver) return;
        if (!customSettings.suggestionArrows && !customSettings.threatArrows) {
            setSuggestionMoves([]);
            setThreatMoves([]);
            return;
        }

        const analysisOptions = buildAnalysisOptions();
        const goMode = getAnalysisGoMode();

        if (customSettings.suggestionArrows && turnColor === userSide) {
            const result = await localGetBestMoves(
                analysisEngine,
                suggestionTabId,
                goMode,
                { fen, moves: [], extraOptions: analysisOptions },
            );
            const moves = result?.[1] ?? [];
            setSuggestionMoves(
                moves.map((m) => ({
                    uci: m.uciMoves[0],
                    cp: normalizeScore(m.score.value, pos.turn),
                    mate: m.score.value.type === "mate" ? m.score.value.value : undefined,
                })),
            );
        } else {
            setSuggestionMoves([]);
        }

        if (customSettings.threatArrows) {
            const threatFen = swapMove(fen);
            const threatTurn = turnColor === "white" ? "black" : "white";
            const result = await localGetBestMoves(
                analysisEngine,
                threatTabId,
                goMode,
                { fen: threatFen, moves: [], extraOptions: analysisOptions },
            );
            const moves = result?.[1] ?? [];
            setThreatMoves(
                moves.map((m) => ({
                    uci: m.uciMoves[0],
                    cp: normalizeScore(m.score.value, threatTurn),
                    mate: m.score.value.type === "mate" ? m.score.value.value : undefined,
                })),
            );
        } else {
            setThreatMoves([]);
        }
    }, [
        analysisEngine,
        pos,
        gameState.isGameOver,
        customSettings.suggestionArrows,
        customSettings.threatArrows,
        turnColor,
        userSide,
        fen,
        suggestionTabId,
        threatTabId,
        buildAnalysisOptions,
        getAnalysisGoMode,
    ]);

    // Update suggestion/threat arrows when position changes
    useThrottledEffect(
        () => {
            if (isEngineThinking) return;
            updateCandidateMoves();
        },
        150,
        [
            fen,
            customSettings.suggestionArrows,
            customSettings.threatArrows,
            isEngineThinking,
            updateCandidateMoves,
        ],
    );

    // Make bot move
    const makeBotMove = useCallback(async () => {
        console.log("[BotGamePage] makeBotMove called");
        setIsEngineThinking(true);
        const thinkingTime = simulateThinkTime(bot.rating);
        console.log("[BotGamePage] Thinking time:", thinkingTime);
        await new Promise(r => setTimeout(r, thinkingTime));

        // 1. Try Opening Book
        console.log("[BotGamePage] Checking opening book for FEN:", fen);
        const bookMove = getBookMove(fen, bot.rating);
        console.log("[BotGamePage] Book move result:", bookMove);

        if (bookMove) {
            const fromName = bookMove.substring(0, 2) as SquareName;
            const toName = bookMove.substring(2, 4) as SquareName;
            const from = parseSquare(fromName)!;
            const to = parseSquare(toName)!;
            const move = { from, to };

            if (pos) {
                const san = makeSan(pos, move as any);
                pos.play(move as any);
                const newFen = makeFen(pos.toSetup());

                setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
                setCurrentPositionIndex(prev => prev + 1);

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);
                
                if (customSettings.botChat) {
                    addMessage("system", t("Bots.Game.BookMove"));
                }

                setGameStats(prev => ({
                    ...prev,
                    totalMoves: prev.totalMoves + 1,
                    botMoves: prev.botMoves + 1
                }));
            }
            setIsEngineThinking(false);
            return;
        }

        // 2. Engine Search
        console.log("[BotGamePage] No book move, calling engine...");
        const candidates = await getEngineBestMove(fen, moveTabId);
        console.log("[BotGamePage] Engine candidates:", candidates);

        if (!candidates || candidates.length === 0) {
            console.log("[BotGamePage] No candidates returned from engine!");
            setIsEngineThinking(false);
            return;
        }

        const blunderConfig = getBlunderConfig(bot.rating);
        const formattedCandidates = candidates.map((c: any) => ({
            uci: c.uciMoves[0],
            cp: c.cp ?? 0,
            mate: c.mate,
            pv: c.uciMoves
        }));

        const decision = selectMoveByRating(
            formattedCandidates,
            bot.rating,
            pos!,
            blunderConfig
        );

        const selectedCandidate = formattedCandidates[decision.selectedMoveIndex];

        if (selectedCandidate) {
            const uci = selectedCandidate.uci;
            const fromName = uci.substring(0, 2) as SquareName;
            const toName = uci.substring(2, 4) as SquareName;
            const promotionChar = uci.length > 4 ? uci.substring(4, 5) : undefined;

            let promotionRole: string | undefined = undefined;
            if (promotionChar === 'q') promotionRole = 'queen';
            if (promotionChar === 'r') promotionRole = 'rook';
            if (promotionChar === 'b') promotionRole = 'bishop';
            if (promotionChar === 'n') promotionRole = 'knight';

            const from = parseSquare(fromName)!;
            const to = parseSquare(toName)!;

            const move = { from, to, promotion: promotionRole };

            if (pos) {
                const san = makeSan(pos, move as any);
                pos.play(move as any);
                const newFen = makeFen(pos.toSetup());

                setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
                setCurrentPositionIndex(prev => prev + 1);

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);

                setGameStats(prev => ({
                    ...prev,
                    totalMoves: prev.totalMoves + 1,
                    botMoves: prev.botMoves + 1
                }));

                if (decision.type === 'blunder' && bot.personality?.blunderReaction && customSettings.botChat) {
                    addMessage("bot", t(bot.personality.blunderReaction));
                }
            }
        }

        setIsEngineThinking(false);
    }, [fen, bot, isEngineThinking, customSettings.botChat, currentPositionIndex, pos, getEngineBestMove, addMessage, moveTabId]);

    // Handle takeback
    const handleTakeback = useCallback(() => {
        if (!customSettings.takebacks) return;
        if (moveHistory.length === 0 || isEngineThinking || gameState.isGameOver) return;

        // If it's user's turn, we need to undo the bot's move AND the user's previous move.
        // If it's bot's turn, we just undo the user's last move.
        const movesToRemove = userSide === turnColor ? 2 : 1;

        if (moveHistory.length < movesToRemove) return;

        const newHistory = moveHistory.slice(0, -movesToRemove);
        const newPositionIndex = Math.max(0, currentPositionIndex - movesToRemove);

        setMoveHistory(newHistory);
        setCurrentPositionIndex(newPositionIndex);
        setFen(gamePositionHistory[newPositionIndex]);
        setLastMove(undefined);

        addMessage("system", t("Game.Takeback"));
    }, [customSettings.takebacks, moveHistory, isEngineThinking, gameState.isGameOver, userSide, turnColor, currentPositionIndex, gamePositionHistory, addMessage]);

    // Handle resignation
    const handleResign = useCallback(() => {
        if (gameState.isGameOver) return;
        endGame('loss', 'resignation', userSide === 'white' ? 'black' : 'white');
        const lossReaction = bot.personality?.lossReaction;
        if (lossReaction && customSettings.botChat) {
            addMessage("bot", t(lossReaction));
        } else {
            addMessage("bot", t("Bots.Game.GoodGame"));
        }
    }, [gameState.isGameOver, userSide, bot, customSettings.botChat, addMessage]);

    // Handle new game
    const handleNewGame = useCallback(() => {
        const newStartFen = createStartFen(customSettings.gameType);
        resetGameState(newStartFen);
    }, [customSettings.gameType, createStartFen, resetGameState]);

    // Handle analysis mode
    const handleAnalysisMode = useCallback(async () => {
        const pgn = moveHistory.join(" ");
        const is960 = customSettings.gameType === "chess960" || customSettings.gameType === "960";

        await createTab({
            tab: {
                name: `${t("Game.Analysis")}: ${bot.nameEnglish}`,
                type: "analysis"
            },
            setTabs,
            setActiveTab,
            pgn,
            headers: {
                id: 0,
                event: "Bot Game",
                site: "En-passant",
                white: userSide === 'white' ? 'Player' : bot.nameEnglish,
                black: userSide === 'black' ? 'Player' : bot.nameEnglish,
                result: gameState.result === 'win' ? (userSide === 'white' ? '1-0' : '0-1') :
                    gameState.result === 'loss' ? (userSide === 'white' ? '0-1' : '1-0') : '1/2-1/2',
                date: new Date().toISOString(),
                fen: is960 ? startFen : INITIAL_FEN,
                variant: is960 ? "Chess960" : undefined,
            }
        });
    }, [moveHistory, bot, userSide, gameState.result, setTabs, setActiveTab, customSettings.gameType, startFen]);

    // Get hint move
    const handleHint = useCallback(async () => {
        if (!customSettings.hints || isEngineThinking || gameState.isGameOver) return;

        const candidates = await getEngineBestMove(fen);
        if (candidates && candidates.length > 0) {
            const bestUci = candidates[0].uciMoves[0];
            const from = bestUci.substring(0, 2);
            const to = bestUci.substring(2, 4);
            addMessage("system", `${t("Game.Hint")}: ${from}-${to}`);
        }
    }, [customSettings.hints, isEngineThinking, gameState.isGameOver, fen, getEngineBestMove, addMessage]);

    // Handle game mode change
    const handleGameModeChange = (mode: string) => {
        const newMode = mode as GameMode;
        setGameMode(newMode);
        
        // Apply game mode defaults
        const defaults = applyGameModeDefaults(newMode);
        setCustomSettings(prev => ({
            ...prev,
            ...defaults
        }));
    };

    const handleGameTypeChange = (value: string) => {
        const normalizedValue = value === "960" ? "chess960" : value;
        if (normalizedValue === customSettings.gameType) return;
        setCustomSettings({ ...customSettings, gameType: normalizedValue });
        const newStartFen = createStartFen(normalizedValue);
        resetGameState(newStartFen);
    };

    // Get result title
    const getResultTitle = useCallback(() => {
        if (!gameState.result) return '';
        switch (gameState.result) {
            case 'win': return t("Game.YouWin");
            case 'loss': return t("Game.YouLose");
            case 'draw': return t("Game.Draw");
            default: return '';
        }
    }, [gameState.result, t]);

    // Get result class
    const getResultClass = useCallback(() => {
        if (!gameState.result) return '';
        switch (gameState.result) {
            case 'win': return classes.gameResultWin;
            case 'loss': return classes.gameResultLoss;
            case 'draw': return classes.gameResultDraw;
            default: return '';
        }
    }, [gameState.result]);

    // Get result subtitle
    const getResultSubtitle = useCallback(() => {
        if (!gameState.endReason) return '';
        switch (gameState.endReason) {
            case 'checkmate': return t("Game.Checkmate");
            case 'stalemate': return t("Game.Stalemate");
            case 'resignation': return t("Game.Resignation");
            case 'time': return t("Game.TimeUp");
            default: return '';
        }
    }, [gameState.endReason, t]);
    
    // Helper function to get piece symbol from move
    const getPieceSymbol = (move: string): string => {
        if (!move) return '';
        
        // Check for piece prefix (K, Q, R, B, N)
        const piecePrefix = move[0];
        if (['K', 'Q', 'R', 'B', 'N'].includes(piecePrefix)) {
            return piecePrefix;
        }
        
        // Check for pawn moves with capture (like exd5)
        if (move.length >= 4 && move.includes('x')) {
            return 'P';
        }
        
        // Check for castling
        if (move === 'O-O' || move === 'O-O-O' || move === '0-0' || move === '0-0-0') {
            return 'K';
        }
        
        // Default to pawn for regular pawn moves
        return 'P';
    };
    
    // Helper function to format move with piece symbol
    const formatMoveWithSymbol = (move: string, isWhite: boolean): React.ReactNode => {
        const pieceSymbol = getPieceSymbol(move);
        const pieceUnicode: Record<string, string> = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙'
        };
        
        const blackPieceUnicode: Record<string, string> = {
            'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
        };
        
        const symbol = isWhite ? pieceUnicode[pieceSymbol] || '♙' : blackPieceUnicode[pieceSymbol] || '♟';
        
        return (
            <span className={classes.moveWithSymbol}>
                <span className={classes.pieceSymbol}>{symbol}</span>
                <span className={isWhite ? classes.moveWhite : classes.moveBlack}>{move}</span>
            </span>
        );
    };

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isPersian = i18n.language.startsWith("fa");

    // Render move feedback badge
    const renderMoveFeedback = useCallback(() => {
        if (!customSettings.moveFeedback || !moveFeedback.type) return null;
    
        const feedbackConfig: Record<MoveQuality, { color: string; icon: string; text: string }> = {
            'brilliant': { color: 'cyan', icon: '/movefeedbackico/Brilliantmove.svg', text: t("Annotate.Brilliant") },
            'good': { color: 'green', icon: '/movefeedbackico/Goodmove.svg', text: t("Annotate.Good") },
            'ok': { color: 'yellow', icon: '/movefeedbackico/Bookmove.svg', text: t("Common.Ok") },
            'mistake': { color: 'orange', icon: '/movefeedbackico/Mistakemove.svg', text: t("Annotate.Mistake") },
            'blunder': { color: 'red', icon: '/movefeedbackico/Blundermove.svg', text: t("Annotate.Blunder") }
        };
    
        const config = feedbackConfig[moveFeedback.type];
    
        return (
            <Badge
                color={config.color}
                variant="filled"
                size="lg"
                className={classes.moveFeedbackBadge}
                leftSection={
                    <img src={config.icon} alt={config.text} style={{ width: '16px', height: '16px' }} />
                }
            >
                {config.text}
            </Badge>
        );
    }, [customSettings.moveFeedback, moveFeedback.type, t]);

    // Render player turn indicator
    const renderTurnIndicator = () => {
        const isPlayerTurn = turnColor === userSide;
        return (
            <Badge 
                color={isPlayerTurn ? "blue" : "orange"} 
                variant="light"
                size="sm"
            >
                {isPlayerTurn ? t("Common.YourTurn") : t("Common.BotThinking")}
            </Badge>
        );
    };

    const formatEvalScore = (cp: number | null) => {
        if (cp == null) return "--";
        const value = Math.abs(cp) / 100;
        return cp >= 0 ? `+${value.toFixed(2)}` : `-${value.toFixed(2)}`;
    };

    const autoShapes = useMemo((): DrawShape[] => {
        if ((!suggestionMoves || suggestionMoves.length === 0) && (!threatMoves || threatMoves.length === 0)) return [];

        const shapes: DrawShape[] = [];
        const showSuggestions = customSettings.suggestionArrows && turnColor === userSide;
        const showThreats = customSettings.threatArrows;
        const getSquares = (uci: string) => {
            const move = parseUci(uci);
            if (!move || !("from" in move) || !("to" in move)) return null;
            const from = makeSquare(move.from);
            const to = makeSquare(move.to);
            if (!from || !to) return null;
            return { from, to };
        };

        if (showSuggestions) {
            suggestionMoves.slice(0, 3).forEach((candidate, index) => {
                const squares = getSquares(candidate.uci);
                if (!squares) return;
                shapes.push({
                    orig: squares.from,
                    dest: squares.to,
                    brush: arrowColors[index]?.strong || "green",
                    modifiers: {
                        lineWidth: index === 0 ? 10 : 6,
                    },
                });
            });
        }

        if (showThreats) {
            const threat = threatMoves[0];
            if (threat) {
                const squares = getSquares(threat.uci);
                if (squares) {
                    shapes.push({
                        orig: squares.from,
                        dest: squares.to,
                        brush: "red",
                        modifiers: {
                            lineWidth: 9,
                        },
                    });
                }
            }
        }

        return shapes;
    }, [suggestionMoves, threatMoves, customSettings.suggestionArrows, customSettings.threatArrows, turnColor, userSide]);

    return (
        <div className={classes.pageContainer}>

            {/* Left Sidebar */}
            <Paper className={classes.sidebar} withBorder radius={0}>
                <ScrollArea className={classes.sidebarContent}>
                    <Stack gap="md">
                        {/* Bot Profile */}
                        <Paper withBorder p="md" radius="md">
                            <Stack align="center" gap="xs">
                                <Avatar src={bot.image} size="lg" radius="md" />
                                <Text fw={700} size="lg">
                                    {isPersian ? bot.namePersian : bot.nameEnglish}
                                </Text>
                                <Badge 
                                    color="yellow" 
                                    variant="filled"
                                    leftSection={<IconTrophy size={14} />}
                                >
                                    {bot.rating}
                                </Badge>
                                <Text size="xs" c="dimmed" ta="center">
                                    {isPersian ? bot.descriptionPersian : bot.descriptionEnglish}
                                </Text>
                                {renderTurnIndicator()}
                            </Stack>
                        </Paper>

                        {/* Player Info */}
                        <Paper withBorder p="md" radius="md">
                            <Group>
                                <Avatar radius="md" color="blue">
                                    <IconUser size={20} />
                                </Avatar>
                                <Stack gap={0}>
                                    <Text fw={600} size="sm">{t("Common.Player")}</Text>
                                    <Text size="xs" c="dimmed">
                                        {userSide === 'white' ? t("Common.WHITE") : t("Common.BLACK")}
                                    </Text>
                                </Stack>
                            </Group>
                        </Paper>

                        {/* Time Control Display */}
                        {customSettings.timeControl !== "none" && (
                            <Paper withBorder p="md" radius="md">
                                <Stack gap="xs">
                                    <Group justify="space-between" className={turnColor === 'white' ? classes.activeTime : ''} p="xs" style={{ borderRadius: 4 }}>
                                        <Group gap="xs">
                                            <IconChessKing size={16} />
                                            <Text size="sm" fw={500}>{t("Common.WHITE")}</Text>
                                        </Group>
                                        <Text fw={700} ff="monospace">
                                            {formatTime(timeControl.whiteTime)}
                                        </Text>
                                    </Group>
                                    <Group justify="space-between" className={turnColor === 'black' ? classes.activeTime : ''} p="xs" style={{ borderRadius: 4 }}>
                                        <Group gap="xs">
                                            <IconChessKing size={16} style={{ transform: 'scaleX(-1)' }} />
                                            <Text size="sm" fw={500}>{t("Common.BLACK")}</Text>
                                        </Group>
                                        <Text fw={700} ff="monospace">
                                            {formatTime(timeControl.blackTime)}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Paper>
                        )}

                        {/* Chat Panel */}
                        {customSettings.botChat && (
                            <Paper withBorder p="md" radius="md" style={{ flex: 1, minHeight: 150 }}>
                                <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">
                                    {t("Bots.Custom.BotChat")}
                                </Text>
                                <BotChatPanel messages={messages} botName={bot.nameEnglish} />
                            </Paper>
                        )}

                        {/* Engine Info Panel */}
                        {customSettings.showEngine && (
                            <Paper withBorder p="md" radius="md">
                                <Stack gap="xs">
                                    <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                                        {t("Common.Engine")}
                                    </Text>
                                    <Group justify="space-between">
                                        <Text size="sm" fw={600}>
                                            {engineName || t("Bots.NoEngine")}
                                        </Text>
                                        <Badge variant="light" color="cyan">
                                            {t("GoMode.Depth")}: {engineEval?.depth ?? "--"}
                                        </Badge>
                                    </Group>
                                    <Group justify="space-between">
                                        <Text size="sm" c="dimmed">
                                            {t("Bots.Engine.Evaluation")}
                                        </Text>
                                        <Text size="sm" fw={600}>
                                            {formatEvalScore(engineEval?.cp ?? null)}
                                        </Text>
                                    </Group>
                                    <Group justify="space-between" align="flex-start">
                                        <Text size="sm" c="dimmed">
                                            {t("Bots.Engine.PV")}
                                        </Text>
                                        <Text size="sm" fw={600} style={{ textAlign: "right" }}>
                                            {engineEval?.pv ?? "--"}
                                        </Text>
                                    </Group>
                                </Stack>
                            </Paper>
                        )}

                        {/* Game Controls */}
                        <Paper withBorder p="md" radius="md">
                            <Stack gap="sm">
                                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                                    {t("Game.GameControls")}
                                </Text>
                                <Group gap="xs">
                                    {/* Takeback Button - only visible if takebacks enabled */}
                                    {customSettings.takebacks && (
                                        <Tooltip label={t("Game.Takeback")} position="top" withArrow>
                                            <ActionIcon
                                                variant="default"
                                                size="lg"
                                                onClick={handleTakeback}
                                                disabled={moveHistory.length === 0 || isEngineThinking || gameState.isGameOver}
                                            >
                                                <IconArrowBackUp size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}

                                    {/* Hint Button - only visible if hints enabled */}
                                    {customSettings.hints && (
                                        <Tooltip label={t("Game.Hint")} position="top" withArrow>
                                            <ActionIcon
                                                variant="default"
                                                size="lg"
                                                onClick={handleHint}
                                                disabled={isEngineThinking || gameState.isGameOver}
                                            >
                                                <IconBulb size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}

                                    {/* Analysis Button */}
                                    <Tooltip label={t("Game.Analyze")} position="top" withArrow>
                                        <ActionIcon
                                            variant="default"
                                            size="lg"
                                            onClick={handleAnalysisMode}
                                            color="blue"
                                        >
                                            <IconAnalyze size={18} />
                                        </ActionIcon>
                                    </Tooltip>

                                    {/* Resign Button */}
                                    <Tooltip label={t("Game.Resign")} position="top" withArrow>
                                        <ActionIcon
                                            variant="default"
                                            size="lg"
                                            onClick={handleResign}
                                            disabled={gameState.isGameOver}
                                            color="red"
                                        >
                                            <IconFlag size={18} />
                                        </ActionIcon>
                                    </Tooltip>

                                    {/* Settings Button */}
                                    <Tooltip label={t("Common.Settings")} position="top" withArrow>
                                        <ActionIcon
                                            variant="default"
                                            size="lg"
                                            onClick={() => setShowSettingsModal(true)}
                                        >
                                            <IconSettings size={18} />
                                        </ActionIcon>
                                    </Tooltip>

                                    {/* Exit Button */}
                                    <Tooltip label={t("Game.Quit")} position="top" withArrow>
                                        <ActionIcon
                                            variant="default"
                                            size="lg"
                                            onClick={onExit}
                                            color="gray"
                                        >
                                            <IconX size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Group>
                            </Stack>
                        </Paper>

                        {/* Thinking Indicator */}
                        {isEngineThinking && (
                            <Paper withBorder p="md" radius="md">
                                <Group justify="center" gap="sm">
                                    <Loader size="sm" />
                                    <Text size="sm" c="dimmed">
                                        {bot.nameEnglish} {t("Common.IsThinking")}
                                    </Text>
                                </Group>
                            </Paper>
                        )}

                        {/* Move Feedback */}
                        {renderMoveFeedback()}
                    </Stack>
                </ScrollArea>
            </Paper>

            {/* Board Area */}
            <div className={classes.boardArea}>
                <div className={classes.boardShell}>
                    {/* Evaluation Bar */}
                    {customSettings.evalBar && engineEval && (
                        <div className={classes.evalBarContainer}>
                            <div 
                                className={classes.evalBarFill}
                                style={{ 
                                    height: `${evalPercentages.white}%`,
                                    backgroundColor: evalPercentages.white > 50 ? '#22c55e' : '#ef4444'
                                }}
                            />
                            <div className={classes.evalBarLabels}>
                                <span>
                                    {engineEval.cp > 0 ? `+${(Math.abs(engineEval.cp) / 100).toFixed(1)}` : 
                                     engineEval.cp < 0 ? `-${(Math.abs(engineEval.cp) / 100).toFixed(1)}` : '0.0'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={classes.boardFrame}>
                        <Chessground
                            fen={fen}
                            orientation={userSide}
                            turnColor={turnColor}
                            check={pos?.isCheck()}
                            lastMove={lastMove}
                            movable={{
                                free: false,
                                color: isEngineThinking || gameState.isGameOver || gameState.isAnalysisMode ? undefined : userSide,
                                dests: dests,
                                events: {
                                    after: (orig, dest) => handleUserMove(orig as SquareName, dest as SquareName),
                                },
                            }}
                            drawable={{
                                enabled: customSettings.suggestionArrows || customSettings.threatArrows,
                                visible: true,
                                autoShapes: autoShapes,
                            }}
                            animation={{ enabled: true }}
                            draggable={{ enabled: !gameState.isGameOver && !gameState.isAnalysisMode }}
                            selectable={{ enabled: true }}
                        />
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Move History */}
            <Paper className={classes.moveHistorySidebar} withBorder radius={0}>
                <div className={classes.moveHistoryHeader}>
                    <Text fw={600} size="sm">{t("Game.MoveHistory")}</Text>
                </div>
                <ScrollArea className={classes.moveHistoryContent}>
                    {moveHistory.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center" mt="md">
                            {t("NoMovesYet")}
                        </Text>
                    ) : (
                        <Stack gap="xs">
                            {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, moveIndex) => {
                                const moveNumber = moveIndex + 1;
                                const whiteMove = moveHistory[moveIndex * 2];
                                const blackMove = moveHistory[moveIndex * 2 + 1];
                                
                                return (
                                    <Paper key={moveIndex} p="xs" withBorder radius="sm">
                                        <Group gap="xs">
                                            <Text size="xs" c="dimmed" w={24}>{moveNumber}.</Text>
                                            <Group gap="sm" style={{ flex: 1 }}>
                                                {whiteMove && formatMoveWithSymbol(whiteMove, true)}
                                                {blackMove && formatMoveWithSymbol(blackMove, false)}
                                            </Group>
                                        </Group>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </ScrollArea>
            </Paper>

            {/* Settings Modal */}
            <Modal
                opened={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                title={t("Common.Settings")}
                size="lg"
            >
                <Tabs defaultValue="mode">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="mode">{t("Bots.Setup.GameMode")}</Tabs.Tab>
                        <Tabs.Tab value="display">{t("Settings.Appearance")}</Tabs.Tab>
                        <Tabs.Tab value="rules">{t("Bots.Setup.CustomSettings")}</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="mode">
                        <Stack gap="md">
                            <SegmentedControl
                                value={gameMode}
                                onChange={handleGameModeChange}
                                data={[
                                    { label: t("Bots.Setup.Mode.Competition"), value: 'competition' },
                                    { label: t("Bots.Setup.Mode.Friendly"), value: 'friendly' },
                                    { label: t("Bots.Setup.Mode.Assisted"), value: 'assisted' },
                                    { label: t("Bots.Setup.Mode.Custom"), value: 'custom' },
                                ]}
                                fullWidth
                            />
                            
                            <Divider />
                            
                            <Text size="sm" c="dimmed">
                                {gameMode === 'competition' && t("Bots.Setup.Mode.Competition.Desc")}
                                {gameMode === 'friendly' && t("Bots.Setup.Mode.Friendly.Desc")}
                                {gameMode === 'assisted' && t("Bots.Setup.Mode.Assisted.Desc")}
                                {gameMode === 'custom' && t("Bots.Setup.Mode.Custom.Desc")}
                            </Text>

                            {availableEngines.length > 0 && (
                                <>
                                    <Divider />
                                    <Text size="sm" fw={600}>{t("Bots.Setup.SelectEngine")}</Text>
                                    <SegmentedControl
                                        value={enginePath}
                                        onChange={(value) => {
                                            const engine = availableEngines.find(e => {
                                                const localEngine = e as any;
                                                return localEngine.path === value || localEngine.name === value;
                                            });
                                            if (engine) {
                                                setEnginePath(value);
                                                setEngineName(engine.name);
                                            }
                                        }}
                                        data={availableEngines.map(e => {
                                            const localEngine = e as any;
                                            return {
                                                label: e.name,
                                                value: localEngine.path || e.name
                                            };
                                        })}
                                        fullWidth
                                    />
                                </>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="display">
                        <Stack gap="md">
                            <Text size="sm" fw={600} c="dimmed">{t("Settings.Appearance")}</Text>
                            
                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.BotChat")}</Text>
                                <Switch
                                    checked={customSettings.botChat}
                                    onChange={(e) => setCustomSettings({ ...customSettings, botChat: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>
                            
                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.Hints")}</Text>
                                <Switch
                                    checked={customSettings.hints}
                                    onChange={(e) => setCustomSettings({ ...customSettings, hints: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>
                            
                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.EvalBar")}</Text>
                                <Switch
                                    checked={customSettings.evalBar}
                                    onChange={(e) => setCustomSettings({ ...customSettings, evalBar: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>

                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.Engine")}</Text>
                                <Switch
                                    checked={customSettings.showEngine}
                                    onChange={(e) => setCustomSettings({ ...customSettings, showEngine: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>

                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.MoveFeedback")}</Text>
                                <Switch
                                    checked={customSettings.moveFeedback}
                                    onChange={(e) => setCustomSettings({ ...customSettings, moveFeedback: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>

                            <Divider />

                            <Text size="sm" fw={600} c="dimmed">{t("Bots.Custom.SuggestionArrows")}</Text>
                            <Switch
                                checked={customSettings.suggestionArrows}
                                onChange={(e) => setCustomSettings({ ...customSettings, suggestionArrows: e.currentTarget.checked })}
                                disabled={gameMode !== 'custom'}
                            />

                            <Text size="sm" fw={600} c="dimmed">{t("Bots.Custom.ThreatArrows")}</Text>
                            <Switch
                                checked={customSettings.threatArrows}
                                onChange={(e) => setCustomSettings({ ...customSettings, threatArrows: e.currentTarget.checked })}
                                disabled={gameMode !== 'custom'}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="rules">
                        <Stack gap="md">
                            <Text size="sm" fw={600} c="dimmed">{t("Bots.Setup.CustomSettings")}</Text>
                            
                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">{t("Bots.Custom.Takebacks")}</Text>
                                <Switch
                                    checked={customSettings.takebacks}
                                    onChange={(e) => setCustomSettings({ ...customSettings, takebacks: e.currentTarget.checked })}
                                    disabled={gameMode !== 'custom'}
                                />
                            </Group>

                            <Divider />

                            <Text size="sm" fw={600} c="dimmed">{t("Bots.Custom.TimeControl")}</Text>
                            <SegmentedControl
                                value={customSettings.timeControl}
                                onChange={(value) => setCustomSettings({ ...customSettings, timeControl: value })}
                                data={[
                                    { label: t("Bots.TimeControl.None"), value: 'none' },
                                    { label: t("Bots.TimeControl.1min"), value: '1min' },
                                    { label: t("Bots.TimeControl.3min"), value: '3min' },
                                    { label: t("Bots.TimeControl.5min"), value: '5min' },
                                    { label: t("Bots.TimeControl.10min"), value: '10min' },
                                    { label: t("Bots.TimeControl.30min"), value: '30min' },
                                ]}
                                fullWidth
                            />

                            <Divider />

                            <Text size="sm" fw={600} c="dimmed">{t("Bots.Custom.GameType")}</Text>
                            <SegmentedControl
                                value={customSettings.gameType}
                                onChange={handleGameTypeChange}
                                data={[
                                    { label: t("Bots.GameType.Standard"), value: 'chess' },
                                    { label: t("Bots.GameType.Chess960"), value: 'chess960' },
                                ]}
                                fullWidth
                            />
                        </Stack>
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" mt="xl">
                    <Button onClick={() => setShowSettingsModal(false)}>
                        {t("Common.Save")}
                    </Button>
                </Group>
            </Modal>

            {/* Game Result Screen */}
            {showResultScreen && (
                <div className={classes.gameResultOverlay}>
                    <Paper className={classes.gameResultCard} withBorder>
                        <Stack align="center" gap="md">
                            {/* Result Icon */}
                            <Box mb="md">
                                {gameState.result === 'win' && (
                                    <IconTrophy size={64} color="var(--mantine-color-green-5)" />
                                )}
                                {gameState.result === 'loss' && (
                                    <IconMoodSad size={64} color="var(--mantine-color-red-5)" />
                                )}
                                {gameState.result === 'draw' && (
                                    <IconMoodConfuzed size={64} color="var(--mantine-color-yellow-5)" />
                                )}
                            </Box>

                            {/* Result Title */}
                            <Title order={2} className={`${classes.gameResultTitle} ${getResultClass()}`}>
                                {getResultTitle()}
                            </Title>

                            <Text size="lg" c="dimmed">
                                {getResultSubtitle()}
                            </Text>

                            {/* Stats Grid */}
                            <div className={classes.gameResultStats}>
                                <Paper withBorder p="md" className={classes.gameResultStat}>
                                    <Text className={classes.gameResultStatLabel}>{t("Game.MoveNumber")}</Text>
                                    <Text className={classes.gameResultStatValue}>{gameStats.totalMoves}</Text>
                                </Paper>

                                <Paper withBorder p="md" className={classes.gameResultStat}>
                                    <Text className={classes.gameResultStatLabel}>{t("Game.GameDuration")}</Text>
                                    <Text className={classes.gameResultStatValue}>{formatDuration(gameStats.gameDuration)}</Text>
                                </Paper>

                                <Paper withBorder p="md" className={classes.gameResultStat}>
                                    <Text className={classes.gameResultStatLabel}>{t("Game.Accuracy")}</Text>
                                    <Text className={classes.gameResultStatValue}>{gameStats.accuracy}%</Text>
                                </Paper>
                            </div>

                            {/* Quality Stats */}
                            <Paper withBorder p="md" className={classes.qualityStats}>
                                <div className={classes.qualityStat}>
                                    <span className={classes.qualityIcon}>💎</span>
                                    <span className={classes.qualityCount}>{gameStats.brilliantMoves}</span>
                                </div>
                                <div className={classes.qualityStat}>
                                    <span className={classes.qualityIcon}>✅</span>
                                    <span className={classes.qualityCount}>{gameStats.goodMoves}</span>
                                </div>
                                <div className={classes.qualityStat}>
                                    <span className={classes.qualityIcon}>⚠️</span>
                                    <span className={classes.qualityCount}>{gameStats.mistakes}</span>
                                </div>
                                <div className={classes.qualityStat}>
                                    <span className={classes.qualityIcon}>💥</span>
                                    <span className={classes.qualityCount}>{gameStats.blunders}</span>
                                </div>
                            </Paper>

                            {/* Action Buttons */}
                            <Group justify="center" gap="md">
                                <Button
                                    leftSection={<IconRefresh size={20} />}
                                    onClick={handleNewGame}
                                    size="md"
                                >
                                    {t("Game.PlayAgain")}
                                </Button>

                                <Button
                                    leftSection={<IconAnalyze size={20} />}
                                    onClick={handleAnalysisMode}
                                    variant="default"
                                    size="md"
                                >
                                    {t("Game.GameAnalysis")}
                                </Button>

                                <Button
                                    leftSection={<IconTarget size={20} />}
                                    onClick={onExit}
                                    variant="default"
                                    size="md"
                                >
                                    {t("Game.SelectBot")}
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                </div>
            )}

            {/* Analysis Mode Modal */}
            <Modal
                opened={showAnalysisModal}
                onClose={() => setShowAnalysisModal(false)}
                title={t("Game.AnalysisMode")}
                size="lg"
                centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {t("Game.AnalysisDescription")}
                    </Text>

                    <Group justify="center">
                        <Button
                            leftSection={<IconAnalyze size={16} />}
                            onClick={() => {
                                handleAnalysisMode();
                                setShowAnalysisModal(false);
                            }}
                        >
                            {t("Game.ViewReport")}
                        </Button>

                        <Button
                            variant="light"
                            leftSection={<IconRotateClockwise size={16} />}
                            onClick={() => setShowAnalysisModal(false)}
                        >
                            {t("Common.Back")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
};
