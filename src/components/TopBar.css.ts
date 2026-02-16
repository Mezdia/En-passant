import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const root = style({
  height: "2.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
  paddingInline: "0.5rem",
  userSelect: "none",
  borderBottom: "1px solid transparent",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  [vars.lightSelector]: {
    background:
      "linear-gradient(180deg, color-mix(in srgb, #ffffff 92%, var(--mantine-color-body)) 0%, color-mix(in srgb, #ffffff 84%, var(--mantine-color-body)) 100%)",
    borderBottomColor: vars.colors.gray[2],
    color: vars.colors.dark[7],
  },
  [vars.darkSelector]: {
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--mantine-color-dark-7) 92%, #000000) 0%, color-mix(in srgb, var(--mantine-color-dark-8) 92%, #000000) 100%)",
    borderBottomColor: vars.colors.dark[5],
    color: vars.colors.gray[0],
  },
});

export const left = style({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flex: 1,
  minWidth: 0,
});

export const brand = style({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  paddingInline: "0.3rem",
  paddingBlock: "0.15rem",
  borderRadius: "0.5rem",
});

export const logo = style({
  height: "1.5rem",
  width: "1.5rem",
  borderRadius: "0.4rem",
  overflow: "hidden",
  flexShrink: 0,
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[1],
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.08) inset",
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark[6],
    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.08) inset",
  },
});

export const title = style({
  fontSize: "0.9rem",
  fontWeight: 600,
  letterSpacing: "0.2px",
  whiteSpace: "nowrap",
});

export const menu = style({
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  flexWrap: "nowrap",
});

export const menuButton = style({
  height: "1.85rem",
  padding: "0 0.65rem",
  borderRadius: "0.55rem",
  fontSize: "0.85rem",
  fontWeight: 500,
  letterSpacing: "0.15px",
  color: "inherit",
  transition:
    "background-color 120ms ease, color 120ms ease, transform 120ms ease",
  ":hover": {
    backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)",
  },
  ":active": {
    transform: "translateY(1px)",
  },
  ":focus-visible": {
    outline: `2px solid ${vars.colors.primary}`,
    outlineOffset: 2,
  },
  selectors: {
    "&[aria-expanded='true']": {
      backgroundColor: "color-mix(in srgb, currentColor 18%, transparent)",
    },
  },
});

export const windowControls = style({
  display: "flex",
  alignItems: "center",
  gap: "0.2rem",
});

export const windowButton = style({
  height: "2.3rem",
  width: "2.75rem",
  display: "grid",
  placeItems: "center",
  borderRadius: "0.5rem",
  transition:
    "background-color 120ms ease, color 120ms ease, transform 120ms ease",
  ":hover": {
    backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)",
  },
  ":active": {
    transform: "scale(0.96)",
  },
});

export const closeButton = style([
  windowButton,
  {
    ":hover": {
      backgroundColor: "color-mix(in srgb, #ff4d4f 65%, transparent)",
      color: vars.colors.white,
    },
  },
]);
