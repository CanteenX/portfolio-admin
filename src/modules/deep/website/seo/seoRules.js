/**
 * SEO rules, scoring and completeness — pure functions, no React, no DOM.
 *
 * WHY a separate module: the list shows a completeness label per row and the
 * editor shows a score with a per-rule checklist. Computed in two components
 * they would drift, and a row would read "Complete" in the list while the
 * editor listed three failures. They are the same rules evaluated twice.
 */

/**
 * Google truncates the title around 600px and the description around 920px of
 * rendered width, not at a character count. 60 / 160 characters is the industry
 * proxy for those widths and is what the counters enforce.
 */
export const TITLE_LIMIT = 60;
export const DESCRIPTION_LIMIT = 160;

/** Below these a snippet is usually too thin to earn the click. */
export const TITLE_MIN = 30;
export const DESCRIPTION_MIN = 70;

export const KEYWORD_MAX = 10;

/**
 * A counter goes amber at 90% of its limit rather than only at the limit. A bar
 * that merely fills tells you nothing at 75/60 — by the time you notice, the
 * title is already cut off.
 */
export const WARN_RATIO = 0.9;

/**
 * Origin of the PUBLIC site, used to default and to check canonical URLs.
 *
 * In production the admin is served from /admin on the same origin as the
 * marketing site, so window.location.origin is correct. In development the
 * admin runs on :3000 while Next runs on :4000, hence the fallback.
 * REACT_APP_SITE_URL overrides both for a split-domain deployment.
 */
export const siteOrigin = () => {
  const configured = process.env.REACT_APP_SITE_URL;
  if (configured) return String(configured).replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:4000";
};

/** "services" and "/services/" are the same route; store one spelling. */
export const normaliseSlug = (slug) => {
  const raw = String(slug || "").trim();
  if (!raw) return "";
  const withLead = raw.startsWith("/") ? raw : `/${raw}`;
  return withLead.length > 1 ? withLead.replace(/\/+$/, "") : "/";
};

/**
 * The route's own absolute URL, used as the default canonical.
 *
 * Returns "" on a localhost origin, deliberately. The SERVER rejects a
 * localhost canonical outright, because one reaching production would point
 * every crawler at a machine it cannot reach — so pre-filling the field with a
 * value the API will 400 would make every save in local development fail on a
 * field the editor never touched. An empty canonical is valid and means
 * "self-referential", which is what the default was trying to express anyway.
 */
export const absoluteUrlFor = (slug, origin = siteOrigin()) => {
  const path = normaliseSlug(slug);
  if (!path) return "";
  try {
    const host = new URL(origin).hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return "";
  } catch {
    return "";
  }
  return `${origin}${path}`;
};

const text = (value) => String(value ?? "").trim();
const len = (value) => text(value).length;

/**
 * Why validate at all: a canonical pointing at a URL that does not exist, or at
 * another page, tells Google to index that other URL instead. A typo here
 * silently de-indexes the page and nothing else in the UI would say so.
 *
 * @returns {string} empty when the value is fine, otherwise a human explanation
 */
export const canonicalProblem = (value) => {
  const raw = text(value);
  if (!raw) return "";
  if (raw.startsWith("/")) {
    return raw.startsWith("//")
      ? "A path starting with // is a protocol-relative URL, not a route."
      : "";
  }
  let url;
  try {
    url = new URL(raw);
  } catch {
    return "Enter the full address including https:// — a path on its own is not a canonical URL.";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "Only http:// and https:// addresses can be canonical.";
  }
  // Checked BEFORE the dot rule so "localhost" gets the explanation that helps.
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname.endsWith(".local")
  ) {
    return "A local address cannot be canonical — leave this blank to point at the page itself.";
  }
  if (!url.hostname.includes(".")) {
    return "That host does not look like a domain name.";
  }
  return "";
};

