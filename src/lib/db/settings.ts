import { getDB } from "./db";
import type { AppSettings } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "light",
  textSize: "normal",
  highContrast: false,
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const all = await db.getAll("settings");
  const settings: Record<string, unknown> = {};
  for (const item of all) {
    settings[item.key] = item.value;
  }
  return { ...DEFAULT_SETTINGS, ...settings } as AppSettings;
}

export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  const db = await getDB();
  for (const [key, value] of Object.entries(partial)) {
    await db.put("settings", { key, value });
  }
}
