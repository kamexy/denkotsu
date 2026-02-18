"use client";

import { useEffect, useState } from "react";

import { getSettings, updateSettings, resetAllData } from "@/lib/db";
import { getAllQuestions } from "@/lib/questions";
import { applyThemePreference } from "@/lib/theme";
import {
  applyRemoteSnapshot,
  generateStrongSyncId,
  getLocalLatestTimestamp,
  isCloudSyncEnabled,
  pullCloudSnapshot,
  pushCloudSnapshot,
  validateSyncId,
} from "@/lib/cloud-sync";
import { RecommendedToolsSection } from "@/components/monetization/RecommendedToolsSection";
import type { ThemePreference, UserSettings } from "@/types";

type SyncWizardMode = "backup" | "restore";
const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "システム" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const APP_BUILD = (process.env.NEXT_PUBLIC_APP_BUILD ?? "").trim();
const APP_VERSION_LABEL = APP_BUILD ? `${APP_VERSION}+${APP_BUILD}` : APP_VERSION;

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [syncIdInput, setSyncIdInput] = useState("");
  const [syncPending, setSyncPending] = useState<null | "push" | "pull" | "save">(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncWizardMode, setSyncWizardMode] = useState<SyncWizardMode>("backup");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [cancelNotice, setCancelNotice] = useState(false);
  const totalQuestions = getAllQuestions().length;
  const cloudSyncEnabled = isCloudSyncEnabled();
  const normalizedSyncIdInput = syncIdInput.trim();
  const syncIdValidationError = normalizedSyncIdInput
    ? validateSyncId(normalizedSyncIdInput)
    : null;
  const savedSyncId = settings?.syncId?.trim() ?? "";
  const hasSavedSyncId = savedSyncId.length > 0;
  const isSyncIdSaved = normalizedSyncIdInput.length > 0 && normalizedSyncIdInput === savedSyncId;
  const hasValidInputSyncId = normalizedSyncIdInput.length > 0 && !syncIdValidationError;
  const isWizardStep1Done = hasValidInputSyncId && isSyncIdSaved;
  const themePreference = settings?.themePreference ?? "system";

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!settings) return;
    setSyncIdInput(settings.syncId ?? "");
  }, [settings]);

  const toggleSetting = async (key: "soundEnabled" | "vibrationEnabled") => {
    if (!settings) return;
    const newValue = !settings[key];
    await updateSettings({ [key]: newValue });
    setSettings({ ...settings, [key]: newValue });
  };

  const handleThemePreferenceChange = async (next: ThemePreference) => {
    if (!settings) return;
    const previous = settings.themePreference;
    if (previous === next) return;

    applyThemePreference(next);
    setSettings((prev) => (prev ? { ...prev, themePreference: next } : prev));

    try {
      await updateSettings({ themePreference: next });
      const latest = await getSettings();
      setSettings(latest);
    } catch {
      applyThemePreference(previous);
      setSettings((prev) => (prev ? { ...prev, themePreference: previous } : prev));
    }
  };

  const handleSaveSyncId = async () => {
    if (!settings || syncPending) return;
    const normalized = syncIdInput.trim();
    if (normalized) {
      const error = validateSyncId(normalized);
      if (error) {
        setSyncNotice(error);
        return;
      }
    }

    setSyncPending("save");
    setSyncNotice(null);
    try {
      await updateSettings({
        syncId: normalized || undefined,
      });
      const latest = await getSettings();
      setSettings(latest);
      setSyncNotice(normalized ? "この端末に同期コードを保存しました。" : "この端末の同期コードを解除しました。");
    } catch {
      setSyncNotice("同期コードの保存に失敗しました。");
    } finally {
      setSyncPending(null);
    }
  };

  const handlePushCloud = async () => {
    if (syncPending) return;
    const syncId = syncIdInput.trim();
    if (!cloudSyncEnabled) {
      setSyncNotice("同期APIが未設定です。NEXT_PUBLIC_SYNC_API_BASE を設定してください。");
      return;
    }
    if (!syncId) {
      setSyncNotice("同期コードを入力してください。初回は「新しい同期コードを作る」が簡単です。");
      return;
    }
    const syncIdError = validateSyncId(syncId);
    if (syncIdError) {
      setSyncNotice(syncIdError);
      return;
    }

    setSyncPending("push");
    setSyncNotice(null);
    try {
      const result = await pushCloudSnapshot(syncId);
      const latest = await getSettings();
      setSettings(latest);
      setSyncNotice(
        result.applied
          ? "この端末の学習データをクラウドにバックアップしました。"
          : "クラウド側により新しいバックアップがあるため、上書きしませんでした。"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "バックアップに失敗しました。";
      setSyncNotice(message);
    } finally {
      setSyncPending(null);
    }
  };

  const handlePullCloud = async () => {
    if (syncPending) return;
    const syncId = syncIdInput.trim();
    if (!cloudSyncEnabled) {
      setSyncNotice("同期APIが未設定です。NEXT_PUBLIC_SYNC_API_BASE を設定してください。");
      return;
    }
    if (!syncId) {
      setSyncNotice("同期コードを入力してください。");
      return;
    }
    const syncIdError = validateSyncId(syncId);
    if (syncIdError) {
      setSyncNotice(syncIdError);
      return;
    }

    setSyncPending("pull");
    setSyncNotice(null);
    try {
      const [result, localLatestAt] = await Promise.all([
        pullCloudSnapshot(syncId),
        getLocalLatestTimestamp(),
      ]);

      if (!result.hasSnapshot) {
        setSyncNotice("この同期コードのバックアップはまだありません。");
        return;
      }

      if (result.serverUpdatedAt <= localLatestAt) {
        setSyncNotice("この端末の方が新しいため、復元は行いませんでした。");
        return;
      }

      await applyRemoteSnapshot(result.snapshot, syncId, result.serverUpdatedAt);
      const latest = await getSettings();
      setSettings(latest);
      applyThemePreference(latest.themePreference);
      setSyncNotice("クラウドのバックアップをこの端末に復元しました。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "復元に失敗しました。";
      setSyncNotice(message);
    } finally {
      setSyncPending(null);
    }
  };

  const handleReset = async () => {
    if (resetPending) return;

    setResetPending(true);
    try {
      await resetAllData();
      setShowResetConfirm(false);
      setCancelNotice(false);
      setResetDone(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } finally {
      setResetPending(false);
    }
  };

  const handleCancelReset = () => {
    if (resetPending) return;
    setShowResetConfirm(false);
    setCancelNotice(true);
    setTimeout(() => {
      setCancelNotice(false);
    }, 1200);
  };

  const handleGenerateSyncId = () => {
    if (syncPending) return;
    const generated = generateStrongSyncId();
    setSyncIdInput(generated);
    setSyncNotice("新しい同期コードを作成しました。まず「このコードを保存」を押してください。");
  };

  const handleRunWizardAction = async () => {
    if (syncWizardMode === "backup") {
      await handlePushCloud();
      return;
    }
    await handlePullCloud();
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
          <p className="text-sm text-slate-500 uppercase tracking-[0.12em] mb-1">
            学習体験
          </p>
          <div className="flex items-center justify-between py-3">
            <span className="text-base text-slate-700 font-medium">サウンド</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.soundEnabled ?? false}
              aria-label="サウンド"
              onClick={() => toggleSetting("soundEnabled")}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings?.soundEnabled ? "bg-teal-700" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings?.soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-base text-slate-700 font-medium">バイブレーション</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.vibrationEnabled ?? false}
              aria-label="バイブレーション"
              onClick={() => toggleSetting("vibrationEnabled")}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                settings?.vibrationEnabled ? "bg-teal-700" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  settings?.vibrationEnabled
                    ? "translate-x-5"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="pt-2 pb-1">
            <p className="text-sm text-slate-500 mb-2">テーマ</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const active = themePreference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      void handleThemePreferenceChange(option.value);
                    }}
                    aria-pressed={active}
                    disabled={!settings}
                    className={`px-2.5 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      active
                        ? "border-teal-600 bg-teal-700 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              デフォルトは「システム」で、端末の設定に連動します。
            </p>
          </div>
        </div>

        {/* Data section */}
        <div className="panel p-4">
          <p className="text-sm text-slate-500 uppercase tracking-[0.12em] mb-3">
            データ
          </p>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-3 space-y-3 mb-3">
            <p className="text-base font-semibold text-slate-700">クラウド同期（β）</p>
            <p className="text-sm text-slate-500">
              2台以上の端末で学習データを移すための機能です。
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 space-y-2">
              <p className="text-sm font-semibold text-slate-700">まず目的を選択</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setSyncWizardMode("backup")}
                  className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                    syncWizardMode === "backup"
                      ? "border-teal-600 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-base font-semibold leading-tight">バックアップを作る</span>
                  <span
                    className={`block mt-0.5 text-sm leading-tight ${
                      syncWizardMode === "backup"
                        ? "text-teal-50/95"
                        : "text-slate-500"
                    }`}
                  >
                    この端末の学習データをクラウドに保存
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncWizardMode("restore")}
                  className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                    syncWizardMode === "restore"
                      ? "border-teal-600 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-base font-semibold leading-tight">バックアップを復元</span>
                  <span
                    className={`block mt-0.5 text-sm leading-tight ${
                      syncWizardMode === "restore"
                        ? "text-teal-50/95"
                        : "text-slate-500"
                    }`}
                  >
                    クラウドのデータをこの端末に読み込む
                  </span>
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">STEP 1: 同期コードを準備</p>
                <span
                  className={`text-[12px] font-semibold rounded-full px-2 py-0.5 ${
                    isWizardStep1Done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {isWizardStep1Done ? "完了" : "未完了"}
                </span>
              </div>
              <label className="block space-y-1">
                <span className="text-sm text-slate-500">同期コード（端末間で共通）</span>
                <input
                  type="text"
                  value={syncIdInput}
                  onChange={(e) => setSyncIdInput(e.target.value)}
                  placeholder="例: dkt-p4n7-z8k2-v6w9"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 disabled:bg-slate-100"
                  disabled={syncPending !== null}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateSyncId}
                  disabled={syncPending !== null}
                  className="w-full sm:w-auto px-2.5 py-1.5 rounded-md border border-teal-300 bg-teal-50 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-100 disabled:opacity-60"
                >
                  新しいコードを作る
                </button>
              </div>
              <p className="text-sm text-slate-500">
                英字と数字を含む12文字以上（推測しやすいコードは利用不可）
              </p>
              {hasSavedSyncId && (
                <p className="text-sm text-slate-500">
                  この端末に保存中のコード: <span className="font-mono">{savedSyncId}</span>
                </p>
              )}
              {normalizedSyncIdInput && !isSyncIdSaved && (
                <p className="text-sm font-semibold text-amber-700">
                  入力中のコードは未保存です。「このコードを保存」を押してください。
                </p>
              )}
              {syncIdValidationError && (
                <p className="text-sm font-semibold text-amber-700">{syncIdValidationError}</p>
              )}
              <button
                type="button"
                onClick={handleSaveSyncId}
                disabled={syncPending !== null}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                {syncPending === "save" ? "保存中..." : "このコードを保存"}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">
                  STEP 2: {syncWizardMode === "backup" ? "バックアップを作成" : "バックアップを復元"}
                </p>
                <span
                  className={`text-[12px] font-semibold rounded-full px-2 py-0.5 ${
                    isWizardStep1Done
                      ? "bg-teal-100 text-teal-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isWizardStep1Done ? "実行可能" : "STEP1完了後"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {syncWizardMode === "backup"
                  ? "この端末の学習データをクラウドに保存します（元端末で実行）"
                  : "クラウド上の学習データをこの端末へ読み込みます（移行先端末で実行）"}
              </p>
              <button
                type="button"
                onClick={() => {
                  void handleRunWizardAction();
                }}
                disabled={
                  syncPending !== null ||
                  !cloudSyncEnabled ||
                  !isWizardStep1Done
                }
                className={`w-full px-3 py-2 rounded-lg text-base font-semibold transition-colors disabled:opacity-60 ${
                  syncWizardMode === "backup"
                    ? "bg-teal-700 text-white hover:bg-teal-800"
                    : "border border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100"
                }`}
              >
                {syncWizardMode === "backup"
                  ? syncPending === "push"
                    ? "バックアップ中..."
                    : "バックアップを実行"
                  : syncPending === "pull"
                    ? "読込中..."
                    : "復元を実行"}
              </button>
            </div>

            {!cloudSyncEnabled && (
              <p className="text-sm text-amber-700">
                同期API未設定: `NEXT_PUBLIC_SYNC_API_BASE` を設定すると利用できます。
              </p>
            )}

            {settings?.lastSyncedAt && (
              <p className="text-sm text-slate-500">
                最終バックアップ/復元: {new Date(settings.lastSyncedAt).toLocaleString("ja-JP")}
              </p>
            )}

            {syncNotice && (
              <p className="text-sm font-semibold text-slate-600" aria-live="polite">
                {syncNotice}
              </p>
            )}
          </div>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => {
                setResetDone(false);
                setCancelNotice(false);
                setShowResetConfirm(true);
              }}
              className="text-base text-rose-600 hover:text-rose-700 py-2 font-semibold transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-lg"
            >
              学習データをリセット
            </button>
          ) : (
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
              <p className="text-base text-rose-800 mb-3">
                すべての学習データが削除されます。この操作は取り消せません。
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetPending}
                  className="px-4 py-2 min-w-[118px] bg-rose-600 text-white text-base rounded-lg font-semibold transition-all hover:bg-rose-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {resetPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                      リセット中...
                    </span>
                  ) : (
                    "リセットする"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelReset}
                  disabled={resetPending}
                  className="px-4 py-2 bg-white text-slate-700 text-base rounded-lg font-semibold border border-slate-300 transition-all hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {cancelNotice && (
            <p className="text-base text-slate-600 mt-2 font-semibold" aria-live="polite">
              キャンセルしました
            </p>
          )}

          {resetDone && (
            <p className="text-base text-emerald-700 mt-2 font-semibold" aria-live="polite">
              リセットしました
            </p>
          )}
        </div>

        <RecommendedToolsSection />

        {/* About */}
        <div className="panel p-4">
          <p className="text-sm text-slate-500 uppercase tracking-[0.12em] mb-3">
            このアプリについて
          </p>
          <div className="space-y-2 text-base text-slate-600">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span className="text-slate-500 font-medium">{APP_VERSION_LABEL}</span>
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
