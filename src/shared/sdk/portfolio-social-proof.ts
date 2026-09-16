import type { AxiosInstance } from "axios";

export type PortfolioTestimonial = {
  _id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  avatar: string;
  rating?: number;
  isActive: boolean;
  order: number;
};

export type PortfolioClientLogo = {
  _id: string;
  name: string;
  logo: string;
  websiteUrl: string;
  isActive: boolean;
  order: number;
};

export type PortfolioMetric = {
  _id: string;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
  order: number;
};

/**
 * The three collections share an identical endpoint shape, so one factory
 * covers all of them. Writing twelve near-identical functions by hand is how a
 * path typo ends up pointing one resource's update at another's collection.
 */
function resource<T extends { _id: string }>(path: string) {
  return {
    list: async (api: AxiosInstance): Promise<T[]> => {
      const response = await api.get<{ items: T[] }>(`/api/v1/portfolio/${path}`);
      return response.data.items ?? [];
    },
    create: async (api: AxiosInstance, payload: Partial<Omit<T, "_id">>): Promise<T> => {
      const response = await api.post<T>(`/api/v1/portfolio/${path}`, payload);
      return response.data;
    },
    update: async (api: AxiosInstance, id: string, payload: Partial<Omit<T, "_id">>): Promise<T> => {
      const response = await api.patch<T>(`/api/v1/portfolio/${path}/${id}`, payload);
      return response.data;
    },
    remove: async (api: AxiosInstance, id: string): Promise<void> => {
      await api.delete(`/api/v1/portfolio/${path}/${id}`);
    }
  };
}

export const testimonialsApi = resource<PortfolioTestimonial>("testimonials");
export const clientLogosApi = resource<PortfolioClientLogo>("client-logos");
export const metricsApi = resource<PortfolioMetric>("metrics");
