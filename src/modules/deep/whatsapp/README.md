# WhatsApp Campaign Management Pages

This module contains pages for managing WhatsApp marketing campaigns, triggers, and audience segments.

## Pages Created

### 1. WhatsAppCampaignsPage.js
**Route:** `/whatsapp/campaigns`

Campaign list page featuring:
- KPI cards showing total campaigns, active campaigns, sent messages, and delivered messages
- Searchable and filterable table of campaigns
- Status filter (all/active/completed/draft)
- Actions: View details, Edit, Delete
- "Create Campaign" button navigates to create page
- Pagination with configurable page sizes

**Mock Data:** Currently uses mock campaign data. Replace with actual API calls:
```javascript
// Replace this:
const mockCampaigns = [...];

// With:
const result = await api.whatsapp.listCampaigns();
setCampaigns(result.campaigns);
setInsights(result.insights);
```

### 2. CampaignDetailPage.js
**Route:** `/whatsapp/campaigns/:campaignId`

Campaign detail page with three tabs:
- **Overview Tab:** Campaign metadata (name, description, status, created date, created by)
- **Bulk Messagings Tab:** Table listing all bulk messagings for this campaign
- **Analytics Tab:** KPIs (sent, delivered, read, failed) + daily breakdown table

**Mock Data:** Currently uses mock data. Replace with actual API calls:
```javascript
// Replace:
const mockCampaign = {...};

// With:
const campaignData = await api.whatsapp.getCampaign(campaignId);
const analyticsData = await api.whatsapp.getCampaignAnalytics(campaignId);
```

### 3. CampaignCreatePage.js
**Route:** 
- Create: `/whatsapp/campaigns/create`
- Edit: `/whatsapp/campaigns/:campaignId/edit`

Campaign create/edit form with:
- Name field (required, min 3 characters)
- Description field (optional textarea)
- Status select (draft/active/completed)
- Form validation
- Success toast on save
- Navigates back to campaigns list on success

**Mock Data:** Currently simulated. Replace with actual API calls:
```javascript
// For create:
await api.whatsapp.createCampaign(payload);

// For edit:
await api.whatsapp.updateCampaign(campaignId, payload);
```

## Integration Steps

### 1. Add Routes to App.js

Add these imports to `src/app/App.js`:
```javascript
const WhatsAppCampaignsPage = React.lazy(() => 
  import("../modules/deep/whatsapp/WhatsAppCampaignsPage").then(m => ({ default: m.WhatsAppCampaignsPage }))
);
const CampaignDetailPage = React.lazy(() => 
  import("../modules/deep/whatsapp/CampaignDetailPage").then(m => ({ default: m.CampaignDetailPage }))
);
const CampaignCreatePage = React.lazy(() => 
  import("../modules/deep/whatsapp/CampaignCreatePage").then(m => ({ default: m.CampaignCreatePage }))
);
```

Add these routes inside the `<Routes>` component:
```javascript
<Route path="/whatsapp/campaigns" element={<WhatsAppCampaignsPage />} />
<Route path="/whatsapp/campaigns/create" element={<CampaignCreatePage />} />
<Route path="/whatsapp/campaigns/:campaignId" element={<CampaignDetailPage />} />
<Route path="/whatsapp/campaigns/:campaignId/edit" element={<CampaignCreatePage />} />
```

### 2. Add to Navigation Menu

Add WhatsApp menu item to your sidebar/menu configuration.

### 3. Implement SDK Methods

Create these methods in your WhatsApp API SDK:

```javascript
// In @admin-platform/shared-sdk or similar
export async function listCampaigns(api) {
  const response = await api.get("/whatsapp/campaigns");
  return response.data;
}

export async function getCampaign(api, campaignId) {
  const response = await api.get(`/whatsapp/campaigns/${campaignId}`);
  return response.data;
}

export async function createCampaign(api, payload) {
  const response = await api.post("/whatsapp/campaigns", payload);
  return response.data;
}

export async function updateCampaign(api, campaignId, payload) {
  const response = await api.put(`/whatsapp/campaigns/${campaignId}`, payload);
  return response.data;
}

export async function deleteCampaign(api, campaignId) {
  await api.delete(`/whatsapp/campaigns/${campaignId}`);
}

export async function getCampaignAnalytics(api, campaignId) {
  const response = await api.get(`/whatsapp/campaigns/${campaignId}/analytics`);
  return response.data;
}
```

