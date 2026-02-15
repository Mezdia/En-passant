import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

// Page layout - clean and professional
export const pageContainer = style({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[0],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[9],
  },
});

// Board area - center content
export const boardArea = style({
  flex: 1,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.spacing.md,
  position: "relative",
});

export const boardShell = style({
  display: "flex",
  alignItems: "stretch",
  gap: vars.spacing.sm,
  height: "min(78vh, 80vw)",
});

export const boardFrame = style({
  width: "min(78vh, 80vw)",
  height: "min(78vh, 80vw)",
  padding: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: "1px solid",
  boxShadow: vars.shadows.md,
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderColor: vars.colors.gray[3],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[5],
  },
});

// Left sidebar - using Paper style like Analysis panel
export const sidebar = style({
  width: "320px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  zIndex: 10,
  borderRight: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderRightColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[8],
    borderRightColor: vars.colors.dark[6],
  },
});

export const sidebarContent = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: vars.spacing.md,
  gap: vars.spacing.md,
  overflowY: "auto",
});

// Bot profile card - clean Paper style
export const botProfile = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: vars.spacing.lg,
  borderRadius: vars.radius.md,
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[6],
  },
});

export const botImage = style({
  width: "64px",
  height: "64px",
  borderRadius: vars.radius.md,
  objectFit: "cover",
  border: "2px solid",
  [vars.lightSelector]: {
    borderColor: vars.colors.gray[3],
  },
  [vars.darkSelector]: {
    borderColor: vars.colors.dark[5],
  },
});

// Evaluation bar - minimal design
export const evalBarContainer = style({
  position: "relative",
  height: "100%",
  width: "16px",
  border: "1px solid",
  borderRadius: vars.radius.sm,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  zIndex: 5,
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[2],
    borderColor: vars.colors.gray[3],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[6],
    borderColor: vars.colors.dark[5],
  },
});

export const evalBarFill = style({
  width: "100%",
  transition: "height 0.3s ease-out",
});

export const evalBarLabels = style({
  position: "absolute",
  bottom: vars.spacing.xs,
  left: 0,
  right: 0,
  textAlign: "center",
  fontSize: "10px",
  fontWeight: 600,
  [vars.lightSelector]: {
    color: vars.colors.dark[7],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});

// Time control display - clean cards like Analysis panel
export const timeControlDisplay = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.xs,
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[6],
  },
});

export const timeDisplay = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  border: "1px solid transparent",
  transition: "background-color 0.2s ease",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[1],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[6],
  },
});

export const activeTime = style({
  backgroundColor: "var(--mantine-primary-color-light)",
});

export const timeLabel = style({
  fontSize: vars.fontSizes.sm,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
});

export const timeValue = style({
  fontSize: vars.fontSizes.md,
  fontWeight: 700,
  fontFamily: "monospace",
  [vars.lightSelector]: {
    color: vars.colors.dark[8],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});

// Chat container - clean Paper style
export const chatContainer = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  borderRadius: vars.radius.md,
  overflow: "hidden",
  maxHeight: "200px",
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[6],
  },
});

export const chatMessages = style({
  flex: 1,
  overflowY: "auto",
  padding: vars.spacing.sm,
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.xs,
});

export const messageBubble = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  maxWidth: "90%",
  fontSize: vars.fontSizes.sm,
  lineHeight: 1.4,
});

export const botMessage = style({
  alignSelf: "flex-start",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[1],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[6],
  },
});

export const systemMessage = style({
  alignSelf: "center",
  backgroundColor: "transparent",
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[2],
  },
  fontSize: vars.fontSizes.xs,
  fontStyle: "italic",
});

// Move history sidebar - right side, clean like Analysis panel
export const moveHistorySidebar = style({
  width: "220px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  zIndex: 10,
  borderLeft: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderLeftColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[8],
    borderLeftColor: vars.colors.dark[6],
  },
});

export const moveHistoryHeader = style({
  padding: vars.spacing.md,
  borderBottom: "1px solid",
  [vars.lightSelector]: {
    borderBottomColor: vars.colors.gray[2],
    backgroundColor: vars.colors.gray[0],
  },
  [vars.darkSelector]: {
    borderBottomColor: vars.colors.dark[6],
    backgroundColor: vars.colors.dark[7],
  },
});

export const moveHistoryContent = style({
  flex: 1,
  overflowY: "auto",
  padding: vars.spacing.sm,
});

export const moveList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.xs,
});

