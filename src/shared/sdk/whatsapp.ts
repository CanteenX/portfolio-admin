/**
 * WhatsApp SDK - API Client Functions
 *
 * Centralized API client for all WhatsApp module endpoints.
 * Used by all WhatsApp pages and components in the Admin Panel.
 *
 * Usage:
 * ```
 * import { api } from './shared/sdk';
 * const campaigns = await api.whatsapp.listCampaigns({ skip: 0, per_page: 20 });
 * ```
 */

import type { ApiClient } from './types';

// ═══════════════════════════════════════════════════════════
// CAMPAIGN APIs
// ═══════════════════════════════════════════════════════════

export async function listCampaigns(api: ApiClient, params?: {
  skip?: number;
  per_page?: number;
  sorton?: string;
  sortdir?: 'asc' | 'desc';
  match?: string;
  status?: string;
}) {
  return api.post('/api/v1/whatsapp/campaigns/list', params || {});
}

export async function createCampaign(api: ApiClient, payload: {
  name: string;
  description?: string;
  status?: 'draft' | 'active';
}) {
  return api.post('/api/v1/whatsapp/campaigns', payload);
}

export async function getCampaign(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/campaigns/${id}`);
}

export async function updateCampaign(api: ApiClient, id: string, payload: {
  name?: string;
  description?: string;
  status?: 'draft' | 'active';
}) {
  return api.put(`/api/v1/whatsapp/campaigns/${id}`, payload);
}

export async function deleteCampaign(api: ApiClient, id: string) {
  return api.delete(`/api/v1/whatsapp/campaigns/${id}`);
}

export async function getCampaignStats(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/campaigns/${id}/stats`);
}

// ═══════════════════════════════════════════════════════════
// BULK MESSAGING APIs
// ═══════════════════════════════════════════════════════════

export async function listBulkMessagings(api: ApiClient, campaignId: string, params?: {
  skip?: number;
  per_page?: number;
  sorton?: string;
  sortdir?: 'asc' | 'desc';
  match?: string;
  status?: string;
}) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${campaignId}/list`, params || {});
}

export async function createBulkMessaging(api: ApiClient, campaignId: string, payload: {
  name: string;
  templateId: string;
  audienceFilter?: any;
  variableOverrides?: Array<{
    position: number;
    customValue?: string;
    fieldPath?: string;
  }>;
  scheduledFor?: string | null;
}) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${campaignId}`, payload);
}

export async function getBulkMessaging(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/bulk-messaging/${id}`);
}

export async function updateBulkMessaging(api: ApiClient, id: string, payload: {
  name?: string;
  templateId?: string;
  audienceFilter?: any;
  variableOverrides?: Array<{
    position: number;
    customValue?: string;
    fieldPath?: string;
  }>;
  scheduledFor?: string | null;
}) {
  return api.put(`/api/v1/whatsapp/bulk-messaging/${id}`, payload);
}

export async function deleteBulkMessaging(api: ApiClient, id: string) {
  return api.delete(`/api/v1/whatsapp/bulk-messaging/${id}`);
}

export async function startBulkMessaging(api: ApiClient, id: string) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${id}/start`, {});
}

export async function pauseBulkMessaging(api: ApiClient, id: string) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${id}/pause`, {});
}

export async function resumeBulkMessaging(api: ApiClient, id: string) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${id}/resume`, {});
}

export async function getBulkMessagingProgress(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/bulk-messaging/${id}/progress`);
}

export async function retryFailedMessages(api: ApiClient, id: string) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${id}/retry-failed`, {});
}

export async function getFailedMessages(api: ApiClient, id: string, params?: {
  skip?: number;
  per_page?: number;
  errorCategory?: string;
  match?: string;
}) {
  return api.post(`/api/v1/whatsapp/bulk-messaging/${id}/failed-messages`, params || {});
}

export async function previewAudience(api: ApiClient, audienceFilter: any) {
  return api.post('/api/v1/whatsapp/bulk-messaging/preview-audience', { audienceFilter });
}

export async function testSendBulkMessaging(api: ApiClient, payload: {
  templateId: string;
  variableOverrides?: Array<{
    position: number;
    customValue: string;
  }>;
  testPhoneNumbers: string[];
}) {
  return api.post('/api/v1/whatsapp/bulk-messaging/test-send', payload);
}

