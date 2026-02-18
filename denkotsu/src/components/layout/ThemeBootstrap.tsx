"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/db";
import {
  applyThemePreference,
  getStoredThemePreference,
  isThemePreference,
} from "@/lib/theme";
import type { ThemePreference } from "@/types";

export function ThemeBootstrap() {
  useEffect(() => {
    const localPreference = getStoredThemePreference() ?? "system";
    applyThemePreference(localPreference, { persist: false });

    void (async () => {
      try {
        const settings = await getSettings();
        const preference: ThemePreference = isThemePreference(settings.themePreference)
          ? settings.themePreference
          : localPreference;
        applyThemePreference(preference);
      } catch {
        applyThemePreference(localPreference, { persist: false });
      }
    })();
  }, []);

  return null;
}

