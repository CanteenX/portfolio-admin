import type { CrmContact, CrmDeal, CrmPipeline } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listCrmContacts(api: AxiosInstance): Promise<CrmContact[]> {
  const response = await api.get<{ items: CrmContact[] }>("/api/v1/crm/contacts");
  return response.data.items;
}

export async function createCrmContact(
  api: AxiosInstance,
  payload: {
    displayName: string;
    primaryEmail?: string;
    primaryPhone?: string;
    companyName?: string;
    notes?: string;
  }
): Promise<CrmContact> {
  const response = await api.post<CrmContact>("/api/v1/crm/contacts", payload);
  return response.data;
}

export async function deleteCrmContact(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/crm/contacts/${id}`);
}

export async function listCrmPipelines(api: AxiosInstance): Promise<CrmPipeline[]> {
  const response = await api.get<{ items: CrmPipeline[] }>("/api/v1/crm/pipelines");
  return response.data.items;
}

export async function createCrmPipeline(
  api: AxiosInstance,
  payload: {
    name: string;
    isDefault?: boolean;
    stages: Array<{
      key: string;
      label: string;
      order: number;
      isTerminalWon?: boolean;
      isTerminalLost?: boolean;
    }>;
  }
): Promise<CrmPipeline> {
  const response = await api.post<CrmPipeline>("/api/v1/crm/pipelines", payload);
  return response.data;
}

export async function listCrmDeals(api: AxiosInstance): Promise<CrmDeal[]> {
  const response = await api.get<{ items: CrmDeal[] }>("/api/v1/crm/deals");
  return response.data.items;
}

export async function createCrmDeal(
  api: AxiosInstance,
  payload: {
    title: string;
    contactId: string;
    pipelineId: string;
    stageKey: string;
    amountValue?: number;
    currency?: string;
  }
): Promise<CrmDeal> {
  const response = await api.post<CrmDeal>("/api/v1/crm/deals", payload);
  return response.data;
}

export async function transitionCrmDealStage(
  api: AxiosInstance,
  dealId: string,
  payload: { stageKey: string; lostReason?: string }
): Promise<CrmDeal> {
  const response = await api.post<CrmDeal>(`/api/v1/crm/deals/${dealId}/stage`, payload);
  return response.data;
}

export async function getCrmInsights(api: AxiosInstance): Promise<{
  counts: { contacts: number; openDeals: number; wonDeals: number; lostDeals: number };
}> {
  const response = await api.get<{
    counts: { contacts: number; openDeals: number; wonDeals: number; lostDeals: number };
  }>("/api/v1/crm/insights");
  return response.data;
}
