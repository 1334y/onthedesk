export interface ScreenInfo {
  width: number;
  height: number;
  taskbar_y: number;
}

function isTauri(): boolean {
  return !!(window as any).__TAURI_INTERNALS__;
}

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
    return tauriInvoke<T>(cmd, args);
  }
  return null as T;
}

export class TauriBridge {
  private static instance: TauriBridge;
  static getInstance(): TauriBridge {
    if (!TauriBridge.instance) TauriBridge.instance = new TauriBridge();
    return TauriBridge.instance;
  }

  get isDesktop(): boolean { return isTauri(); }

  async getScreenInfo(): Promise<ScreenInfo> {
    if (isTauri()) return invoke<ScreenInfo>('get_screen_info');
    return { width: 1920, height: 1080, taskbar_y: 1020 };
  }

  /** 移动窗口到逻辑坐标 (screenX/Y 同单位) */
  async moveWindow(x: number, y: number): Promise<void> {
    if (!isTauri()) return;
    await invoke('move_window_to', { x: Math.round(x), y: Math.round(y) });
  }
}
