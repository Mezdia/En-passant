import {
  BaseDirectory,
  readTextFile,
  remove,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import type {
  AsyncStorage,
  AsyncStringStorage,
  SyncStorage,
  SyncStringStorage,
} from "jotai/vanilla/utils/atomWithStorage";

import { warn } from "@tauri-apps/plugin-log";
import type { z } from "zod";

const options = { baseDir: BaseDirectory.AppData };
const isTauriEnv = typeof window !== "undefined" && (window as any).__TAURI__ !== undefined;
export const fileStorage: AsyncStringStorage = {
  async getItem(key) {
    if (!isTauriEnv) {
      try {
        const v = localStorage.getItem(key);
        console.debug(`[fileStorage][fallback] getItem ${key} -> ${v?.length ?? 0} chars`);
        return v;
      } catch (error) {
        console.debug(`[fileStorage][fallback] getItem ${key} -> error: ${error}`);
        return null;
      }
    }
    try {
      const res = await readTextFile(key, options);
      try {
        console.debug(`[fileStorage] getItem ${key} -> ${res?.length ?? 0} chars`);
      } catch {}
      return res;
    } catch (error) {
      console.debug(`[fileStorage] getItem ${key} -> error: ${error}`);
      return null;
    }
  },
  async setItem(key, newValue) {
    if (!isTauriEnv) {
      try {
        localStorage.setItem(key, newValue);
        console.debug(`[fileStorage][fallback] setItem ${key} -> ${newValue?.length ?? 0} chars`);
        return;
      } catch (error) {
        console.debug(`[fileStorage][fallback] setItem ${key} -> error: ${error}`);
        throw error;
      }
    }
    try {
      await writeTextFile(key, newValue, options);
      try {
        console.debug(`[fileStorage] setItem ${key} -> ${newValue?.length ?? 0} chars`);
      } catch {}
    } catch (error) {
      console.debug(`[fileStorage] setItem ${key} -> error: ${error}`);
      throw error;
    }
  },
  async removeItem(key) {
    if (!isTauriEnv) {
      try {
        localStorage.removeItem(key);
        console.debug(`[fileStorage][fallback] removeItem ${key}`);
        return;
      } catch (error) {
        console.debug(`[fileStorage][fallback] removeItem ${key} -> error: ${error}`);
        throw error;
      }
    }
    try {
      await remove(key, options);
      console.debug(`[fileStorage] removeItem ${key}`);
    } catch (error) {
      console.debug(`[fileStorage] removeItem ${key} -> error: ${error}`);
      throw error;
    }
  },
};

export function createZodStorage<Value>(
  schema: z.ZodType<Value>,
  storage: SyncStringStorage,
): SyncStorage<Value> {
  return {
    getItem(key, initialValue) {
      const storedValue = storage.getItem(key);
      if (storedValue === null) {
        return initialValue;
      }
      try {
        return schema.parse(JSON.parse(storedValue));
      } catch {
        warn(`Invalid value for ${key}: ${storedValue}`);
        this.setItem(key, initialValue);
        return initialValue;
      }
    },
    setItem(key, value) {
      storage.setItem(key, JSON.stringify(value));
    },
    removeItem(key) {
      storage.removeItem(key);
    },
  };
}

export function createAsyncZodStorage<Value>(
  schema: z.ZodType<Value>,
  storage: AsyncStringStorage,
): AsyncStorage<Value> {
  return {
    async getItem(key, initialValue) {
      try {
        const storedValue = await storage.getItem(key);
        if (storedValue === null) {
          // attempt to recover from backup for engines file
          try {
            const backupKey = key.endsWith(".json")
              ? key.replace(/\.json$/, ".backup.json")
              : `${key}.backup`;
            const backup = await storage.getItem(backupKey);
            if (backup !== null) {
              const resBackup = schema.safeParse(JSON.parse(backup));
              if (resBackup.success) return resBackup.data;
            }
          } catch (e) {
            // ignore and return initialValue below
          }
          return initialValue;
        }
        try {
          console.debug(`[createAsyncZodStorage] getItem ${key} -> ${storedValue?.length ?? 0} chars`);
        } catch {}
        const res = schema.safeParse(JSON.parse(storedValue));
        if (res.success) {
          return res.data;
        }
        warn(`Invalid value for ${key}: ${storedValue}\n${res.error}`);
        await this.setItem(key, initialValue);
        return initialValue;
      } catch (error) {
        warn(`Error getting ${key}: ${error}`);
        return initialValue;
      }
    },
    async setItem(key, value) {
      const serialized = JSON.stringify(value, null, 4);
      try {
        await storage.setItem(key, serialized);
        try {
          console.debug(`[createAsyncZodStorage] setItem ${key} -> ${serialized?.length ?? 0} chars`);
        } catch {}
      } catch (e) {
        warn(`Failed to write ${key}: ${e}`);
        throw e;
      }
      // also write a backup copy for engines to a secondary file
      try {
        if (key === "engines/engines.json") {
          const backupKey = key.replace(/\.json$/, ".backup.json");
          await storage.setItem(backupKey, serialized);
          console.debug(`[createAsyncZodStorage] setItem backup ${backupKey}`);
        }
      } catch (e) {
        warn(`Failed to write backup for ${key}: ${e}`);
      }
    },
    async removeItem(key) {
      await storage.removeItem(key);
      try {
        if (key === "engines/engines.json") {
          const backupKey = key.replace(/\.json$/, ".backup.json");
          await storage.removeItem(backupKey);
        }
      } catch (e) {
        warn(`Failed to remove backup for ${key}: ${e}`);
      }
    },
  };
}
