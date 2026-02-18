import type { ThemePreference } from "@/types";

export const THEME_PREFERENCE_STORAGE_KEY = "denkotsu:theme-preference";

let cleanupSystemThemeListener: (() => void) | null = null;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
}

function setThemeAttributes(preference: ThemePreference): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference);
}

function setStoredThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, preference);
}

export function getStoredThemePreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(THEME_PREFERENCE_STORAGE_KEY);
  return isThemePreference(raw) ? raw : null;
}

export function applyThemePreference(
  preference: ThemePreference,
  options: { persist?: boolean } = {}
): void {
  if (cleanupSystemThemeListener) {
    cleanupSystemThemeListener();
    cleanupSystemThemeListener = null;
  }

  setThemeAttributes(preference);
  if (options.persist !== false) {
    setStoredThemePreference(preference);
  }

  if (
    preference === "system" &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
  ) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setThemeAttributes("system");

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      cleanupSystemThemeListener = () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      mediaQuery.addListener(handleChange);
      cleanupSystemThemeListener = () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }
}

