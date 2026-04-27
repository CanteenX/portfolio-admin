import type { ChatConversation, ChatMessage } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listChatConversations(
  api: AxiosInstance,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: ChatConversation[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: ChatConversation[]; page: number; limit: number; total: number }>(
    "/api/v1/chat/conversations",
    { params: { page: params.page ?? 1, limit: params.limit ?? 25 } }
  );
  return response.data;
}

export async function createChatConversation(
  api: AxiosInstance,
  payload: { title: string; participantUserIds: string[] }
): Promise<ChatConversation> {
  const response = await api.post<ChatConversation>("/api/v1/chat/conversations", payload);
  return response.data;
}

export async function getChatConversation(api: AxiosInstance, conversationId: string): Promise<ChatConversation> {
  const response = await api.get<ChatConversation>(`/api/v1/chat/conversations/${conversationId}`);
  return response.data;
}

export async function updateChatConversation(
  api: AxiosInstance,
  conversationId: string,
  payload: { title: string }
): Promise<ChatConversation> {
  const response = await api.patch<ChatConversation>(`/api/v1/chat/conversations/${conversationId}`, payload);
  return response.data;
}

export async function archiveChatConversation(api: AxiosInstance, conversationId: string): Promise<ChatConversation> {
  const response = await api.post<ChatConversation>(`/api/v1/chat/conversations/${conversationId}/archive`);
  return response.data;
}

export async function deleteChatConversation(api: AxiosInstance, conversationId: string): Promise<void> {
  await api.delete(`/api/v1/chat/conversations/${conversationId}`);
}

export async function listChatMessages(
  api: AxiosInstance,
  conversationId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: ChatMessage[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: ChatMessage[]; page: number; limit: number; total: number }>(
    `/api/v1/chat/conversations/${conversationId}/messages`,
    { params: { page: params.page ?? 1, limit: params.limit ?? 50 } }
  );
  return response.data;
}

export async function sendChatMessage(
  api: AxiosInstance,
  conversationId: string,
  payload: { content: string }
): Promise<ChatMessage> {
  const response = await api.post<ChatMessage>(`/api/v1/chat/conversations/${conversationId}/messages`, payload);
  return response.data;
}

export async function editChatMessage(
  api: AxiosInstance,
  messageId: string,
  payload: { content: string }
): Promise<ChatMessage> {
  const response = await api.patch<ChatMessage>(`/api/v1/chat/messages/${messageId}`, payload);
  return response.data;
}

export async function deleteChatMessage(api: AxiosInstance, messageId: string): Promise<void> {
  await api.delete(`/api/v1/chat/messages/${messageId}`);
}

export async function getChatInsights(api: AxiosInstance): Promise<{
  counts: {
    totalConversations: number;
    activeConversations: number;
    archivedConversations: number;
    totalMessages: number;
  };
}> {
  const response = await api.get<{
    counts: {
      totalConversations: number;
      activeConversations: number;
      archivedConversations: number;
      totalMessages: number;
    };
  }>("/api/v1/chat/insights");
  return response.data;
}