/** True when the canonical points somewhere other than this row's own route. */
export const canonicalPointsElsewhere = (value, slug, origin = siteOrigin()) => {
  const raw = text(value);
  if (!raw || canonicalProblem(raw)) return false;
  const expected = absoluteUrlFor(slug, origin);
  if (!expected) return false;
  const tidy = (u) => u.replace(/\/+$/, "").toLowerCase() || "/";
  return tidy(raw) !== tidy(expected);
};

/**
 * Counter state for one length-limited field.
 *
 * Returns a WORD as well as a colour on purpose — `label` renders next to the
 * count, so the warning survives greyscale and colour blindness.
 */
export const counterState = (value, limit) => {
  const count = len(value);
  const warnAt = Math.floor(limit * WARN_RATIO);
  if (count > limit) {
    return {
      count,
      limit,
      state: "over",
      label: "Too long",
      tone: "text-red-500",
      hint: `Google cuts this off at about ${limit} characters.`
    };
  }
  if (count >= warnAt) {
    return {
      count,
      limit,
      state: "near",
      label: "Getting long",
      tone: "text-amber-500",
      hint: `${limit - count} characters left before Google truncates it.`
    };
  }
  return {
    count,
    limit,
    state: "ok",
    label: count === 0 ? "Empty" : "Good",
    tone: "text-muted-foreground",
    hint: ""
  };
};

