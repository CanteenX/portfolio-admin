# WhatsApp Module Routing Guide

## New Pages Created

### 1. WhatsAppInboxPage.js
**Path:** `/whatsapp/inbox`
**Purpose:** Two-way messaging inbox for WhatsApp conversations

### 2. AnalyticsDashboardPage.js
**Path:** `/whatsapp/analytics`
**Purpose:** Campaign analytics dashboard with charts and reports

## Integration Steps

### Add to Routes

Update your routing configuration to include:

```javascript
import { WhatsAppInboxPage, AnalyticsDashboardPage } from './modules/deep/whatsapp';

// In your routes array:
{
  path: '/whatsapp/inbox',
  element: <WhatsAppInboxPage />
},
{
  path: '/whatsapp/analytics',
  element: <AnalyticsDashboardPage />
}
```

### Navigation Menu

Add these items to your WhatsApp navigation menu:

```javascript
{
  label: 'Inbox',
  icon: MessageCircle,
  path: '/whatsapp/inbox'
},
{
  label: 'Analytics',
  icon: BarChart3,
  path: '/whatsapp/analytics'
}
```

## Socket.IO Setup (Required for Inbox)

### 1. Install socket.io-client

```bash
npm install socket.io-client
```

### 2. Configure Socket URL

Add to your `.env` file:

```
REACT_APP_SOCKET_URL=http://localhost:7002
```

### 3. Uncomment Socket.IO Code

In `WhatsAppInboxPage.js`, uncomment the following sections:

- Lines 50-51: Import statement
- Lines 297-330: Socket.IO setup in useEffect

## API Integration

Both pages have TODO comments marking where SDK calls should be implemented:

### WhatsAppInboxPage API Calls:
- `api.whatsapp.getConversations({ page, limit, search, campaignId })`
- `api.whatsapp.listCampaigns()`
- `api.whatsapp.listTemplates({ status: "approved" })`
- `api.whatsapp.getMessages(conversationId, { limit })`
- `api.whatsapp.sendReply(conversationId, { text })`
- `api.whatsapp.sendTemplate(conversationId, { templateId, variables })`
- `api.whatsapp.markConversationRead(conversationId)`

### AnalyticsDashboardPage API Calls:
- `api.whatsapp.listCampaigns()`
- `api.whatsapp.getCampaignAnalytics({ campaignId, startDate, endDate })`

## Features Summary

### WhatsAppInboxPage
- ✅ Two-column layout (conversations list + chat panel)
- ✅ Real-time message updates (Socket.IO ready)
- ✅ 24-hour window enforcement
- ✅ Free-text reply input
- ✅ Template picker modal
- ✅ Message status indicators (sent/delivered/read)
- ✅ Unread count badges
- ✅ Auto-scroll to bottom
- ✅ Search and campaign filter

### AnalyticsDashboardPage
- ✅ Date range picker (Last 7/30 days, Custom)
- ✅ Campaign filter dropdown
- ✅ KPI cards (Sent, Delivery Rate, Read Rate, Failed)
- ✅ Delivery funnel visualization
- ✅ Daily breakdown area chart (recharts)
- ✅ Template performance table with sorting
- ✅ Export to CSV functionality
- ✅ Pagination for template stats

## Mock Data

Both pages are production-ready with comprehensive mock data. Simply replace the TODO-marked sections with actual SDK calls when backend is ready.

## Design Patterns

Both pages follow the existing Velzon/AdminPanel-Classic patterns:
- Industrial card design with `industrial-card` className
- Uppercase tracking for headings
- StatCard component for KPIs
- Table components with sorting and pagination
- Badge components for status indicators
- Breadcrumb navigation
- Error handling with toast notifications
