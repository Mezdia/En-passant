import { events } from "@/bindings";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { fetch } from "@tauri-apps/plugin-http";
import { error, info } from "@tauri-apps/plugin-log";
import { Chess } from "chessops";
import {
  ChildNode,
  type PgnNodeData,
  defaultGame,
  makePgn,
} from "chessops/pgn";
import { makeSan } from "chessops/san";
import { z } from "zod";
import { decodeTCN } from "./tcn";

const baseURL = "https://api.chess.com";
const headers = {
  "User-Agent": "EnPassant",
};

const ChessComPerf = z.object({
  last: z.object({
    rating: z.number(),
    date: z.number(),
    rd: z.number(),
  }),
  record: z.object({
    win: z.number(),
    loss: z.number(),
    draw: z.number(),
  }),
});

const ChessComStatsSchema = z.object({
  chess_daily: ChessComPerf.optional(),
  chess_rapid: ChessComPerf.optional(),
  chess_blitz: ChessComPerf.optional(),
  chess_bullet: ChessComPerf.optional(),
});
export type ChessComStats = z.infer<typeof ChessComStatsSchema>;

type Archive = {
  archives: string[];
};

const ChessComPlayer = z.object({
  rating: z.number(),
  result: z.string(),
  username: z.string(),
});

const ChessComGames = z.object({
  games: z.array(
    z.object({
      url: z.string(),
      pgn: z.string().nullish(),
      time_control: z.string(),
      end_time: z.number(),
      rated: z.boolean(),
      initial_setup: z.string(),
      fen: z.string(),
      rules: z.string(),
      white: ChessComPlayer,
      black: ChessComPlayer,
    }),
  ),
});

export async function getChessComAccount(
  player: string,
): Promise<ChessComStats | null> {
  const url = `${baseURL}/pub/player/${player.toLowerCase()}/stats`;
  const response = await fetch(url, { headers, method: "GET" });
  if (!response.ok) {
    error(
      `Failed to fetch Chess.com account: ${response.status} ${response.url}`,
    );
    notifications.show({
      title: "Failed to fetch Chess.com account",
      message: `Could not find account "${player}" on chess.com`,
      color: "red",
      icon: <IconX />,
    });
    return null;
  }
  const data = await response.json();
  const stats = ChessComStatsSchema.safeParse(data);
  if (!stats.success) {
    error(
      `Invalid response for Chess.com account: ${response.status} ${response.url}\n${stats.error}`,
    );
    notifications.show({
      title: "Failed to fetch Chess.com account",
      message: `Invalid response for "${player}" on chess.com`,
      color: "red",
      icon: <IconX />,
    });
    return null;
  }
  return stats.data;
}

async function getGameArchives(player: string) {
  const url = `${baseURL}/pub/player/${player}/games/archives`;
  const response = await fetch(url, { headers, method: "GET" });
  return (await response.json()) as Archive;
}

export async function downloadChessCom(
  player: string,
  timestamp: number | null,
) {
  const timestampDate = new Date(timestamp ?? 0);
  const approximateDate = new Date(
    timestampDate.getFullYear(),
    timestampDate.getMonth(),
    1,
  );
  const archives = await getGameArchives(player);
  const file = await resolve(
    await appDataDir(),
    "db",
    `${player}_chesscom.pgn`,
  );
  info(`Found ${archives.archives.length} archives for ${player}`);
  writeTextFile(file, "", {
    append: false,
  });
  const filteredArchives = archives.archives.filter((archive) => {
    const [year, month] = archive.split("/").slice(-2);
    const archiveDate = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
    );
    return archiveDate >= approximateDate;
  });

  for (const archive of filteredArchives) {
    info(`Fetching games for ${player} from ${archive}`);
    const response = await fetch(archive, {
      headers,
      method: "GET",
    });
    const games = ChessComGames.safeParse(await response.json());

    if (!games.success) {
      error(
        `Failed to fetch Chess.com games: ${response.status} ${response.url}`,
      );
      notifications.show({
        title: "Failed to fetch Chess.com games",
        message: `Could not find games for "${player}" on chess.com for ${archive}`,
        color: "red",
        icon: <IconX />,
      });
      return;
    }

    writeTextFile(file, games.data.games.map((g) => g.pgn).join("\n"), {
      append: true,
    });
    events.downloadProgress.emit({
      finished: false,
      id: `chesscom_${player}`,
      progress:
        (filteredArchives.indexOf(archive) / filteredArchives.length) * 100,
    });
  }
  events.downloadProgress.emit({
    finished: false,
    id: `chesscom_${player}`,
    progress: 100,
  });
}

const chessComGameSchema = z.object({
  moveList: z.string(),
  pgnHeaders: z.record(z.string(), z.string()),
});

