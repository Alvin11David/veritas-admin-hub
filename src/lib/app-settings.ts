import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  DocumentSnapshot,
} from "firebase/firestore";

const FIRESTORE_COLLECTION = "appSettings";
const FIRESTORE_DOC_ID = "admin";

export const DEFAULT_SOFTWARE_NAME = "Application Management";
export const DEFAULT_SOFTWARE_TAGLINE = "Admin Panel";
export const DEFAULT_DASHBOARD_WELCOME = "Welcome back, Admin";
export const DEFAULT_TIMEZONE = "UTC";

export const DATE_FORMAT_OPTIONS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
] as const;
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
  studentPortalName: string;
  ourMission: string;
  organizationMission: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationWhatsappCta: string;
  organizationAddress: string;
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
  studentPortalName: "",
  ourMission: "",
  organizationMission: "",
  organizationEmail: "",
  organizationPhone: "",
  organizationWhatsappCta: "",
  organizationAddress: "",
};

function normalizeText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
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

function normalizeFirestoreData(
  data: Partial<AppSettings> | undefined,
): AppSettings {
  if (!data) {
    return APP_SETTINGS_DEFAULTS;
  }

  return {
    softwareName: normalizeText(
      data.softwareName ?? APP_SETTINGS_DEFAULTS.softwareName,
      DEFAULT_SOFTWARE_NAME,
    ),
    softwareTagline: normalizeText(
      data.softwareTagline ?? APP_SETTINGS_DEFAULTS.softwareTagline,
      DEFAULT_SOFTWARE_TAGLINE,
    ),
    dashboardWelcome: normalizeText(
      data.dashboardWelcome ?? APP_SETTINGS_DEFAULTS.dashboardWelcome,
      DEFAULT_DASHBOARD_WELCOME,
    ),
    showNotificationDot:
      typeof data.showNotificationDot === "boolean"
        ? data.showNotificationDot
        : APP_SETTINGS_DEFAULTS.showNotificationDot,
    timezone: normalizeTimezone(data.timezone),
    dateFormat: normalizeDateFormat(data.dateFormat),
    timeFormat: normalizeTimeFormat(data.timeFormat),
    maintenanceMode:
      typeof data.maintenanceMode === "boolean"
        ? data.maintenanceMode
        : APP_SETTINGS_DEFAULTS.maintenanceMode,
    studentPortalName: normalizeText(
      data.studentPortalName ?? APP_SETTINGS_DEFAULTS.studentPortalName,
      "",
    ),
    ourMission: normalizeText(data.ourMission ?? APP_SETTINGS_DEFAULTS.ourMission, ""),
    organizationMission: normalizeText(
      data.organizationMission ?? APP_SETTINGS_DEFAULTS.organizationMission,
      "",
    ),
    organizationEmail: normalizeText(
      data.organizationEmail ?? APP_SETTINGS_DEFAULTS.organizationEmail,
      "",
    ),
    organizationPhone: normalizeText(
      data.organizationPhone ?? APP_SETTINGS_DEFAULTS.organizationPhone,
      "",
    ),
    organizationWhatsappCta: normalizeText(
      data.organizationWhatsappCta ??
        APP_SETTINGS_DEFAULTS.organizationWhatsappCta,
      "",
    ),
    organizationAddress: normalizeText(
      data.organizationAddress ?? APP_SETTINGS_DEFAULTS.organizationAddress,
      "",
    ),
  };
}

export async function getAppSettingsFromFirestore(): Promise<AppSettings> {
  try {
    const docRef = doc(collection(db, FIRESTORE_COLLECTION), FIRESTORE_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return normalizeFirestoreData(docSnap.data() as Partial<AppSettings>);
    }

    return APP_SETTINGS_DEFAULTS;
  } catch (error) {
    console.error("Error fetching app settings from Firestore:", error);
    return APP_SETTINGS_DEFAULTS;
  }
}

export async function saveAppSettingsToFirestore(
  current: AppSettings,
  next: Partial<AppSettings>,
): Promise<AppSettings> {
  const merged: AppSettings = {
    ...current,
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
    studentPortalName: normalizeText(merged.studentPortalName, ""),
    ourMission: normalizeText(merged.ourMission, ""),
    organizationMission: normalizeText(merged.organizationMission, ""),
    organizationEmail: normalizeText(merged.organizationEmail, ""),
    organizationPhone: normalizeText(merged.organizationPhone, ""),
    organizationWhatsappCta: normalizeText(merged.organizationWhatsappCta, ""),
    organizationAddress: normalizeText(merged.organizationAddress, ""),
  };

  try {
    const docRef = doc(collection(db, FIRESTORE_COLLECTION), FIRESTORE_DOC_ID);
    await setDoc(docRef, normalized);
    return normalized;
  } catch (error) {
    console.error("Error saving app settings to Firestore:", error);
    throw error;
  }
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(APP_SETTINGS_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load from Firestore
    const loadSettings = async () => {
      try {
        const data = await getAppSettingsFromFirestore();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettings(APP_SETTINGS_DEFAULTS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(
      doc(collection(db, FIRESTORE_COLLECTION), FIRESTORE_DOC_ID),
      (docSnap: DocumentSnapshot) => {
        if (docSnap.exists()) {
          const data = normalizeFirestoreData(
            docSnap.data() as Partial<AppSettings>,
          );
          setSettings(data);
        } else {
          setSettings(APP_SETTINGS_DEFAULTS);
        }
      },
      (error) => {
        console.error("Error listening to settings:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  const setAppSettings = async (next: Partial<AppSettings>) => {
    try {
      const updated = await saveAppSettingsToFirestore(settings, next);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  const resetAppSettings = async () => {
    return setAppSettings(APP_SETTINGS_DEFAULTS);
  };

  return {
    settings,
    loading,
    setAppSettings,
    resetAppSettings,
  };
}
