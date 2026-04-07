export const SITE_NAME = "デンコツ";
export const SITE_TITLE = "デンコツ - 第二種電気工事士";
export const SITE_DESCRIPTION =
  "第二種電気工事士の学科・技能を無料で学べる学習サイト。1問10秒のクイズ、要点解説、欠陥判定、候補問題の手順練習まで一つにまとめています。";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://denkotsu.pages.dev"
).trim();
export const CONTACT_URL = "https://github.com/kamexy/denkotsu/issues";

export function getAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, SITE_URL).toString();
}
