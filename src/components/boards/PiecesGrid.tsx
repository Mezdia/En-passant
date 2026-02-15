import { Box, SimpleGrid } from "@mantine/core";
import { COLORS, type Piece as ChessPiece, ROLES, parseSquare } from "chessops";
import { makeFen, parseFen } from "chessops/fen";
import Piece from "../common/Piece";

function PiecesGrid({
  fen,
  boardRef,
  vertical,
  onPut,
  orientation = "white",
  size,
  selectedPiece,
  onSelectPiece,
}: {
  fen: string;
  boardRef: React.MutableRefObject<HTMLDivElement | null>;
  onPut: (newFen: string) => void;
  vertical?: boolean;
  orientation?: "white" | "black";
  size?: number | string;
  selectedPiece?: ChessPiece | null;
  onSelectPiece?: (piece: ChessPiece | null) => void;
}) {
  return (
    <SimpleGrid cols={vertical ? 2 : 6} flex={1} w="100%">
      {COLORS.map((color) =>
        ROLES.map((role) => {
          const piece = { role, color } as ChessPiece;
          const isSelected =
            selectedPiece?.role === role && selectedPiece?.color === color;
          return (
            <Box
              key={role + color}
              onClick={() => {
                if (!onSelectPiece) return;
                onSelectPiece(isSelected ? null : piece);
              }}
              style={{
                outline: isSelected
                  ? "2px solid var(--mantine-color-blue-6)"
                  : "2px solid transparent",
                borderRadius: "var(--mantine-radius-sm)",
                cursor: onSelectPiece ? "pointer" : "default",
              }}
            >
              <Piece
                putPiece={(to, piece) => {
                  const setup = parseFen(fen).unwrap();
                  setup.board.set(to, piece);
                  onPut(makeFen(setup));
                }}
                boardRef={boardRef}
                piece={piece}
                orientation={orientation}
                size={size}
              />
            </Box>
          );
        }),
      )}
    </SimpleGrid>
  );
}

export default PiecesGrid;
