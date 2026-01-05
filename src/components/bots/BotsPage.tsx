import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Modal,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChessKing,
  IconCrown,
  IconDice,
  IconPlus,
  IconRobot,
  IconTrophy,
} from "@tabler/icons-react";
import cx from "clsx";
import { useAtom, useAtomValue } from "jotai";
import * as Flags from "mantine-flagpack";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { activeTabAtom, enginesAtom, tabsAtom } from "@/state/atoms";
import type { LocalEngine } from "@/utils/engines";
import { createTab } from "@/utils/tabs";
import * as classes from "./BotsPage.css";
import {
  BOT_CATEGORIES,
  type Bot,
  type BotCategory,
  getAllBots,
  getBotsByCategory,
} from "./botData";
import {
  getEngineOptionsForElo,
  getGoModeForElo,
  getRatingBehavior,
  getRatingDescription,
} from "./engineRating";

// Helper to get Flag component by country code
const flagComponents = Object.entries(Flags).map(([key, value]) => ({
  key: key.replace("Flag", ""),
  component: value,
}));

function getFlag(code: string | string[]) {
  if (Array.isArray(code)) {
    return code.map(
      (c) => flagComponents.find((f) => f.key === c.toUpperCase())?.component,
    );
  }
  return flagComponents.find((f) => f.key === code.toUpperCase())?.component;
}

// Game mode types
type GameMode = "competition" | "friendly" | "assisted" | "custom";
type PlaySide = "white" | "random" | "black";

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

const DEFAULT_CUSTOM_SETTINGS: CustomSettings = {
  botChat: true,
  hints: false,
  evalBar: false,
  threatArrows: false,
  suggestionArrows: false,
  moveFeedback: false,
  showEngine: false,
  takebacks: false,
  timeControl: "none",
  gameType: "chess",
};