### 4. Update Mock Data References

Once SDK is implemented, search for `// TODO: Replace with actual SDK call` comments in:
- `WhatsAppCampaignsPage.js` (line ~43)
- `CampaignDetailPage.js` (lines ~33, ~88)
- `CampaignCreatePage.js` (lines ~55, ~103, ~108)

## Dependencies

All required dependencies are already installed:
- `react-router-dom` - Navigation
- `sonner` - Toast notifications  
- `lucide-react` - Icons
- `@radix-ui` - UI components (via shadcn/ui)

## Components Used

All components are from the existing component library:
- `Breadcrumb` - Page breadcrumb navigation
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Card layouts
- `Button` - Action buttons
- `Badge` - Status badges
- `Table` - Data tables
- `Tabs` - Tab navigation
- `Input`, `Label`, `Select` - Form inputs
- `StatCard` - KPI cards
- `TablePagination` - Pagination controls
- `TableSearch` - Search and filter UI
- `SortableHeader` - Sortable table headers

## Hooks Used

- `usePagination` - Pagination logic
- `useTableFilter` - Search and filtering
- `useTableSort` - Table sorting
- `useAuth` - Authentication context
- `useParams`, `useNavigate` - React Router

## Styling

Pages follow the existing "industrial" design pattern with:
- `industrial-card` class for cards
- Uppercase tracking-wider labels
- Font-display for headings
- Consistent spacing and typography

## Trigger Management Pages

### 4. TriggerListPage.js
**Route:** `/whatsapp/triggers`

Event trigger list page featuring:
- Searchable table of triggers
- Event Key badge (uppercase, blue background)
- Active toggle switch (inline API call to toggle isActive)
- Actions: Edit, Delete
- "Create Trigger" button
- Pagination with configurable page sizes

**Mock Data:** Replace with actual API calls:
```javascript
const result = await api.whatsapp.listTriggers({ match, skip, per_page });
await api.whatsapp.updateTrigger(id, { isActive });
await api.whatsapp.deleteTrigger(id);
```

### 5. TriggerFormPage.js
**Route:** 
- Create: `/whatsapp/triggers/create`
- Edit: `/whatsapp/triggers/:triggerId/edit`

