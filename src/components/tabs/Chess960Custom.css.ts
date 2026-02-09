import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const page = style({
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.sm,
  padding: vars.spacing.sm,
  overflow: "hidden",
  backgroundColor: "transparent",
});

export const layout = style({
  flex: 1,
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
  gap: vars.spacing.sm,
  "@media": {
    "screen and (max-width: 1100px)": {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "minmax(0, 1fr) auto",
    },
  },
});

export const boardPane = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const boardArea = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.spacing.sm,
});

export const boardSizer = style({
  width: "min(78vh, 100%)",
  maxWidth: "100%",
  maxHeight: "100%",
  aspectRatio: "1",
  "@media": {
    "screen and (max-width: 1100px)": {
      width: "min(82vw, 100%)",
    },
  },
});

export const boardInner = style({
  width: "100%",
  height: "100%",
});

export const sideColumn = style({
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto",
  gap: vars.spacing.sm,
  minHeight: 0,
});

export const sidePanel = style({
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
});

export const sideHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing.sm,
  padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
});

export const sideTitle = style({
  fontSize: vars.fontSizes.sm,
  fontWeight: 600,
  [vars.lightSelector]: {
    color: vars.colors.dark[8],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});

export const sideSubtitle = style({
  fontSize: vars.fontSizes.xs,
  [vars.lightSelector]: {
    color: vars.colors.gray[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.dark[2],
  },
});

export const tabsRoot = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
});

export const tabPanel = style({
  flex: 1,
  minHeight: 0,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const tabSection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.sm,
  padding: vars.spacing.sm,
});

export const piecesArea = style({
  flex: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const controlRow = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.spacing.sm,
  flexWrap: "wrap",
});

export const actionsPanel = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.spacing.sm,
});

export const errorText = style({
  fontSize: vars.fontSizes.xs,
  fontWeight: 600,
  [vars.lightSelector]: {
    color: vars.colors.red[7],
  },
  [vars.darkSelector]: {
    color: vars.colors.red[3],
  },
});
