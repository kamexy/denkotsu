"use client";

import { useEffect } from "react";
import { runStartupCloudPull } from "@/lib/cloud-sync";
import { getSettings } from "@/lib/db";
import { applyThemePreference, isThemePreference } from "@/lib/theme";

export function CloudSyncBootstrap() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await runStartupCloudPull();
        if (cancelled) return;

        const latest = await getSettings();
        if (isThemePreference(latest.themePreference)) {
          applyThemePreference(latest.themePreference);
        }
      } catch {
        // 起動時処理でエラーが出てもUIは継続
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
