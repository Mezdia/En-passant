import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const page = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.md,
});

export const headerBar = style({
  borderRadius: vars.radius.lg,
  border: "1px solid",
  padding: `${vars.spacing.sm} ${vars.spacing.md}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing.md,
  flexWrap: "wrap",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  [vars.lightSelector]: {
    background: vars.colors.white,
    borderColor: vars.colors.gray[2],
    boxShadow: "0 8px 20px -16px rgba(0, 0, 0, 0.25)",
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[7],
    borderColor: vars.colors.dark[5],
    boxShadow: "0 10px 24px -18px rgba(0, 0, 0, 0.8)",
  },
});

export const headerLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.sm,
  minWidth: 0,
  flex: 1,
});

export const headerInfo = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
  minWidth: 0,
});

export const headerTitle = style({
  fontWeight: 700,
  fontSize: "1.05rem",
  letterSpacing: "0.2px",
});

export const headerSubtitle = style({
  fontSize: vars.fontSizes.xs,
  opacity: 0.7,
});

export const headerRight = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.xs,
  alignItems: "flex-end",
});

export const typeSegment = style({
  width: "min(420px, 100%)",
});

export const summaryChips = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
  flexWrap: "wrap",
});

export const sectionCard = style({
  borderRadius: vars.radius.lg,
  border: "1px solid",
  padding: vars.spacing.md,
  [vars.lightSelector]: {
    background: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[7],
    borderColor: vars.colors.dark[5],
  },
});

export const listToolbar = style({
  borderRadius: vars.radius.md,
  border: "1px solid",
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing.sm,
  flexWrap: "wrap",
  [vars.lightSelector]: {
    background: vars.colors.gray[0],
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[6],
    borderColor: vars.colors.dark[4],
  },
});

export const historyCard = style({
  position: "relative",
  overflow: "hidden",
  borderRadius: vars.radius.lg,
  border: "1px solid",
  [vars.lightSelector]: {
    background: vars.colors.white,
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[7],
    borderColor: vars.colors.dark[5],
  },
});

export const historyCardContent = style({
  padding: vars.spacing.md,
  paddingInlineStart: `calc(${vars.spacing.md} + 0.5rem)`,
});

export const accent = style({
  position: "absolute",
  insetBlock: 0,
  insetInlineStart: 0,
  width: "0.35rem",
  background: "var(--result-color)",
  boxShadow: "0 0 16px color-mix(in srgb, var(--result-color) 40%, transparent)",
});

export const playerRow = style({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  flexWrap: "wrap",
});

export const playerName = style({
  fontWeight: 600,
});

export const badgesRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.spacing.xs,
  flexWrap: "wrap",
});

export const metaStack = style({
  alignItems: "flex-end",
});

export const metaTime = style({
  fontSize: vars.fontSizes.xs,
  opacity: 0.7,
});

export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: vars.spacing.sm,
});

export const statCard = style({
  borderRadius: vars.radius.md,
  border: "1px solid",
  padding: "0.6rem 0.8rem",
  minHeight: "3.25rem",
  [vars.lightSelector]: {
    background: vars.colors.gray[0],
    borderColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    background: vars.colors.dark[6],
    borderColor: vars.colors.dark[4],
  },
});

export const statLabel = style({
  fontSize: vars.fontSizes.xs,
  opacity: 0.7,
});

export const statValue = style({
  fontSize: vars.fontSizes.sm,
  fontWeight: 600,
});
