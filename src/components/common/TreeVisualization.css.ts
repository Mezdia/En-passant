import { vars } from "@/styles/theme";
import { style } from "@vanilla-extract/css";

export const treeContainer = style({
    width: "100%",
    height: "100%",
    minHeight: "600px",
    background: "var(--mantine-color-body)",
    borderRadius: "var(--mantine-radius-md)",
    overflow: "hidden",
});

export const moveNode = style({
    all: "unset",
    fontSize: "0.9rem",
    fontWeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 8px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    cursor: "pointer",
    minWidth: "60px",
    border: "2px solid transparent", // Use 2px border for better visibility
    transition: "transform 0.1s ease, box-shadow 0.1s ease",

    [vars.lightSelector]: {
        color: vars.colors.gray[8],
        backgroundColor: "transparent",
        borderColor: vars.colors.gray[3],
    },
    [vars.darkSelector]: {
        color: vars.colors.gray[1],
        backgroundColor: "transparent",
        borderColor: vars.colors.gray[8],
    },

    ":hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
});

export const nodeContent = style({
    display: "flex",
    alignItems: "center",
    gap: "4px",
});

// Highlighting styles - BORDER ONLY as requested

export const nodeCurrentPath = style({
    borderColor: "var(--mantine-color-green-filled) !important", // Force priority
    boxShadow: "0 0 0 1px var(--mantine-color-green-filled)", // Optional glowing border effect
    // No background color change
});

export const nodePreviousMove = style({
    borderColor: "var(--mantine-color-yellow-filled) !important",
    boxShadow: "0 0 0 1px var(--mantine-color-yellow-filled)",
});

export const nodeRoot = style({
    backgroundColor: "var(--mantine-color-blue-filled) !important",
    color: "var(--mantine-color-white) !important",
    borderColor: "var(--mantine-color-blue-8) !important",
});

export const nodeOther = style({
    // Standard style
});

export const nodeEvaluation = style({
    fontSize: "0.7rem",
    opacity: 0.9,
    marginTop: "2px",
    padding: "1px 4px",
    borderRadius: "2px",
    backgroundColor: "rgba(128, 128, 128, 0.1)",
});

export const phantomNode = style({
    visibility: "hidden",
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
});
