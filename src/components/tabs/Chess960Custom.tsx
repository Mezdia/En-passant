
import { Box, Button, Group, Title, ActionIcon, Tooltip, Stack, Paper, Text, Transition } from "@mantine/core";
import { IconArrowBack, IconArrowsShuffle, IconDeviceGamepad2, IconAnalyze, IconRefresh, IconAlertTriangle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useMemo } from "react";
import { Chessground } from "@/chessground/Chessground";
import { generateChess960Fen } from "@/utils/chess";
import { defaultTree } from "@/utils/treeReducer";
import { positionFromFen, chessopsError } from "@/utils/chessops";
import { useAtom } from "jotai";
import { tabsAtom } from "@/state/atoms";
import type { Tab } from "@/utils/tabs";
import PiecesGrid from "@/components/boards/PiecesGrid";

interface Chess960CustomProps {
    id: string;
    onBack: () => void;
}

export default function Chess960Custom({ id, onBack }: Chess960CustomProps) {
    const { t } = useTranslation();
    const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    const [, setTabs] = useAtom(tabsAtom);
    const boardRef = useRef<HTMLDivElement>(null);

    // Validate the position
    const [, error] = useMemo(() => positionFromFen(fen), [fen]);
    const isValid = !error;

    const handleRandomize = () => {
        setFen(generateChess960Fen());
    };

    const handleStandard = () => {
        setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    };

    const startGame = (mode: "play" | "analysis") => {
        if (!isValid) return;

        const tree = defaultTree(fen);
        tree.headers.variant = "Chess960";
        sessionStorage.setItem(
            id,
            JSON.stringify({ version: 0, state: tree }),
        );

        setTabs((prev: Tab[]) => {
            const tab = prev.find((t) => t.value === id);
            if (!tab) return prev;
            tab.name = t("Home.Card.Chess960.Title");
            tab.type = mode;
            return [...prev];
        });
    };

    return (
        <Box h="100%" w="100%" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Group justify="space-between" align="center">
                <Group>
                    <Tooltip label={t("Home.Card.Chess960.Customize.Back")}>
                        <ActionIcon variant="subtle" size="lg" onClick={onBack}>
                            <IconArrowBack />
                        </ActionIcon>
                    </Tooltip>
                    <Title order={3}>{t("Home.Card.Chess960.Customize.Title")}</Title>
                </Group>
            </Group>

            <Box style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem" }}>

                <Box style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "2rem", width: "100%" }}>
                    {/* Board Container */}
                    <Box
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            alignItems: "center"
                        }}
                    >
                        <Paper
                            shadow="sm"
                            p={4}
                            radius="md"
                            withBorder
                            style={{
                                width: "60vh",
                                maxWidth: "600px",
                                aspectRatio: 1,
                                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                                borderColor: error ? "var(--mantine-color-red-filled)" : undefined
                            }}
                        >
                            <Box ref={boardRef} w="100%" h="100%">
                                <Chessground
                                    fen={fen}
                                    setBoardFen={setFen}
                                    orientation="white"
                                    coordinates={true}
                                    movable={{
                                        free: true,
                                        color: "both",
                                    }}
                                    draggable={{
                                        enabled: true,
                                        deleteOnDropOff: true,
                                    }}
                                />
                            </Box>
                        </Paper>

                        {/* Error Message Display */}
                        <Box h="2rem">
                            <Transition mounted={!!error} transition="slide-up" duration={200} timingFunction="ease">
                                {(styles) => (
                                    <Paper style={styles} shadow="xs" px="md" py="xs" radius="xl" bg="red.1" withBorder>
                                        <Group gap="xs">
                                            <IconAlertTriangle size={16} color="var(--mantine-color-red-6)" />
                                            <Text size="sm" c="red.8" fw={500}>
                                                {error ? t(chessopsError(error)) : ""}
                                            </Text>
                                        </Group>
                                    </Paper>
                                )}
                            </Transition>
                        </Box>
                    </Box>

                    <Paper
                        shadow="md"
                        radius="lg"
                        withBorder
                        p="md"
                        h="60vh"
                        mah="600px"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflowY: 'auto',
                            backgroundColor: "var(--mantine-color-body)",
                            minWidth: "120px"
                        }}
                    >
                        <Stack justify="center" align="center" gap="md">
                            <PiecesGrid
                                fen={fen}
                                boardRef={boardRef}
                                onPut={setFen}
                                vertical={true}
                                orientation="white"
                                size={45}
                            />
                        </Stack>
                    </Paper>
                </Box>
            </Box>

            <Group justify="center" gap="md">
                <Button
                    leftSection={<IconArrowsShuffle size={20} />}
                    variant="light"
                    onClick={handleRandomize}
                >
                    {t("Home.Card.Chess960.Customize.Randomize")}
                </Button>
                <Button
                    leftSection={<IconRefresh size={20} />}
                    variant="default"
                    onClick={handleStandard}
                >
                    {t("Home.Card.Chess960.Customize.Standard")}
                </Button>
            </Group>

            <Group justify="center" gap="xl" pb="md">
                <Button
                    size="lg"
                    leftSection={<IconDeviceGamepad2 size={24} />}
                    color="blue"
                    onClick={() => startGame("play")}
                    disabled={!isValid}
                >
                    {t("Home.Card.Chess960.Customize.Play")}
                </Button>
                <Button
                    size="lg"
                    leftSection={<IconAnalyze size={24} />}
                    variant="outline"
                    color="teal"
                    onClick={() => startGame("analysis")}
                    disabled={!isValid}
                >
                    {t("Home.Card.Chess960.Customize.Analysis")}
                </Button>
            </Group>
        </Box>
    );
}
