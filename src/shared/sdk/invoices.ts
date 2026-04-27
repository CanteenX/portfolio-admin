import type { InvoiceDocument } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listInvoiceDocuments(api: AxiosInstance): Promise<InvoiceDocument[]> {
  const response = await api.get<{ items: InvoiceDocument[] }>("/api/v1/invoices/documents");
  return response.data.items;
}

export async function createInvoiceDocument(
  api: AxiosInstance,
  payload: {
    contactId?: string;
    dealId?: string;
    orderId?: string;
    currency?: string;
    lineItems: Array<{ description: string; quantity: number; unitPriceMinor: number }>;
    taxMinor?: number;
    discountMinor?: number;
    amountPaidMinor?: number;
    dueAt?: string;
    notes?: string;
  }
): Promise<InvoiceDocument> {
  const response = await api.post<InvoiceDocument>("/api/v1/invoices/documents", payload);
  return response.data;
}

export async function transitionInvoiceDocument(
  api: AxiosInstance,
  id: string,
  payload: {
    to: "draft" | "issued" | "sent" | "partially_paid" | "overdue" | "paid" | "void" | "uncollectible";
    amountPaidMinor?: number;
  }
): Promise<InvoiceDocument> {
  const response = await api.post<InvoiceDocument>(`/api/v1/invoices/documents/${id}/transition`, payload);
  return response.data;
}

export async function getInvoiceInsights(api: AxiosInstance): Promise<{
  counts: { draft: number; sent: number; paid: number; overdue: number };
}> {
  const response = await api.get<{ counts: { draft: number; sent: number; paid: number; overdue: number } }>(
    "/api/v1/invoices/insights"
  );
  return response.data;
}
