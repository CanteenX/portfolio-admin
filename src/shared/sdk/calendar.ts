import type { CalendarEvent } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listCalendarEvents(
  api: AxiosInstance,
  params: { page?: number; limit?: number; from?: string; to?: string; status?: string } = {}
): Promise<{ items: CalendarEvent[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 50 };
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  if (params.status) query.status = params.status;
  const response = await api.get<{ items: CalendarEvent[]; page: number; limit: number; total: number }>(
    "/api/v1/calendar/events",
    { params: query }
  );
  return response.data;
}

export async function createCalendarEvent(
  api: AxiosInstance,
  payload: {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    allDay?: boolean;
    location?: string;
    recurrence?: "none" | "daily" | "weekly" | "monthly";
    color?: string;
    attendeeUserIds?: string[];
    tags?: string[];
  }
): Promise<CalendarEvent> {
  const response = await api.post<CalendarEvent>("/api/v1/calendar/events", payload);
  return response.data;
}

export async function getCalendarEvent(api: AxiosInstance, eventId: string): Promise<CalendarEvent> {
  const response = await api.get<CalendarEvent>(`/api/v1/calendar/events/${eventId}`);
  return response.data;
}

export async function updateCalendarEvent(
  api: AxiosInstance,
  eventId: string,
  payload: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    allDay?: boolean;
    location?: string;
    recurrence?: "none" | "daily" | "weekly" | "monthly";
    color?: string;
    attendeeUserIds?: string[];
    tags?: string[];
  }
): Promise<CalendarEvent> {
  const response = await api.patch<CalendarEvent>(`/api/v1/calendar/events/${eventId}`, payload);
  return response.data;
}

export async function cancelCalendarEvent(api: AxiosInstance, eventId: string): Promise<CalendarEvent> {
  const response = await api.post<CalendarEvent>(`/api/v1/calendar/events/${eventId}/cancel`);
  return response.data;
}

export async function deleteCalendarEvent(api: AxiosInstance, eventId: string): Promise<void> {
  await api.delete(`/api/v1/calendar/events/${eventId}`);
}

export async function getCalendarInsights(api: AxiosInstance): Promise<{
  counts: {
    scheduled: number;
    cancelled: number;
    upcoming: number;
    past: number;
    totalEvents: number;
  };
}> {
  const response = await api.get<{
    counts: {
      scheduled: number;
      cancelled: number;
      upcoming: number;
      past: number;
      totalEvents: number;
    };
  }>("/api/v1/calendar/insights");
  return response.data;
}