export async function getCampaignAnalytics(api: ApiClient, params?: {
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return api.get('/api/v1/whatsapp/bulk-messaging/analytics', { params });
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE APIs
// ═══════════════════════════════════════════════════════════

export async function listTemplates(api: ApiClient, params?: {
  skip?: number;
  per_page?: number;
  sorton?: string;
  sortdir?: 'asc' | 'desc';
  match?: string;
  category?: string;
  metaStatus?: string;
}) {
  return api.post('/api/v1/whatsapp/templates/list', params || {});
}

export async function createTemplate(api: ApiClient, payload: {
  name: string;
  metaTemplateName: string;
  language?: string;
  category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  bodyText?: string;
  headerText?: string;
  footerText?: string;
  variables?: Array<{
    position: number;
    description?: string;
    sampleValue?: string;
    fieldMapping?: string;
    customValue?: string;
  }>;
}) {
  return api.post('/api/v1/whatsapp/templates', payload);
}

export async function getTemplate(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/templates/${id}`);
}

export async function updateTemplate(api: ApiClient, id: string, payload: {
  name?: string;
  metaTemplateName?: string;
  language?: string;
  category?: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  bodyText?: string;
  headerText?: string;
  footerText?: string;
  variables?: Array<{
    position: number;
    description?: string;
    sampleValue?: string;
    fieldMapping?: string;
    customValue?: string;
  }>;
  status?: string;
}) {
  return api.put(`/api/v1/whatsapp/templates/${id}`, payload);
}

export async function deleteTemplate(api: ApiClient, id: string) {
  return api.delete(`/api/v1/whatsapp/templates/${id}`);
}

export async function syncFromMeta(api: ApiClient) {
  return api.post('/api/v1/whatsapp/templates/sync', {});
}

export async function submitToMeta(api: ApiClient, id: string) {
  return api.post(`/api/v1/whatsapp/templates/${id}/submit-to-meta`, {});
}

// ═══════════════════════════════════════════════════════════
// TRIGGER APIs
// ═══════════════════════════════════════════════════════════

export async function listTriggers(api: ApiClient, params?: {
  skip?: number;
  per_page?: number;
  sorton?: string;
  sortdir?: 'asc' | 'desc';
  match?: string;
}) {
  return api.post('/api/v1/whatsapp/triggers/list', params || {});
}

export async function createTrigger(api: ApiClient, payload: {
  eventKey: string;
  displayName: string;
  description?: string;
  template: string;
  isActive?: boolean;
  availableParams?: Array<{
    key: string;
    label: string;
    source?: string;
  }>;
  variableMapping?: Array<{
    position: number;
    source: 'context' | 'user_field' | 'static';
    key: string;
    fallback?: string;
  }>;
}) {
  return api.post('/api/v1/whatsapp/triggers', payload);
}

export async function getTrigger(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/triggers/${id}`);
}

export async function updateTrigger(api: ApiClient, id: string, payload: {
  displayName?: string;
  description?: string;
  template?: string;
  isActive?: boolean;
  availableParams?: Array<{
    key: string;
    label: string;
    source?: string;
  }>;
  variableMapping?: Array<{
    position: number;
    source: 'context' | 'user_field' | 'static';
    key: string;
    fallback?: string;
  }>;
}) {
  return api.put(`/api/v1/whatsapp/triggers/${id}`, payload);
}

export async function deleteTrigger(api: ApiClient, id: string) {
  return api.delete(`/api/v1/whatsapp/triggers/${id}`);
}

export async function listApprovedTemplates(api: ApiClient) {
  return api.get('/api/v1/whatsapp/triggers/approved-templates');
}

// ═══════════════════════════════════════════════════════════
// INBOX APIs
// ═══════════════════════════════════════════════════════════

export async function getConversations(api: ApiClient, params?: {
  page?: number;
  limit?: number;
  search?: string;
  campaignId?: string;
}) {
  return api.post('/api/v1/whatsapp/inbox/conversations', params || {});
}

export async function getConversationDetail(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/inbox/conversations/${id}`);
}

export async function getMessages(api: ApiClient, conversationId: string, params?: {
  before?: string;
  limit?: number;
}) {
  return api.get(`/api/v1/whatsapp/inbox/conversations/${conversationId}/messages`, { params });
}

export async function sendReply(api: ApiClient, conversationId: string, payload: {
  text: string;
  replyToWaMessageId?: string;
}) {
  return api.post(`/api/v1/whatsapp/inbox/conversations/${conversationId}/reply`, payload);
}

export async function sendTemplate(api: ApiClient, conversationId: string, payload: {
  templateId: string;
  variables?: string[];
}) {
  return api.post(`/api/v1/whatsapp/inbox/conversations/${conversationId}/send-template`, payload);
}

export async function searchMessages(api: ApiClient, params?: {
  q: string;
  page?: number;
  limit?: number;
}) {
  return api.get('/api/v1/whatsapp/inbox/search', { params });
}

// ═══════════════════════════════════════════════════════════
// AUDIENCE TYPE APIs
// ═══════════════════════════════════════════════════════════

export async function listAudienceTypes(api: ApiClient, params?: {
  skip?: number;
  per_page?: number;
}) {
  return api.post('/api/v1/whatsapp/audience-types/list', params || {});
}

export async function createAudienceType(api: ApiClient, payload: {
  name: string;
  description?: string;
  filterCriteria: any;
}) {
  return api.post('/api/v1/whatsapp/audience-types', payload);
}

export async function getAudienceType(api: ApiClient, id: string) {
  return api.get(`/api/v1/whatsapp/audience-types/${id}`);
}

export async function updateAudienceType(api: ApiClient, id: string, payload: {
  name?: string;
  description?: string;
  filterCriteria?: any;
}) {
  return api.put(`/api/v1/whatsapp/audience-types/${id}`, payload);
}

export async function deleteAudienceType(api: ApiClient, id: string) {
  return api.delete(`/api/v1/whatsapp/audience-types/${id}`);
}