// Bot Card Component - Modern premium design
function BotCard({
  bot,
  isSelected,
  onClick,
}: {
  bot: Bot;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isPersian = i18n.language.startsWith("fa");

  const flagData = bot.country ? getFlag(bot.country) : null;

  return (
    <Box
      className={cx(
        classes.card,
        { [classes.cardSelected]: isSelected },
        { [classes.cardGolden]: bot.cardStyle === "golden" },
        {
          [classes.cardGoldenSelected]:
            bot.cardStyle === "golden" && isSelected,
        },
      )}
      component="button"
      type="button"
      onClick={onClick}
    >
      {/* Large Image Container */}
      <div className={classes.cardImageContainer}>
        {bot.image ? (
          <img
            src={bot.image}
            alt={isPersian ? bot.namePersian : bot.nameEnglish}
            className={classes.cardImage}
          />
        ) : (
          <div className={classes.cardPlaceholder}>
            <IconRobot size="1em" stroke={1} />
          </div>
        )}

        {/* Country Flag Badge */}
        {flagData && (
          <div className={classes.flagBadge}>
            {Array.isArray(flagData) ? (
              flagData.map(
                (FlagComponent, index) =>
                  FlagComponent && (
                    <div key={index} className={classes.individualFlag}>
                      <FlagComponent w={24} h={16} />
                    </div>
                  ),
              )
            ) : (
              <div className={classes.individualFlag}>
                {flagData && React.createElement(flagData, { w: 24, h: 16 })}
              </div>
            )}
          </div>
        )}

        {/* Rating Badge */}
        <div
          className={cx(classes.ratingBadge, {
            [classes.ratingBadgeGolden]: bot.cardStyle === "golden",
          })}
        >
          <IconTrophy
            size={14}
            className={cx(classes.ratingIcon, {
              [classes.ratingIconGolden]: bot.cardStyle === "golden",
            })}
          />
          <span>{bot.rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className={classes.cardContent}>
        <h4 className={classes.cardName}>
          {t(bot.nameKey, { defaultValue: isPersian ? bot.namePersian : bot.nameEnglish })}
        </h4>
        <p className={classes.cardDescription}>
          {t(bot.descriptionKey, { defaultValue: isPersian ? bot.descriptionPersian : bot.descriptionEnglish })}
        </p>
        <div
          className={cx(classes.cardLevel, {
            [classes.cardLevelGolden]: bot.cardStyle === "golden",
          })}
        >
          <IconChessKing size={12} />
          <span>{getRatingDescription(bot.rating)}</span>
        </div>
      </div>
    </Box>
  );
}

// Play Side Selector
function PlaySideSelector({
  selected,
  onChange,
}: {
  selected: PlaySide;
  onChange: (side: PlaySide) => void;
}) {
  const { t } = useTranslation();

  const sides: { value: PlaySide; icon: React.ReactNode; label: string }[] = [
    {
      value: "white",
      icon: <IconChessKing size={32} />,
      label: t("Bots.PlaySide.White"),
    },
    {
      value: "random",
      icon: <IconDice size={32} />,
      label: t("Bots.PlaySide.Random"),
    },
    {
      value: "black",
      icon: <IconChessKing size={32} style={{ transform: "scaleX(-1)" }} />,
      label: t("Bots.PlaySide.Black"),
    },
  ];

  return (
    <div className={classes.playSideContainer}>
      {sides.map((side) => (
        <button
          type="button"
          key={side.value}
          className={cx(classes.playSideBtn, {
            [classes.playSideBtnActive]: selected === side.value,
          })}
          onClick={() => onChange(side.value)}
        >
          {side.icon}
          <Text size="sm" fw={500}>
            {side.label}
          </Text>
        </button>
      ))}
    </div>
  );
}

// Mode Button
function ModeButton({
  mode,
  selected,
  onClick,
  crowns,
  title,
  description,
}: {
  mode: GameMode;
  selected: boolean;
  onClick: () => void;
  crowns: number;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className={cx(classes.modeBtn, { [classes.modeBtnActive]: selected })}
      onClick={onClick}
    >
      <div className={classes.modeTitle}>
        <span>{title}</span>
        <Group gap={2}>
          {Array.from({ length: crowns }).map((_, i) => (
            <IconCrown
              key={i}
              size={12}
              color="var(--mantine-color-yellow-6)"
            />
          ))}
        </Group>
      </div>
      <div className={classes.modeDesc}>{description}</div>
    </button>
  );
}

// Custom Settings Panel
function CustomSettingsPanel({
  settings,
  onChange,
}: {
  settings: CustomSettings;
  onChange: (settings: CustomSettings) => void;
}) {
  const { t } = useTranslation();

  const timeControls = [
    { value: "none", label: t("Bots.TimeControl.None") },
    { value: "1min", label: t("Bots.TimeControl.1min") },
    { value: "3min", label: t("Bots.TimeControl.3min") },
    { value: "5min", label: t("Bots.TimeControl.5min") },
    { value: "10min", label: t("Bots.TimeControl.10min") },
    { value: "30min", label: t("Bots.TimeControl.30min") },
  ];

  const gameTypes = [
    { value: "chess", label: t("Bots.GameType.Standard") },
    { value: "chess960", label: t("Bots.GameType.Chess960") },
  ];

  return (
    <Stack gap="xs">
      <SimpleGrid cols={2}>
        <Switch
          label={t("Bots.Custom.BotChat")}
          checked={settings.botChat}
          onChange={(e) =>
            onChange({ ...settings, botChat: e.currentTarget.checked })
          }
        />
        <Switch
          label={t("Bots.Custom.Hints")}
          checked={settings.hints}
          onChange={(e) =>
            onChange({ ...settings, hints: e.currentTarget.checked })
          }
        />
        <Switch
          label={t("Bots.Custom.EvalBar")}
          checked={settings.evalBar}
          onChange={(e) =>
            onChange({ ...settings, evalBar: e.currentTarget.checked })
          }
        />
        <Switch
          label={t("Bots.Custom.Takebacks")}
          checked={settings.takebacks}
          onChange={(e) =>
            onChange({ ...settings, takebacks: e.currentTarget.checked })
          }
        />
      </SimpleGrid>
      <Divider my="xs" />
      <Group grow>
        <Select
          label={t("Bots.Custom.TimeControl")}
          data={timeControls}
          value={settings.timeControl}
          onChange={(v) => onChange({ ...settings, timeControl: v || "none" })}
        />
        <Select
          label={t("Bots.Custom.GameType")}
          data={gameTypes}
          value={settings.gameType}
          onChange={(v) => onChange({ ...settings, gameType: v || "chess" })}
        />
      </Group>
    </Stack>
  );
}

// Bot Settings Panel (shown when bot is selected)
function BotSettingsPanel({
  bot,
  playSide,
  setPlaySide,
  gameMode,
  setGameMode,
  customSettings,
  setCustomSettings,
  selectedEngine,
  setSelectedEngine,
  onStartGame,
}: {
  bot: Bot | null;
  playSide: PlaySide;
  setPlaySide: (side: PlaySide) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  customSettings: CustomSettings;
  setCustomSettings: (settings: CustomSettings) => void;
  selectedEngine: string;
  setSelectedEngine: (path: string) => void;
  onStartGame: () => void | Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const isPersian = i18n.language.startsWith("fa");
  const engines = useAtomValue(enginesAtom).filter(
    (e): e is LocalEngine => e.type === "local",
  );

  if (!bot) {
    return (
      <Text ta="center" c="dimmed">
        {t("Bots.SelectBot")}
      </Text>
    );
  }

  const behavior = getRatingBehavior(bot.rating);
  const flagData = bot.country ? getFlag(bot.country) : null;

  return (
    <ScrollArea h="100%" offsetScrollbars>
      <Stack>
        <Group wrap="nowrap">
          {bot.image ? (
            <img
              src={bot.image}
              alt={isPersian ? bot.namePersian : bot.nameEnglish}
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--mantine-color-dark-5)",
              }}
            >
              <IconRobot size={32} />
            </Box>
          )}
          <Stack gap={4}>
            <Group gap="xs">
              <Title order={4}>
                {t(bot.nameKey, { defaultValue: isPersian ? bot.namePersian : bot.nameEnglish })}
              </Title>
              {flagData && (
                <div className={classes.settingsPanelFlags}>
                  {Array.isArray(flagData) ? (
                    flagData.map(
                      (FlagComponent, index) =>
                        FlagComponent && (
                          <div
                            key={index}
                            className={classes.individualFlagSmall}
                          >
                            <FlagComponent w={20} />
                          </div>
                        ),
                    )
                  ) : (
                    <div className={classes.individualFlagSmall}>
                      {flagData && React.createElement(flagData, { w: 20 })}
                    </div>
                  )}
                </div>
              )}
            </Group>
            <Group gap="xs">
              <Badge variant="light" leftSection={<IconTrophy size={12} />}>
                {bot.rating}
              </Badge>
              <Text size="xs" c="dimmed">
                {getRatingDescription(bot.rating)}
              </Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t(bot.descriptionKey, { defaultValue: isPersian ? bot.descriptionPersian : bot.descriptionEnglish })}
            </Text>
          </Stack>
        </Group>

        <Divider label={t("Bots.Setup.PlayAs")} />
        <PlaySideSelector selected={playSide} onChange={setPlaySide} />

        <Divider label={t("Bots.Setup.GameMode")} />
        <div className={classes.modeGrid}>
          <ModeButton
            mode="competition"
            selected={gameMode === "competition"}
            onClick={() => setGameMode("competition")}
            crowns={3}
            title={t("Bots.Setup.Mode.Competition")}
            description={t("Bots.Setup.Mode.Competition.Desc")}
          />
          <ModeButton
            mode="friendly"
            selected={gameMode === "friendly"}
            onClick={() => setGameMode("friendly")}
            crowns={2}
            title={t("Bots.Setup.Mode.Friendly")}
            description={t("Bots.Setup.Mode.Friendly.Desc")}
          />
          <ModeButton
            mode="assisted"
            selected={gameMode === "assisted"}
            onClick={() => setGameMode("assisted")}
            crowns={1}
            title={t("Bots.Setup.Mode.Assisted")}
            description={t("Bots.Setup.Mode.Assisted.Desc")}
          />
          <ModeButton
            mode="custom"
            selected={gameMode === "custom"}
            onClick={() => setGameMode("custom")}
            crowns={3}
            title={t("Bots.Setup.Mode.Custom")}
            description={t("Bots.Setup.Mode.Custom.Desc")}
          />
        </div>

        <Collapse in={gameMode === "custom"}>
          <Stack gap="xs">
            <Divider label={t("Bots.Setup.CustomSettings")} />
            <CustomSettingsPanel
              settings={customSettings}
              onChange={setCustomSettings}
            />
          </Stack>
        </Collapse>

        {engines.length > 0 && (
          <>
            <Divider label={t("Bots.Setup.SelectEngine")} />
            <Select
              data={engines.map((e) => ({ value: e.path, label: e.name }))}
              value={selectedEngine}
              onChange={(v) => setSelectedEngine(v || "")}
            />
          </>
        )}

        <Button
          size="md"
          mt="md"
          onClick={onStartGame}
          disabled={engines.length === 0}
        >
          {t("Bots.Setup.StartGame")}
        </Button>

        {engines.length === 0 && (
          <Text size="sm" c="red" ta="center">
            {t("Bots.NoEngine")}
          </Text>
        )}
      </Stack>
    </ScrollArea>
  );
}

