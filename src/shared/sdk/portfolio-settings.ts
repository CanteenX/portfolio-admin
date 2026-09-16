import type { AxiosInstance } from "axios";

export type PageCopy = { eyebrow: string; title: string; lead: string };

/** Must match `pageCopy` on the server and the key the website resolves with. */
export type PageCopyKey =
  | "work"
  | "services"
  | "team"
  | "about"
  | "process"
  | "contact"
  | "insights"
  | "faq";

export type PortfolioSettings = {
  _id?: string;
  hero: {
    tagline: string;
    description: string;
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
    featuredProjects: { title: string; description: string; href: string; image: string; eyebrow: string }[];
  };
  navbar: { brandName: string; links: { label: string; href: string }[] };
  footer: { description: string; email: string; version: string; links: { label: string; href: string }[] };
  techMarquee: string[];
  callSlots: string[];
  about: {
    vision: string;
    mission: string;
    values: { icon: string; title: string; desc: string }[];
    stats: { label: string; value: string }[];
  };
  process: {
    phases: { id: string; n: string; title: string; description: string; accent: string; dot: string }[];
    perks: { title: string; description: string; icon: string; gradient: string; border: string }[];
  };
  teamPlaybook: { phase: string; name: string; body: string }[];
  contactInfo: { email: string; phone: string };
  /** Per-page opening block. A blank field means "keep the shipped copy". */
  pageCopy?: Partial<Record<PageCopyKey, PageCopy>>;
  contactCta?: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: { label: string; href: string };
    secondary: { label: string; href: string };
  };
  contactForm?: { budgetBands: string[]; timelines: string[] };
  engagement?: {
    eyebrow: string;
    title: string;
    lead: string;
    bands: { name: string; range: string; duration: string; description: string }[];
    footnote: string;
  };
  isActive: boolean;
};

export async function getPortfolioSettings(api: AxiosInstance): Promise<PortfolioSettings> {
  const response = await api.get<PortfolioSettings>("/api/v1/portfolio/settings");
  return response.data;
}

export async function updatePortfolioSettings(
  api: AxiosInstance,
  payload: Partial<PortfolioSettings>
): Promise<PortfolioSettings> {
  const response = await api.put<PortfolioSettings>("/api/v1/portfolio/settings", payload);
  return response.data;
}
