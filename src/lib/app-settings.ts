import { useEffect, useState } from "react";

const APP_SETTINGS_STORAGE_KEY = "veritas-admin-hub.app-settings";
const APP_SETTINGS_UPDATED_EVENT = "veritas-admin-hub.app-settings-updated";

export const DEFAULT_SOFTWARE_NAME = "Application Management";

export interface AppSettings {
  softwareName: string;
}

const defaultSettings: AppSettings = {
  softwareName: DEFAULT_SOFTWARE_NAME,
};

function normalizeSoftwareName(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_SOFTWARE_NAME;
}

function canUseWindow() {
  return typeof window !== "undefined";
}

export function getAppSettings(): AppSettings {
  if (!canUseWindow()) {
    return defaultSettings;
  }

  const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      softwareName: normalizeSoftwareName(
        parsed.softwareName ?? defaultSettings.softwareName,
      ),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(next: Partial<AppSettings>) {
  const merged: AppSettings = {
    ...getAppSettings(),
    ...next,
  };

  const normalized: AppSettings = {
    softwareName: normalizeSoftwareName(merged.softwareName),
  };

  if (canUseWindow()) {
    window.localStorage.setItem(
      APP_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalized),
    );
    window.dispatchEvent(new Event(APP_SETTINGS_UPDATED_EVENT));
  }

  return normalized;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());

  useEffect(() => {
    if (!canUseWindow()) {
      return;
    }

    const refresh = () => {
      setSettings(getAppSettings());
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === APP_SETTINGS_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(APP_SETTINGS_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(APP_SETTINGS_UPDATED_EVENT, refresh);
    };
  }, []);

  const setSoftwareName = (softwareName: string) => {
    const updated = saveAppSettings({ softwareName });
    setSettings(updated);
    return updated;
  };

  return {
    settings,
    setSoftwareName,
  };
}
