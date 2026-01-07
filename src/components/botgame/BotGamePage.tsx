import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
    parseUci,
    makeSquare,
    parseSquare,
    type SquareName
} from "chessops";
import { positionFromFen } from "@/utils/chessops";
import { makeSan } from "chessops/san";
import { chessgroundDests } from "chessops/compat";
import { INITIAL_FEN, makeFen } from "chessops/fen";

import {
    Button,
    Text,
    Avatar,
    Tooltip,
    ActionIcon,
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
    Card
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
    IconSwitch2
} from "@tabler/icons-react";

import { useTranslation } from "react-i18next";
import { Bot, BotPersonality } from "../bots/botData";
import { getRatingBehavior, simulateThinkTime } from "../bots/engineRating";
import { selectMoveByRating, getBlunderConfig } from "../bots/blunderInjection";
import { getBookMove } from "../bots/openingBook";
import { BotChatPanel, ChatMessage } from "./BotChatPanel";
import * as classes from "./BotGamePage.css";

import { Chessground } from "@/chessground/Chessground";
import { commands } from "@/bindings";
import { saveBotGame } from "../bots/botGameHistory";
import { genID } from "@/utils/tabs";
import { activeTabAtom, botGameHistoryTriggerAtom, tabsAtom, enginesAtom } from "@/state/atoms";
import { createTab } from "@/utils/tabs";
import i18n from "i18next";
import { IconMoodSad, IconMoodConfuzed, IconTrophy, IconSparkles } from "@tabler/icons-react";

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

// Helper function to get game mode from settings
const getGameModeFromSettings = (settings: CustomSettings): GameMode => {
    // If custom mode, return custom
    if (settings.hints && settings.evalBar && settings.moveFeedback && settings.takebacks && settings.botChat) {
        return 'custom';
    }
    // If assisted mode - has hints and move feedback but not takebacks
    if (settings.hints && settings.moveFeedback && !settings.takebacks) {
        return 'assisted';
    }
    // If friendly mode - has takebacks but not hints
    if (settings.takebacks && !settings.hints) {
        return 'friendly';
    }
    // Default to competition
    return 'competition';
};