// Main BotsPage Component
export default function BotsPage() {
  const { t, i18n } = useTranslation();
  const isPersian = i18n.language.startsWith("fa");
  const [tabs, setTabs] = useAtom(tabsAtom);
  const [, setActiveTab] = useAtom(activeTabAtom);
  const engines = useAtomValue(enginesAtom).filter(
    (e): e is LocalEngine => e.type === "local",
  );

  const [selectedCategory, setSelectedCategory] =
    useState<BotCategory>("Beginner");
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  // Animation state for settings panel
  const [showPanel, setShowPanel] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const prevSelectedBot = useRef<Bot | null>(null);

  // Handle panel animation when bot selection changes
  useEffect(() => {
    if (selectedBot && !prevSelectedBot.current) {
      // Bot was selected - show panel
      setShowPanel(true);
      setIsClosing(false);
    } else if (!selectedBot && prevSelectedBot.current) {
      // Bot was deselected - animate close
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShowPanel(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
    prevSelectedBot.current = selectedBot;
  }, [selectedBot]);

  // Game setup state
  const [playSide, setPlaySide] = useState<PlaySide>("white");
  const [gameMode, setGameMode] = useState<GameMode>("competition");
  const [customSettings, setCustomSettings] = useState<CustomSettings>(
    DEFAULT_CUSTOM_SETTINGS,
  );
  const [selectedEngine, setSelectedEngine] = useState<string>("");

  // Initialize engine selection
  useEffect(() => {
    if (engines.length > 0 && !selectedEngine) {
      setSelectedEngine(engines[0].path);
    }
  }, [engines, selectedEngine]);

  // Get bots for selected category
  const bots = getBotsByCategory(selectedCategory);

  // Start game with selected bot
  const startGame = useCallback(async () => {
    if (!selectedBot) return;

    const engine = engines.find((e) => e.path === selectedEngine) || engines[0];
    if (!engine) return;

    // Store bot info in session storage for the game
    const botGameInfo = {
      bot: selectedBot,
      playSide,
      gameMode,
      customSettings: gameMode === "custom" ? customSettings : null,
      engine: engine.path,
      rating: selectedBot.rating,
      engineOptions: getEngineOptionsForElo(selectedBot.rating),
      goMode: getGoModeForElo(selectedBot.rating),
    };

    // Create a new tab for the bot game
    const botName = isPersian ? selectedBot.namePersian : selectedBot.nameEnglish;
    const id = await createTab({
      tab: {
        name: `${t("Bots.Game.VsPrefix")} ${botName}`,
        type: "play",
      },
      setTabs,
      setActiveTab,
      pgn: "",
    });

    // Store bot info for the game page using the new tab ID
    sessionStorage.setItem(`gameSettings_${id}`, JSON.stringify(botGameInfo));
  }, [
    selectedBot,
    playSide,
    gameMode,
    customSettings,
    engines,
    selectedEngine,
    t,
    i18n,
    setTabs,
    setActiveTab,
  ]);

  return (
    <div className={classes.pageContainer}>
      <div className={classes.pageHeader}>
        <Title order={2}>{t("Bots.Title")}</Title>
      </div>

      <div className={classes.mainContent}>
        {/* Categories Sidebar */}
        <Paper withBorder p="sm" className={classes.categorySidebar}>
          <ScrollArea h="100%">
            <div className={classes.categoryList}>
              {BOT_CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={cx(classes.categoryItem, {
                    [classes.categoryItemActive]: selectedCategory === category,
                  })}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedBot(null);
                  }}
                >
                  <span>{t(`Bots.Category.${category}`)}</span>
                  {category === "Engine" && (
                    <span className={classes.devBadge}>
                      {t("Bots.Category.Engine.Dev")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </Paper>

        {/* Bots Grid - Takes full remaining space */}
        <ScrollArea className={classes.botsGridContainer} offsetScrollbars>
          <SimpleGrid
            cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
            spacing="md"
          >
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                bot={bot}
                isSelected={selectedBot?.id === bot.id}
                onClick={() => setSelectedBot(bot)}
              />
            ))}
            {selectedCategory === "Engine" && (
              <div className={classes.emptyCard}>
                <IconRobot size={48} stroke={1.2} />
                <Text mt={12} ta="center">
                  {t("Bots.Category.Engine.Dev")}
                </Text>
              </div>
            )}
          </SimpleGrid>
        </ScrollArea>

        {/* Settings Panel - Animated open/close */}
        {showPanel && (
          <Paper
            withBorder
            p="md"
            className={cx(classes.settingsPanel, {
              [classes.settingsPanelClosing]: isClosing,
            })}
          >
            <BotSettingsPanel
              bot={selectedBot}
              playSide={playSide}
              setPlaySide={setPlaySide}
              gameMode={gameMode}
              setGameMode={setGameMode}
              customSettings={customSettings}
              setCustomSettings={setCustomSettings}
              selectedEngine={selectedEngine}
              setSelectedEngine={setSelectedEngine}
              onStartGame={startGame}
            />
          </Paper>
        )}
      </div>
    </div>
  );
}
