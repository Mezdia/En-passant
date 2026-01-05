
import { style } from "@vanilla-extract/css";

export const pageContainer = style({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "var(--mantine-color-body)",
    overflow: "hidden",
});

export const boardArea = style({
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative",
});

export const sidebar = style({
    width: "350px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--mantine-color-dark-8)",
    borderLeft: "1px solid var(--mantine-color-dark-6)",
    zIndex: 10,
});

export const sidebarContent = style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    gap: "1rem",
    overflowY: "auto",
});

export const botProfile = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "1rem",
    backgroundColor: "var(--mantine-color-dark-7)",
    borderRadius: "8px",
    border: "1px solid var(--mantine-color-dark-5)",
});

export const botImage = style({
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "0.5rem",
    border: "3px solid var(--mantine-primary-color-filled)",
});

export const evalBarContainer = style({
    position: "absolute",
    left: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    height: "60vh",
    width: "16px",
    backgroundColor: "var(--mantine-color-dark-6)",
    borderRadius: "4px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column-reverse", // Bottom is 0
});

export const evalBarFill = style({
    width: "100%",
    backgroundColor: "var(--mantine-color-white)",
    transition: "height 0.5s ease-out",
});

export const chatContainer = style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--mantine-color-dark-9)",
    borderRadius: "8px",
    overflow: "hidden",
    marginTop: "auto",
    maxHeight: "300px",
});

export const chatMessages = style({
    flex: 1,
    overflowY: "auto",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
});

export const messageBubble = style({
    padding: "0.5rem 0.8rem",
    borderRadius: "8px",
    maxWidth: "85%",
    fontSize: "0.9rem",
    lineHeight: 1.4,
});

export const botMessage = style({
    alignSelf: "flex-start",
    backgroundColor: "var(--mantine-color-dark-6)",
    borderBottomLeftRadius: 0,
});

export const systemMessage = style({
    alignSelf: "center",
    backgroundColor: "transparent",
    color: "var(--mantine-color-dimmed)",
    fontSize: "0.8rem",
    fontStyle: "italic",
});

export const moveHistory = style({
    backgroundColor: "var(--mantine-color-dark-7)",
    borderRadius: "8px",
    padding: "0.5rem",
    flex: 1,
    overflow: "hidden",
});

export const controlPanel = style({
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
});

export const capturedPieces = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    minHeight: 24,
});