export const moveItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
  fontSize: vars.fontSizes.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  transition: "background-color 0.2s ease",

  selectors: {
    "&:hover": {
      [vars.lightSelector]: {
        backgroundColor: vars.colors.gray[1],
      },
      [vars.darkSelector]: {
        backgroundColor: vars.colors.dark[6],
      },
    },
  },
});

export const moveNumber = style({
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[2],
  },
  fontSize: vars.fontSizes.xs,
  minWidth: "24px",
  fontWeight: 500,
});

export const moveWhite = style({
  [vars.lightSelector]: {
    color: vars.colors.gray[7],
  },
  [vars.darkSelector]: {
    color: vars.colors.gray[3],
  },
  fontWeight: 500,
});

export const moveBlack = style({
  [vars.lightSelector]: {
    color: vars.colors.dark[9],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
  fontWeight: 500,
});

export const moveWithSymbol = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
});

export const pieceSymbol = style({
  fontSize: vars.fontSizes.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "16px",
  minHeight: "16px",
});

export const movePairItem = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
  fontSize: vars.fontSizes.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  transition: "background-color 0.2s ease",

  selectors: {
    "&:hover": {
      [vars.lightSelector]: {
        backgroundColor: vars.colors.gray[1],
      },
      [vars.darkSelector]: {
        backgroundColor: vars.colors.dark[6],
      },
    },
  },
});

export const movePairContent = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.sm,
  flexWrap: "wrap",
});

export const moveSeparator = style({
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[3],
  },
  fontSize: vars.fontSizes.sm,
  margin: "0 4px",
});

// Move feedback badge - minimal
export const moveFeedbackBadge = style({
  marginTop: vars.spacing.sm,
});

// Game result overlay - clean modal like professional apps
export const gameResultOverlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
});

export const gameResultCard = style({
  borderRadius: vars.radius.lg,
  padding: vars.spacing.xl,
  textAlign: "center",
  maxWidth: "480px",
  width: "90%",
  boxShadow: vars.shadows.xl,
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[8],
    borderColor: vars.colors.dark[6],
  },
});

export const gameResultTitle = style({
  fontSize: vars.fontSizes["2xl"],
  fontWeight: 700,
  marginBottom: vars.spacing.sm,
});

export const gameResultWin = style({
  color: vars.colors.green[5],
});

export const gameResultLoss = style({
  color: vars.colors.red[5],
});

export const gameResultDraw = style({
  color: vars.colors.yellow[5],
});

export const gameResultSubtitle = style({
  fontSize: vars.fontSizes.md,
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[2],
  },
  marginBottom: vars.spacing.xl,
});

// Stats grid - clean and organized
export const gameResultStats = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: vars.spacing.md,
  marginBottom: vars.spacing.xl,
});

export const gameResultStat = style({
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[0],
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[6],
  },
});

export const gameResultStatLabel = style({
  fontSize: vars.fontSizes.xs,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: 600,
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[2],
  },
});

export const gameResultStatValue = style({
  fontSize: vars.fontSizes.lg,
  fontWeight: 700,
  marginTop: vars.spacing.xs,
  [vars.lightSelector]: {
    color: vars.colors.dark[8],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});

// Quality stats - clean flex layout
export const qualityStats = style({
  display: "flex",
  justifyContent: "center",
  gap: vars.spacing.lg,
  marginBottom: vars.spacing.xl,
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
  border: "1px solid",
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[0],
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[7],
    borderColor: vars.colors.dark[6],
  },
});

export const qualityStat = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.spacing.xs,
});

export const qualityIcon = style({
  fontSize: vars.fontSizes.lg,
});

