
import { vars } from "@/styles/theme";
import { keyframes, style } from "@vanilla-extract/css";

// Animations - Following the existing pattern
const slideInFromBottom = keyframes({
    "0%": {
        opacity: 0,
        transform: "translateY(30px)",
    },
    "100%": {
        opacity: 1,
        transform: "translateY(0)",
    },
});

const slideInFromRight = keyframes({
    "0%": {
        opacity: 0,
        transform: "translateX(30px)",
    },
    "100%": {
        opacity: 1,
        transform: "translateX(0)",
    },
});

const scaleIn = keyframes({
    "0%": {
        opacity: 0,
        transform: "scale(0.95)",
    },
    "100%": {
        opacity: 1,
        transform: "scale(1)",
    },
});

const fadeIn = keyframes({
    "0%": { opacity: "0" },
    "100%": { opacity: "1" }
});

const bounceIn = keyframes({
    "0%": {
        opacity: "0",
        transform: "scale(0.3)",
    },
    "50%": {
        opacity: "1",
        transform: "scale(1.05)",
    },
    "70%": {
        transform: "scale(0.9)",
    },
    "100%": {
        opacity: "1",
        transform: "scale(1)",
    },
});

const pulse = keyframes({
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.05)" },
    "100%": { transform: "scale(1)" }
});

const glow = keyframes({
    "0%, 100%": {
        boxShadow: `0 0 20px rgba(34, 197, 94, 0.2)`,
    },
    "50%": {
        boxShadow: `0 0 40px rgba(34, 197, 94, 0.5)`,
    },
});

const winGlow = keyframes({
    "0%, 100%": { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1)' },
    "50%": { boxShadow: '0 0 40px rgba(34, 197, 94, 0.6), inset 0 0 30px rgba(34, 197, 94, 0.2)' },
});

const lossGlow = keyframes({
    "0%, 100%": { boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1)' },
    "50%": { boxShadow: '0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(239, 68, 68, 0.2)' },
});

const drawGlow = keyframes({
    "0%, 100%": { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(245, 158, 11, 0.1)' },
    "50%": { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.2)' },
});

const floating = keyframes({
    "0%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-10px)" },
    "100%": { transform: "translateY(0)" },
});

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
    padding: vars.spacing.md,
    position: "relative",
});

export const sidebar = style({
    width: "350px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: vars.colors.dark[8],
    borderLeft: `1px solid ${vars.colors.dark[6]}`,
    zIndex: 10,
});

export const sidebarContent = style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: vars.spacing.md,
    gap: vars.spacing.md,
    overflowY: "auto",
});

export const botProfile = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: vars.spacing.lg,
    backgroundColor: vars.colors.dark[7],
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.colors.dark[5]}`,
    animation: `${slideInFromBottom} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)`,
    position: "relative",
    overflow: "hidden",

    selectors: {
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, var(--mantine-primary-color-filled), var(--mantine-primary-color-filled-hover))",
        }
    }
});

export const botImage = style({
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: vars.spacing.sm,
    border: `3px solid var(--mantine-primary-color-filled)`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    zIndex: 1,

    selectors: {
        "&:hover": {
            transform: "scale(1.05)",
            boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3)`,
        }
    }
});

export const evalBarContainer = style({
    position: "absolute",
    left: vars.spacing.sm,
    top: "50%",
    transform: "translateY(-50%)",
    height: "60vh",
    width: "16px",
    backgroundColor: vars.colors.dark[6],
    borderRadius: vars.radius.sm,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column-reverse",
});

export const evalBarFill = style({
    width: "100%",
    backgroundColor: vars.colors.white,
    transition: "height 0.5s ease-out",
});

export const chatContainer = style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: vars.colors.dark[9],
    borderRadius: vars.radius.lg,
    overflow: "hidden",
    marginTop: "auto",
    maxHeight: "300px",
    border: `1px solid ${vars.colors.dark[6]}`,
});

