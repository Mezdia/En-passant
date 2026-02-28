import { platform } from "@tauri-apps/plugin-os";
import { atomWithStorage } from "jotai/utils";
import type {
  SyncStorage,
  SyncStringStorage,
} from "jotai/vanilla/utils/atomWithStorage";

const meta = (() => {
  try {
    return platform() === "macos" ? "cmd" : "ctrl";
  } catch {
    return "ctrl";
  }
})();

type Keybind = {
  name: string;
  keys: string;
};

type KeyMap = Record<string, Keybind>;

const keys: KeyMap = {
  NEW_TAB: { name: "Keybind.NewTab", keys: `${meta}+t` },
  CLOSE_TAB: { name: "Keybind.CloseTab", keys: `${meta}+w` },
  OPEN_FILE: { name: "Keybind.OpenFile", keys: `${meta}+o` },
  SAVE_FILE: { name: "Keybind.SaveFile", keys: `${meta}+s` },
  SWAP_ORIENTATION: { name: "Keybind.SwapOrientation", keys: "f" },
  CLEAR_SHAPES: { name: "Keybind.ClearShapes", keys: "ctrl+l" },
  NEXT_MOVE: { name: "Keybind.NextMove", keys: "arrowright" },
  PREVIOUS_MOVE: { name: "Keybind.PreviousMove", keys: "arrowleft" },
  GO_TO_BRANCH_START: { name: "Keybind.GoToBranchStart", keys: "arrowup" },
  GO_TO_BRANCH_END: { name: "Keybind.GoToBranchEnd", keys: "arrowdown" },
  GO_TO_START: { name: "Keybind.GoToStart", keys: "shift+arrowup" },
  GO_TO_END: { name: "Keybind.GoToEnd", keys: "shift+down" },
  NEXT_BRANCH: { name: "Keybind.NextBranch", keys: "c" },
  PREVIOUS_BRANCH: { name: "Keybind.PreviousBranch", keys: "x" },
  NEXT_BRANCHING: { name: "Keybind.NextBranching", keys: "shift+arrowright" },
  PREVIOUS_BRANCHING: {
    name: "Keybind.PreviousBranching",
    keys: "shift+arrowleft",
  },
  DELETE_MOVE: { name: "Keybind.DeleteMove", keys: "delete" },
  CYCLE_TABS: { name: "Keybind.CycleTabs", keys: "ctrl+tab" },
  REVERSE_CYCLE_TABS: {
    name: "Keybind.ReverseCycleTabs",
    keys: "ctrl+shift+tab",
  },
  TOGGLE_EVAL_BAR: { name: "Keybind.ToggleEvalBar", keys: "z" },
  PRACTICE_TAB: { name: "Keybind.PracticeTab", keys: "p" },
  ANALYSIS_TAB: { name: "Keybind.AnalysisTab", keys: "a" },
  DATABASE_TAB: { name: "Keybind.DatabaseTab", keys: "b" },
  ANNOTATE_TAB: { name: "Keybind.AnnotateTab", keys: "d" },
  INFO_TAB: { name: "Keybind.InfoTab", keys: "i" },
  ANNOTATION_BRILLIANT: { name: "Keybind.AnnotationBrilliant", keys: "1" },
  ANNOTATION_GOOD: { name: "Keybind.AnnotationGood", keys: "2" },
  ANNOTATION_INTERESTING: {
    name: "Keybind.AnnotationInteresting",
    keys: "3",
  },
  ANNOTATION_DUBIOUS: { name: "Keybind.AnnotationDubious", keys: "4" },
  ANNOTATION_MISTAKE: { name: "Keybind.AnnotationMistake", keys: "5" },
  ANNOTATION_BLUNDER: { name: "Keybind.AnnotationBlunder", keys: "6" },
  TOGGLE_ALL_ENGINES: { name: "Keybind.ToggleAllEngines", keys: "ctrl+a" },
  TOGGLE_BLUR: { name: "Keybind.ToggleBlur", keys: "ctrl+b" },
  PREVIOUS_GAME: { name: "Keybind.PreviousGame", keys: "pageup" },
  NEXT_GAME: { name: "Keybind.NextGame", keys: "pagedown" },
};

export const keyMapAtom = atomWithStorage(
  "keybinds",
  keys,
  defaultStorage(keys, localStorage),
);

function defaultStorage(
  defaults: KeyMap,
  storage: SyncStringStorage,
): SyncStorage<KeyMap> {
  return {
    getItem(key, initialValue) {
      const storedValue = storage.getItem(key);
      if (storedValue === null) {
        return initialValue;
      }
      const parsed = JSON.parse(storedValue);
      for (const key in defaults) {
        if (!(key in parsed)) {
          parsed[key] = defaults[key];
        }
      }
      return parsed;
    },
    setItem(key, value) {
      const normalized: KeyMap = Object.fromEntries(
        Object.entries(value).map(([subkey, keybind]) => [
          subkey,
          { ...keybind, keys: keybind.keys.replace("meta", meta) },
        ]),
      );
      storage.setItem(key, JSON.stringify(normalized));
    },
    removeItem(key) {
      storage.removeItem(key);
    },
  };
}
