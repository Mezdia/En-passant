
import React, { useEffect, useState, useRef, useMemo } from "react";
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
    Modal
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
    IconRefresh
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
import { invoke } from "@tauri-apps/api/core";
import { saveBotGame } from "../bots/botGameHistory";
import { genID } from "@/utils/tabs";
import { activeTabAtom, botGameHistoryTriggerAtom, tabsAtom } from "@/state/atoms";
import { createTab } from "@/utils/tabs";
import i18n from "i18next";
import { IconMoodSad, IconMoodConfuzed, IconTrophy } from "@tabler/icons-react";

// Props 
interface BotGamePageProps {
    bot: Bot;
    onExit: () => void;
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

export const BotGamePage: React.FC<BotGamePageProps> = ({ bot, onExit }) => {
    const { t } = useTranslation();
    const activeTab = useAtomValue(activeTabAtom);
    const [, setTabs] = useAtom(tabsAtom);
    const [, setHistoryTrigger] = useAtom(botGameHistoryTriggerAtom);
    const [, setActiveTab] = useAtom(activeTabAtom);

    // Game State
    const [fen, setFen] = useState<string>(INITIAL_FEN);
    const [userSide, setUserSide] = useState<"white" | "black">("white");
    const [isEngineThinking, setIsEngineThinking] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState<[SquareName, SquareName] | undefined>(undefined);
    const [enginePath, setEnginePath] = useState<string>("");

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

    const [showResultScreen, setShowResultScreen] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [gameStats, setGameStats] = useState({
        totalMoves: 0,
        playerMoves: 0,
        botMoves: 0,
        gameDuration: 0,
        accuracy: 0
    });

    const [gamePositionHistory, setGamePositionHistory] = useState<string[]>([INITIAL_FEN]);
    const [currentPositionIndex, setCurrentPositionIndex] = useState(0);

    // Load engine path from session storage
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
                } catch (e) {
                    console.error("[BotGamePage] Failed to parse game settings:", e);
                }
            }
        }
    }, [activeTab]);

    // Derived state using chessops
    const [pos, error] = useMemo(() => positionFromFen(fen), [fen]);

    const turnColor = pos?.turn || "white";

    // Calculate dests for Chessground
    const dests = useMemo(() => {
        if (!pos) return new Map();
        return chessgroundDests(pos);
    }, [pos]);

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
            // Small additional delay to feel more natural even after simulatesThinkTime
            setTimeout(() => {
                makeBotMove();
            }, 300);
        }
    }, [fen, isEngineThinking, userSide, enginePath, gameState.isGameOver, gameState.isAnalysisMode, turnColor]);

    const checkGameOver = () => {
        if (!pos || gameState.isGameOver) return false;

        // Use dests map which is already computed
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
        return false;
    };

    const endGame = (result: GameResult, endReason: GameEndReason, winner: 'white' | 'black') => {
        const gameEndTime = Date.now();
        const duration = Math.floor((gameEndTime - gameState.gameStartTime) / 1000);

        const stats = {
            totalMoves: moveHistory.length,
            playerMoves: Math.ceil(moveHistory.length / 2),
            botMoves: Math.floor(moveHistory.length / 2),
            gameDuration: duration,
            accuracy: calculateAccuracy()
        };

        setGameStats(stats);
        setGameState(prev => ({
            ...prev,
            isGameOver: true,
            result,
            endReason,
            winner,
            gameEndTime
        }));

        // Show result screen after a short delay for dramatic effect
        setTimeout(() => {
            setShowResultScreen(true);
            triggerConfetti(result === 'win');
        }, 1500);

        // Save game
        const gameResult = winner === userSide ? "1-0" : winner === null ? "1/2-1/2" : "0-1";
        saveGame(gameResult);
        setHistoryTrigger(prev => prev + 1);

        // Bot reaction message
        const reactionKey = result === 'win' ? bot.personality?.lossReaction : result === 'loss' ? bot.personality?.winReaction : null;
        if (reactionKey) {
            setTimeout(() => {
                addMessage("bot", t(reactionKey));
            }, 500);
        }
    };

    const calculateAccuracy = () => {
        // Simple accuracy calculation based on move quality
        // In a real implementation, this would analyze move accuracy
        const playerMoves = Math.ceil(moveHistory.length / 2);
        const goodMoves = Math.floor(playerMoves * 0.8); // Assume 80% good moves
        return Math.round((goodMoves / playerMoves) * 100);
    };

    const triggerConfetti = (show: boolean) => {
        if (!show) return;

        // Create confetti effect
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

    const addMessage = (sender: "bot" | "user" | "system", text: string) => {
        setMessages(prev => [...prev, {
            id: Math.random().toString(36),
            sender,
            text,
            timestamp: Date.now()
        }]);
    };

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
                gameMode: "competition",
                movesCount: Math.ceil(moveHistory.length / 2),
            });
        } catch (e) {
            console.error("Failed to save game", e);
        }
    };

    const handleUserMove = (orig: SquareName, dest: SquareName) => {
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

        // Add to position history for analysis
        setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
        setCurrentPositionIndex(prev => prev + 1);

        setFen(newFen);
        setLastMove([orig, dest]);
        setMoveHistory(prev => [...prev, san]);

        // Update stats
        setGameStats(prev => ({
            ...prev,
            totalMoves: prev.totalMoves + 1,
            playerMoves: prev.playerMoves + 1
        }));
    };

    const getEngineBestMove = async (currentFen: string) => {
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

            return result.data[1];
        } catch (e) {
            console.error("[BotGamePage] Engine error", e);
            return [];
        }
    };

    const makeBotMove = async () => {
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

                // Add to position history
                setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
                setCurrentPositionIndex(prev => prev + 1);

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);
                addMessage("system", "Book Move");

                // Update stats
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

                // Add to position history
                setGamePositionHistory(prev => [...prev.slice(0, currentPositionIndex + 1), newFen]);
                setCurrentPositionIndex(prev => prev + 1);

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);

                // Update stats
                setGameStats(prev => ({
                    ...prev,
                    totalMoves: prev.totalMoves + 1,
                    botMoves: prev.botMoves + 1
                }));

                if (decision.type === 'blunder' && bot.personality?.blunderReaction) {
                    addMessage("bot", t(bot.personality.blunderReaction));
                }
            }
        }

        setIsEngineThinking(false);
    };

    // Game control functions
    const handleTakeback = () => {
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
        setLastMove(undefined); // Clear highlighting for safety

        addMessage("system", t("Game.Takeback"));
    };

    const handleResign = () => {
        if (gameState.isGameOver) return;
        endGame('loss', 'resignation', userSide === 'white' ? 'black' : 'white');
        const lossReaction = bot.personality?.lossReaction;
        addMessage("bot", lossReaction ? t(lossReaction) : "Good game!");
    };

    const handleNewGame = () => {
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

        // Re-initialize bot greeting
        setTimeout(() => {
            const greeting = bot.greeting ? t(bot.greeting) : t("Bots.DefaultGreeting");
            addMessage("bot", greeting);
        }, 500);
    };

    const handleAnalysisMode = async () => {
        // Construct PGN
        const pgn = moveHistory.join(" ");

        // Create a new analysis tab
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
    };

    const toggleLanguage = () => {
        const currentLang = i18n.language;
        const nextLang = currentLang === 'fa_IR' ? 'en_US' : 'fa_IR';
        i18n.changeLanguage(nextLang);
        localStorage.setItem("lang", nextLang);
    };

    const isRTL = i18n.language === 'fa_IR';

    const handleExitAnalysis = () => {
        setGameState(prev => ({ ...prev, isAnalysisMode: false }));
        setShowAnalysisModal(false);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getResultTitle = () => {
        if (!gameState.result) return '';

        switch (gameState.result) {
            case 'win': return t("Game.YouWin");
            case 'loss': return t("Game.YouLose");
            case 'draw': return t("Game.Draw");
            default: return '';
        }
    };

    const getResultClass = () => {
        if (!gameState.result) return '';

        switch (gameState.result) {
            case 'win': return classes.gameResultWin;
            case 'loss': return classes.gameResultLoss;
            case 'draw': return classes.gameResultDraw;
            default: return '';
        }
    };

    const getResultSubtitle = () => {
        if (!gameState.endReason) return '';

        switch (gameState.endReason) {
            case 'checkmate': return t("Game.Checkmate");
            case 'stalemate': return t("Game.Stalemate");
            case 'resignation': return t("Game.Resignation");
            case 'time': return t("Game.TimeUp");
            default: return '';
        }
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.sidebar}>
                <div className={classes.sidebarContent}>
                    <div className={classes.botProfile}>
                        <Avatar src={bot.image} size="xl" className={classes.botImage} />
                        <Text fw={800} size="xl" mt="sm" style={{ letterSpacing: '-0.5px' }}>{isRTL ? bot.namePersian : bot.nameEnglish}</Text>
                        <Badge color="yellow" variant="filled" py="xs" px="md" radius="sm" style={{ fontWeight: 800 }}>{bot.rating}</Badge>
                        <Text size="sm" c="dimmed" ta="center" mt="xs" px="md" style={{ lineHeight: 1.4 }}>
                            {isRTL ? bot.descriptionPersian : bot.descriptionEnglish}
                        </Text>
                    </div>

                    <BotChatPanel messages={messages} botName={bot.nameEnglish} />

                    {/* Game Controls */}
                    <div className={classes.gameControlsContainer}>
                        <Text className={classes.gameControlsTitle}>{t("Game.GameControls")}</Text>
                        <div className={classes.gameControlsRow}>
                            <Tooltip label={t("Game.Takeback")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButton}
                                    onClick={handleTakeback}
                                    disabled={moveHistory.length === 0 || isEngineThinking || gameState.isGameOver}
                                >
                                    <IconArrowBackUp size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            <Tooltip label={t("Game.Analyze")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButtonPrimary}
                                    onClick={handleAnalysisMode}
                                >
                                    <IconAnalyze size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            <Tooltip label={t("Game.Resign")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButtonDanger}
                                    onClick={handleResign}
                                    disabled={gameState.isGameOver}
                                >
                                    <IconFlag size={22} stroke={2} />
                                </button>
                            </Tooltip>

                            <Tooltip label={t("Game.Quit")} position="top" withArrow>
                                <button
                                    className={classes.gameControlButton}
                                    onClick={onExit}
                                >
                                    <IconX size={22} stroke={2} />
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
                </div>
            </div>

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

            {/* Game Result Screen */}
            {showResultScreen && (
                <div className={classes.gameResultOverlay}>
                    <div className={classes.gameResultCard}>
                        <div className={`${classes.gameResultTitle} ${getResultClass()}`}>
                            {gameState.result === 'win' && <IconTrophy size={80} className={classes.resultIcon} />}
                            {gameState.result === 'loss' && <IconMoodSad size={80} className={classes.resultIcon} />}
                            {gameState.result === 'draw' && <IconMoodConfuzed size={80} className={classes.resultIcon} />}
                            <div style={{ marginTop: '1rem' }}>{getResultTitle()}</div>
                        </div>

                        <Text className={classes.gameResultSubtitle}>
                            {getResultSubtitle()}
                        </Text>

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
                onClose={handleExitAnalysis}
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
                                // Implement detailed analysis
                                handleExitAnalysis();
                            }}
                        >
                            {t("Game.ViewReport")}
                        </Button>

                        <Button
                            variant="light"
                            leftSection={<IconRotateClockwise size={16} />}
                            onClick={handleExitAnalysis}
                        >
                            {t("Common.Back")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
};
