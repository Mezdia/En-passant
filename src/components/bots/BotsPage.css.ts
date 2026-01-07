import { vars } from "@/styles/theme";
import { keyframes, style } from "@vanilla-extract/css";

// Animations
const slideIn = keyframes({
  "0%": {
    opacity: 0,
    transform: "translateX(30px)",
    maxWidth: "0px",
  },
  "100%": {
    opacity: 1,
    transform: "translateX(0)",
    maxWidth: "350px",
  },
});

const slideOut = keyframes({
  "0%": {
    opacity: 1,
    transform: "translateX(0)",
    maxWidth: "350px",
  },
  "100%": {
    opacity: 0,
    transform: "translateX(30px)",
    maxWidth: "0px",
  },
});

// Modern Bot Card - Better integration with Mantine theme
export const card = style({
  cursor: "pointer",
  borderRadius: vars.radius.lg,
  border: "1px solid",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",

  [vars.lightSelector]: {
    background: vars.colors.white,
    borderColor: vars.colors.gray[2],
    ":hover": {
      borderColor: "var(--mantine-primary-color-filled)",
      boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.15)",
    },
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[7],
    borderColor: vars.colors.dark[4],
    ":hover": {
      borderColor: "var(--mantine-primary-color-filled)",
      boxShadow: "0 12px 28px -8px rgba(0, 0, 0, 0.5)",
    },
  },
});

export const cardSelected = style({
  borderColor: "var(--mantine-primary-color-filled) !important",
  borderWidth: "2px",
  boxShadow: "0 0 0 4px var(--mantine-primary-color-light-hover)",
});

// Large image container at top
export const cardImageContainer = style({
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",

  [vars.lightSelector]: {
    background: vars.colors.gray[0],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[8],
  },
});

export const cardImage = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "opacity 0.4s ease",

  selectors: {
    [`${card}:hover &`]: {
      opacity: 0.9,
    },
  },
});

export const cardPlaceholder = style({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3rem",
  color: "var(--mantine-primary-color-light-color)",
  opacity: 0.6,
});

// YouTube icon badge
export const youtubeBadge = style({
  position: "absolute",
  top: "12px",
  left: "12px",
  borderRadius: "4px",
  overflow: "hidden",
  zIndex: 2,
});

export const youtubeLink = style({
  display: "block",
  transition: "opacity 0.3s ease",

  ":hover": {
    opacity: 0.8,
  },
});

export const youtubeIcon = style({
  width: "24px",
  height: "24px",
  display: "block",
});

// Country flag badge
export const flagBadge = style({
  position: "absolute",
  top: "12px",
  right: "12px",
  borderRadius: "4px",
  overflow: "hidden",
  boxShadow: vars.shadows.md,
  zIndex: 2,
  display: "flex",
  gap: "4px", // Increased gap between flags
});

// Individual flag container with separate border
export const individualFlag = style({
  border: "2px solid rgba(255, 255, 255, 0.9)", // 2px border for each flag
  borderRadius: "2px",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
});

// Flags container for settings panel
export const settingsPanelFlags = style({
  display: "flex",
  gap: "3px", // Slightly smaller gap for settings panel
});

// Individual flag container for settings panel (smaller flags)
export const individualFlagSmall = style({
  border: "2px solid rgba(255, 255, 255, 0.8)", // 2px border for smaller flags
  borderRadius: "2px",
  overflow: "hidden",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
});

// Rating badge
export const ratingBadge = style({
  position: "absolute",
  bottom: "12px",
  left: "12px",
  padding: "6px 14px",
  borderRadius: vars.radius.md,
  fontWeight: 800,
  fontSize: vars.fontSizes.sm,
  display: "flex",
  alignItems: "center",
  gap: "6px",
  backdropFilter: "blur(12px)",
  zIndex: 2,
  boxShadow: vars.shadows.sm,

  [vars.lightSelector]: {
    background: "rgba(255, 255, 255, 0.85)",
    color: vars.colors.dark[8],
  },
  [vars.darkSelector]: {
    background: "rgba(26, 27, 30, 0.85)",
    color: vars.colors.gray[0],
  },
});

export const ratingIcon = style({
  color: "var(--mantine-primary-color-filled)",
});

// Content area
export const cardContent = style({
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flexGrow: 1,
});

export const cardName = style({
  fontWeight: 700,
  fontSize: vars.fontSizes.md,
  lineHeight: 1.2,
  margin: 0,
  color: "inherit",
});

