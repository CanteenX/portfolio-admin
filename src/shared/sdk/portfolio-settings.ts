import type { AxiosInstance } from "axios";

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
  services: string[];
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
