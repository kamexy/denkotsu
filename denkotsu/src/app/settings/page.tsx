"use client";

import { useEffect, useState } from "react";

import { getSettings, updateSettings, resetAllData } from "@/lib/db";
import { getAllQuestions } from "@/lib/questions";
import type { UserSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const totalQuestions = getAllQuestions().length;

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const toggleSetting = async (key: "soundEnabled" | "vibrationEnabled") => {
    if (!settings) return;
    const newValue = !settings[key];
    await updateSettings({ [key]: newValue });
    setSettings({ ...settings, [key]: newValue });
  };

  const handleReset = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <h1 className="font-display text-2xl font-bold text-teal-800">設定</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Sound / Vibration toggles */}
        <div className="panel p-4 space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-[0.12em] mb-1">
            学習体験
          </p>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-700 font-medium">サウンド</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.soundEnabled ?? false}
              aria-label="サウンド"
              onClick={() => toggleSetting("soundEnabled")}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings?.soundEnabled ? "bg-teal-700" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings?.soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-700 font-medium">バイブレーション</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.vibrationEnabled ?? false}
              aria-label="バイブレーション"
              onClick={() => toggleSetting("vibrationEnabled")}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings?.vibrationEnabled ? "bg-teal-700" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings?.vibrationEnabled
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data section */}
        <div className="panel p-4">
          <p className="text-xs text-slate-500 uppercase tracking-[0.12em] mb-3">
            データ
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-sm text-rose-600 hover:text-rose-700 py-2 font-semibold"
            >
              学習データをリセット
            </button>
          ) : (
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <p className="text-sm text-rose-800 mb-3">
                すべての学習データが削除されます。この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-rose-600 text-white text-sm rounded-lg font-semibold"
                >
                  リセットする
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-white text-slate-600 text-sm rounded-lg font-semibold border border-slate-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {resetDone && (
            <p className="text-sm text-emerald-700 mt-2 font-semibold">
              リセットしました
            </p>
          )}
        </div>

        {/* About */}
        <div className="panel p-4">
          <p className="text-xs text-slate-500 uppercase tracking-[0.12em] mb-3">
            このアプリについて
          </p>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>バージョン</span>
              {/* TODO: package.jsonまたは環境変数からバージョンを取得する */}
              <span className="text-slate-500 font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>問題数</span>
              <span className="text-slate-500 font-medium">{totalQuestions}問</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
