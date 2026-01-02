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
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Title,
  Tooltip,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconAnalyze,
  IconArrowBack,
  IconArrowsShuffle,
  IconDeviceGamepad2,
  IconRefresh,
} from "@tabler/icons-react";
import { Chess, IllegalSetup, SquareSet } from "chessops";
// Correct imports: Chess is in the root 'chessops', fen utils are in 'chessops/fen'
import { InvalidFen, makeFen, parseFen } from "chessops/fen";
import { useAtom, useAtomValue } from "jotai";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Chess960CustomProps {
  id: string;
  onBack: () => void;
}

export default function Chess960Custom({ id, onBack }: Chess960CustomProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const pieceSet = useAtomValue(pieceSetAtom);
  // State for the full FEN string
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [, setTabs] = useAtom(tabsAtom);
  const boardRef = useRef<HTMLDivElement>(null);

  // Derived state for current turn to sync with UI
  const currentTurn = useMemo(() => {
    const res = parseFen(fen);
    const [setup] = res.unwrap(
      (s) => [s, null],
      (e) => [null, e],
    );
    if (!setup) return "white";
    return setup.turn;
  }, [fen]);

  // Validation Logic
  const validationResult = useMemo(() => {
    const setupResult = parseFen(fen);
    const [setup, fenErr] = setupResult.unwrap(
      (s) => [s, null],
      (e) => [null, e],
    );

    if (fenErr || !setup) return { valid: false, error: "Errors.InvalidFen" };

    // 1. Piece Count Checks
    // Max 16 pieces per side
    if (setup.board.white.size() > 16 || setup.board.black.size() > 16) {
      return { valid: false, error: "Errors.TooManyPieces" };
    }
    // Max 8 pawns per side
    if (
      setup.board.pawn.intersect(setup.board.white).size() > 8 ||
      setup.board.pawn.intersect(setup.board.black).size() > 8
    ) {
      return { valid: false, error: "Errors.TooManyPieces" };
    }

    // 2. Chessops Validation (Kings, Backrank, Opposite Check)
    const posResult = Chess.fromSetup(setup);
    const [chess, posErr] = posResult.unwrap(
      (c) => [c, null],
      (e) => [null, e],
    );

    if (posErr || !chess) {
      return { valid: false, error: chessopsError(posErr!) };
    }

    // 3. Legal Moves Check
    // We must ensure the side to move has at least one legal move.
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

  // Helper to sanitize setup:
  // 1. Clears En Passant square (prevent stale EP)
  // 2. Ensures basic move counters
  // 3. Strips invalid Castling Rights if they cause validation errors
  const sanitizeSetup = (setup: any) => {
    // Always clear EP square on manual setup changes to avoid invalid states
    setup.epSquare = undefined;

    // Ensure proper move counts
    if (setup.turn === "black" && setup.fullmoves === 0) setup.fullmoves = 1;
    if (setup.turn === "white" && setup.fullmoves === 0) setup.fullmoves = 1;

    // Validating Castling Rights
    // If the current setup has bad castling flags (e.g. piece moved), Chess.fromSetup will fail.
    // We try to anticipate or fix this by attempting to validate, and if 'BadCastlingFlags' or similar occurs,
    // we strip the rights to make the position "Legal" (albeit without castling).
    // Note: We can't use the error enum directly easily without comprehensive imports,
    // but we can try-catch or check the result.
    const res = Chess.fromSetup(setup);
    // Use the unwrap pattern correctly to get the error if any
    const [, posErr] = res.unwrap(
      (c) => [c, null],
      (e) => [null, e],
    );

    if (posErr) {
      const err = posErr;
      // Check if error is related to castling issues (e.g. lost rights but flags remain)
      // We use precise enum checks now that we imported them.
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        (err.message === InvalidFen.Castling || err.message === InvalidFen.Fen)
      ) {
        // Try stripping castling rights
        const cleanSetup = { ...setup, unmovedRooks: SquareSet.empty() };

        // Verify if stripping fixes it
        const cleanRes = Chess.fromSetup(cleanSetup);
        const [, cleanErr] = cleanRes.unwrap(
          (c) => [c, null],
          (e) => [null, e],
        );

        if (!cleanErr) {
          // If valid without castling rights, apply the fix
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

    // Sanitize to prevent invalid states when just switching turns
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

        // Keep the turn from our potential UI state / previous state
        newSetup.turn = oldSetup.turn;

        // Sanitize the new board setup (clear EP, check consistency)
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
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Explicitly load cburnett pieces for sidebar visibility */}
      <link rel="stylesheet" href="/pieces/cburnett.css" />

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

      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "2rem",
            width: "100%",
          }}
        >
          {/* Sidebar Palette */}
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
              overflowY: "auto",
              backgroundColor: "var(--mantine-color-body)",
              minWidth: "120px",
            }}
          >
            <Stack justify="center" align="center" gap="md">
              <PiecesGrid
                fen={fen}
                boardRef={boardRef}
                onPut={handlePiecePut}
                vertical={true}
                orientation="white"
                size={45}
              />
            </Stack>
          </Paper>

          {/* Board Container */}
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
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
                borderColor: error
                  ? "var(--mantine-color-red-filled)"
                  : undefined,
              }}
            >
              <Box ref={boardRef} w="100%" h="100%">
                <Chessground
                  fen={fen}
                  setBoardFen={handleBoardFenChange}
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

            {/* Controls and Errors */}
            <Stack align="center" gap="xs" w="100%">
              <Group>
                <Text size="sm" fw={500}>
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
                />
              </Group>

              <Box h="2rem">
                <Transition
                  mounted={!!error}
                  transition="slide-up"
                  duration={200}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <Paper
                      style={styles}
                      shadow="xs"
                      px="md"
                      py="xs"
                      radius="xl"
                      bg="red.1"
                      withBorder
                    >
                      <Group gap="xs">
                        <IconAlertTriangle
                          size={16}
                          color="var(--mantine-color-red-6)"
                        />
                        <Text size="sm" c="red.8" fw={500}>
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
          </Box>
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