Trigger create/edit form with:
- Event Key (uppercase text input)
- Display Name
- Description
- Template selector (approved templates only)
- Active toggle
- Available Params section (add/remove custom params)
- Variable Mapping table:
  - Position (#1, #2, etc.)
  - Source (context/user_field/static)
  - Key (text input)
  - Fallback (optional)
- Template preview showing variables

**Mock Data:** Replace with actual API calls:
```javascript
await api.whatsapp.listApprovedTemplates();
await api.whatsapp.createTrigger(payload);
await api.whatsapp.updateTrigger(id, payload);
await api.whatsapp.getTrigger(id);
```

## Audience Segment Pages

### 6. AudienceTypeListPage.js
**Route:** `/whatsapp/audience-types`

Saved audience segments list featuring:
- Searchable table of segments
- Columns: Name, Description, Filter Criteria (JSON preview), Created By, Actions
- Filter Criteria shows truncated JSON (first 50 chars)
- Actions: Edit, Delete
- "Create Audience Segment" button
- Pagination

**Mock Data:** Replace with actual API calls:
```javascript
const result = await api.whatsapp.listAudienceTypes({ skip, per_page });
await api.whatsapp.deleteAudienceType(id);
```

### 7. AudienceTypeFormPage.js
**Route:** 
- Create: `/whatsapp/audience-types/create`
- Edit: `/whatsapp/audience-types/:audienceTypeId/edit`

Audience segment create/edit form with:
- Name and Description
- Collapsible filter sections:
  - User Types (personal/business/company checkboxes)
  - Geographic (City and State multi-select)
  - Date Ranges (Registered After/Before date pickers)
  - Custom Fields (Industry, Company Size multi-select)
  - Additional Filters (Verified Only, Premium Only switches)
  - Custom Query (JSON editor for advanced users)
- "Preview Audience" button (opens modal with count)
- "Save Segment" button

**Mock Data:** Replace with actual API calls:
```javascript
await api.whatsapp.createAudienceType(payload);
await api.whatsapp.updateAudienceType(id, payload);
await api.whatsapp.getAudienceType(id);
await api.whatsapp.previewAudience(filterCriteria);
```

## Integration Steps - New Pages

### Add Routes for Triggers and Audience Types

Add these imports to `src/app/App.js`:
```javascript
const TriggerListPage = React.lazy(() => 
  import("../modules/deep/whatsapp/TriggerListPage").then(m => ({ default: m.TriggerListPage }))
);
const TriggerFormPage = React.lazy(() => 
  import("../modules/deep/whatsapp/TriggerFormPage").then(m => ({ default: m.TriggerFormPage }))
);
const AudienceTypeListPage = React.lazy(() => 
  import("../modules/deep/whatsapp/AudienceTypeListPage").then(m => ({ default: m.AudienceTypeListPage }))
);
const AudienceTypeFormPage = React.lazy(() => 
  import("../modules/deep/whatsapp/AudienceTypeFormPage").then(m => ({ default: m.AudienceTypeFormPage }))
);
```

Add these routes:
```javascript
<Route path="/whatsapp/triggers" element={<TriggerListPage />} />
<Route path="/whatsapp/triggers/create" element={<TriggerFormPage />} />
<Route path="/whatsapp/triggers/:triggerId/edit" element={<TriggerFormPage />} />
<Route path="/whatsapp/audience-types" element={<AudienceTypeListPage />} />
<Route path="/whatsapp/audience-types/create" element={<AudienceTypeFormPage />} />
<Route path="/whatsapp/audience-types/:audienceTypeId/edit" element={<AudienceTypeFormPage />} />
```

### Implement SDK Methods for Triggers and Audience Types

```javascript
// Triggers
export async function listTriggers(api, params) {
  const response = await api.get("/whatsapp/triggers", { params });
  return response.data;
}

export async function getTrigger(api, triggerId) {
  const response = await api.get(`/whatsapp/triggers/${triggerId}`);
  return response.data;
}

export async function createTrigger(api, payload) {
  const response = await api.post("/whatsapp/triggers", payload);
  return response.data;
}

export async function updateTrigger(api, triggerId, payload) {
  const response = await api.put(`/whatsapp/triggers/${triggerId}`, payload);
  return response.data;
}

export async function deleteTrigger(api, triggerId) {
  await api.delete(`/whatsapp/triggers/${triggerId}`);
}

export async function listApprovedTemplates(api) {
  const response = await api.get("/whatsapp/templates", { params: { metaStatus: "APPROVED" } });
  return response.data;
}

// Audience Types
export async function listAudienceTypes(api, params) {
  const response = await api.get("/whatsapp/audience-types", { params });
  return response.data;
}

export async function getAudienceType(api, audienceTypeId) {
  const response = await api.get(`/whatsapp/audience-types/${audienceTypeId}`);
  return response.data;
}

export async function createAudienceType(api, payload) {
  const response = await api.post("/whatsapp/audience-types", payload);
  return response.data;
}

export async function updateAudienceType(api, audienceTypeId, payload) {
  const response = await api.put(`/whatsapp/audience-types/${audienceTypeId}`, payload);
  return response.data;
}

export async function deleteAudienceType(api, audienceTypeId) {
  await api.delete(`/whatsapp/audience-types/${audienceTypeId}`);
}

export async function previewAudience(api, filterCriteria) {
  const response = await api.post("/whatsapp/audience-types/preview", filterCriteria);
  return response.data;
}
```

## Additional Dependencies

For the new pages, ensure these are installed:
- `react-datepicker` - Date range pickers in AudienceTypeFormPage
- All other dependencies same as campaign pages

## Notes

- All pages use mock data until SDK is implemented
- Form validation is implemented on all create/edit pages
- Pagination defaults to 10 items per page
- Status badges and event keys use consistent color coding
- All delete actions have confirmation dialogs
- Error handling with toast notifications
- Trigger variable mapping supports three source types: context, user_field, static
- Audience segments support collapsible filter sections for better UX
- Preview audience feature shows estimated recipient count before saving
