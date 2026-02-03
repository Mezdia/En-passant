import { Chessground } from "@/chessground/Chessground";
import PiecesGrid from "@/components/boards/PiecesGrid";
import { pieceSetAtom, tabsAtom } from "@/state/atoms";
import { generateChess960Fen } from "@/utils/chess";
import { chessopsError } from "@/utils/chessops";
import type { Tab } from "@/utils/tabs";
import { defaultTree } from "@/utils/treeReducer";
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
  Transition,
  rgba,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconAnalyze,
  IconArrowLeft,
  IconArrowsShuffle,
  IconDeviceGamepad2,
  IconRefresh,
} from "@tabler/icons-react";
import { Chess, IllegalSetup, SquareSet } from "chessops";
import { InvalidFen, makeFen, parseFen } from "chessops/fen";
import { useAtom, useAtomValue } from "jotai";
import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

interface Chess960CustomProps {
  id: string;
  onBack: () => void;
}

export default function Chess960Custom({ id, onBack }: Chess960CustomProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const pieceSet = useAtomValue(pieceSetAtom);
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [, setTabs] = useAtom(tabsAtom);
  const boardRef = useRef<HTMLDivElement>(null);

  const currentTurn = useMemo(() => {
    const res = parseFen(fen);
    const [setup] = res.unwrap(
      (s) => [s, null],
      (e) => [null, e],
    );
    if (!setup) return "white";
    return setup.turn;
  }, [fen]);

  // Board orientation follows the side to move
  const boardOrientation = currentTurn;

  const validationResult = useMemo(() => {
    const setupResult = parseFen(fen);
    const [setup, fenErr] = setupResult.unwrap(
      (s) => [s, null],
      (e) => [null, e],
    );

    if (fenErr || !setup) return { valid: false, error: "Errors.InvalidFen" };

    if (setup.board.white.size() > 16 || setup.board.black.size() > 16) {
      return { valid: false, error: "Errors.TooManyPieces" };
    }

    if (
      setup.board.pawn.intersect(setup.board.white).size() > 8 ||
      setup.board.pawn.intersect(setup.board.black).size() > 8
    ) {
      return { valid: false, error: "Errors.TooManyPieces" };
    }

    const posResult = Chess.fromSetup(setup);
    const [chess, posErr] = posResult.unwrap(
      (c) => [c, null],
      (e) => [null, e],
    );

    if (posErr || !chess) {
      return { valid: false, error: chessopsError(posErr!) };
    }

    const allMoves = chess.allDests();
    if (allMoves.size === 0) {
      return { valid: false, error: "Errors.NoLegalMoves" };
    }

    return { valid: true, error: null };
  }, [fen]);

  const isValid = validationResult.valid;
  const error = validationResult.error;

  const handleRandomize = () => {
    setFen(generateChess960Fen());
  };

  const handleStandard = () => {
    setFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  };

  const sanitizeSetup = (setup: any) => {
    setup.epSquare = undefined;

    if (setup.turn === "black" && setup.fullmoves === 0) setup.fullmoves = 1;
    if (setup.turn === "white" && setup.fullmoves === 0) setup.fullmoves = 1;

    const res = Chess.fromSetup(setup);
    const [, posErr] = res.unwrap(
      (c) => [c, null],
      (e) => [null, e],
    );

    if (posErr) {
      const err = posErr;
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        (err.message === InvalidFen.Castling || err.message === InvalidFen.Fen)
      ) {
        const cleanSetup = { ...setup, unmovedRooks: SquareSet.empty() };

        const cleanRes = Chess.fromSetup(cleanSetup);
        const [, cleanErr] = cleanRes.unwrap(
          (c) => [c, null],
          (e) => [null, e],
        );

        if (!cleanErr) {
          setup.unmovedRooks = SquareSet.empty();
        }
      }
    }
    return setup;
  };

  const handleTurnChange = (value: string) => {
    const res = parseFen(fen);
    const [setup] = res.unwrap(
      (s) => [s, null],
      (e) => [null, e],
    );
    if (!setup) return;

    setup.turn = value as "white" | "black";
    sanitizeSetup(setup);
    setFen(makeFen(setup));
  };

  const handleBoardFenChange = (newFen: string) => {
    try {
      const oldRes = parseFen(fen);
      const newRes = parseFen(newFen);

      if (oldRes.isOk && newRes.isOk) {
        const oldSetup = oldRes.unwrap();
        const newSetup = newRes.unwrap();

        newSetup.turn = oldSetup.turn;
        sanitizeSetup(newSetup);
        setFen(makeFen(newSetup));
      } else {
        setFen(newFen);
      }
    } catch (e) {
      setFen(newFen);
    }
  };

  const handlePiecePut = (newFen: string) => {
    handleBoardFenChange(newFen);
  };

  const startGame = (mode: "play" | "analysis") => {
    if (!isValid) return;

    const tree = defaultTree(fen);
    tree.headers.variant = "Chess960";
    sessionStorage.setItem(id, JSON.stringify({ version: 0, state: tree }));

    setTabs((prev: Tab[]) => {
      const tab = prev.find((t) => t.value === id);
      if (!tab) return prev;
      tab.name = t("Home.Card.Chess960.Title");
      tab.type = mode;
      return [...prev];
    });
  };

  return (
    <Box
      h="100%"
      w="100%"
      p="md"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        backgroundColor: "var(--mantine-color-body)",
        overflow: "hidden",
      }}
    >
      <Helmet>
        <link rel="stylesheet" href={`/pieces/${pieceSet}.css`} />
      </Helmet>

      {/* Header - Vertical Layout */}
      <Paper
        shadow="sm"
        radius="md"
        p="md"
        withBorder
        style={{
          backgroundColor: theme.colors.dark[7],
          borderColor: theme.colors.dark[6],
          flexShrink: 0,
        }}
      >
        <Stack gap="sm" align="center">
          {/* Back Button */}
          <Tooltip label={t("Home.Card.Chess960.Customize.Back")}>
            <ActionIcon
              variant="filled"
              size="lg"
              radius="md"
              onClick={onBack}
              style={{
                backgroundColor: "var(--mantine-primary-color-filled)",
                color: "var(--mantine-primary-color-contrast)",
                transition: "all 0.2s ease",
              }}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "var(--mantine-primary-color-filled-hover)",
                    transform: "translateY(-2px)",
                  },
                },
              }}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          </Tooltip>

          {/* Title */}
          <Box ta="center">
            <Title order={3} c="white" fw={600} size="h4">
              {t("Home.Card.Chess960.Customize.Title")}
            </Title>
            <Text size="xs" c="dimmed">
              {t("Home.Card.Chess960.Customize.Subtitle", "Customize your starting position")}
            </Text>
          </Box>

          {/* Action Buttons */}
          <Group gap="sm" wrap="nowrap">
            <Button
              leftSection={<IconArrowsShuffle size={18} />}
              variant="light"
              color="cyan"
              radius="md"
              size="sm"
              onClick={handleRandomize}
              styles={{
                root: {
                  backgroundColor: "var(--mantine-primary-color-light)",
                  color: "var(--mantine-primary-color-light-color)",
                  border: "1px solid var(--mantine-primary-color-light-hover)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "var(--mantine-primary-color-light-hover)",
                    transform: "translateY(-1px)",
                  },
                },
              }}
            >
              {t("Home.Card.Chess960.Customize.Randomize")}
            </Button>
            <Button
              leftSection={<IconRefresh size={18} />}
              variant="default"
              radius="md"
              size="sm"
              onClick={handleStandard}
              styles={{
                root: {
                  backgroundColor: theme.colors.dark[6],
                  borderColor: theme.colors.dark[5],
                  color: theme.colors.gray[5],
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: theme.colors.dark[5],
                    borderColor: theme.colors.dark[4],
                    color: "white",
                    transform: "translateY(-1px)",
                  },
                },
              }}
            >
              {t("Home.Card.Chess960.Customize.Standard")}
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5rem",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Pieces Sidebar */}
        <Paper
          shadow="md"
          radius="lg"
          withBorder
          p="md"
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.colors.dark[7],
            borderColor: theme.colors.dark[6],
            minWidth: "120px",
            maxWidth: "140px",
            height: "100%",
            maxHeight: "100%",
            overflow: "hidden",
          }}
        >
          <Text size="sm" fw={600} c="white" ta="center" mb="sm">
            {t("Home.Card.Chess960.Customize.Pieces", "Pieces")}
          </Text>
          <Divider mb="sm" color={theme.colors.dark[6]} />
          <Box style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <Stack justify="center" align="center" gap="sm">
              <PiecesGrid
                fen={fen}
                boardRef={boardRef}
                onPut={handlePiecePut}
                vertical={true}
                orientation={boardOrientation}
                size={44}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Board and Controls Container */}
        <Stack gap="md" align="center" style={{ height: "100%", justifyContent: "center" }}>
          {/* Board */}
          <Paper
            shadow="xl"
            radius="xl"
            p="xs"
            withBorder
            style={{
              width: "min(55vh, 520px)",
              aspectRatio: 1,
              transition: "all 0.3s ease",
              borderColor: error
                ? theme.colors.red[6]
                : theme.colors.dark[6],
              backgroundColor: error
                ? rgba(theme.colors.red[9], 0.2)
                : theme.colors.dark[8],
              boxShadow: error
                ? `0 0 20px ${rgba(theme.colors.red[6], 0.3)}`
                : undefined,
            }}
          >
            <Box ref={boardRef} w="100%" h="100%" style={{ borderRadius: theme.radius.lg, overflow: "hidden" }}>
              <Chessground
                fen={fen}
                setBoardFen={handleBoardFenChange}
                orientation={boardOrientation}
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

          {/* Controls - Compact */}
          <Paper
            shadow="sm"
            radius="md"
            p="sm"
            withBorder
            style={{
              backgroundColor: theme.colors.dark[7],
              borderColor: theme.colors.dark[6],
              width: "fit-content",
            }}
          >
            <Stack align="center" gap="sm">
              <Group gap="sm" align="center" wrap="nowrap">
                <Text size="sm" fw={500} c="white">
                  {t("Home.Card.Chess960.Customize.SideToMove")}:
                </Text>
                <SegmentedControl
                  value={currentTurn}
                  onChange={handleTurnChange}
                  data={[
                    {
                      label: t("Home.Card.Chess960.Customize.White"),
                      value: "white",
                    },
                    {
                      label: t("Home.Card.Chess960.Customize.Black"),
                      value: "black",
                    },
                  ]}
                  size="sm"
                  styles={{
                    root: {
                      backgroundColor: theme.colors.dark[6],
                    },
                    label: {
                      color: theme.colors.gray[4],
                      "&[data-active]": {
                        color: "white",
                      },
                    },
                    control: {
                      "&[data-active]": {
                        backgroundColor: "var(--mantine-primary-color-filled)",
                      },
                    },
                  }}
                />
              </Group>

              <Box h="1.5rem">
                <Transition
                  mounted={!!error}
                  transition="slide-up"
                  duration={200}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <Paper
                      style={styles}
                      shadow="sm"
                      px="md"
                      py="xs"
                      radius="md"
                      withBorder
                      styles={{
                        root: {
                          backgroundColor: rgba(theme.colors.red[9], 0.9),
                          borderColor: theme.colors.red[6],
                        },
                      }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <IconAlertTriangle
                          size={16}
                          color={theme.colors.red[4]}
                        />
                        <Text size="xs" c="red.4" fw={600}>
                          {error === "Errors.InvalidTurn"
                            ? ""
                            : error
                              ? t(error)
                              : ""}
                        </Text>
                      </Group>
                    </Paper>
                  )}
                </Transition>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Paper
        shadow="sm"
        radius="md"
        p="md"
        withBorder
        style={{
          backgroundColor: theme.colors.dark[7],
          borderColor: theme.colors.dark[6],
          flexShrink: 0,
        }}
      >
        <Group justify="center" gap="xl">
          <Button
            size="md"
            leftSection={<IconDeviceGamepad2 size={22} />}
            radius="md"
            onClick={() => startGame("play")}
            disabled={!isValid}
            styles={{
              root: {
                minWidth: "140px",
                backgroundColor: "var(--mantine-primary-color-filled)",
                color: "var(--mantine-primary-color-contrast)",
                transition: "all 0.2s ease",
                "&:hover:not(:disabled)": {
                  backgroundColor: "var(--mantine-primary-color-filled-hover)",
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows.md,
                },
                "&:disabled": {
                  opacity: 0.5,
                  backgroundColor: theme.colors.dark[6],
                  color: theme.colors.gray[5],
                },
              },
            }}
          >
            {t("Home.Card.Chess960.Customize.Play")}
          </Button>
          <Button
            size="md"
            leftSection={<IconAnalyze size={22} />}
            variant="default"
            radius="md"
            onClick={() => startGame("analysis")}
            disabled={!isValid}
            styles={{
              root: {
                minWidth: "140px",
                backgroundColor: theme.colors.dark[6],
                borderColor: theme.colors.dark[5],
                color: "white",
                transition: "all 0.2s ease",
                "&:hover:not(:disabled)": {
                  backgroundColor: theme.colors.dark[5],
                  borderColor: theme.colors.dark[4],
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows.md,
                },
                "&:disabled": {
                  opacity: 0.5,
                  backgroundColor: theme.colors.dark[6],
                  color: theme.colors.gray[5],
                },
              },
            }}
          >
            {t("Home.Card.Chess960.Customize.Analysis")}
          </Button>
        </Group>
      </Paper>
    </Box>
  );
}