/** Accepts the stored array or a comma-separated string from a paste. */
export const keywordList = (keywords) => {
  if (Array.isArray(keywords)) return keywords.map(text).filter(Boolean);
  return text(keywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
};

/** OG values inherit the meta values when blank — mirror that in the previews. */
export const effectiveOgTitle = (values) =>
  text(values.ogTitle) || text(values.metaTitle) || text(values.pageTitle);

export const effectiveOgDescription = (values) =>
  text(values.ogDescription) || text(values.metaDescription);

const rule = (id, label, targetId, weight, passed, detail, soft = false) => ({
  id,
  label,
  targetId,
  weight,
  passed,
  detail,
  /** A soft rule still costs score but reads as advice rather than breakage. */
  soft
});

/** The rules for a page that is open to search engines. */
const indexableRules = (values) => {
  const titleLen = len(values.metaTitle);
  const descLen = len(values.metaDescription);
  const keywords = keywordList(values.keywords);
  const primary = keywords[0] || "";
  const canonical = text(values.canonicalUrl);

  return [
    rule("title-present", "Meta title is filled in", "seoMetaTitle", 3, titleLen > 0,
      "Without one, Google invents a title from the page copy."),
    rule("title-length", `Meta title is ${TITLE_MIN}–${TITLE_LIMIT} characters`, "seoMetaTitle", 2,
      titleLen >= TITLE_MIN && titleLen <= TITLE_LIMIT,
      `Currently ${titleLen}. Shorter wastes the slot, longer gets cut off.`),
    rule("description-present", "Meta description is filled in", "seoMetaDescription", 3, descLen > 0,
      "This is the sentence under the link on the results page."),
    rule("description-length", `Meta description is ${DESCRIPTION_MIN}–${DESCRIPTION_LIMIT} characters`,
      "seoMetaDescription", 2, descLen >= DESCRIPTION_MIN && descLen <= DESCRIPTION_LIMIT,
      `Currently ${descLen} characters.`),
    rule("keywords", `Between 1 and ${KEYWORD_MAX} keywords`, "seoKeywordInput", 1,
      keywords.length > 0 && keywords.length <= KEYWORD_MAX,
      keywords.length > KEYWORD_MAX
        ? `${keywords.length} keywords is stuffing; keep the ${KEYWORD_MAX} that matter.`
        : "Used for your own reporting and for the keywords meta tag.",
      true),
    rule("keyword-in-title", "Main keyword appears in the meta title", "seoMetaTitle", 1,
      Boolean(primary) && text(values.metaTitle).toLowerCase().includes(primary.toLowerCase()),
      primary ? `Looking for "${primary}" inside the title.`
              : "Add a keyword and this then checks the title contains it.",
      true),
    rule("canonical-valid", "Canonical URL is a complete, valid address", "seoCanonicalUrl", 2,
      Boolean(canonical) && !canonicalProblem(canonical),
      canonical ? canonicalProblem(canonical) || "Looks good."
                : "Empty leaves Google to decide which URL is the real one."),
    rule("canonical-self", "Canonical points at this page", "seoCanonicalUrl", 1,
      Boolean(canonical) && !canonicalProblem(canonical) &&
        !canonicalPointsElsewhere(canonical, values.slug),
      "A canonical aimed elsewhere hands this page's ranking to that other URL. Deliberate for a duplicate, a mistake otherwise.",
      true),
    rule("og-title", "Social title is set (or inherits the meta title)", "seoOgTitle", 1,
      Boolean(effectiveOgTitle(values)),
      "Shown when the page is shared on WhatsApp, LinkedIn or X."),
    rule("og-description", "Social description is set (or inherits the meta description)",
      "seoOgDescription", 1, Boolean(effectiveOgDescription(values)),
      "Shown under the title in a shared link preview."),
    rule("og-image", "Social share image is set", "seoOgImage", 2, Boolean(text(values.ogImage)),
      "Without one, a shared link renders as a bare grey box."),
    rule("indexable", "Page is open to search engines", "seoNoIndex", 2, values.noIndex !== true,
      "Hide from search is on, so none of the above ever reaches Google.")
  ];
};

/**
 * Rules for a page deliberately hidden from search.
 *
 * Scoring a hidden page against share images and description length would
 * report a permanent 40% and train everyone to ignore the score. What matters
 * there is that it is genuinely shut out and still has a sane tab title.
 */
const hiddenRules = (values) => [
  rule("noindex-on", "Hidden from search engines", "seoNoIndex", 3, values.noIndex === true,
    "Pages that should not rank must be explicitly excluded."),
  rule("title-present", "Title is filled in (used as the browser tab label)", "seoMetaTitle", 2,
    len(values.metaTitle) > 0, "Visitors still see this in their tab and history."),
  rule("title-length", `Title is at most ${TITLE_LIMIT} characters`, "seoMetaTitle", 1,
    len(values.metaTitle) <= TITLE_LIMIT, "Long tab labels get cut off in the browser.")
];

const BANDS = [
  { min: 90, label: "Excellent", tone: "text-emerald-500" },
  { min: 70, label: "Good", tone: "text-emerald-500" },
  { min: 45, label: "Needs work", tone: "text-amber-500" },
  { min: 0, label: "Poor", tone: "text-red-500" }
];

export const evaluateSeo = (values) => {
  const hidden = values?.noIndex === true;
  const rules = hidden ? hiddenRules(values || {}) : indexableRules(values || {});
  const total = rules.reduce((sum, r) => sum + r.weight, 0) || 1;
  const earned = rules.reduce((sum, r) => sum + (r.passed ? r.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  return {
    rules,
    score,
    band: BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1],
    hidden,
    passedCount: rules.filter((r) => r.passed).length,
    totalCount: rules.length
  };
};

/**
 * Completeness for one saved row, as shown in the list.
 *
 * Returns a WORD as well as a colour: a bare coloured dot is unreadable in
 * greyscale, unreadable with a colour vision deficiency, and a lookup for
 * everyone else.
 */
export const completeness = (row) => {
  const { score, hidden, passedCount, totalCount } = evaluateSeo({
    ...(row || {}),
    keywords: keywordList(row?.keywords)
  });
  const detail = `${passedCount} of ${totalCount} checks pass`;

  if (hidden) {
    return {
      score,
      detail,
      label: score === 100 ? "Hidden (correct)" : "Hidden (check title)",
      tone: score === 100 ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-600"
    };
  }
  if (score >= 90) return { score, detail, label: "Complete", tone: "bg-emerald-500/15 text-emerald-600" };
  if (score >= 45) return { score, detail, label: "Needs work", tone: "bg-amber-500/15 text-amber-600" };
  return { score, detail, label: "Missing basics", tone: "bg-red-500/15 text-red-600" };
};