export const chatMessages = style({
    flex: 1,
    overflowY: "auto",
    padding: vars.spacing.sm,
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing.sm,
});

export const messageBubble = style({
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    borderRadius: vars.radius.md,
    maxWidth: "85%",
    fontSize: vars.fontSizes.sm,
    lineHeight: 1.4,
    animation: `${fadeIn} 0.3s ease-out`,
});

export const botMessage = style({
    alignSelf: "flex-start",
    backgroundColor: vars.colors.dark[6],
    borderBottomLeftRadius: 0,
});

export const systemMessage = style({
    alignSelf: "center",
    backgroundColor: "transparent",
    color: vars.colors.dark[2],
    fontSize: vars.fontSizes.xs,
    fontStyle: "italic",
});

export const moveHistory = style({
    backgroundColor: vars.colors.dark[7],
    borderRadius: vars.radius.md,
    padding: vars.spacing.sm,
    flex: 1,
    overflow: "hidden",
});

export const controlPanel = style({
    display: "flex",
    gap: vars.spacing.sm,
    marginTop: vars.spacing.md,
    flexWrap: "wrap",
});

export const capturedPieces = style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    minHeight: 24,
});

// Game Result Overlay - Following Mantine design patterns
export const gameResultOverlay = style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    animation: `${fadeIn} 0.4s ease-out`,
    backdropFilter: "blur(8px)",
});

export const gameResultCard = style({
    backgroundColor: "rgba(26, 27, 30, 0.85)",
    backdropFilter: "blur(20px) saturate(180%)",
    borderRadius: "28px",
    padding: vars.spacing["3xl"],
    textAlign: "center",
    maxWidth: "550px",
    width: "90%",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    animation: `${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",

    selectors: {
        "&::after": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent)',
            pointerEvents: 'none',
        }
    }
});

export const gameResultTitle = style({
    fontSize: vars.fontSizes["3xl"],
    fontWeight: 800,
    marginBottom: vars.spacing.lg,
    animation: `${slideInFromBottom} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)`,
});

export const gameResultWin = style({
    color: vars.colors.green[4],
    textShadow: "0 0 30px rgba(34, 197, 94, 0.6)",
    animation: `${winGlow} 2s infinite, ${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
});

export const gameResultLoss = style({
    color: vars.colors.red[4],
    textShadow: "0 0 30px rgba(239, 68, 68, 0.6)",
    animation: `${lossGlow} 2s infinite, ${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
});

export const gameResultDraw = style({
    color: vars.colors.yellow[4],
    textShadow: "0 0 30px rgba(245, 158, 11, 0.6)",
    animation: `${drawGlow} 2s infinite, ${bounceIn} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
});

export const gameResultSubtitle = style({
    fontSize: vars.fontSizes.lg,
    color: vars.colors.dark[2],
    marginBottom: vars.spacing["2xl"],
    animation: `${fadeIn} 1s ease-out 0.3s both`,
});

export const gameResultStats = style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: vars.spacing.md,
    marginBottom: vars.spacing["2xl"],
    animation: `${slideInFromBottom} 0.8s ease-out 0.6s both`,
});

export const gameResultStat = style({
    backgroundColor: vars.colors.dark[7],
    padding: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.colors.dark[5]}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    selectors: {
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: vars.shadows.md,
            borderColor: "var(--mantine-primary-color-filled)",
        }
    }
});

export const gameResultStatLabel = style({
    fontSize: vars.fontSizes.xs,
    color: vars.colors.dark[2],
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 700,
});

export const gameResultStatValue = style({
    fontSize: vars.fontSizes.xl,
    fontWeight: 800,
    color: vars.colors.white,
    marginTop: vars.spacing.xs,
});

export const gameResultActions = style({
    display: "flex",
    gap: vars.spacing.md,
    justifyContent: "center",
    flexWrap: "wrap",
    animation: `${fadeIn} 1s ease-out 0.9s both`,
});

