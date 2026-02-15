export function isTauri(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const tauriWindow = window as Window & {
    __TAURI__?: unknown;
    __TAURI_IPC__?: unknown;
  };
  return (
    tauriWindow.__TAURI__ !== undefined ||
    tauriWindow.__TAURI_IPC__ !== undefined
  );
}
