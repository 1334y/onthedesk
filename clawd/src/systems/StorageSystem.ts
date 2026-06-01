/**
 * 本地持久化 — localStorage
 */
import type { PetStats } from './NurtureSystem';

const KEY_STATS = 'clawd-stats';
const KEY_SETTINGS = 'clawd-settings';

export interface SaveData {
  stats: PetStats;
  lastDecayTime: Record<string, number>;
  deskX: number;
  deskY: number;
}

export function savePet(data: SaveData): void {
  try { localStorage.setItem(KEY_STATS, JSON.stringify(data)); } catch {}
}

export function loadPet(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY_STATS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export interface AppSettings {
  apiKey: string;
  autoStart: boolean;
  scale: number;
}

export function saveSettings(s: AppSettings): void {
  try { localStorage.setItem(KEY_SETTINGS, JSON.stringify(s)); } catch {}
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? JSON.parse(raw) : { apiKey: '', autoStart: false, scale: 2.3 };
  } catch { return { apiKey: '', autoStart: false, scale: 2.3 }; }
}
