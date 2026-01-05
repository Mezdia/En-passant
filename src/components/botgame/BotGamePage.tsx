
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
    Loader
} from "@mantine/core";
import {
    IconArrowBackUp,
    IconBulb,
    IconFlag,
    IconSettings,
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
import { activeTabAtom, botGameHistoryTriggerAtom } from "@/state/atoms";

// Props 
interface BotGamePageProps {
    bot: Bot;
    onExit: () => void;
}

export const BotGamePage: React.FC<BotGamePageProps> = ({ bot, onExit }) => {
    const { t } = useTranslation();
    const activeTab = useAtomValue(activeTabAtom);

    // Game State
    const [fen, setFen] = useState<string>(INITIAL_FEN);
    const [userSide, setUserSide] = useState<"white" | "black">("white");
    const [isEngineThinking, setIsEngineThinking] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [moveHistory, setMoveHistory] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState<[SquareName, SquareName] | undefined>(undefined);
    const [enginePath, setEnginePath] = useState<string>("");

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
                        // Handle "random" by picking a side
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
        if (!pos) return;
        if (!enginePath) {
            console.log("[BotGamePage] Waiting for engine path to load...");
            return;
        }

        const currentTurn = pos.turn === "white" ? "white" : "black";
        console.log("[BotGamePage] Turn check - currentTurn:", currentTurn, "userSide:", userSide, "isEngineThinking:", isEngineThinking);

        if (checkGameOver()) return;

        if (currentTurn !== userSide && !isEngineThinking) {
            console.log("[BotGamePage] Triggering bot move...");
            makeBotMove();
        }
    }, [fen, isEngineThinking, userSide, enginePath]);

    const checkGameOver = () => {
        if (!pos) return false;

        // Use dests map which is already computed
        const hasMoves = dests.size > 0;
        const isCheck = pos.isCheck();

        if (!hasMoves) {
            if (isCheck) {
                const winner = pos.turn === "white" ? "black" : "white";
                addMessage("system", winner === "white" ? "White wins by Checkmate!" : "Black wins by Checkmate!");
                saveGame(winner === "white" ? "1-0" : "0-1");
            } else {
                addMessage("system", "Draw by Stalemate");
                saveGame("1/2-1/2");
            }
            return true;
        }
        return false;
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
                result: result as any, // Cast to expected enum string
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
        if (isEngineThinking) return;
        if (!pos) return;

        const fromSq = parseSquare(orig)!;
        const toSq = parseSquare(dest)!;

        // Check if promotion is needed (pawn to last rank)
        // Note: pos.board.get uses square number
        // dest[1] char check is valid for rank
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

        setFen(newFen);
        setLastMove([orig, dest]);
        setMoveHistory(prev => [...prev, san]);
    };

    const getEngineBestMove = async (currentFen: string) => {
        // Check if engine path is loaded
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
        // Wait at least thinkingTime
        await new Promise(r => setTimeout(r, thinkingTime));

        // 1. Try Opening Book
        console.log("[BotGamePage] Checking opening book for FEN:", fen);
        const bookMove = getBookMove(fen, bot.rating);
        console.log("[BotGamePage] Book move result:", bookMove);

        if (bookMove) {
            // Apply book move directly
            const fromName = bookMove.substring(0, 2) as SquareName;
            const toName = bookMove.substring(2, 4) as SquareName;
            const from = parseSquare(fromName)!;
            const to = parseSquare(toName)!;
            const move = { from, to }; // Book moves usually don't have promotion, or strictly 'q'

            if (pos) {
                const san = makeSan(pos, move as any);
                pos.play(move as any);
                const newFen = makeFen(pos.toSetup());

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);
                addMessage("system", "Book Move"); // Optional debug
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

        // Move selection - pass actual position for game phase detection
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

                setFen(newFen);
                setLastMove([fromName, toName]);
                setMoveHistory(prev => [...prev, san]);

                if (decision.type === 'blunder' && bot.personality?.blunderReaction) {
                    addMessage("bot", t(bot.personality.blunderReaction));
                }
            }
        }

        setIsEngineThinking(false);
    };

    return (
        <div className={classes.pageContainer}>
            <div className={classes.sidebar}>
                <div className={classes.sidebarContent}>
                    <div className={classes.botProfile}>
                        <Avatar src={bot.image} size="xl" className={classes.botImage} />
                        <Text fw={700} size="lg">{bot.nameEnglish}</Text>
                        <Badge color="yellow" variant="light">{bot.rating}</Badge>
                    </div>

                    <BotChatPanel messages={messages} botName={bot.nameEnglish} />

                    <div className={classes.controlPanel}>
                        <Tooltip label={t("Game.Takeback")}>
                            <ActionIcon size="lg" variant="default" onClick={() => { }}>
                                <IconArrowBackUp />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("Game.Hint")}>
                            <ActionIcon size="lg" variant="default">
                                <IconBulb />
                            </ActionIcon>
                        </Tooltip>
                        <Button color="red" variant="light" leftSection={<IconFlag />} onClick={onExit}>
                            {t("Game.Resign")}
                        </Button>
                    </div>
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
                            color: isEngineThinking ? undefined : userSide,
                            dests: dests,
                            events: {
                                after: (orig, dest) => handleUserMove(orig as SquareName, dest as SquareName),
                            },
                        }}
                        animation={{ enabled: true }}
                        draggable={{ enabled: true }}
                        selectable={{ enabled: true }}
                    />
                </div>
            </div>
        </div>
    );
};
