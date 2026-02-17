import { deleteBotGame, type BotGameRecord } from "@/components/bots/botGameHistory";
import { getAllBots } from "@/components/bots/botData";
import {
  activeTabAtom,
  botGameHistoryAtom,
  botGameHistoryTriggerAtom,
  gameHistoryAtom,
  gameHistoryTriggerAtom,
  tabsAtom,
} from "@/state/atoms";
import {
  addGameHistory,
  deleteGameHistory,
  type GameHistoryRecord,
} from "@/utils/gameHistory";
import { createTab, genID } from "@/utils/tabs";
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Select,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconArrowBackUp,
  IconCpu,
  IconFileExport,
  IconFileImport,
  IconHistory,
  IconRobot,
  IconSearch,
  IconTrash,
  IconUser,
  IconZoomCheck,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import dayjs from "dayjs";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import * as classes from "./GameHistoryPage.css";

type HistoryType = "bot" | "engine" | "human";

type HistoryItem = {
  id: string;
  recordId: string;
  source: "bot" | "board";
  type: HistoryType;
  date: string;
  result: "1-0" | "0-1" | "1/2-1/2" | "*";
  white: string;
  black: string;
  whiteType: "human" | "engine" | "bot";
  blackType: "human" | "engine" | "bot";
  movesCount: number;
  pgn?: string;
  variant?: string;
  timeControl?: string;
  engineName?: string;
  botName?: string;
  accuracy?: number;
  whiteAccuracy?: number;
  blackAccuracy?: number;
  gameMode?: string;
};

type Filters = {
  search: string;
  type: "all" | HistoryType;
  result: "all" | "1-0" | "0-1" | "1/2-1/2";
  from: Date | null;
  to: Date | null;
};

const emptyFilters: Filters = {
  search: "",
  type: "all",
  result: "all",
  from: null,
  to: null,
};

function getResultLabel(
  result: HistoryItem["result"],
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  switch (result) {
    case "1-0":
      return t("GameHistory.Result.White");
    case "0-1":
      return t("GameHistory.Result.Black");
    case "1/2-1/2":
      return t("GameHistory.Result.Draw");
    default:
      return t("GameHistory.Result.Unknown");
  }
}

function getResultColor(result: HistoryItem["result"]) {
  switch (result) {
    case "1-0":
      return "blue";
    case "0-1":
      return "indigo";
    case "1/2-1/2":
      return "cyan";
    default:
      return "blue";
  }
}

function getResultTone(result: HistoryItem["result"]) {
  const base = getResultColor(result);
  return `var(--mantine-color-${base}-6)`;
}

