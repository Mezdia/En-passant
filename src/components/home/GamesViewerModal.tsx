import { fetchChessComGames, type ChessComGameData } from "@/utils/chess.com/api";
import { fetchLichessGames, type LichessGameData } from "@/utils/lichess/api";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Loader,
    Modal,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import {
    IconChess,
    IconCopy,
    IconExternalLink,
    IconFilter,
    IconRefresh,
    IconSearch,
    IconTrophy,
    IconX,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GamePreview from "../databases/GamePreview";
import LichessLogo from "./LichessLogo";
import * as classes from "./GamesViewerModal.css";

// Unified game type for display
type UnifiedGame = {
    id: string;
    url: string;
    pgn: string;
    date: Date;
    speed: string;
    rated: boolean;
    white: {
        username: string;
        rating: number;
        result: string;
    };
    black: {
        username: string;
        rating: number;
        result: string;
    };
    opening?: string;
    platform: "lichess" | "chesscom";
};

type ColorFilter = "all" | "white" | "black";
type ResultFilter = "all" | "win" | "loss" | "draw";

interface GamesViewerModalProps {
    opened: boolean;
    onClose: () => void;
    username: string;
    platform: "lichess" | "chesscom";
    token?: string;
}

function normalizeChessComResult(result: string): "win" | "loss" | "draw" {
    if (result === "win") return "win";
    if (["checkmated", "timeout", "resigned", "abandoned", "lose"].includes(result)) return "loss";
    return "draw";
}

function convertChessComGame(game: ChessComGameData): UnifiedGame {
    return {
        id: game.id,
        url: game.url,
        pgn: game.pgn,
        date: new Date(game.endTime * 1000),
        speed: game.timeControl,
        rated: game.rated,
        white: {
            username: game.white.username,
            rating: game.white.rating,
            result: normalizeChessComResult(game.white.result),
        },
        black: {
            username: game.black.username,
            rating: game.black.rating,
            result: normalizeChessComResult(game.black.result),
        },
        opening: game.opening,
        platform: "chesscom",
    };
}

function convertLichessGame(game: LichessGameData): UnifiedGame {
    return {
        id: game.id,
        url: game.url,
        pgn: game.pgn,
        date: new Date(game.createdAt),
        speed: game.speed,
        rated: game.rated,
        white: {
            username: game.white.username,
            rating: game.white.rating,
            result: game.white.result,
        },
        black: {
            username: game.black.username,
            rating: game.black.rating,
            result: game.black.result,
        },
        opening: game.opening,
        platform: "lichess",
    };
}

function GamesViewerModal({
    opened,
    onClose,
    username,
    platform,
    token,
}: GamesViewerModalProps) {
    const { t } = useTranslation();
    const [games, setGames] = useState<UnifiedGame[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState<UnifiedGame | null>(null);

    // Filters
    const [colorFilter, setColorFilter] = useState<ColorFilter>("all");
    const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
    const [openingSearch, setOpeningSearch] = useState("");

    const fetchGames = useCallback(async () => {
        setLoading(true);
        setSelectedGame(null);
        try {
            if (platform === "lichess") {
                const lichessGames = await fetchLichessGames(username, 50, token);
                setGames(lichessGames.map(convertLichessGame));
            } else {
                const chesscomGames = await fetchChessComGames(username, 50);
                setGames(chesscomGames.map(convertChessComGame));
            }
        } catch (error) {
            console.error("Failed to fetch games:", error);
            setGames([]);
        } finally {
            setLoading(false);
        }
    }, [username, platform, token]);

    useEffect(() => {
        if (opened) {
            fetchGames();
        }
    }, [opened, fetchGames]);

    const filteredGames = useMemo(() => {
        return games.filter((game) => {
            // Color filter
            if (colorFilter === "white" && game.white.username.toLowerCase() !== username.toLowerCase()) {
                return false;
            }
            if (colorFilter === "black" && game.black.username.toLowerCase() !== username.toLowerCase()) {
                return false;
            }

            // Result filter
            if (resultFilter !== "all") {
                const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
                const userResult = isWhite ? game.white.result : game.black.result;
                if (userResult !== resultFilter) {
                    return false;
                }
            }

            // Opening search
            if (openingSearch && game.opening) {
                if (!game.opening.toLowerCase().includes(openingSearch.toLowerCase())) {
                    return false;
                }
            } else if (openingSearch && !game.opening) {
                return false;
            }

            return true;
        });
    }, [games, colorFilter, resultFilter, openingSearch, username]);

    const getResultForUser = (game: UnifiedGame): "win" | "loss" | "draw" => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        return (isWhite ? game.white.result : game.black.result) as "win" | "loss" | "draw";
    };

    const getOpponent = (game: UnifiedGame) => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        return isWhite ? game.black : game.white;
    };

    const getUserColor = (game: UnifiedGame): "white" | "black" => {
        return game.white.username.toLowerCase() === username.toLowerCase() ? "white" : "black";
    };

    const copyPGN = async (pgn: string) => {
        await navigator.clipboard.writeText(pgn);
    };

    const openInBrowser = (url: string) => {
        window.open(url, "_blank");
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTimeControl = (tc: string) => {
        // Handle Lichess speed format
        if (["ultraBullet", "bullet", "blitz", "rapid", "classical", "correspondence"].includes(tc)) {
            return tc.charAt(0).toUpperCase() + tc.slice(1);
        }
        // Handle Chess.com time control format (e.g., "600" or "180+2")
        const parts = tc.split("+");
        const base = parseInt(parts[0]);
        if (base < 60) return "Bullet";
        if (base < 180) return "Bullet";
        if (base < 600) return "Blitz";
        if (base < 1800) return "Rapid";
        return "Classical";
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    {platform === "lichess" ? (
                        <LichessLogo />
                    ) : (
                        <img width={24} height={24} src="/chesscom.png" alt="chess.com" />
                    )}
                    <Text fw={600}>{t("GamesViewer.Title", { player: username })}</Text>
                </Group>
            }
            size="xl"
            centered
        >
            <Box className={classes.modalContent}>
                {/* Filters */}
                <Box className={`${classes.filtersContainer} ${classes.mobileFilters}`}>
                    <Group gap="xs">
                        <IconFilter size={16} />
                        <Text size="sm" fw={500}>{t("GamesViewer.Filters.Title", "Filters")}</Text>
                    </Group>

                    <SegmentedControl
                        size="xs"
                        value={colorFilter}
                        onChange={(v) => setColorFilter(v as ColorFilter)}
                        data={[
                            { label: t("GamesViewer.Filters.All", "All"), value: "all" },
                            { label: t("Common.WHITE", "White"), value: "white" },
                            { label: t("Common.BLACK", "Black"), value: "black" },
                        ]}
                    />

                    <SegmentedControl
                        size="xs"
                        value={resultFilter}
                        onChange={(v) => setResultFilter(v as ResultFilter)}
                        data={[
                            { label: t("GamesViewer.Filters.All", "All"), value: "all" },
                            { label: t("GamesViewer.Result.Win", "Win"), value: "win" },
                            { label: t("GamesViewer.Result.Loss", "Loss"), value: "loss" },
                            { label: t("GamesViewer.Result.Draw", "Draw"), value: "draw" },
                        ]}
                    />

                    <TextInput
                        size="xs"
                        placeholder={t("GamesViewer.Filters.Opening", "Search opening...")}
                        leftSection={<IconSearch size={14} />}
                        value={openingSearch}
                        onChange={(e) => setOpeningSearch(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 150 }}
                        rightSection={
                            openingSearch && (
                                <ActionIcon size="xs" variant="subtle" onClick={() => setOpeningSearch("")}>
                                    <IconX size={12} />
                                </ActionIcon>
                            )
                        }
                    />

                    <Tooltip label={t("GamesViewer.Refresh", "Refresh games")}>
                        <ActionIcon variant="light" onClick={fetchGames} loading={loading}>
                            <IconRefresh size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Box>

                {/* Games List */}
                {loading ? (
                    <Box className={classes.loadingContainer}>
                        <Loader size="lg" />
                        <Text c="dimmed">{t("GamesViewer.Loading", "Loading games...")}</Text>
                    </Box>
                ) : filteredGames.length === 0 ? (
                    <Box className={classes.emptyState}>
                        <IconChess size={48} stroke={1} />
                        <Text>{t("GamesViewer.NoGames", "No games found")}</Text>
                        {games.length > 0 && (
                            <Text size="sm" c="dimmed">
                                {t("GamesViewer.TryDifferentFilters", "Try adjusting your filters")}
                            </Text>
                        )}
                    </Box>
                ) : (
                    <ScrollArea className={classes.gamesList}>
                        <Stack gap="xs">
                            {filteredGames.map((game) => {
                                const result = getResultForUser(game);
                                const opponent = getOpponent(game);
                                const userColor = getUserColor(game);
                                const isSelected = selectedGame?.id === game.id;

                                return (
                                    <Box
                                        key={game.id}
                                        className={`${classes.gameCard} ${classes.mobileGameCard} ${isSelected ? classes.gameCardSelected : ""}`}
                                        onClick={() => setSelectedGame(isSelected ? null : game)}
                                    >
                                        <Group justify="space-between" wrap="nowrap">
                                            <Group gap="sm" wrap="nowrap">
                                                {/* Result indicator */}
                                                <Box
                                                    w={4}
                                                    h={40}
                                                    style={{
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                            result === "win"
                                                                ? "var(--mantine-color-green-6)"
                                                                : result === "loss"
                                                                    ? "var(--mantine-color-red-6)"
                                                                    : "var(--mantine-color-gray-5)",
                                                    }}
                                                />

                                                <Stack gap={2}>
                                                    <Group gap="xs" wrap="nowrap">
                                                        <Text
                                                            size="sm"
                                                            fw={600}
                                                            className={
                                                                result === "win"
                                                                    ? classes.resultWin
                                                                    : result === "loss"
                                                                        ? classes.resultLoss
                                                                        : classes.resultDraw
                                                            }
                                                        >
                                                            {result === "win" ? "1" : result === "loss" ? "0" : "½"}
                                                        </Text>
                                                        <Text size="sm" fw={500}>
                                                            vs {opponent.username}
                                                        </Text>
                                                        <Badge size="xs" variant="light">
                                                            {opponent.rating}
                                                        </Badge>
                                                    </Group>
                                                    <Group gap="xs" className={classes.gameMetadata}>
                                                        <Badge size="xs" variant="outline" color={userColor === "white" ? "gray" : "dark"}>
                                                            {userColor === "white" ? "♔" : "♚"} {t(`Common.${userColor.toUpperCase()}`, userColor)}
                                                        </Badge>
                                                        <Text size="xs">{formatDate(game.date)}</Text>
                                                        <Badge size="xs" variant="dot">
                                                            {formatTimeControl(game.speed)}
                                                        </Badge>
                                                        {game.opening && (
                                                            <Tooltip label={game.opening}>
                                                                <Badge size="xs" variant="light" color="cyan" className={classes.openingBadge}>
                                                                    {game.opening}
                                                                </Badge>
                                                            </Tooltip>
                                                        )}
                                                    </Group>
                                                </Stack>
                                            </Group>

                                            <Group gap="xs" wrap="nowrap">
                                                <Tooltip label={t("GamesViewer.Actions.CopyPGN", "Copy PGN")}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyPGN(game.pgn);
                                                        }}
                                                    >
                                                        <IconCopy size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t("GamesViewer.Actions.OpenExternal", "Open in browser")}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openInBrowser(game.url);
                                                        }}
                                                    >
                                                        <IconExternalLink size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Group>

                                        {/* Expanded preview */}
                                        {isSelected && game.pgn && (
                                            <Box className={classes.previewContainer}>
                                                <GamePreview pgn={game.pgn} />
                                                <Group className={classes.actionButtons}>
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        leftSection={<IconCopy size={14} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyPGN(game.pgn);
                                                        }}
                                                    >
                                                        {t("GamesViewer.Actions.CopyPGN", "Copy PGN")}
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        leftSection={<IconExternalLink size={14} />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openInBrowser(game.url);
                                                        }}
                                                    >
                                                        {t("GamesViewer.Actions.OpenExternal", "Open in browser")}
                                                    </Button>
                                                </Group>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </ScrollArea>
                )}

                {/* Stats footer */}
                {!loading && games.length > 0 && (
                    <Group justify="space-between" mt="sm">
                        <Text size="xs" c="dimmed">
                            {t("GamesViewer.Showing", "Showing {{count}} of {{total}} games", {
                                count: filteredGames.length,
                                total: games.length,
                            })}
                        </Text>
                        <Group gap="xs">
                            <IconTrophy size={14} />
                            <Text size="xs" c="dimmed">
                                {t("GamesViewer.WinRate", "Win rate")}: {" "}
                                {games.length > 0
                                    ? Math.round(
                                        (games.filter((g) => getResultForUser(g) === "win").length / games.length) * 100
                                    )
                                    : 0}
                                %
                            </Text>
                        </Group>
                    </Group>
                )}
            </Box>
        </Modal>
    );
}

export default GamesViewerModal;
