import { useEffect, useState } from "react";

const APP_SETTINGS_STORAGE_KEY = "veritas-admin-hub.app-settings";
const APP_SETTINGS_UPDATED_EVENT = "veritas-admin-hub.app-settings-updated";

export const DEFAULT_SOFTWARE_NAME = "Application Management";
export const DEFAULT_SOFTWARE_TAGLINE = "Admin Panel";
export const DEFAULT_DASHBOARD_WELCOME = "Welcome back, Admin";
export const DEFAULT_TIMEZONE = "UTC";

export const DATE_FORMAT_OPTIONS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;
export const TIME_FORMAT_OPTIONS = ["12h", "24h"] as const;

export type DateFormat = (typeof DATE_FORMAT_OPTIONS)[number];
export type TimeFormat = (typeof TIME_FORMAT_OPTIONS)[number];

export interface AppSettings {
  softwareName: string;
  softwareTagline: string;
  dashboardWelcome: string;
  showNotificationDot: boolean;
  timezone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  maintenanceMode: boolean;
}

export const APP_SETTINGS_DEFAULTS: AppSettings = {
  softwareName: DEFAULT_SOFTWARE_NAME,
  softwareTagline: DEFAULT_SOFTWARE_TAGLINE,
  dashboardWelcome: DEFAULT_DASHBOARD_WELCOME,
  showNotificationDot: true,
  timezone: DEFAULT_TIMEZONE,
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  maintenanceMode: false,
};

function normalizeText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function canUseWindow() {
  return typeof window !== "undefined";
}

function normalizeDateFormat(value: string | undefined): DateFormat {
  return DATE_FORMAT_OPTIONS.includes(value as DateFormat)
    ? (value as DateFormat)
    : APP_SETTINGS_DEFAULTS.dateFormat;
}

function normalizeTimeFormat(value: string | undefined): TimeFormat {
  return TIME_FORMAT_OPTIONS.includes(value as TimeFormat)
    ? (value as TimeFormat)
    : APP_SETTINGS_DEFAULTS.timeFormat;
}

function normalizeTimezone(value: string | undefined): string {
  const candidate = (value ?? "").trim();
  if (candidate.length === 0) {
    return APP_SETTINGS_DEFAULTS.timezone;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return APP_SETTINGS_DEFAULTS.timezone;
  }
}

export function getAppSettings(): AppSettings {
  if (!canUseWindow()) {
    return APP_SETTINGS_DEFAULTS;
  }

  const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return APP_SETTINGS_DEFAULTS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      softwareName: normalizeText(
        parsed.softwareName ?? APP_SETTINGS_DEFAULTS.softwareName,
        DEFAULT_SOFTWARE_NAME,
      ),
      softwareTagline: normalizeText(
        parsed.softwareTagline ?? APP_SETTINGS_DEFAULTS.softwareTagline,
        DEFAULT_SOFTWARE_TAGLINE,
      ),
      dashboardWelcome: normalizeText(
        parsed.dashboardWelcome ?? APP_SETTINGS_DEFAULTS.dashboardWelcome,
        DEFAULT_DASHBOARD_WELCOME,
      ),
      showNotificationDot:
        typeof parsed.showNotificationDot === "boolean"
          ? parsed.showNotificationDot
          : APP_SETTINGS_DEFAULTS.showNotificationDot,
      timezone: normalizeTimezone(parsed.timezone),
      dateFormat: normalizeDateFormat(parsed.dateFormat),
      timeFormat: normalizeTimeFormat(parsed.timeFormat),
      maintenanceMode:
        typeof parsed.maintenanceMode === "boolean"
          ? parsed.maintenanceMode
          : APP_SETTINGS_DEFAULTS.maintenanceMode,
    };
  } catch {
    return APP_SETTINGS_DEFAULTS;
  }
}

export function saveAppSettings(next: Partial<AppSettings>) {
  const merged: AppSettings = {
    ...getAppSettings(),
    ...next,
  };

  const normalized: AppSettings = {
    softwareName: normalizeText(merged.softwareName, DEFAULT_SOFTWARE_NAME),
    softwareTagline: normalizeText(
      merged.softwareTagline,
      DEFAULT_SOFTWARE_TAGLINE,
    ),
    dashboardWelcome: normalizeText(
      merged.dashboardWelcome,
      DEFAULT_DASHBOARD_WELCOME,
    ),
    showNotificationDot: Boolean(merged.showNotificationDot),
    timezone: normalizeTimezone(merged.timezone),
    dateFormat: normalizeDateFormat(merged.dateFormat),
    timeFormat: normalizeTimeFormat(merged.timeFormat),
    maintenanceMode: Boolean(merged.maintenanceMode),
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

  const setAppSettings = (next: Partial<AppSettings>) => {
    const updated = saveAppSettings(next);
    setSettings(updated);
    return updated;
  };

  const setSoftwareName = (softwareName: string) => {
    return setAppSettings({ softwareName });
  };

  const resetAppSettings = () => {
    return setAppSettings(APP_SETTINGS_DEFAULTS);
  };

  return {
    settings,
    setAppSettings,
    setSoftwareName,
    resetAppSettings,
  };
}
