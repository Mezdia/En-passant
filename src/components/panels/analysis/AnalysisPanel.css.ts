import { style } from "@vanilla-extract/css";

export const label = style({
  cursor: "pointer",
  ":hover": {
    textDecoration: "underline",
  },
});

export const annotationIcon = style({
  width: "18px",
  height: "18px",
  display: "block",
  margin: "0 auto",
  objectFit: "contain",
});
