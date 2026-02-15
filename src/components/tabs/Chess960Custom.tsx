import { Chessground } from "@/chessground/Chessground";
import PiecesGrid from "@/components/boards/PiecesGrid";
import { pieceSetAtom, tabsAtom } from "@/state/atoms";
import { chessboard } from "@/styles/Chessboard.css";
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
  ScrollArea,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import {
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
import * as classes from "./Chess960Custom.css";

interface Chess960CustomProps {
  id: string;
  onBack: () => void;
}

export default function Chess960Custom({ id, onBack }: Chess960CustomProps) {
  const { t } = useTranslation();
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
  const errorMessage =
    error === "Errors.InvalidTurn" ? "" : error ? t(error) : "";

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
    <Box className={classes.page}>
      <Helmet>
        <link rel="stylesheet" href={`/pieces/${pieceSet}.css`} />
      </Helmet>

      <div className={classes.layout}>
        <Box className={classes.boardPane}>
          <Box className={classes.boardArea}>
            <div className={classes.boardSizer}>
              <Box
                ref={boardRef}
                className={`${chessboard} ${classes.boardInner}`}
              >
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
            </div>
          </Box>
        </Box>

        <div className={classes.sideColumn}>
          <Paper className={classes.sidePanel} withBorder p="xs">
            <div className={classes.sideHeader}>
              <Group gap="xs" wrap="nowrap">
                <Tooltip label={t("Home.Card.Chess960.Customize.Back")}>
                  <ActionIcon variant="default" size="lg" onClick={onBack}>
                    <IconArrowLeft size={18} />
                  </ActionIcon>
                </Tooltip>
                <div>
                  <Text className={classes.sideTitle}>
                    {t("Home.Card.Chess960.Customize.Title")}
                  </Text>
                  <Text className={classes.sideSubtitle}>
                    {t("Home.Card.Chess960.Customize.Subtitle")}
                  </Text>
                </div>
              </Group>
            </div>
            <Divider />
            <Tabs
              defaultValue="setup"
              className={classes.tabsRoot}
              keepMounted={false}
            >
              <Tabs.List grow>
                <Tabs.Tab value="setup">
                  {t("Home.Card.Chess960.Customize.Setup")}
                </Tabs.Tab>
                <Tabs.Tab value="pieces">
                  {t("Home.Card.Chess960.Customize.Pieces")}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="setup" className={classes.tabPanel}>
                <ScrollArea h="100%" offsetScrollbars>
                  <Stack gap="sm" className={classes.tabSection}>
                    <div className={classes.controlRow}>
                      <Text size="sm" fw={600}>
                        {t("Home.Card.Chess960.Customize.SideToMove")}
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
                      />
                    </div>

                    <Group grow>
                      <Button
                        variant="default"
                        leftSection={<IconArrowsShuffle size={16} />}
                        onClick={handleRandomize}
                      >
                        {t("Home.Card.Chess960.Customize.Randomize")}
                      </Button>
                      <Button
                        variant="default"
                        leftSection={<IconRefresh size={16} />}
                        onClick={handleStandard}
                      >
                        {t("Home.Card.Chess960.Customize.Standard")}
                      </Button>
                    </Group>
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              <Tabs.Panel value="pieces" className={classes.tabPanel}>
                <ScrollArea h="100%" offsetScrollbars>
                  <Box className={classes.piecesArea}>
                    <PiecesGrid
                      fen={fen}
                      boardRef={boardRef}
                      onPut={handlePiecePut}
                      vertical={true}
                      orientation={boardOrientation}
                      size={42}
                    />
                  </Box>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>
          </Paper>

          <Paper className={classes.actionsPanel} withBorder p="xs">
            <Stack gap="sm">
              <Group grow>
                <Button
                  size="md"
                  leftSection={<IconDeviceGamepad2 size={20} />}
                  onClick={() => startGame("play")}
                  disabled={!isValid}
                >
                  {t("Home.Card.Chess960.Customize.Play")}
                </Button>
                <Button
                  size="md"
                  leftSection={<IconAnalyze size={20} />}
                  variant="default"
                  onClick={() => startGame("analysis")}
                  disabled={!isValid}
                >
                  {t("Home.Card.Chess960.Customize.Analysis")}
                </Button>
              </Group>
              {errorMessage ? (
                <Text className={classes.errorText}>{errorMessage}</Text>
              ) : null}
            </Stack>
          </Paper>
        </div>
      </div>
    </Box>
  );
}