export const qualityCount = style({
  fontSize: vars.fontSizes.md,
  fontWeight: 700,
  [vars.lightSelector]: {
    color: vars.colors.dark[8],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});

// Game result actions - Mantine Button style
export const gameResultActions = style({
  display: "flex",
  gap: vars.spacing.md,
  justifyContent: "center",
  flexWrap: "wrap",
});

export const gameResultButton = style({
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  borderRadius: vars.radius.md,
  fontWeight: 600,
  fontSize: vars.fontSizes.sm,
  border: "1px solid transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.sm,

  selectors: {
    "&:hover": {
      opacity: 0.9,
    },
    "&:active": {
      transform: "scale(0.98)",
    },
  },
});

export const gameResultPrimaryButton = style([
  gameResultButton,
  {
    backgroundColor: "var(--mantine-primary-color-filled)",
    color: "var(--mantine-primary-color-contrast)",

    selectors: {
      "&:hover": {
        backgroundColor: "var(--mantine-primary-color-filled-hover)",
      },
    },
  },
]);

export const gameResultSecondaryButton = style([
  gameResultButton,
  {
    borderColor: vars.colors.dark[5],

    selectors: {
      "&:hover": {
        backgroundColor: vars.colors.dark[5],
        borderColor: vars.colors.dark[4],
      },
    },
  },
]);

// Icon button base - clean like Mantine ActionIcon
export const iconButton = style({
  width: "36px",
  height: "36px",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radius.sm,
  transition: "all 0.15s ease",
  cursor: "pointer",
  border: "1px solid transparent",
  backgroundColor: "transparent",

  selectors: {
    "&:hover": {
      backgroundColor: vars.colors.dark[6],
    },
    "&:active": {
      transform: "scale(0.95)",
    },
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed",
    },
  },
});

// Game controls container - Paper style
export const gameControlsContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.sm,
  padding: vars.spacing.md,
  backgroundColor: vars.colors.dark[7],
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.colors.dark[6]}`,
});

export const gameControlsTitle = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  color: vars.colors.dark[2],
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

export const gameControlsRow = style({
  display: "flex",
  gap: vars.spacing.xs,
  flexWrap: "wrap",
  justifyContent: "flex-start",
});

export const gameControlButton = style([
  iconButton,
  {
    backgroundColor: vars.colors.dark[6],
    borderColor: vars.colors.dark[5],
    color: vars.colors.dark[1],

    selectors: {
      "&:hover": {
        backgroundColor: vars.colors.dark[5],
        color: vars.colors.white,
        borderColor: vars.colors.dark[4],
      },
      "&:disabled": {
        opacity: 0.3,
        cursor: "not-allowed",
        transform: "none",
      },
    },
  },
]);

export const gameControlButtonDanger = style([
  gameControlButton,
  {
    selectors: {
      "&:hover": {
        backgroundColor: vars.colors.red[9],
        color: vars.colors.red[1],
        borderColor: vars.colors.red[7],
      },
    },
  },
]);

export const gameControlButtonPrimary = style([
  gameControlButton,
  {
    selectors: {
      "&:hover": {
        backgroundColor: vars.colors.blue[9],
        color: vars.colors.blue[1],
        borderColor: vars.colors.blue[7],
      },
    },
  },
]);

// Thinking indicator - clean minimal
export const thinkingIndicator = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.sm,
  padding: vars.spacing.sm,
  backgroundColor: vars.colors.dark[7],
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.colors.dark[6]}`,
});

export const thinkingDots = style({
  display: "flex",
  gap: "3px",
});

export const thinkingDot = style({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "var(--mantine-primary-color-filled)",
});

// Turn indicator - simple badge
export const turnIndicator = style({
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

export const turnIndicatorPlayer = style([
  turnIndicator,
  {
    backgroundColor: vars.colors.blue[9],
    color: vars.colors.blue[1],
  },
]);

export const turnIndicatorBot = style([
  turnIndicator,
  {
    backgroundColor: vars.colors.orange[9],
    color: vars.colors.orange[1],
  },
]);

// Confetti - minimal
export const winConfetti = style({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  pointerEvents: "none",
  zIndex: 1001,
});

export const confettiPiece = style({
  position: "absolute",
  width: "8px",
  height: "8px",
  backgroundColor: vars.colors.green[5],
  opacity: 0,
});

// Player info section - clean card style
export const playerInfo = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.sm,
  padding: vars.spacing.md,
  backgroundColor: vars.colors.dark[7],
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.colors.dark[6]}`,
});

export const playerAvatar = style({
  width: "40px",
  height: "40px",
  borderRadius: vars.radius.sm,
  backgroundColor: vars.colors.dark[6],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const playerDetails = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.xs,
});

export const playerName = style({
  fontSize: vars.fontSizes.sm,
  fontWeight: 600,
  color: vars.colors.white,
});

export const playerRating = style({
  fontSize: vars.fontSizes.xs,
  color: vars.colors.dark[2],
});

// Status indicators
export const statusIndicator = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.spacing.xs,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
});

export const statusOnline = style({
  backgroundColor: vars.colors.green[9],
  color: vars.colors.green[1],
});

export const statusOffline = style({
  backgroundColor: vars.colors.gray[7],
  color: vars.colors.gray[2],
});
