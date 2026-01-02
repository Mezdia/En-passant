import { vars } from "@/styles/theme";
import { globalStyle } from "@vanilla-extract/css";

// Override driver.js default styles for a premium look
globalStyle(".driver-popover", {
  backgroundColor: `${vars.colors.dark[7]} !important`,
  color: `${vars.colors.gray[0]} !important`,
  borderRadius: `${vars.radius.lg} !important`,
  boxShadow: `${vars.shadows.xl} !important`,
  padding: `${vars.spacing.md} !important`,
  fontFamily: "inherit !important",
  minWidth: "300px",
  maxWidth: "400px",
});

globalStyle(".driver-popover-title", {
  fontSize: "1.25rem !important",
  fontWeight: "700 !important",
  marginBottom: `${vars.spacing.xs} !important`,
  color: `${vars.colors.white} !important`,
  textAlign: "center", // Center aligned titles for splash feel
  fontFamily: "inherit !important",
});

globalStyle(".driver-popover-description", {
  fontSize: "1rem !important",
  lineHeight: "1.6 !important",
  color: `${vars.colors.dimmed} !important`,
  marginBottom: `${vars.spacing.md} !important`,
  textAlign: "center",
  fontFamily: "inherit !important",
});

globalStyle(".driver-popover-footer", {
  marginTop: `${vars.spacing.md} !important`,
  display: "flex !important",
  justifyContent: "center !important", // Center buttons
  gap: `${vars.spacing.sm} !important`,
});

globalStyle(".driver-popover-btn", {
  backgroundColor: `${vars.colors.primary} !important`,
  color: `${vars.colors.white} !important`,
  borderRadius: `${vars.radius.md} !important`,
  padding: `${vars.spacing.sm} ${vars.spacing.lg} !important`,
  fontSize: "0.9rem !important",
  fontWeight: "600 !important",
  border: "none !important",
  textShadow: "none !important",
  transition: "transform 0.2s ease, background-color 0.2s ease",
  cursor: "pointer",
  fontFamily: "inherit !important",
});

globalStyle(".driver-popover-btn:hover", {
  transform: "translateY(-2px)",
  filter: "brightness(1.1)",
});

globalStyle(".driver-popover-btn-disabled", {
  opacity: "0.5 !important",
  cursor: "not-allowed !important",
  display: "none !important", // Hide disabled buttons if wanted
});

// Navigation dots styling (if driver.js supports progress dots or we simulate them)
// Driver.js uses "Step X of Y" usually.

// Mobile adjustments
globalStyle(".driver-popover", {
  "@media": {
    "(max-width: 768px)": {
      width: "90% !important",
      left: "5% !important",
      bottom: "20px !important",
      top: "auto !important",
      position: "fixed !important" as any,
      margin: "0 !important",
    },
  },
});

// Spotlight effect refinement
globalStyle(".driver-overlay", {
  opacity: "0.8 !important", // Darker overlay
});
