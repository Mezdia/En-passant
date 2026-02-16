import { moveNotationTypeAtom } from "@/state/atoms";
import {
  ANNOTATION_INFO,
  ANNOTATION_COLOR_MAP,
  ANNOTATION_ICON_MAP,
  type Annotation,
  addPieceSymbol,
} from "@/utils/annotation";
import { Box, rgba, useMantineTheme } from "@mantine/core";
import { IconFlag } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { type ForwardedRef, forwardRef } from "react";
import * as classes from "./MoveCell.css";

interface MoveCellProps {
  annotations: Annotation[];
  isStart: boolean;
  isCurrentVariation: boolean;
  move: string;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

const MoveCell = forwardRef(function MoveCell(
  props: MoveCellProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const [moveNotationType] = useAtom(moveNotationTypeAtom);

  const primaryAnnotation = props.annotations[0];
  const color = ANNOTATION_INFO[primaryAnnotation]?.color || "gray";
  const annotationColor = ANNOTATION_COLOR_MAP[primaryAnnotation];
  const theme = useMantineTheme();
  const hoverOpacity = props.isCurrentVariation ? 0.25 : 0.1;
  let baseLight = theme.colors.gray[8];
  let hoverLight = rgba(baseLight, hoverOpacity);
  let baseDark = theme.colors.gray[1];
  let hoverDark = rgba(baseDark, hoverOpacity);
  let darkBg = "transparent";
  let lightBg = "transparent";

  if (annotationColor) {
    baseLight = annotationColor;
    baseDark = annotationColor;
    hoverLight = rgba(annotationColor, hoverOpacity);
    hoverDark = rgba(annotationColor, hoverOpacity);
  } else if (color !== "gray") {
    baseLight = theme.colors[color][6];
    hoverLight = rgba(baseLight, hoverOpacity);
    baseDark = theme.colors[color][6];
    hoverDark = rgba(baseDark, hoverOpacity);
  }

  if (props.isCurrentVariation) {
    const activeColor = annotationColor ?? theme.colors[color][6];
    darkBg = rgba(activeColor, 0.2);
    lightBg = rgba(activeColor, 0.2);
    hoverLight = rgba(lightBg, 0.25);
    hoverDark = rgba(darkBg, 0.25);
  }

  const annotationIcons = props.annotations
    .filter((annotation) => annotation !== "")
    .map((annotation, index) => {
      const icon = ANNOTATION_ICON_MAP[annotation];
      if (icon) {
        return (
          <img
            key={`${annotation}-${index}`}
            className={classes.annotationIcon}
            src={icon}
            alt={annotation}
            title={annotation}
          />
        );
      }
      return (
        <span key={`${annotation}-${index}`} className={classes.annotationText}>
          {annotation}
        </span>
      );
    });

  return (
    <Box
      ref={ref}
      component="button"
      className={classes.cell}
      style={{
        "--light-color": baseLight,
        "--light-hover-color": hoverLight,
        "--dark-color": baseDark,
        "--dark-hover-color": hoverDark,
        "--dark-bg": darkBg,
        "--light-bg": lightBg,
      }}
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
    >
      {props.isStart && <IconFlag style={{ marginRight: 5 }} size="0.875rem" />}
      {moveNotationType === "symbols" ? addPieceSymbol(props.move) : props.move}
      {annotationIcons.length > 0 && (
        <span className={classes.annotationList}>{annotationIcons}</span>
      )}
    </Box>
  );
});

export default MoveCell;
