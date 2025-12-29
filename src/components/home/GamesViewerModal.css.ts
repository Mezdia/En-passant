import { vars } from "@/styles/theme";
import { style, keyframes } from "@vanilla-extract/css";

const fadeIn = keyframes({
    "0%": { opacity: 0, transform: "translateY(10px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
});

export const modalContent = style({
    display: "flex",
    flexDirection: "column",
    height: "70vh",
    maxHeight: "600px",
});

export const filtersContainer = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "0.75rem",
    marginBottom: "1rem",
    padding: "0.75rem",
    borderRadius: "8px",
    [vars.lightSelector]: {
        backgroundColor: vars.colors.gray[0],
    },
    [vars.darkSelector]: {
        backgroundColor: vars.colors.dark[7],
    },
});

export const gamesList = style({
    flex: 1,
    overflowY: "auto",
});

export const gameCard = style({
    padding: "0.75rem",
    marginBottom: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    animation: `${fadeIn} 0.3s ease`,
    border: "1px solid transparent",
    [vars.lightSelector]: {
        backgroundColor: vars.colors.white,
        ":hover": {
            backgroundColor: vars.colors.gray[0],
            borderColor: vars.colors.cyan[4],
        },
    },
    [vars.darkSelector]: {
        backgroundColor: vars.colors.dark[6],
        ":hover": {
            backgroundColor: vars.colors.dark[5],
            borderColor: vars.colors.cyan[6],
        },
    },
});

export const gameCardSelected = style({
    [vars.lightSelector]: {
        borderColor: vars.colors.cyan[5],
        backgroundColor: vars.colors.cyan[0],
    },
    [vars.darkSelector]: {
        borderColor: vars.colors.cyan[7],
        backgroundColor: vars.colors.dark[5],
    },
});

export const playerInfo = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
});

export const resultWin = style({
    color: vars.colors.green[6],
    fontWeight: 700,
});

export const resultLoss = style({
    color: vars.colors.red[6],
    fontWeight: 700,
});

export const resultDraw = style({
    color: vars.colors.gray[6],
    fontWeight: 700,
});

export const gameMetadata = style({
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginTop: "0.5rem",
    fontSize: "0.8rem",
    color: vars.colors.gray[6],
});

export const openingBadge = style({
    fontSize: "0.75rem",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});

export const loadingContainer = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    gap: "1rem",
});

export const emptyState = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    gap: "0.5rem",
    color: vars.colors.gray[6],
});

export const previewContainer = style({
    marginTop: "1rem",
    padding: "1rem",
    borderRadius: "8px",
    [vars.lightSelector]: {
        backgroundColor: vars.colors.gray[0],
    },
    [vars.darkSelector]: {
        backgroundColor: vars.colors.dark[7],
    },
});

export const actionButtons = style({
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    flexWrap: "wrap",
});

// Responsive styles for mobile
export const mobileFilters = style({
    "@media": {
        "(max-width: 600px)": {
            flexDirection: "column",
        },
    },
});

export const mobileGameCard = style({
    "@media": {
        "(max-width: 600px)": {
            padding: "0.5rem",
        },
    },
});
