export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    ((window as any).__TAURI__ !== undefined ||
      (window as any).__TAURI_IPC__ !== undefined)
  );
}