export const cardDescription = style({
  fontSize: vars.fontSizes.xs,
  lineHeight: 1.5,
  margin: 0,
  opacity: 0.7,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export const cardLevel = style({
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.65rem",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginTop: "auto",
  padding: "4px 10px",
  borderRadius: "200px",
  width: "fit-content",

  [vars.lightSelector]: {
    background: "var(--mantine-primary-color-light)",
    color: "var(--mantine-primary-color-light-color)",
  },
  [vars.darkSelector]: {
    background: "var(--mantine-primary-color-light)",
    color: "var(--mantine-primary-color-light-color)",
  },
});

// Category Sidebar
export const categorySidebar = style({
  width: "200px",
  flexShrink: 0,
});

export const categoryList = style({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const categoryItem = style({
  padding: "10px 14px",
  borderRadius: vars.radius.md,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "none",
  background: "transparent",
  width: "100%",
  fontSize: vars.fontSizes.sm,
  fontWeight: 500,
  transition: "all 0.3s ease",
  textAlign: "left",

  [vars.lightSelector]: {
    color: vars.colors.gray[7],
    ":hover": {
      background: vars.colors.gray[0],
      color: vars.colors.dark[8],
    },
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[1],
    ":hover": {
      background: vars.colors.dark[6],
      color: vars.colors.gray[0],
    },
  },
});

export const categoryItemActive = style({
  background: "var(--mantine-primary-color-light) !important",
  color: "var(--mantine-primary-color-light-color) !important",
  fontWeight: 700,
});

export const devBadge = style({
  fontSize: "0.6rem",
  padding: "2px 6px",
  borderRadius: "4px",
  fontWeight: 700,
  textTransform: "uppercase",
  background: vars.colors.yellow[4],
  color: vars.colors.dark[8],
});

// Settings Panel
export const settingsPanel = style({
  width: "350px",
  flexShrink: 0,
  height: "100%",
  animation: `${slideIn} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
  overflow: "hidden",
});

export const settingsPanelClosing = style({
  animation: `${slideOut} 0.3s cubic-bezier(0.4, 0, 1, 1) forwards`,
});

// Layout
export const pageContainer = style({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "0 20px 20px",
  gap: "16px",
});

export const pageHeader = style({
  padding: "12px 0",
});

export const mainContent = style({
  display: "flex",
  flex: 1,
  gap: "20px",
  overflow: "hidden",
});

export const botsGridContainer = style({
  flex: 1,
  minWidth: 0,
});

export const emptyCard = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  borderRadius: vars.radius.lg,
  border: "2px dashed",
  aspectRatio: "1 / 1.3",
  opacity: 0.5,

  [vars.lightSelector]: {
    borderColor: vars.colors.gray[3],
    color: vars.colors.gray[5],
  },
  [vars.darkSelector]: {
    borderColor: vars.colors.dark[4],
    color: vars.colors.dark[3],
  },
});

// Modes & Options
export const playSideContainer = style({
  display: "flex",
  gap: "10px",
});

export const playSideBtn = style({
  flex: 1,
  padding: "16px",
  borderRadius: vars.radius.md,
  border: "2px solid transparent",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  background: "transparent",

  [vars.lightSelector]: {
    background: vars.colors.gray[0],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[8],
  },

  ":hover": {
    borderColor: "var(--mantine-primary-color-filled)",
    boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.1)",
  },
});

export const playSideBtnActive = style({
  borderColor: "var(--mantine-primary-color-filled) !important",
  background: "var(--mantine-primary-color-light) !important",
  color: "var(--mantine-primary-color-light-color) !important",
});

export const modeGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
});

export const modeBtn = style({
  padding: "14px",
  borderRadius: vars.radius.md,
  border: "2px solid transparent",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.3s ease",
  background: "transparent",
  display: "flex",
  flexDirection: "column",
  gap: "4px",

  [vars.lightSelector]: {
    background: vars.colors.gray[0],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[8],
  },

  ":hover": {
    borderColor: "var(--mantine-primary-color-filled)",
  },
});

export const modeBtnActive = style({
  borderColor: "var(--mantine-primary-color-filled) !important",
  background: "var(--mantine-primary-color-light) !important",
});

export const modeTitle = style({
  fontWeight: 700,
  fontSize: vars.fontSizes.sm,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "inherit",
});

export const modeDesc = style({
  fontSize: "0.7rem",
  opacity: 0.7,
});

// Golden Card Styles - Premium appearance for special bots
export const cardGolden = style({
  // Golden gradient border that stays consistent
  border: "2px solid transparent",

  [vars.lightSelector]: {
    background: `
            linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box
        `,
    boxShadow: "0 4px 20px -2px rgba(255, 215, 0, 0.3)",
    ":hover": {
      background: `
                linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #FFD700, #FFA500, #FF8C00) border-box
            `,
      boxShadow: "0 8px 24px -4px rgba(255, 215, 0, 0.5)",
    },
  },
  [vars.darkSelector]: {
    background: `
            linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
            linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box
        `,
    boxShadow: "0 4px 20px -2px rgba(255, 215, 0, 0.4)",
    ":hover": {
      background: `
                linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
                linear-gradient(135deg, #FFD700, #FFA500, #FF8C00) border-box
            `,
      boxShadow: "0 8px 24px -4px rgba(255, 215, 0, 0.6)",
    },
  },
});

export const cardGoldenSelected = style({
  border: "2px solid transparent !important",
  background: `
        linear-gradient(${vars.colors.white}, ${vars.colors.white}) padding-box,
        linear-gradient(135deg, #FFD700, #FFA500, #FF8C00) border-box
    `,
  boxShadow: "0 0 0 4px rgba(255, 215, 0, 0.4) !important",

  [vars.darkSelector]: {
    background: `
            linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
            linear-gradient(135deg, #FFD700, #FFA500, #FF8C00) border-box
        `,
    boxShadow: "0 0 0 4px rgba(255, 215, 0, 0.5) !important",
  },
});

// Golden rating badge
export const ratingBadgeGolden = style({
  background: "linear-gradient(135deg, #FFD700, #FFA500) !important",
  color: vars.colors.dark[8] + " !important",
  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.4) !important",
  fontWeight: 900,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
});

// Golden rating icon
export const ratingIconGolden = style({
  color: vars.colors.dark[8] + " !important",
  filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
});

// Golden level badge
export const cardLevelGolden = style({
  background: "linear-gradient(135deg, #FFD700, #FFA500) !important",
  color: vars.colors.dark[8] + " !important",
  fontWeight: 900,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
  border: "1px solid rgba(255, 215, 0, 0.3)",
});

// YouTube Card Styles - Red gradient for Persian creators
export const cardYoutube = style({
  // Red gradient border
  border: "2px solid transparent",
  position: "relative",

  [vars.lightSelector]: {
    background: `
            linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #FF0000, #DC143C, #FF0000) border-box
        `,
    ":hover": {
      background: `
                linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #FF0000, #DC143C, #B22222) border-box
            `,
      transform: "translateY(-2px)",
    },
  },
  [vars.darkSelector]: {
    background: `
            linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
            linear-gradient(135deg, #FF0000, #DC143C, #FF0000) border-box
        `,
    ":hover": {
      background: `
                linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
                linear-gradient(135deg, #FF0000, #DC143C, #B22222) border-box
            `,
      transform: "translateY(-2px)",
    },
  },

  // Smooth transition
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});

export const cardYoutubeSelected = style({
  border: "2px solid transparent !important",
  background: `
        linear-gradient(${vars.colors.white}, ${vars.colors.white}) padding-box,
        linear-gradient(135deg, #FF0000, #DC143C, #B22222) border-box
    `,
  transform: "translateY(-2px) !important",

  [vars.darkSelector]: {
    background: `
            linear-gradient(${vars.colors.dark[7]}, ${vars.colors.dark[7]}) padding-box,
            linear-gradient(135deg, #FF0000, #DC143C, #B22222) border-box
        `,
  },
});

// YouTube rating badge
export const ratingBadgeYoutube = style({
  background: "linear-gradient(135deg, #FF0000, #DC143C) !important",
  color: vars.colors.white + " !important",
  fontWeight: 900,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
});

// YouTube rating icon
export const ratingIconYoutube = style({
  color: vars.colors.white + " !important",
});

// YouTube level badge
export const cardLevelYoutube = style({
  background: "linear-gradient(135deg, #FF0000, #DC143C) !important",
  color: vars.colors.white + " !important",
  fontWeight: 900,
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
});

// Legacy support (to avoid crashes if components still use them)
export const cardHeader = style({ display: "none" });
export const cardInfo = style({ display: "none" });
export const cardStats = style({ display: "none" });
export const statItem = style({ display: "none" });
export const statLabel = style({ display: "none" });
export const statValue = style({ display: "none" });