export async function getChesscomGame(gameURL: string) {
  const regex = /.*\/game\/(live|daily)\/(\d+)/;
  const match = gameURL.match(regex);

  if (!match) {
    return "";
  }

  const gameType = match[1];
  const gameId = match[2];

  const response = await fetch(
    `https://www.chess.com/callback/${gameType}/game/${gameId}`,
    {
      headers,
      method: "GET",
    },
  );

  if (!response.ok) {
    error(`Failed to fetch Chess.com game: ${response.status} ${response.url}`);
    notifications.show({
      title: "Failed to fetch Chess.com game",
      message: `Could not find game "${gameURL}" on chess.com`,
      color: "red",
      icon: <IconX />,
    });
    return null;
  }

  const apiData = await response.json();
  const gameData = chessComGameSchema.safeParse(apiData);
  if (!gameData.success) {
    error(
      `Invalid response for Chess.com game: ${response.status} ${response.url}\n${gameData.error}`,
    );
    notifications.show({
      title: "Failed to fetch Chess.com game",
      message: `Invalid response for "${gameURL}" on chess.com`,
      color: "red",
      icon: <IconX />,
    });
    return null;
  }

  const moveList = gameData.data.moveList;
  const pgnHeaders = gameData.data.pgnHeaders;
  const moves = moveList.match(/.{1,2}/g);
  if (!moves) {
    return "";
  }
  const game = defaultGame<PgnNodeData>(
    () =>
      new Map(Object.entries(pgnHeaders).map(([k, v]) => [k, v.toString()])),
  );
  const chess = Chess.default();

  let lastNode = game.moves;
  for (const move of moves) {
    const m = decodeTCN(move);
    lastNode.children.push(
      new ChildNode({
        san: makeSan(chess, m),
      }),
    );
    chess.play(m);
    lastNode = lastNode.children[0];
  }

  return makePgn(game);
}

// Type for game data used in the Games Viewer
export type ChessComGameData = {
  id: string;
  url: string;
  pgn: string;
  timeControl: string;
  endTime: number;
  rated: boolean;
  white: {
    username: string;
    rating: number;
    result: string;
  };
  black: {
    username: string;
    rating: number;
    result: string;
  };
  opening?: string;
};

// Fetch games for viewing (returns array of games)
export async function fetchChessComGames(
  player: string,
  maxGames: number = 50
): Promise<ChessComGameData[]> {
  const archives = await getGameArchives(player);
  if (!archives.archives || archives.archives.length === 0) {
    return [];
  }

  const allGames: ChessComGameData[] = [];
  // Start from the most recent archive
  const sortedArchives = [...archives.archives].reverse();

  for (const archive of sortedArchives) {
    if (allGames.length >= maxGames) break;

    const response = await fetch(archive, { headers, method: "GET" });
    const gamesResult = ChessComGames.safeParse(await response.json());

    if (!gamesResult.success) {
      error(`Failed to fetch Chess.com games from ${archive}`);
      continue;
    }

    // Also reverse games within the archive to get most recent first
    const reversedGames = [...gamesResult.data.games].reverse();

    for (const game of reversedGames) {
      if (allGames.length >= maxGames) break;

      // Extract game ID from URL
      const urlMatch = game.url.match(/\/game\/(live|daily)\/(\d+)/);
      const gameId = urlMatch ? urlMatch[2] : game.url;

      // Try to extract opening from PGN
      let opening: string | undefined;
      if (game.pgn) {
        const ecoMatch = game.pgn.match(/\[ECOUrl\s+"[^"]*\/([^"]+)"\]/);
        if (ecoMatch) {
          opening = ecoMatch[1].replace(/-/g, " ");
        } else {
          const openingMatch = game.pgn.match(/\[Opening\s+"([^"]+)"\]/);
          if (openingMatch) {
            opening = openingMatch[1];
          }
        }
      }

      allGames.push({
        id: gameId,
        url: game.url,
        pgn: game.pgn || "",
        timeControl: game.time_control,
        endTime: game.end_time,
        rated: game.rated,
        white: {
          username: game.white.username,
          rating: game.white.rating,
          result: game.white.result,
        },
        black: {
          username: game.black.username,
          rating: game.black.rating,
          result: game.black.result,
        },
        opening,
      });
    }
  }

  return allGames;
}

export function getStats(stats: ChessComStats) {
  const statsArray = [];
  if (stats.chess_bullet) {
    statsArray.push({
      value: stats.chess_bullet.last.rating,
      label: "Bullet",
    });
  }
  if (stats.chess_blitz) {
    statsArray.push({
      value: stats.chess_blitz.last.rating,
      label: "Blitz",
    });
  }
  if (stats.chess_rapid) {
    statsArray.push({
      value: stats.chess_rapid.last.rating,
      label: "Rapid",
    });
  }
  if (stats.chess_daily) {
    statsArray.push({
      value: stats.chess_daily.last.rating,
      label: "Daily",
    });
  }
  return statsArray;
}
