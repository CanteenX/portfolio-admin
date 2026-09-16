/**
 * Structured documentation content for the Admin Platform User Manual.
 * Each tab has a title, sidebar sections, and each section has an id, heading, and body (HTML).
 *
 * @typedef {{ id: string; heading: string; body: string }} DocSection
 * @typedef {{ key: string; label: string; sections: DocSection[] }} DocTab
 */

/** @type {DocTab[]} */
export const DOC_TABS = [
  {
    key: "home",
    label: "Home",
    sections: [
      {
        id: "what-is",
        heading: "What is the Admin Panel?",
        body: `
          <p>The Admin Panel is where you manage everything about your platform. From here, you can:</p>
          <ul>
            <li>Set up your company and team</li>
            <li>Control who can access what via roles and permissions</li>
            <li>Manage all the master data used across the platform</li>
            <li>Oversee customers, contacts, and deals</li>
            <li>Handle support tickets and communication</li>
            <li>Send notifications and manage content</li>
            <li>Track projects, tasks, invoices, and more</li>
          </ul>
        `,
      },
      {
        id: "navigate",
        heading: "How to Navigate This Manual",
        body: `
          <p>Use the <strong>tabs</strong> at the top to find the section you need:</p>
          <ul>
            <li><strong>Getting Started</strong> — Initial setup, login, and first steps</li>
            <li><strong>Dashboard</strong> — Overview of KPIs and analytics</li>
            <li><strong>Modules</strong> — All 13 business modules explained</li>
            <li><strong>Settings</strong> — System configuration, roles, permissions, and branding</li>
            <li><strong>Features</strong> — Feature flags, layouts, themes, and i18n</li>
            <li><strong>Components</strong> — Reusable UI components available throughout the panel</li>
            <li><strong>API Reference</strong> — REST API endpoints for developers</li>
            <li><strong>How To Use</strong> — Common workflows and step-by-step guides</li>
          </ul>
        `,
      },
      {
        id: "quick-links",
        heading: "Quick Links",
        body: `
          <ul>
            <li><strong>Dashboard</strong> — <code>/</code></li>
            <li><strong>System Settings</strong> — <code>/settings/system</code></li>
            <li><strong>Roles</strong> — <code>/rbac/roles</code></li>
            <li><strong>Feature Toggles</strong> — <code>/settings/feature-toggles</code></li>
            <li><strong>Branding</strong> — <code>/settings/branding</code></li>
            <li><strong>Audit Log</strong> — <code>/settings/audit-log</code></li>
          </ul>
        `,
      },
    ],
  },
  {
    key: "getting-started",
    label: "Getting Started",
    sections: [
      {
        id: "prerequisites",
        heading: "Prerequisites",
        body: `
          <p>Before running the Admin Platform, ensure you have:</p>
          <table>
            <thead><tr><th>Tool</th><th>Version</th></tr></thead>
            <tbody>
              <tr><td>Node.js</td><td>&gt;= 22</td></tr>
              <tr><td>pnpm</td><td>&gt;= 9.15</td></tr>
              <tr><td>MongoDB</td><td>&gt;= 6.0 (or Atlas)</td></tr>
            </tbody>
          </table>
        `,
      },
      {
        id: "installation",
        heading: "Installation",
        body: `
          <ol>
            <li>Clone the repository and run <code>pnpm install</code> from the root.</li>
            <li>Create <code>apps/admin-backend/.env</code> with your MongoDB URI, JWT secrets, and seed passwords.</li>
            <li>Set <code>ENABLE_SEED=true</code> for the first run to create default users.</li>
            <li>Run <code>pnpm dev</code> to start the backend and both frontends simultaneously.</li>
          </ol>
        `,
      },
      {
        id: "first-login",
        heading: "First Login",
        body: `
          <p>After seeding, two accounts are available:</p>
          <table>
            <thead><tr><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              <tr><td><code>superadmin@admin.local</code></td><td>Super Admin</td></tr>
              <tr><td><code>admin@admin.local</code></td><td>Admin</td></tr>
            </tbody>
          </table>
          <p>Use the passwords you set in <code>SUPER_ADMIN_SEED_PASSWORD</code> and <code>ADMIN_SEED_PASSWORD</code>.</p>
          <p>After login, you'll be redirected to the Dashboard. The system calls the <strong>session bootstrap</strong> endpoint to load your permissions, enabled modules, feature flags, and menu structure.</p>
        `,
      },
      {
        id: "session-bootstrap",
        heading: "Session Bootstrap",
        body: `
          <p>On every login, the frontend calls <code>GET /api/v1/system/session-bootstrap</code>. This single request returns:</p>
          <ul>
            <li><strong>User info</strong> — email and role</li>
            <li><strong>Permissions</strong> — flat permission strings for middleware checks</li>
            <li><strong>Enabled modules</strong> — which of the 14 modules are active</li>
            <li><strong>UI feature flags</strong> — 30+ toggles controlling header, sidebar, layout, and feature visibility</li>
            <li><strong>Menu groups</strong> — dynamic sidebar menu tree from the database</li>
            <li><strong>RBAC grants</strong> — the menu/action pairs the user holds, used to gate buttons; the server re-checks them on every request</li>
            <li><strong>Module catalog</strong> — full list of available modules</li>
          </ul>
        `,
      },
    ],
  },
  {
    key: "dashboard",
    label: "Dashboard",
    sections: [
      {
        id: "dashboard-overview",
        heading: "Dashboard Overview",
        body: `
          <p>The Dashboard is the landing page after login. It displays real-time KPIs fetched from <code>GET /api/v1/system/dashboard-kpis</code>:</p>
          <ul>
            <li><strong>Open Tickets</strong> — Support tickets in open/in_progress/pending_customer status</li>
            <li><strong>Active Tasks</strong> — Tasks in todo/in_progress/review status</li>
            <li><strong>Today's Events</strong> — Calendar events scheduled for today</li>
            <li><strong>Open Deals</strong> — CRM deals with open status</li>
            <li><strong>Pipeline Value</strong> — Total monetary value of open deals</li>
            <li><strong>Open Jobs</strong> — Active job postings</li>
            <li><strong>Pending Applications</strong> — Job applications in submitted status</li>
          </ul>
        `,
      },
      {
        id: "dashboard-charts",
        heading: "Charts & Analytics",
        body: `
          <p>The platform includes two charting libraries available under the <strong>Charts</strong> sidebar section:</p>
          <ul>
            <li><strong>ApexCharts</strong> — Interactive charts with zoom, pan, and export capabilities. Navigate to <code>/charts/apex</code>.</li>
            <li><strong>Chart.js</strong> — Lightweight canvas-based charts. Navigate to <code>/charts/chartjs</code>.</li>
          </ul>
          <p>Both are lazy-loaded and can be toggled via the <code>sidebar.charts</code> and <code>page.charts</code> feature flags.</p>
        `,
      },
    ],
  },
  {
    key: "modules",
    label: "Modules",
    sections: [
      { id: "modules-overview", heading: "Modules Overview", body: `<p>The platform ships with <strong>13 business modules</strong>. Each module has its own backend routes, Mongoose models, service layer, and frontend pages. Modules can be individually enabled or disabled by a Super Admin via <strong>Settings &gt; Feature Config</strong>.</p><p>All modules follow a consistent REST pattern:</p><pre>GET    /api/v1/{module}          — List records (paginated)\nPOST   /api/v1/{module}          — Create record\nGET    /api/v1/{module}/:id      — Get single record\nPUT    /api/v1/{module}/:id      — Update record\nDELETE /api/v1/{module}/:id      — Delete record</pre>` },
      { id: "mod-calendar", heading: "Calendar", body: `<p>Full-featured event scheduling powered by FullCalendar. Supports day, week, month, and list views. Events can be created, dragged, resized, and deleted.</p><p><strong>Route:</strong> <code>/modules/calendar</code></p>` },
      { id: "mod-chat", heading: "Chat", body: `<p>Real-time messaging workspace with conversations, message threads, and user presence.</p><p><strong>Route:</strong> <code>/modules/chat</code></p>` },
      { id: "mod-mailbox", heading: "Mailbox", body: `<p>Email-like inbox with folder management (inbox, sent, drafts, trash). Supports compose, reply, and folder organization.</p><p><strong>Route:</strong> <code>/modules/mailbox</code></p>` },
      { id: "mod-ecommerce", heading: "eCommerce", body: `<p>Product and order management system. Includes:</p><ul><li><strong>Products</strong> — Create, edit, and manage product listings with images, pricing, and inventory</li><li><strong>Orders</strong> — Track orders through their lifecycle</li></ul><p>Integrates with Stripe, PayPal, and Razorpay for payment processing.</p><p><strong>Route:</strong> <code>/modules/ecommerce</code></p>` },
      { id: "mod-projects", heading: "Projects", body: `<p>Project tracking with status management, member assignment, and progress tracking.</p><p><strong>Route:</strong> <code>/modules/projects</code></p>` },
      { id: "mod-tasks", heading: "Tasks", body: `<p>Task management board with assignees, due dates, priorities, and statuses (todo, in_progress, review, done). Supports Kanban-style views.</p><p><strong>Route:</strong> <code>/modules/tasks</code></p>` },
      { id: "mod-crm", heading: "CRM", body: `<p>Customer Relationship Management with three sub-modules:</p><ul><li><strong>Contacts</strong> — Manage customer/prospect contact information</li><li><strong>Deals</strong> — Track sales opportunities with monetary values and stages</li><li><strong>Pipelines</strong> — Configure deal stages and pipeline workflows</li></ul><p><strong>Route:</strong> <code>/modules/crm</code></p>` },
      { id: "mod-invoices", heading: "Invoices", body: `<p>Invoice creation and tracking system with line items, tax calculations, and payment status tracking.</p><p><strong>Route:</strong> <code>/modules/invoices</code></p>` },
      { id: "mod-support", heading: "Support Tickets", body: `<p>Helpdesk ticket system. Tickets have statuses (open, in_progress, pending_customer, resolved, closed), priority levels, and assignees.</p><p><strong>Route:</strong> <code>/modules/support-tickets</code></p>` },
      { id: "mod-files", heading: "File Manager", body: `<p>File upload and management supporting local storage and Amazon S3. Features drag-and-drop upload, browsing, configurable max file size, and S3 presigned URLs.</p><p><strong>Route:</strong> <code>/modules/file-manager</code></p>` },
      { id: "mod-todo", heading: "ToDo", body: `<p>Personal todo list with completion tracking.</p><p><strong>Route:</strong> <code>/modules/todo</code></p>` },
      { id: "mod-job", heading: "Job", body: `<p>Job posting and recruitment management:</p><ul><li><strong>Job Postings</strong> — Create and manage open positions</li><li><strong>Applications</strong> — Track candidate applications</li></ul><p><strong>Route:</strong> <code>/modules/job</code></p>` },
      { id: "mod-api", heading: "API Management", body: `<p>Generate and manage API keys for external integrations. Features key generation, revocation, and usage tracking.</p><p><strong>Route:</strong> <code>/modules/api-management</code></p>` },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    sections: [
      { id: "settings-overview", heading: "Settings Overview", body: `<p>The Settings section is accessible to <strong>Super Admins</strong> only. It provides system-wide configuration for the entire platform.</p>` },
      { id: "system-settings", heading: "System Settings", body: `<p>Configure global platform settings:</p><ul><li><strong>Timezone</strong> — Default timezone for date/time display</li><li><strong>Default Currency</strong> — 3-letter currency code (e.g., USD, EUR, INR)</li><li><strong>Locale</strong> — Default language/locale setting</li></ul><p><strong>Route:</strong> <code>/settings/system</code></p>` },
      { id: "branding", heading: "Branding", body: `<p>Customize the panel's appearance:</p><ul><li><strong>Company Name</strong> — Displayed in the sidebar and emails</li><li><strong>Logo URL</strong> — Custom logo image</li><li><strong>Primary Color</strong> — Hex color code for the theme accent</li></ul><p><strong>Route:</strong> <code>/settings/branding</code></p>` },
      { id: "roles", heading: "Roles & Permissions", body: `<p>Access control lives under <strong>Access Control &gt; Roles</strong>, not Settings. A role is a set of grants, each one a menu plus an action:</p><table><thead><tr><th>Action</th><th>Description</th></tr></thead><tbody><tr><td><strong>read</strong></td><td>View the page and its data</td></tr><tr><td><strong>write</strong></td><td>Create new records</td></tr><tr><td><strong>edit</strong></td><td>Change existing records</td></tr><tr><td><strong>delete</strong></td><td>Remove records</td></tr><tr><td><strong>print</strong></td><td>Export or print data</td></tr><tr><td><strong>mail</strong></td><td>Send mail from the screen</td></tr></tbody></table><p>An admin may only assign a role whose grants are a subset of their own, and cannot assign a role to themselves. The server re-checks every request, so hiding a button is presentation only.</p><p><strong>Route:</strong> <code>/rbac/roles</code></p>` },
      { id: "custom-roles-retired", heading: "Custom Roles (retired)", body: `<p>The old <code>/settings/custom-roles</code> screen has been removed. It narrowed what the UI offered but the API never consulted it, so a user with a restrictive custom role could still call any endpoint their base role allowed. Use <strong>Access Control &gt; Roles</strong> instead — those grants are the ones the server enforces.</p>` },
      { id: "feature-config", heading: "Feature Config (Module Toggles)", body: `<p>Enable or disable entire business modules. Disabled modules are hidden from the sidebar and their API endpoints return 404.</p>` },
      { id: "feature-toggles", heading: "UI Feature Toggles", body: `<p>Fine-grained control over 30+ UI elements organized by category: Header, Layout, Sidebar, Pages, and Features.</p><p><strong>Route:</strong> <code>/settings/feature-toggles</code></p>` },
      { id: "payment-settings", heading: "Payment Settings", body: `<p>View and manage Stripe, PayPal, and Razorpay configuration. Each provider shows configuration status and webhook endpoint.</p><p><strong>Route:</strong> <code>/settings/payments</code></p>` },
      { id: "audit-log", heading: "Audit Log", body: `<p>Every significant action is recorded with: action performed, who, before/after data snapshots, and timestamp. Filter by entity type and paginate.</p><p><strong>Route:</strong> <code>/settings/audit-log</code></p>` },
      { id: "quick-links-mgmt", heading: "Quick Links Management", body: `<p>Quick Links appear in the header as a grid dropdown. Manage via API: <code>CRUD /api/v1/system/quick-links</code>.</p>` },
    ],
  },
  {
    key: "features",
    label: "Features",
    sections: [
      { id: "themes", heading: "Themes & Dark Mode", body: `<p>Both frontends support <strong>light and dark modes</strong>. The Theme Customizer provides: layout type (Vertical, Horizontal, Two-Column), layout width (Default, Boxed), sidebar size (Default, Compact, Small Icon, Small Hover), and sidebar theme (Dark, Light, Gradient).</p>` },
      { id: "i18n", heading: "Internationalization (i18n)", body: `<p>8 languages: English, Spanish, French, German, Italian, Russian, Chinese, Arabic. Arabic includes full <strong>RTL</strong> support. Toggle via <code>feature.i18n</code> and <code>feature.rtlSupport</code> flags.</p>` },
      { id: "layouts", heading: "Layout Options", body: `<p>Three modes: <strong>Vertical</strong> (left sidebar), <strong>Horizontal</strong> (top nav), <strong>Two-Column</strong> (icon sidebar + sub-menu panel). Switch via Theme Customizer.</p>` },
      { id: "search", heading: "Global Search", body: `<p>Header search bar searches across Support Tickets, Tasks, Projects, CRM Contacts, and Job Postings simultaneously. Minimum 2 characters.</p>` },
      { id: "notifications", heading: "Notifications", body: `<p>Bell icon with unread count badge, dropdown, and full page at <code>/notifications</code>. Mark individual or all as read.</p>` },
      { id: "import-export", heading: "Data Import & Export", body: `<p>CSV export/import per module. GDPR export bundles all user data as JSON. Frontend includes Export CSV Modal with column selection.</p>` },
    ],
  },
  {
    key: "components",
    label: "Components",
    sections: [
      { id: "comp-overview", heading: "Reusable Components", body: `<p>Located in <code>src/components/common/</code>, available in both frontend themes.</p>` },
      { id: "comp-datatable", heading: "DataTable", body: `<p>Built on <code>@tanstack/react-table</code>. Features: column sorting, global search, pagination, custom cell renderers, row click handlers.</p>` },
      { id: "comp-delete", heading: "DeleteConfirmModal", body: `<p>Confirmation dialog with warning icon pulse animation, async delete with spinner, customizable title and message.</p>` },
      { id: "comp-csv", heading: "ExportCsvModal", body: `<p>Column-selectable CSV export. Select All toggle, built-in CSV generation, automatic file download.</p>` },
      { id: "comp-draggable", heading: "DraggableDataTable", body: `<p>Table with row drag-and-drop reordering via HTML5 DnD. Drag handle, visual feedback, reorder callback.</p>` },
      { id: "comp-imagecrop", heading: "ImageCropUploader", body: `<p>Image upload with canvas-based crop overlay. Draggable/resizable crop region, preview, outputs cropped Blob.</p>` },
      { id: "comp-breadcrumb", heading: "Breadcrumb", body: `<p>Automatic breadcrumb navigation based on current route.</p>` },
      { id: "comp-featuregate", heading: "FeatureGate", body: `<p>Conditionally renders children based on UI feature flag: <code>&lt;FeatureGate flagKey="header.searchBar"&gt;...&lt;/FeatureGate&gt;</code></p>` },
      { id: "comp-rbacgate", heading: "RbacGate", body: `<p>Conditionally renders children based on the current page's grants: <code>&lt;RbacGate action="delete"&gt;...&lt;/RbacGate&gt;</code>. Actions are the server's vocabulary — <code>read</code>, <code>write</code>, <code>edit</code>, <code>delete</code>, <code>print</code>, <code>mail</code> — and the menu URL is inferred from the route, so a renamed route cannot drift from its grant. Replaces the retired <code>PermissionGate</code>.</p>` },
    ],
  },
  {
    key: "api",
    label: "API Reference",
    sections: [
      { id: "api-overview", heading: "API Overview", body: `<p>Base URL: <code>http://localhost:7002/api/v1</code></p><p>All endpoints (except login and health) require <code>Authorization: Bearer &lt;token&gt;</code>. Enable Swagger docs with <code>ENABLE_API_DOCS=true</code>.</p>` },
      { id: "api-auth", heading: "Authentication", body: `<table><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead><tbody><tr><td>POST</td><td><code>/auth/login</code></td><td>Login, returns JWT</td></tr><tr><td>GET</td><td><code>/system/session-bootstrap</code></td><td>Full session data</td></tr></tbody></table>` },
      { id: "api-system", heading: "System Endpoints", body: `<table><thead><tr><th>Method</th><th>Endpoint</th><th>Access</th><th>Description</th></tr></thead><tbody><tr><td>GET</td><td><code>/health</code></td><td>Public</td><td>Health check</td></tr><tr><td>GET</td><td><code>/system/dashboard-kpis</code></td><td>Admin+</td><td>Dashboard stats</td></tr><tr><td>GET</td><td><code>/system/search?q=</code></td><td>Admin+</td><td>Global search</td></tr><tr><td>GET/PUT</td><td><code>/system/settings</code></td><td>Super Admin</td><td>System settings</td></tr><tr><td>GET/PUT</td><td><code>/system/branding</code></td><td>Super Admin</td><td>Branding</td></tr><tr><td>GET/PUT</td><td><code>/system/feature-config</code></td><td>Super Admin</td><td>Module toggles</td></tr><tr><td>GET/PUT</td><td><code>/system/ui-feature-flags</code></td><td>Super Admin</td><td>UI flags</td></tr><tr><td>GET</td><td><code>/system/audit-log</code></td><td>Super Admin</td><td>Audit trail</td></tr><tr><td>CRUD</td><td><code>/system/quick-links</code></td><td>Super Admin</td><td>Quick links</td></tr></tbody></table>` },
      { id: "api-menus", heading: "Dynamic Menu Endpoints", body: `<table><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead><tbody><tr><td>GET</td><td><code>/menus/groups</code></td><td>List menu groups</td></tr><tr><td>POST</td><td><code>/menus/groups</code></td><td>Create group</td></tr><tr><td>PUT</td><td><code>/menus/groups/:id</code></td><td>Update group</td></tr><tr><td>DELETE</td><td><code>/menus/groups/:id</code></td><td>Delete group</td></tr><tr><td>POST</td><td><code>/menus/items</code></td><td>Create item</td></tr><tr><td>PUT</td><td><code>/menus/items/:id</code></td><td>Update item</td></tr><tr><td>DELETE</td><td><code>/menus/items/:id</code></td><td>Delete item</td></tr></tbody></table>` },
      { id: "api-modules", heading: "Module Endpoints", body: `<p>Every module uses REST convention. Replace <code>{module}</code> with: calendar, chat, mailbox, ecommerce, projects, tasks, crm, invoices, support-tickets, file-manager, todo, job, api-management.</p><table><thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead><tbody><tr><td>GET</td><td><code>/{module}</code></td><td>List (paginated)</td></tr><tr><td>POST</td><td><code>/{module}</code></td><td>Create</td></tr><tr><td>GET</td><td><code>/{module}/:id</code></td><td>Get one</td></tr><tr><td>PUT</td><td><code>/{module}/:id</code></td><td>Update</td></tr><tr><td>DELETE</td><td><code>/{module}/:id</code></td><td>Delete</td></tr></tbody></table>` },
    ],
  },
  {
    key: "how-to",
    label: "How To Use",
    sections: [
      { id: "howto-create-role", heading: "Create a Role", body: `<ol><li>Navigate to <strong>Access Control &gt; Roles</strong></li><li>Click <strong>Create Role</strong> and name it (e.g., "Sales Manager")</li><li>Open the role and tick the menu/action pairs it should hold</li><li>Save</li></ol><p>You can only grant what you hold yourself, so a role you create is never more powerful than your own. Allow up to a minute for the change to reach every server — grants are cached.</p>` },
      { id: "howto-assign-role", heading: "Assign a Role to a User", body: `<ol><li>Open <strong>Access Control &gt; Employees</strong></li><li>Edit the employee and pick a role</li><li>Save</li></ol><p>You can only assign a role whose grants are a subset of your own, and you cannot assign a role to yourself — ask a super admin. Via the API: <code>PUT /api/v1/rbac/employees/:id</code> with <code>{ "roleId": "..." }</code>.</p>` },
      { id: "howto-toggle-modules", heading: "Enable or Disable a Module", body: `<ol><li>Go to <strong>Settings</strong> as Super Admin</li><li>Toggle modules on/off — no data is lost</li></ol>` },
      { id: "howto-export-csv", heading: "Export Data as CSV", body: `<ol><li>Navigate to any module workspace page</li><li>Click <strong>Export</strong></li><li>Select columns to include</li><li>Click <strong>Export</strong> — CSV downloads automatically</li></ol>` },
      { id: "howto-branding", heading: "Customize Branding", body: `<ol><li>Go to <strong>Settings &gt; Branding</strong></li><li>Enter company name, logo URL, and primary color</li><li>Click <strong>Save</strong></li></ol>` },
      { id: "howto-theme", heading: "Change Theme and Layout", body: `<ol><li>Click the <strong>gear icon</strong> (bottom-right) for Theme Customizer</li><li>Choose layout, width, sidebar size, sidebar theme</li><li>Toggle dark mode from the header icon</li></ol>` },
      { id: "howto-search", heading: "Use Global Search", body: `<ol><li>Click the <strong>search icon</strong> in the header</li><li>Type at least 2 characters</li><li>Click a result to navigate to it</li></ol>` },
      { id: "howto-i18n", heading: "Switch Language", body: `<ol><li>Click the <strong>flag/globe icon</strong> in the header</li><li>Select from 8 languages</li><li>Arabic enables RTL layout automatically</li></ol>` },
    ],
  },
];
