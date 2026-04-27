import type { MailboxMessage } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listMailboxMessages(
  api: AxiosInstance,
  params: { page?: number; limit?: number; folder?: string } = {}
): Promise<{ items: MailboxMessage[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: MailboxMessage[]; page: number; limit: number; total: number }>(
    "/api/v1/mailbox/messages",
    { params: { page: params.page ?? 1, limit: params.limit ?? 25, folder: params.folder ?? "inbox" } }
  );
  return response.data;
}

export async function createMailboxMessage(
  api: AxiosInstance,
  payload: {
    subject: string;
    body: string;
    fromAddress: string;
    fromName: string;
    toAddresses: string[];
    ccAddresses?: string[];
    bccAddresses?: string[];
    folder?: "drafts" | "sent";
  }
): Promise<MailboxMessage> {
  const response = await api.post<MailboxMessage>("/api/v1/mailbox/messages", payload);
  return response.data;
}

export async function getMailboxMessage(api: AxiosInstance, messageId: string): Promise<MailboxMessage> {
  const response = await api.get<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}`);
  return response.data;
}

export async function updateMailboxMessage(
  api: AxiosInstance,
  messageId: string,
  payload: {
    subject?: string;
    body?: string;
    toAddresses?: string[];
    ccAddresses?: string[];
    bccAddresses?: string[];
  }
): Promise<MailboxMessage> {
  const response = await api.patch<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}`, payload);
  return response.data;
}

export async function sendMailboxDraft(api: AxiosInstance, messageId: string): Promise<MailboxMessage> {
  const response = await api.post<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}/send`);
  return response.data;
}

export async function moveMailboxMessage(
  api: AxiosInstance,
  messageId: string,
  folder: "inbox" | "sent" | "drafts" | "trash" | "archive"
): Promise<MailboxMessage> {
  const response = await api.post<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}/move`, { folder });
  return response.data;
}

export async function toggleMailboxStar(api: AxiosInstance, messageId: string): Promise<MailboxMessage> {
  const response = await api.post<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}/star`);
  return response.data;
}

export async function markMailboxRead(api: AxiosInstance, messageId: string): Promise<MailboxMessage> {
  const response = await api.post<MailboxMessage>(`/api/v1/mailbox/messages/${messageId}/read`);
  return response.data;
}

export async function deleteMailboxMessage(api: AxiosInstance, messageId: string): Promise<void> {
  await api.delete(`/api/v1/mailbox/messages/${messageId}`);
}

export async function getMailboxInsights(api: AxiosInstance): Promise<{
  counts: {
    inbox: number;
    sent: number;
    drafts: number;
    trash: number;
    archive: number;
    unread: number;
    starred: number;
  };
}> {
  const response = await api.get<{
    counts: {
      inbox: number;
      sent: number;
      drafts: number;
      trash: number;
      archive: number;
      unread: number;
      starred: number;
    };
  }>("/api/v1/mailbox/insights");
  return response.data;
}
