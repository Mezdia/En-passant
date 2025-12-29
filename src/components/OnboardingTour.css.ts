import { vars } from "@/styles/theme";
import { style, keyframes } from "@vanilla-extract/css";

const pulse = keyframes({
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.05)" },
    "100%": { transform: "scale(1)" },
});

export const root = style({
    overflow: "hidden",
    height: "500px",
    display: "flex",
    flexDirection: "column",
});

export const header = style({
    height: "220px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.5s ease",
    position: "relative",
    padding: vars.spacing.xl,
});

export const content = style({
    flex: 1,
    padding: vars.spacing.xl,
    display: "flex",
    flexDirection: "column",
    backgroundColor: vars.colors.dark[7],
});

export const title = style({
    marginTop: vars.spacing.md,
    textAlign: "center",
});

export const description = style({
    maxWidth: "500px",
    color: vars.colors.dimmed,
    lineHeight: 1.6,
});

export const iconPulse = style({
    animation: `${pulse} 2s infinite ease-in-out`,
});

export const stepper = style({
    width: "100%",
    padding: `0 ${vars.spacing.xl}`,
});

export const actionButton = style({
    minWidth: "120px",
});
