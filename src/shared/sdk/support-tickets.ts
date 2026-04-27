import type { SupportTicket, SupportTicketListItem } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listSupportTickets(
  api: AxiosInstance,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: SupportTicketListItem[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: SupportTicketListItem[]; page: number; limit: number; total: number }>(
    "/api/v1/support-tickets/tickets",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 25
      }
    }
  );
  return response.data;
}

export async function createSupportTicket(
  api: AxiosInstance,
  payload: {
    subject: string;
    description: string;
    requesterName: string;
    requesterEmail: string;
    channel?: "email" | "chat" | "phone" | "web";
    priority?: "low" | "medium" | "high" | "urgent";
    tags?: string[];
    assignedToUserId?: string;
  }
): Promise<SupportTicket> {
  const response = await api.post<SupportTicket>("/api/v1/support-tickets/tickets", payload);
  return response.data;
}

export async function updateSupportTicket(
  api: AxiosInstance,
  ticketId: string,
  payload: {
    subject?: string;
    description?: string;
    requesterName?: string;
    requesterEmail?: string;
    channel?: "email" | "chat" | "phone" | "web";
    priority?: "low" | "medium" | "high" | "urgent";
    tags?: string[];
    assignedToUserId?: string | null;
  }
): Promise<SupportTicket> {
  const response = await api.patch<SupportTicket>(`/api/v1/support-tickets/tickets/${ticketId}`, payload);
  return response.data;
}

export async function transitionSupportTicket(
  api: AxiosInstance,
  ticketId: string,
  payload: {
    to: "open" | "in_progress" | "pending_customer" | "resolved" | "closed";
    note?: string;
  }
): Promise<SupportTicket> {
  const response = await api.post<SupportTicket>(`/api/v1/support-tickets/tickets/${ticketId}/transition`, payload);
  return response.data;
}

export async function addSupportTicketComment(
  api: AxiosInstance,
  ticketId: string,
  payload: { message: string; isInternal?: boolean }
): Promise<SupportTicket> {
  const response = await api.post<SupportTicket>(`/api/v1/support-tickets/tickets/${ticketId}/comments`, payload);
  return response.data;
}

export async function deleteSupportTicket(api: AxiosInstance, ticketId: string): Promise<void> {
  await api.delete(`/api/v1/support-tickets/tickets/${ticketId}`);
}

export async function getSupportTicketInsights(api: AxiosInstance): Promise<{
  counts: {
    open: number;
    inProgress: number;
    pendingCustomer: number;
    resolved: number;
    closed: number;
    urgentOpen: number;
  };
}> {
  const response = await api.get<{
    counts: {
      open: number;
      inProgress: number;
      pendingCustomer: number;
      resolved: number;
      closed: number;
      urgentOpen: number;
    };
  }>("/api/v1/support-tickets/insights");
  return response.data;
}