// Helper function to apply game mode defaults
const applyGameModeDefaults = (mode: GameMode): Partial<CustomSettings> => {
    switch (mode) {
        case 'competition':
            return {
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
            };
        case 'friendly':
            return {
                botChat: true,
                hints: false,
                evalBar: false,
                threatArrows: false,
                suggestionArrows: false,
                moveFeedback: false,
                showEngine: false,
                takebacks: true,
                timeControl: "none",
                gameType: "chess"
            };
        case 'assisted':
            return {
                botChat: true,
                hints: true,
                evalBar: true,
                threatArrows: true,
                suggestionArrows: true,
                moveFeedback: true,
                showEngine: true,
                takebacks: false,
                timeControl: "10min",
                gameType: "chess"
            };
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
    const [candidateMoves, setCandidateMoves] = useState<Array<{ uci: string; cp: number; mate?: number }>>([]);

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
                        setCustomSettings(prev => ({
                            ...prev,
                            ...parsed.customSettings
                        }));
                        console.log("[BotGamePage] Loaded custom settings:", parsed.customSettings);
                        
                        // Set game mode based on settings
                        setGameMode(getGameModeFromSettings(parsed.customSettings));
                    }
                } catch (e) {
                    console.error("[BotGamePage] Failed to parse game settings:", e);
                }
            }
        }
    }, [activeTab]);

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
    const getEngineEvaluation = useCallback(async () => {
        if (!customSettings.evalBar || !enginePath || !pos || gameState.isGameOver) {
            setEngineEval(null);
            return null;
        }

        try {
            const behavior = getRatingBehavior(bot.rating);
            const result = await commands.getBestMoves(
                pos.turn === 'white' ? 'white' : 'black',
                enginePath,
                "bot-game-session",
                { t: "Depth", c: behavior.depth },
                {
                    fen: fen,
                    extraOptions: [
                        { name: "MultiPV", value: "1" },
                        { name: "UCI_ShowWDL", value: "true" }
                    ],
                    moves: []
                }
            );

            if (result.status === "ok" && result.data && result.data.length > 1) {
                const bestMove = result.data[1][0];
                // BestMove has different structure, extract values safely
                const cpValue = (bestMove as any).cp ?? 
                    ((bestMove as any).mate ? ((bestMove as any).mate > 0 ? 30000 : -30000) : 0);
                return {
                    cp: cpValue,
                    depth: behavior.depth,
                    wdl: (bestMove as any).wdl,
                    pv: (bestMove as any).uciMoves?.[0]
                };
            }
        } catch (e) {
            console.error("[BotGamePage] Engine eval error:", e);
        }

        return null;
    }, [customSettings.evalBar, enginePath, pos, gameState.isGameOver, fen, bot.rating]);

    // Update evaluation when position changes
    useEffect(() => {
        if (!customSettings.evalBar || gameState.isGameOver) return;

        getEngineEvaluation().then(evalResult => {
            if (evalResult) {
                setEngineEval(evalResult);
            }
        });
    }, [fen, customSettings.evalBar, gameState.isGameOver, getEngineEvaluation]);

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
            getEngineEvaluation().then(evalAfter => {
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
                    'ok': "OK",
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
    const getEngineBestMove = useCallback(async (currentFen: string) => {
        if (!enginePath) {
            console.warn("[BotGamePage] Engine path not loaded yet");
            return [];
        }

        const behavior = getRatingBehavior(bot.rating);

        try {
            const options = [
                { name: "MultiPV", value: Math.max(3, behavior.multiPV).toString() },
                { name: "Skill Level", value: "20" },
                { name: "UCI_LimitStrength", value: "false" },
            ];

            console.log("[BotGamePage] Calling getBestMoves with engine:", enginePath);

            const result = await commands.getBestMoves(
                pos?.turn === 'white' ? 'white' : 'black',
                enginePath,
                "bot-game-session",
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

            // Store candidate moves for arrows
            const candidates = result.data[1] || [];
            setCandidateMoves(candidates.map((c: any) => ({
                uci: c.uciMoves[0],
                cp: c.cp ?? 0,
                mate: c.mate
            })));

            return candidates;
        } catch (e) {
            console.error("[BotGamePage] Engine error", e);
            return [];
        }
    }, [enginePath, bot.rating, pos]);

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
        const candidates = await getEngineBestMove(fen);
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
    }, [fen, bot, isEngineThinking, customSettings.botChat, currentPositionIndex, pos, getEngineBestMove, addMessage]);

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
        setFen(INITIAL_FEN);
        setMoveHistory([]);
        setLastMove(undefined);
        setMessages([]);
        setGamePositionHistory([INITIAL_FEN]);
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
        setCandidateMoves([]);

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
        }, 500);
    }, [customSettings.timeControl, bot, addMessage, t]);

    // Handle analysis mode
    const handleAnalysisMode = useCallback(async () => {
        const pgn = moveHistory.join(" ");

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
                fen: INITIAL_FEN
            }
        });
    }, [moveHistory, bot, userSide, gameState.result, setTabs, setActiveTab, t]);

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
    }, [customSettings.hints, isEngineThinking, gameState.isGameOver, fen, getEngineBestMove, addMessage, t]);

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

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isRTL = i18n.language === 'fa_IR';
    const isPersian = i18n.language.startsWith("fa");

    // Render move feedback badge
    const renderMoveFeedback = useCallback(() => {
        if (!customSettings.moveFeedback || !moveFeedback.type) return null;

        const feedbackConfig: Record<MoveQuality, { color: string; icon: string; text: string }> = {
            'brilliant': { color: 'cyan', icon: '💎', text: t("Annotate.Brilliant") },
            'good': { color: 'green', icon: '✅', text: t("Annotate.Good") },
            'ok': { color: 'yellow', icon: '⚠️', text: 'OK' },
            'mistake': { color: 'orange', icon: '❌', text: t("Annotate.Mistake") },
            'blunder': { color: 'red', icon: '💥', text: t("Annotate.Blunder") }
        };

        const config = feedbackConfig[moveFeedback.type];

        return (
            <Badge 
                color={config.color} 
                variant="filled" 
                size="lg"
                className={classes.moveFeedbackBadge}
            >
                {config.icon} {config.text}
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
                className={isPlayerTurn ? classes.turnIndicatorPlayer : classes.turnIndicatorBot}
            >
                {isPlayerTurn ? t("Common.YourTurn") : t("Common.BotThinking")}
            </Badge>
        );
    };

    return (
        <div className={classes.pageContainer}>
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

            {/* Left Sidebar */}
            <div className={classes.sidebar}>
                <div className={classes.sidebarContent}>
                    {/* Bot Profile */}
                    <div className={classes.botProfile}>
                        <Avatar src={bot.image} size="xl" className={classes.botImage} />
                        <Text fw={800} size="xl" mt="sm" style={{ letterSpacing: '-0.5px' }}>
                            {isPersian ? bot.namePersian : bot.nameEnglish}
                        </Text>
                        <Badge color="yellow" variant="filled" py="xs" px="md" radius="sm" style={{ fontWeight: 800 }}>
                            {bot.rating}
                        </Badge>
                        <Text size="sm" c="dimmed" ta="center" mt="xs" px="md" style={{ lineHeight: 1.4 }}>
                            {isPersian ? bot.descriptionPersian : bot.descriptionEnglish}
                        </Text>
                        {renderTurnIndicator()}
                    </div>

                    {/* Time Control Display */}
                    {customSettings.timeControl !== "none" && (
                        <div className={classes.timeControlDisplay}>
                            <div className={`${classes.timeDisplay} ${turnColor === 'white' ? classes.activeTime : ''}`}>
                                <div className={classes.timeLabel}>⚪ {t("Common.WHITE")}</div>
                                <div className={classes.timeValue}>{formatTime(timeControl.whiteTime)}</div>
                            </div>
                            <div className={`${classes.timeDisplay} ${turnColor === 'black' ? classes.activeTime : ''}`}>
                                <div className={classes.timeLabel}>⚫ {t("Common.BLACK")}</div>
                                <div className={classes.timeValue}>{formatTime(timeControl.blackTime)}</div>
                            </div>
                        </div>
                    )}

                    {/* Chat Panel */}
                    {customSettings.botChat && (
                        <BotChatPanel messages={messages} botName={bot.nameEnglish} />
                    )}

                    {/* Game Controls */}
                    <div className={classes.gameControlsContainer}>
                        <Text className={classes.gameControlsTitle}>{t("Game.GameControls")}</Text>
                        <div className={classes.gameControlsRow}>
                            {/* Takeback Button - only visible if takebacks enabled */}
                            {customSettings.takebacks && (
                                <Tooltip label={t("Game.Takeback")} position="top" withArrow>
                                    <button
                                        className={classes.gameControlButton}
                                        onClick={handleTakeback}
                                        disabled={moveHistory.length === 0 || isEngineThinking || gameState.isGameOver}
                                    >
                                        <IconArrowBackUp size={22} stroke={2} />
                                    </button>
                                </Tooltip>
                            )}

                            {/* Hint Button - only visible if hints enabled */}
                            {customSettings.hints && (
                                <Tooltip label={t("Game.Hint")} position="top" withArrow>
                                    <button
                                        className={classes.gameControlButton}
                                        onClick={handleHint}
                                        disabled={isEngineThinking || gameState.isGameOver}
                                    >
                                        <IconBulb size={22} stroke={2} />
                                    </button>
                                </Tooltip>
                            )}

                            {/* Analysis Button */}
                            <Tooltip label={t("Game.Analyze")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButtonPrimary}
                                    onClick={handleAnalysisMode}
                                >
                                    <IconAnalyze size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            {/* Resign Button */}
                            <Tooltip label={t("Game.Resign")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButtonDanger}
                                    onClick={handleResign}
                                    disabled={gameState.isGameOver}
                                >
                                    <IconFlag size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            {/* Exit Button */}
                            <Tooltip label={t("Game.Quit")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButton}
                                    onClick={onExit}
                                >
                                    <IconX size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            {/* Settings Button */}
                            <Tooltip label={t("Common.Settings")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButton}
                                    onClick={() => setShowSettingsModal(true)}
                                >
                                    <IconSettings size={22} stroke={2} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Thinking Indicator */}
                    {isEngineThinking && (
                        <div className={classes.thinkingIndicator}>
                            <div className={classes.thinkingDots}>
                                <div className={classes.thinkingDot}></div>
                                <div className={classes.thinkingDot}></div>
                                <div className={classes.thinkingDot}></div>
                            </div>
                            <Text size="sm" c="dimmed">
                                {bot.nameEnglish} {t("Common.IsThinking")}
                            </Text>
                        </div>
                    )}

                    {/* Move Feedback */}
                    {renderMoveFeedback()}
                </div>
            </div>

            {/* Board Area */}
            <div className={classes.boardArea}>
                <div style={{ width: "70vh", height: "70vh" }}>
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
                        animation={{ enabled: true }}
                        draggable={{ enabled: !gameState.isGameOver && !gameState.isAnalysisMode }}
                        selectable={{ enabled: true }}
                    />
                </div>
            </div>

            {/* Right Sidebar - Move History */}
            <div className={classes.moveHistorySidebar}>
                <div className={classes.moveHistoryHeader}>
                    <Text fw={600}>{t("Game.MoveHistory")}</Text>
                </div>
                <div className={classes.moveHistoryContent}>
                    {moveHistory.length === 0 ? (
                        <Text size="sm" c="dimmed" ta="center" mt="md">
                            {t("NoMovesYet")}
                        </Text>
                    ) : (
                        <div className={classes.moveList}>
                            {moveHistory.map((move, index) => {
                                const moveNumber = Math.floor(index / 2) + 1;
                                const isWhiteMove = index % 2 === 0;
                                return (
                                    <div key={index} className={classes.moveItem}>
                                        <span className={classes.moveNumber}>{moveNumber}.</span>
                                        {isWhiteMove && <span className={classes.moveWhite}>{move}</span>}
                                        {!isWhiteMove && <span className={classes.moveBlack}>{move}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <Modal
                opened={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                title={t("Common.Settings")}
                size="md"
            >
                <Stack gap="md">
                    {/* Game Mode Selection */}
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

                    <Divider my="sm" />

                    {/* Engine Selection */}
                    <Paper withBorder p="md">
                        <Text size="sm" fw={600} mb="sm">{t("Bots.Setup.SelectEngine")}</Text>
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
                    </Paper>

                    <Divider my="sm" />

                    {/* Display Settings */}
                    <Text size="sm" fw={600} c="dimmed">{t("Settings.Appearance")}</Text>
                    
                    <Switch
                        label={t("Bots.Custom.BotChat")}
                        checked={customSettings.botChat}
                        onChange={(e) => setCustomSettings({ ...customSettings, botChat: e.currentTarget.checked })}
                        disabled={gameMode !== 'custom'}
                    />
                    
                    <Switch
                        label={t("Bots.Custom.Hints")}
                        checked={customSettings.hints}
                        onChange={(e) => setCustomSettings({ ...customSettings, hints: e.currentTarget.checked })}
                        disabled={gameMode !== 'custom'}
                    />
                    
                    <Switch
                        label={t("Bots.Custom.EvalBar")}
                        checked={customSettings.evalBar}
                        onChange={(e) => setCustomSettings({ ...customSettings, evalBar: e.currentTarget.checked })}
                        disabled={gameMode !== 'custom'}
                    />
                    
                    <Switch
                        label={t("Bots.Custom.MoveFeedback")}
                        checked={customSettings.moveFeedback}
                        onChange={(e) => setCustomSettings({ ...customSettings, moveFeedback: e.currentTarget.checked })}
                        disabled={gameMode !== 'custom'}
                    />

                    <Divider my="sm" />

                    {/* Game Rules */}
                    <Text size="sm" fw={600} c="dimmed">{t("Bots.Setup.CustomSettings")}</Text>
                    
                    <Switch
                        label={t("Bots.Custom.Takebacks")}
                        checked={customSettings.takebacks}
                        onChange={(e) => setCustomSettings({ ...customSettings, takebacks: e.currentTarget.checked })}
                        disabled={gameMode !== 'custom'}
                    />

                    <Divider my="sm" />

                    {/* Time Control */}
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

                    <Divider my="sm" />

                    {/* Game Type */}
                    <Text size="sm" fw={600} c="dimmed">{t("Bots.Custom.GameType")}</Text>
                    <SegmentedControl
                        value={customSettings.gameType}
                        onChange={(value) => setCustomSettings({ ...customSettings, gameType: value })}
                        data={[
                            { label: t("Bots.GameType.Standard"), value: 'chess' },
                            { label: t("Bots.GameType.Chess960"), value: '960' },
                        ]}
                        fullWidth
                    />

                    <Group justify="flex-end" mt="md">
                        <Button onClick={() => setShowSettingsModal(false)}>
                            {t("Common.Save")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Game Result Screen */}
            {showResultScreen && (
                <div className={classes.gameResultOverlay}>
                    <div className={classes.gameResultCard}>
                        <div className={`${classes.gameResultTitle} ${getResultClass()}`}>
                            {gameState.result === 'win' && <IconTrophy size={80} />}
                            {gameState.result === 'loss' && <IconMoodSad size={80} />}
                            {gameState.result === 'draw' && <IconMoodConfuzed size={80} />}
                            <div style={{ marginTop: '1rem' }}>{getResultTitle()}</div>
                        </div>

                        <Text className={classes.gameResultSubtitle}>
                            {getResultSubtitle()}
                        </Text>

                        {/* Detailed Stats */}
                        <div className={classes.gameResultStats}>
                            <div className={classes.gameResultStat}>
                                <div className={classes.gameResultStatLabel}>{t("Game.MoveNumber")}</div>
                                <div className={classes.gameResultStatValue}>{gameStats.totalMoves}</div>
                            </div>

                            <div className={classes.gameResultStat}>
                                <div className={classes.gameResultStatLabel}>{t("Game.GameDuration")}</div>
                                <div className={classes.gameResultStatValue}>{formatDuration(gameStats.gameDuration)}</div>
                            </div>

                            <div className={classes.gameResultStat}>
                                <div className={classes.gameResultStatLabel}>{t("Game.Accuracy")}</div>
                                <div className={classes.gameResultStatValue}>{gameStats.accuracy}%</div>
                            </div>
                        </div>

                        {/* Move Quality Stats */}
                        <div className={classes.qualityStats}>
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
                        </div>

                        <div className={classes.gameResultActions}>
                            <Tooltip label={t("Game.PlayAgain")} position="bottom" withArrow>
                                <button
                                    className={classes.gameResultPrimaryButton}
                                    onClick={handleNewGame}
                                    style={{ width: '64px', height: '64px', padding: 0, borderRadius: '20px' }}
                                >
                                    <IconRefresh size={32} stroke={2.5} />
                                </button>
                            </Tooltip>

                            <Tooltip label={t("Game.GameAnalysis")} position="bottom" withArrow>
                                <button
                                    className={classes.gameResultSecondaryButton}
                                    onClick={handleAnalysisMode}
                                    style={{ width: '64px', height: '64px', padding: 0, borderRadius: '20px' }}
                                >
                                    <IconAnalyze size={32} stroke={2.5} />
                                </button>
                            </Tooltip>

                            <Tooltip label={t("Game.SelectBot")} position="bottom" withArrow>
                                <button
                                    className={classes.gameResultSecondaryButton}
                                    onClick={onExit}
                                    style={{ width: '64px', height: '64px', padding: 0, borderRadius: '20px' }}
                                >
                                    <IconTarget size={32} stroke={2.5} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
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
