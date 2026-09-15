import { evaluateSeo } from "./seoRules";

/**
 * Score with a per-rule checklist, and a Google result preview.
 *
 * The score alone is a number nobody can act on. Every failing rule names the
 * field it is about and explains the consequence, and clicking one focuses that
 * field — so "62%" becomes a list of things to type.
 */
export function SeoScorePanel({ values }) {
  const { rules, score, band, hidden, passedCount, totalCount } = evaluateSeo(values);

  const focusField = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.focus();
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            SEO score
          </span>
          <span className={`text-3xl font-semibold tabular-nums ${band.tone}`}>{score}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              score >= 70 ? "bg-emerald-500" : score >= 45 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {band.label} — {passedCount} of {totalCount} checks pass
          {hidden ? " (scored as a hidden page)" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {rules.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => focusField(r.targetId)}
            className="flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/40"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                r.passed
                  ? "bg-emerald-500/15 text-emerald-600"
                  : r.soft
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-red-500/15 text-red-600"
              }`}
            >
              {r.passed ? "✓" : "!"}
            </span>
            <span className="min-w-0">
              {/* The word, not just the colour — this has to survive greyscale. */}
              <span className="block text-sm font-medium">
                {r.label}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({r.passed ? "pass" : r.soft ? "advice" : "fail"})
                </span>
              </span>
              {!r.passed && r.detail ? (
                <span className="mt-0.5 block text-xs text-muted-foreground">{r.detail}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Approximation of a Google result.
 *
 * Deliberately not pixel-accurate — the point is to make truncation and a
 * missing description obvious at a glance, which a form with two text inputs
 * does not.
 */
export function GooglePreview({ values, url }) {
  const title = values.metaTitle || values.pageTitle || "Untitled page";
  const description =
    values.metaDescription || "No meta description — Google will invent one from the page copy.";

  return (
    <div className="rounded-xl border border-border p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Search result preview
      </span>
      <div className="mt-4 font-sans">
        <div className="truncate text-xs text-emerald-700">{url || "(no canonical set)"}</div>
        <div className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title}</div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