export default function GameHistoryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const botHistory = useAtomValue(botGameHistoryAtom);
  const gameHistory = useAtomValue(gameHistoryAtom);
  const setBotHistoryTrigger = useSetAtom(botGameHistoryTriggerAtom);
  const setGameHistoryTrigger = useSetAtom(gameHistoryTriggerAtom);
  const [, setTabs] = useAtom(tabsAtom);
  const setActiveTab = useSetAtom(activeTabAtom);
  const activeTab = useAtomValue(activeTabAtom);

  const botsById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getAllBots>[number]>();
    for (const bot of getAllBots()) {
      map.set(bot.id, bot);
    }
    return map;
  }, []);

  const isPersian = i18n.language.startsWith("fa");

  const resolveBotName = useCallback(
    (record: BotGameRecord) => {
      const bot = botsById.get(record.botId);
      if (!bot) return record.botName;
      return t(bot.nameKey, {
        defaultValue: isPersian ? bot.namePersian : bot.nameEnglish,
      });
    },
    [botsById, isPersian, t],
  );

  const youLabel = t("GameHistory.You");

  const botItems: HistoryItem[] = useMemo(() => {
    return botHistory.map((record) => {
      const botName = resolveBotName(record);
      const white = record.playerSide === "white" ? youLabel : botName;
      const black = record.playerSide === "white" ? botName : youLabel;

      return {
        id: `bot-${record.id}`,
        recordId: record.id,
        source: "bot",
        type: "bot",
        date: record.date,
        result: record.result,
        white,
        black,
        whiteType: record.playerSide === "white" ? "human" : "bot",
        blackType: record.playerSide === "white" ? "bot" : "human",
        movesCount: record.movesCount,
        pgn: record.pgn,
        engineName: record.engineName,
        botName,
        accuracy: record.accuracy,
        gameMode: record.gameMode,
        timeControl: record.timeControl,
        variant: record.variant,
      };
    });
  }, [botHistory, resolveBotName, youLabel]);

  const boardItems: HistoryItem[] = useMemo(() => {
    return gameHistory.map((record: GameHistoryRecord) => ({
      id: `board-${record.id}`,
      recordId: record.id,
      source: "board",
      type: record.type,
      date: record.date,
      result: record.result,
      white: record.white,
      black: record.black,
      whiteType: record.whiteType,
      blackType: record.blackType,
      movesCount: record.movesCount,
      pgn: record.pgn,
      variant: record.variant,
      timeControl: record.timeControl,
      engineName: record.engineName,
      botName: record.botName,
      accuracy: record.accuracy,
      whiteAccuracy: record.whiteAccuracy,
      blackAccuracy: record.blackAccuracy,
    }));
  }, [gameHistory]);

  const allItems = useMemo(() => {
    const combined = [...botItems, ...boardItems];
    return combined.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [botItems, boardItems]);

  const summary = useMemo(() => {
    const total = allItems.length;
    const bots = allItems.filter((item) => item.type === "bot").length;
    const engines = allItems.filter((item) => item.type === "engine").length;
    const humans = allItems.filter((item) => item.type === "human").length;
    const analyzed = allItems.filter(
      (item) =>
        item.accuracy !== undefined ||
        item.whiteAccuracy !== undefined ||
        item.blackAccuracy !== undefined,
    ).length;

    return { total, bots, engines, humans, analyzed };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const from = filters.from ? dayjs(filters.from).startOf("day").valueOf() : 0;
    const to = filters.to
      ? dayjs(filters.to).endOf("day").valueOf()
      : Number.POSITIVE_INFINITY;

    return allItems.filter((item) => {
      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (filters.result !== "all" && item.result !== filters.result)
        return false;

      const dateValue = new Date(item.date).getTime();
      if (dateValue < from || dateValue > to) return false;

      if (search.length > 0) {
        const haystack = [
          item.white,
          item.black,
          item.engineName,
          item.botName,
          item.variant,
          item.gameMode,
          item.timeControl,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [allItems, filters]);

  const resetFilters = () => setFilters(emptyFilters);

  const handleBack = useCallback(() => {
    if (!activeTab) return;
    setTabs((prev) => {
      const tab = prev.find((item) => item.value === activeTab);
      if (!tab) return prev;
      tab.name = t("Tab.NewTab");
      tab.type = "new";
      return [...prev];
    });
    navigate({ to: "/" });
  }, [activeTab, navigate, setTabs, t]);

  const selectedItems = useMemo(
    () => filteredItems.filter((item) => selected.has(item.id)),
    [filteredItems, selected],
  );

  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selected.has(item.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allSelected) {
        const next = new Set(prev);
        for (const item of filteredItems) {
          next.delete(item.id);
        }
        return next;
      }
      const next = new Set(prev);
      for (const item of filteredItems) {
        next.add(item.id);
      }
      return next;
    });
  };

  const toggleSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleAnalyze = (item: HistoryItem) => {
    if (!item.pgn) return;
    createTab({
      tab: {
        name: `${item.white} ${t("Bots.Game.VsPrefix")} ${item.black}`,
        type: "analysis",
      },
      setTabs,
      setActiveTab,
      pgn: item.pgn,
    });
    navigate({ to: "/" });
  };

  const handleDelete = (item: HistoryItem) => {
    if (item.source === "bot") {
      deleteBotGame(item.recordId);
      setBotHistoryTrigger((prev) => prev + 1);
      return;
    }
    deleteGameHistory(item.recordId);
    setGameHistoryTrigger((prev) => prev + 1);
  };

  const escapeCsvValue = (value: string) => {
    if (value.includes('"')) {
      value = value.replaceAll('"', '""');
    }
    if (value.includes(",") || value.includes("\n") || value.includes("\r")) {
      return `"${value}"`;
    }
    return value;
  };

  const buildCsv = (items: HistoryItem[]) => {
    const headers = [
      "id",
      "source",
      "type",
      "date",
      "result",
      "white",
      "black",
      "whiteType",
      "blackType",
      "movesCount",
      "engineName",
      "botName",
      "variant",
      "timeControl",
      "accuracy",
      "whiteAccuracy",
      "blackAccuracy",
      "pgn",
    ];

    const rows = items.map((item) => [
      item.recordId,
      item.source,
      item.type,
      item.date,
      item.result,
      item.white,
      item.black,
      item.whiteType,
      item.blackType,
      String(item.movesCount),
      item.engineName ?? "",
      item.botName ?? "",
      item.variant ?? "",
      item.timeControl ?? "",
      item.accuracy !== undefined ? String(item.accuracy) : "",
      item.whiteAccuracy !== undefined ? String(item.whiteAccuracy) : "",
      item.blackAccuracy !== undefined ? String(item.blackAccuracy) : "",
      item.pgn ?? "",
    ]);

    return [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");
  };

  const parseCsv = (content: string): string[][] => {
    const rows: string[][] = [];
    let current: string[] = [];
    let value = "";
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        current.push(value);
        value = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (value.length > 0 || current.length > 0) {
          current.push(value);
          rows.push(current);
        }
        current = [];
        value = "";
        continue;
      }

      value += char;
    }

    if (value.length > 0 || current.length > 0) {
      current.push(value);
      rows.push(current);
    }

    return rows;
  };

  const normalizeResult = (value: string): HistoryItem["result"] => {
    if (value === "1-0" || value === "0-1" || value === "1/2-1/2" || value === "*") {
      return value;
    }
    return "*";
  };

  const normalizeType = (value: string): HistoryType => {
    if (value === "bot" || value === "engine" || value === "human") return value;
    return "human";
  };

  const normalizeParticipant = (
    value: string,
  ): "human" | "engine" | "bot" => {
    if (value === "bot" || value === "engine" || value === "human") return value;
    return "human";
  };

  const exportCsv = async (items: HistoryItem[], defaultName: string) => {
    const file = await save({ defaultPath: defaultName });
    if (!file) return;
    await writeTextFile(file, buildCsv(items));
  };

  const exportPgn = async (item: HistoryItem) => {
    if (!item.pgn) return;
    const safeName = `${item.white}_${t("Bots.Game.VsPrefix")}_${item.black}`
      .replaceAll(" ", "_")
      .replaceAll("/", "-");
    const file = await save({ defaultPath: `${safeName}.pgn` });
    if (!file) return;
    await writeTextFile(file, item.pgn);
  };

  const importCsv = async () => {
    const file = await open({
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (!file || Array.isArray(file)) return;

    const content = await readTextFile(file);
    const rows = parseCsv(content);
    if (rows.length <= 1) return;

    const [headerRow, ...dataRows] = rows;
    const headerMap = new Map<string, number>();
    headerRow.forEach((header, index) => {
      headerMap.set(header.trim(), index);
    });

    const records: GameHistoryRecord[] = [];

    for (const row of dataRows) {
      const getValue = (key: string) => {
        const idx = headerMap.get(key);
        return idx !== undefined ? row[idx] ?? "" : "";
      };

      const date = getValue("date") || new Date().toISOString();
      const record: GameHistoryRecord = {
        id: getValue("id") || genID(),
        source: getValue("source") === "bot" ? "bot" : "board",
        type: normalizeType(getValue("type")),
        date,
        result: normalizeResult(getValue("result")),
        white: getValue("white") || t("Common.Unknown"),
        black: getValue("black") || t("Common.Unknown"),
        whiteType: normalizeParticipant(getValue("whiteType")),
        blackType: normalizeParticipant(getValue("blackType")),
        movesCount: Number.parseInt(getValue("movesCount") || "0", 10),
        pgn: getValue("pgn") || undefined,
        variant: getValue("variant") || undefined,
        timeControl: getValue("timeControl") || undefined,
        engineName: getValue("engineName") || undefined,
        botName: getValue("botName") || undefined,
        accuracy: getValue("accuracy")
          ? Number.parseFloat(getValue("accuracy"))
          : undefined,
        whiteAccuracy: getValue("whiteAccuracy")
          ? Number.parseFloat(getValue("whiteAccuracy"))
          : undefined,
        blackAccuracy: getValue("blackAccuracy")
          ? Number.parseFloat(getValue("blackAccuracy"))
          : undefined,
      };
      records.push(record);
    }

    addGameHistory(records);
    setGameHistoryTrigger((prev) => prev + 1);
  };

  const renderAccuracy = (item: HistoryItem) => {
    if (item.accuracy !== undefined) {
      return `${item.accuracy}%`;
    }

    if (item.whiteAccuracy !== undefined || item.blackAccuracy !== undefined) {
      const whiteText =
        item.whiteAccuracy !== undefined
          ? `${item.whiteAccuracy.toFixed(1)}%`
          : "--";
      const blackText =
        item.blackAccuracy !== undefined
          ? `${item.blackAccuracy.toFixed(1)}%`
          : "--";
      return `${t("GameHistory.Accuracy.White")} ${whiteText} / ${t(
        "GameHistory.Accuracy.Black",
      )} ${blackText}`;
    }

    return t("GameHistory.Accuracy.Unavailable");
  };

  const formatTimeControl = (value?: string) => {
    if (!value) return t("Common.Unknown");
    if (value === "none") return t("GameHistory.TimeControl.Unlimited");
    return value;
  };

  const formatVariant = (value?: string) => {
    if (!value || value === "chess") return t("GameHistory.Variant.Standard");
    if (value === "chess960" || value === "Chess960")
      return t("Home.Card.Chess960.Title");
    return value;
  };

  const resolveLocale = (locale: string) => {
    const normalized = locale.replace("_", "-");
    try {
      // Ensure the locale is supported and well-formed
      return Intl.DateTimeFormat(normalized).resolvedOptions().locale;
    } catch {
      const short = normalized.split("-")[0];
      try {
        return Intl.DateTimeFormat(short).resolvedOptions().locale;
      } catch {
        return undefined;
      }
    }
  };

  const formatDateParts = (value: string) => {
    const date = new Date(value);
    const locale = resolveLocale(i18n.language);
    return {
      dateLabel: date.toLocaleDateString(locale),
      timeLabel: date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <ScrollArea h="100%" px="md" pt="md" pb="xl" offsetScrollbars>
      <Stack gap="md" className={classes.page}>
        <Paper className={classes.headerBar} radius="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group className={classes.headerLeft} gap="sm" align="center" wrap="wrap">
              <Button
                size="sm"
                variant="light"
                leftSection={<IconArrowBackUp size={16} />}
                onClick={handleBack}
              >
                {t("Common.Back")}
              </Button>
              <Stack gap={2} className={classes.headerInfo}>
                <Group gap="xs">
                  <IconHistory size={20} />
                  <Text className={classes.headerTitle}>
                    {t("GameHistory.Title")}
                  </Text>
                </Group>
                <Text className={classes.headerSubtitle}>
                  {t("GameHistory.Desc")}
                </Text>
              </Stack>
            </Group>
            <Stack gap="xs" className={classes.headerRight}>
              <SegmentedControl
                className={classes.typeSegment}
                size="sm"
                radius="md"
                value={filters.type}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: (value as Filters["type"]) ?? "all",
                  }))
                }
                data={[
                  { value: "all", label: t("GameHistory.Filters.Type.All") },
                  { value: "bot", label: t("GameHistory.Filters.Type.Bot") },
                  { value: "engine", label: t("GameHistory.Filters.Type.Engine") },
                  { value: "human", label: t("GameHistory.Filters.Type.Human") },
                ]}
              />
              <Group gap="xs" className={classes.summaryChips}>
                <Badge variant="light" color="blue">
                  {t("GameHistory.Summary.Total")}: {summary.total}
                </Badge>
                <Badge variant="light" color="cyan">
                  {t("GameHistory.Summary.Bots")}: {summary.bots}
                </Badge>
                <Badge variant="light" color="indigo">
                  {t("GameHistory.Summary.Engine")}: {summary.engines}
                </Badge>
                <Badge variant="light" color="blue">
                  {t("GameHistory.Summary.Human")}: {summary.humans}
                </Badge>
                <Badge variant="light" color="blue">
                  {t("GameHistory.Summary.Analyzed")}: {summary.analyzed}
                </Badge>
              </Group>
            </Stack>
          </Group>
        </Paper>

        <Paper className={classes.sectionCard} radius="lg">
          <Stack gap="xs">
            <Text fw={600}>{t("GameHistory.Filters.Title")}</Text>
            <Text size="sm" c="dimmed">
              {t("GameHistory.Filters.Desc")}
            </Text>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mt="md" spacing="sm">
            <TextInput
              size="sm"
              leftSection={<IconSearch size={16} />}
              label={t("GameHistory.Filters.Search.Label")}
              placeholder={t("GameHistory.Filters.Search.Placeholder")}
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.currentTarget.value,
                }))
              }
            />
            <Select
              size="sm"
              label={t("GameHistory.Filters.Result.Label")}
              value={filters.result}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  result: (value as Filters["result"]) ?? "all",
                }))
              }
              data={[
                { value: "all", label: t("GameHistory.Filters.Result.All") },
                { value: "1-0", label: t("GameHistory.Result.White") },
                { value: "0-1", label: t("GameHistory.Result.Black") },
                { value: "1/2-1/2", label: t("GameHistory.Result.Draw") },
              ]}
            />
            <DateInput
              size="sm"
              valueFormat="YYYY-MM-DD"
              label={t("GameHistory.Filters.DateFrom")}
              placeholder={t("GameHistory.Filters.DatePlaceholder")}
              value={filters.from}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, from: value }))
              }
              clearable
            />
            <DateInput
              size="sm"
              valueFormat="YYYY-MM-DD"
              label={t("GameHistory.Filters.DateTo")}
              placeholder={t("GameHistory.Filters.DatePlaceholder")}
              value={filters.to}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, to: value }))
              }
              clearable
            />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button size="sm" variant="default" onClick={resetFilters}>
              {t("GameHistory.Filters.Reset")}
            </Button>
          </Group>
        </Paper>

        <Paper className={classes.sectionCard} radius="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap">
              <Stack gap={2}>
                <Text fw={600}>{t("GameHistory.List.Title")}</Text>
                <Text size="sm" c="dimmed">
                  {t("GameHistory.List.Count", {
                    count: filteredItems.length,
                  })}
                </Text>
              </Stack>
            </Group>

            <div className={classes.listToolbar}>
              <Group gap="sm" wrap="wrap">
                <Checkbox
                  size="sm"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  label={t("GameHistory.SelectAll")}
                />
                <Text size="sm" c="dimmed">
                  {t("GameHistory.SelectedCount", {
                    count: selectedItems.length,
                  })}
                </Text>
              </Group>
              <Group gap="xs" wrap="wrap">
                <Tooltip label={t("GameHistory.Export.Selected")}>
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() =>
                      exportCsv(selectedItems, "games_selected.csv")
                    }
                    disabled={selectedItems.length === 0}
                  >
                    <IconFileExport size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t("GameHistory.Export.All")}>
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => exportCsv(allItems, "games_all.csv")}
                    disabled={allItems.length === 0}
                  >
                    <IconFileExport size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={t("GameHistory.Import.Csv")}>
                  <ActionIcon variant="light" size="lg" onClick={importCsv}>
                    <IconFileImport size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </div>

            {filteredItems.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">{t("GameHistory.Empty")}</Text>
              </Center>
            ) : (
              <Stack gap="md">
                {filteredItems.map((item) => {
                  const hasAccuracy =
                    item.accuracy !== undefined ||
                    item.whiteAccuracy !== undefined ||
                    item.blackAccuracy !== undefined;

                  const typeIcon =
                    item.type === "bot" ? (
                      <IconRobot size={16} />
                    ) : item.type === "engine" ? (
                      <IconCpu size={16} />
                    ) : (
                      <IconUser size={16} />
                    );

                  const { dateLabel, timeLabel } = formatDateParts(item.date);

                  const detailItems = [
                    {
                      label: t("GameHistory.Fields.Moves"),
                      value: item.movesCount,
                    },
                    {
                      label: t("GameHistory.Fields.Accuracy"),
                      value: renderAccuracy(item),
                    },
                    {
                      label: t("GameHistory.Fields.Variant"),
                      value: formatVariant(item.variant),
                    },
                    {
                      label: t("GameHistory.Fields.TimeControl"),
                      value: formatTimeControl(item.timeControl),
                    },
                    {
                      label: t("GameHistory.Fields.Engine"),
                      value:
                        item.engineName ??
                        t("GameHistory.Fields.NotApplicable"),
                    },
                    {
                      label: t("GameHistory.Fields.Bot"),
                      value:
                        item.botName ?? t("GameHistory.Fields.NotApplicable"),
                    },
                  ];

                  return (
                    <Paper
                      key={item.id}
                      className={classes.historyCard}
                      style={
                        {
                          "--result-color": getResultTone(item.result),
                        } as CSSProperties
                      }
                      radius="lg"
                    >
                      <div className={classes.accent} />
                      <div className={classes.historyCardContent}>
                        <Group
                          justify="space-between"
                          align="flex-start"
                          wrap="wrap"
                        >
                          <Group gap="sm" align="flex-start" wrap="wrap">
                            <Checkbox
                              size="sm"
                              checked={selected.has(item.id)}
                              onChange={() => toggleSelected(item.id)}
                            />
                            <Stack gap={6}>
                              <Group gap="xs" className={classes.playerRow}>
                                <Text size="sm" className={classes.playerName}>
                                  {item.white}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {t("Bots.Game.VsPrefix")}
                                </Text>
                                <Text size="sm" className={classes.playerName}>
                                  {item.black}
                                </Text>
                              </Group>
                              <Group gap="xs" className={classes.badgesRow}>
                                <Badge
                                  size="sm"
                                  variant="filled"
                                  color={getResultColor(item.result)}
                                >
                                  {getResultLabel(item.result, t)}
                                </Badge>
                                <Badge
                                  size="sm"
                                  variant="light"
                                  color={
                                    item.type === "bot"
                                      ? "blue"
                                      : item.type === "engine"
                                        ? "indigo"
                                        : "cyan"
                                  }
                                  leftSection={typeIcon}
                                >
                                  {item.type === "bot"
                                    ? t("GameHistory.Filters.Type.Bot")
                                    : item.type === "engine"
                                      ? t("GameHistory.Filters.Type.Engine")
                                      : t("GameHistory.Filters.Type.Human")}
                                </Badge>
                                {hasAccuracy && (
                                  <Badge size="sm" variant="light" color="blue">
                                    {t("GameHistory.Badge.Analyzed")}
                                  </Badge>
                                )}
                              </Group>
                            </Stack>
                          </Group>
                          <Stack gap={4} align="flex-end" className={classes.metaStack}>
                            <Text size="xs" c="dimmed" className={classes.metaTime}>
                              {dateLabel}
                            </Text>
                            <Text size="xs" c="dimmed" className={classes.metaTime}>
                              {timeLabel}
                            </Text>
                            <Group gap="xs">
                              {item.pgn && (
                                <>
                                  <Tooltip label={t("GameHistory.Action.Analyze")}>
                                    <ActionIcon
                                      variant="light"
                                      size="lg"
                                      onClick={() => handleAnalyze(item)}
                                    >
                                      <IconZoomCheck size={18} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip
                                    label={t("GameHistory.Action.ExportPgn")}
                                  >
                                    <ActionIcon
                                      variant="light"
                                      size="lg"
                                      onClick={() => exportPgn(item)}
                                    >
                                      <IconFileExport size={18} />
                                    </ActionIcon>
                                  </Tooltip>
                                </>
                              )}
                              <Tooltip label={t("GameHistory.Action.Delete")}>
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  size="lg"
                                  onClick={() => handleDelete(item)}
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Stack>
                        </Group>

                        <Divider my="sm" />

                        <div className={classes.statsGrid}>
                          {detailItems.map((detail) => (
                            <div key={detail.label} className={classes.statCard}>
                              <Text className={classes.statLabel}>
                                {detail.label}
                              </Text>
                              <Text className={classes.statValue}>
                                {detail.value}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </ScrollArea>
  );
}