export const gameResultButton = style({
    padding: `${vars.spacing.sm} ${vars.spacing.xl}`,
    borderRadius: vars.radius.lg,
    fontWeight: 600,
    fontSize: vars.fontSizes.sm,
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: vars.spacing.xs,
    position: "relative",
    overflow: "hidden",

    selectors: {
        "&::before": {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s ease',
        },
        "&:hover::before": {
            left: '100%',
        },
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: vars.shadows.lg,
        },
        "&:active": {
            transform: "translateY(0)",
        }
    }
});

export const gameResultPrimaryButton = style([
    gameResultButton,
    {
        backgroundColor: "var(--mantine-primary-color-filled)",
        color: "var(--mantine-primary-color-contrast)",
        borderColor: "var(--mantine-primary-color-filled)",
        animation: `${pulse} 3s infinite`,

        selectors: {
            "&:hover": {
                backgroundColor: "var(--mantine-primary-color-filled-hover)",
                boxShadow: `0 8px 25px rgba(0, 0, 0, 0.3), 0 0 0 4px var(--mantine-primary-color-light-hover)`,
            }
        }
    }
]);

export const gameResultSecondaryButton = style([
    gameResultButton,
    {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        color: vars.colors.white,
        borderColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(5px)",

        selectors: {
            "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            }
        }
    }
]);

export const iconButton = style({
    width: "44px",
    height: "44px",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "1px solid transparent",

    selectors: {
        "&:hover": {
            transform: "translateY(-2px) scale(1.05)",
        },
        "&:active": {
            transform: "translateY(0) scale(0.95)",
        }
    }
});

