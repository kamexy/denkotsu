import { getMonetizationWarnings, getRecommendedTools } from "@/lib/monetization";
import { TrackedExternalLink } from "@/components/monetization/TrackedExternalLink";

export function RecommendedToolsSection() {
  const warnings = getMonetizationWarnings();
  if (warnings.length > 0) {
    console.warn(`[monetization] ${warnings.join(" / ")}`);
  }

  const tools = getRecommendedTools();
  if (tools.length === 0) return null;

  return (
    <div className="panel p-4">
      <p className="text-sm text-slate-500 uppercase tracking-[0.12em] mb-3">
        試験対策グッズ
      </p>
      <div className="space-y-2">
        {tools.map((tool) => (
          <article
            key={tool.id}
            className="rounded-xl border border-slate-200 bg-white/80 p-3"
          >
            <p className="text-base font-semibold text-slate-800">{tool.name}</p>
            <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
            <TrackedExternalLink
              href={tool.url}
              toolId={tool.id}
              toolName={tool.name}
              label={tool.label}
              className="mt-2 inline-flex items-center rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-100"
            />
          </article>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-slate-500">
        外部サイトへのリンクを含みます（スポンサーリンク）。
      </p>
    </div>
  );
}
