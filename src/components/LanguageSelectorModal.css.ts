import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const languageButton = style({
    transition: "all 0.2s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: vars.shadows.md,
    },
});

export const recommendedLanguage = style({
    [vars.lightSelector]: {
        borderColor: vars.colors.primary,
        borderWidth: "2px",
    },
    [vars.darkSelector]: {
        borderColor: vars.colors.primary,
        borderWidth: "2px",
    },
});

export const flagEmoji = style({
    fontSize: "1.5rem",
    lineHeight: 1,
});

export const languageInfo = style({
    display: "flex",
    flexDirection: "column",
    gap: 0,
    marginLeft: vars.spacing.xs,
    overflow: "hidden",
});
