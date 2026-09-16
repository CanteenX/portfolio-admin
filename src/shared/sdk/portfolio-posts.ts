import type { AxiosInstance } from "axios";

export type PostBlockType = "paragraph" | "heading" | "quote" | "code" | "list";

export type PostBlock = {
  type: PostBlockType;
  /** Heading text for `heading`, language for `code`, attribution for `quote`. */
  label: string;
  text: string;
};

export type PortfolioPostSummary = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  readingMinutes: number;
  isPublished: boolean;
  isFeatured: boolean;
  order: number;
};

export type PortfolioPost = PortfolioPostSummary & {
  blocks: PostBlock[];
};

/** The list endpoint omits blocks — fetch one post to edit its body. */
export async function listPosts(api: AxiosInstance): Promise<PortfolioPostSummary[]> {
  const response = await api.get<{ items: PortfolioPostSummary[] }>("/api/v1/portfolio/posts");
  return response.data.items ?? [];
}

export async function getPost(api: AxiosInstance, id: string): Promise<PortfolioPost> {
  const response = await api.get<PortfolioPost>(`/api/v1/portfolio/posts/${id}`);
  return response.data;
}

export async function createPost(
  api: AxiosInstance,
  payload: Partial<Omit<PortfolioPost, "_id">>
): Promise<PortfolioPost> {
  const response = await api.post<PortfolioPost>("/api/v1/portfolio/posts", payload);
  return response.data;
}

export async function updatePost(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<PortfolioPost, "_id">>
): Promise<PortfolioPost> {
  const response = await api.patch<PortfolioPost>(`/api/v1/portfolio/posts/${id}`, payload);
  return response.data;
}

export async function deletePost(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/posts/${id}`);
}