// Game Controls - Following the existing patterns
export const gameControlsContainer = style({
    display: "flex",
    flexDirection: "column",
    gap: vars.spacing.md,
    marginTop: vars.spacing.md,
    padding: vars.spacing.md,
    backgroundColor: vars.colors.dark[7],
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.colors.dark[6]}`,
    animation: `${slideInFromBottom} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)`,
});

export const gameControlsTitle = style({
    fontSize: vars.fontSizes.md,
    fontWeight: 700,
    color: vars.colors.white,
    marginBottom: vars.spacing.sm,
});

export const gameControlsRow = style({
    display: "flex",
    gap: vars.spacing.sm,
    flexWrap: "wrap",
});

export const gameControlButton = style([
    iconButton,
    {
        backgroundColor: vars.colors.dark[6],
        borderColor: vars.colors.dark[5],
        color: vars.colors.dark[1],

        selectors: {
            "&:hover": {
                backgroundColor: vars.colors.dark[5],
                color: vars.colors.white,
                borderColor: vars.colors.dark[4],
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            },
            "&:disabled": {
                opacity: 0.3,
                cursor: "not-allowed",
                transform: "none",
            }
        }
    }
]);

export const gameControlButtonDanger = style([
    gameControlButton,
    {
        selectors: {
            "&:hover": {
                backgroundColor: vars.colors.red[9],
                color: vars.colors.red[1],
                borderColor: vars.colors.red[7],
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            }
        }
    }
]);

export const gameControlButtonPrimary = style([
    gameControlButton,
    {
        selectors: {
            "&:hover": {
                backgroundColor: vars.colors.blue[9],
                color: vars.colors.blue[1],
                borderColor: vars.colors.blue[7],
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
            }
        }
    }
]);

// Thinking indicator - Following the app pattern
export const thinkingIndicator = style({
    display: "flex",
    alignItems: "center",
    gap: vars.spacing.sm,
    padding: vars.spacing.sm,
    backgroundColor: vars.colors.dark[7],
    borderRadius: vars.radius.md,
    border: `1px solid ${vars.colors.dark[6]}`,
    animation: `${fadeIn} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`,
});

export const thinkingDots = style({
    display: "flex",
    gap: "4px",
});

export const thinkingDot = style({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--mantine-primary-color-filled)",
    animation: `${pulse} 1.5s infinite`,

    selectors: {
        "&:nth-child(2)": {
            animationDelay: '0.2s',
        },
        "&:nth-child(3)": {
            animationDelay: '0.4s',
        }
    }
});

// Analysis mode overlay
export const analysisModeOverlay = style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    animation: `${fadeIn} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`,
    backdropFilter: "blur(4px)",
});

export const analysisModeCard = style({
    backgroundColor: vars.colors.dark[8],
    borderRadius: vars.radius.xl,
    padding: vars.spacing["2xl"],
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
    border: `1px solid ${vars.colors.dark[6]}`,
    animation: `${scaleIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)`,
    boxShadow: vars.shadows.xl,
});

export const analysisModeTitle = style({
    fontSize: vars.fontSizes.xl,
    fontWeight: 700,
    color: vars.colors.white,
    marginBottom: vars.spacing.md,
});

export const analysisModeDescription = style({
    fontSize: vars.fontSizes.sm,
    color: vars.colors.dark[2],
    marginBottom: vars.spacing["2xl"],
    lineHeight: 1.6,
});

export const analysisModeActions = style({
    display: "flex",
    gap: vars.spacing.md,
    justifyContent: "center",
    flexWrap: "wrap",
});

export const loadingSpinner = style({
    width: "24px",
    height: "24px",
    border: `2px solid ${vars.colors.dark[5]}`,
    borderTop: `2px solid var(--mantine-primary-color-filled)`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
});

// Confetti animation
export const winConfetti = style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: 1001,
});

export const confettiPiece = style({
    position: "absolute",
    width: "10px",
    height: "10px",
    backgroundColor: vars.colors.green[5],
    animation: `${bounceIn} 2s ease-out forwards`,
    opacity: 0,
});

// Turn indicator
export const turnIndicator = style({
    padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
    borderRadius: vars.radius.md,
    fontSize: vars.fontSizes.xs,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    animation: `${slideInFromRight} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)`,
});

export const turnIndicatorPlayer = style([
    turnIndicator,
    {
        backgroundColor: vars.colors.blue[8],
        color: vars.colors.blue[1],
        border: `1px solid ${vars.colors.blue[7]}`,
    }
]);

export const turnIndicatorBot = style([
    turnIndicator,
    {
        backgroundColor: vars.colors.orange[8],
        color: vars.colors.orange[1],
        border: `1px solid ${vars.colors.orange[7]}`,
    }
]);

// Victory/Defeat message styling
export const victoryMessage = style({
    background: `linear-gradient(135deg, ${vars.colors.green[8]}, ${vars.colors.green[6]})`,
    color: vars.colors.white,
    padding: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `2px solid ${vars.colors.green[5]}`,
    fontWeight: 700,
    textAlign: "center",
    animation: `${glow} 2s infinite`,
});

export const defeatMessage = style({
    background: `linear-gradient(135deg, ${vars.colors.red[8]}, ${vars.colors.red[6]})`,
    color: vars.colors.white,
    padding: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `2px solid ${vars.colors.red[5]}`,
    fontWeight: 700,
    textAlign: "center",
});

export const drawMessage = style({
    background: `linear-gradient(135deg, ${vars.colors.yellow[8]}, ${vars.colors.yellow[6]})`,
    color: vars.colors.dark[8],
    padding: vars.spacing.md,
    borderRadius: vars.radius.lg,
    border: `2px solid ${vars.colors.yellow[5]}`,
    fontWeight: 700,
    textAlign: "center",
});

// Add shimmer keyframes for the card
const shimmer = keyframes({
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" }
});

const spin = keyframes({
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
});

export const langSwitchContainer = style({
    position: 'absolute',
    top: vars.spacing.md,
    right: vars.spacing.md,
    zIndex: 100,
});

export const langButton = style({
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '8px 12px',
    color: vars.colors.white,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',

    selectors: {
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-1px)',
        },
        '&:active': {
            transform: 'translateY(0)',
        }
    }
});

export const resultIcon = style({
    animation: `${floating} 3s ease-in-out infinite`,
    filter: "drop-shadow(0 0 15px currentColor)",
});
