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
    <div className="pb-20">
      <header className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">設定</h1>
      </header>

      <div className="px-4 py-4">
        {/* Sound / Vibration toggles */}
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-700">サウンド</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.soundEnabled ?? false}
              aria-label="サウンド"
              onClick={() => toggleSetting("soundEnabled")}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings?.soundEnabled ? "bg-blue-600" : "bg-gray-300"
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
            <span className="text-sm text-gray-700">バイブレーション</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.vibrationEnabled ?? false}
              aria-label="バイブレーション"
              onClick={() => toggleSetting("vibrationEnabled")}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                settings?.vibrationEnabled ? "bg-blue-600" : "bg-gray-300"
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
        <div className="mt-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            データ
          </p>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-sm text-red-500 hover:text-red-600 py-2"
            >
              学習データをリセット
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm text-red-700 mb-3">
                すべての学習データが削除されます。この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-medium"
                >
                  リセットする
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-white text-gray-600 text-sm rounded-lg font-medium border border-gray-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {resetDone && (
            <p className="text-sm text-emerald-600 mt-2">
              リセットしました
            </p>
          )}
        </div>

        {/* About */}
        <div className="mt-8">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            このアプリについて
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>バージョン</span>
              {/* TODO: package.jsonまたは環境変数からバージョンを取得する */}
              <span className="text-gray-400">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>問題数</span>
              <span className="text-gray-400">{totalQuestions}問</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
