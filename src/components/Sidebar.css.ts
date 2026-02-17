import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const root = style({
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "0.35rem 0.25rem 0.45rem",
  gap: "0.35rem",
  borderInlineEnd: "1px solid transparent",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  [vars.lightSelector]: {
    background:
      "linear-gradient(180deg, color-mix(in srgb, #ffffff 92%, var(--mantine-color-body)) 0%, color-mix(in srgb, #ffffff 84%, var(--mantine-color-body)) 100%)",
    borderInlineEndColor: vars.colors.gray[2],
  },
  [vars.darkSelector]: {
    background:
      "linear-gradient(180deg, color-mix(in srgb, var(--mantine-color-dark-7) 92%, #000000) 0%, color-mix(in srgb, var(--mantine-color-dark-8) 92%, #000000) 100%)",
    borderInlineEndColor: vars.colors.dark[5],
  },
});

export const section = style({
  display: "flex",
  justifyContent: "center",
});

export const link = style({
  width: "2.5rem",
  height: "2.5rem",
  display: "grid",
  placeItems: "center",
  borderRadius: "0.6rem",
  border: "1px solid transparent",
  transition:
    "background-color 120ms ease, color 120ms ease, transform 120ms ease, box-shadow 120ms ease",
  [vars.lightSelector]: {
    color: vars.colors.dark[6],
  },
  [vars.darkSelector]: {
    color: vars.colors.gray[0],
  },
  ":hover": {
    backgroundColor: "color-mix(in srgb, currentColor 12%, transparent)",
  },
  ":active": {
    transform: "scale(0.96)",
  },
  ":focus-visible": {
    outline: `2px solid ${vars.colors.primary}`,
    outlineOffset: 2,
  },
});

export const active = style({
  backgroundColor: "color-mix(in srgb, currentColor 18%, transparent)",
  borderColor: "color-mix(in srgb, currentColor 22%, transparent)",
  boxShadow: "0 0 0 1px color-mix(in srgb, currentColor 18%, transparent) inset",
  [vars.lightSelector]: {
    color: vars.colors.dark[7],
  },
  [vars.darkSelector]: {
    color: vars.colors.white,
  },
});
