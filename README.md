# Admin Panel Classic

React + Tailwind CSS + shadcn/ui frontend for the Admin Panel. Ships with 13 business modules, role-based permissions, feature flags, dynamic menus, dark/light theme, i18n, and a customizable layout system.

## Table of Contents

- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Authentication Flow](#authentication-flow)
- [Permissions & Feature Flags](#permissions--feature-flags)
- [Layout System](#layout-system)
- [Theming](#theming)
- [Internationalization](#internationalization)
- [Pairing with the Backend](#pairing-with-the-backend)
- [Deployment](#deployment)

---

## Quick Start

### Prerequisites

| Tool    | Version |
|---------|---------|
| Node.js | >= 22   |
| pnpm    | >= 9.15 |

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start the dev server

```bash
pnpm dev
```

Opens on `http://localhost:3000` by default.

> The app expects the backend API at `http://localhost:7002`. Set `REACT_APP_API_BASE_URL` to override.

---

## How It Works

### App Startup

```
Browser loads http://localhost:3000
  │
  ▼
index.js
  │  Renders <App /> inside React.StrictMode
  │
  ▼
App.js
  │  Wraps the app in context providers:
  │   ThemeProvider → AuthProvider → FeatureFlagProvider → MenuProvider → I18nProvider
  │
  ├─ Not authenticated:
  │   → LoginPage (email + password form)
  │   → POST /api/v1/auth/login → stores JWT in localStorage
  │
  ├─ Authenticated:
  │   → GET /api/v1/system/session-bootstrap
  │   → Returns user, permissions, features, menus, uiFlags
  │   → Renders the main layout with sidebar + header + content
  │
  └─ Route matching:
      → Dynamic routes built from menu items returned by session-bootstrap
      → Each route is guarded by feature flags and permissions
```

### Session Bootstrap

After login, the app calls `GET /api/v1/system/session-bootstrap` which returns everything the UI needs:

```json
{
  "user":        { "name": "...", "email": "...", "role": "admin" },
  "permissions": { "crm.read": true, "crm.create": true },
  "features":    { "crm": true, "ecommerce": true, "chat": false },
  "uiFlags":     { "darkMode": true, "compactSidebar": false },
  "menuGroups":  [ { "label": "Apps", "menus": [...] } ],
  "modules":     [ { "key": "crm", "label": "CRM" } ]
}
```

This single response drives:
- **Sidebar menus** - only shows enabled modules the user can access
- **Route guards** - blocks navigation to disabled/unauthorized modules
- **Permission gates** - hides create/edit/delete buttons per module
- **UI feature flags** - toggles header elements, layout options, page visibility

---

## Environment Variables

| Variable                   | Default                 | Description          |
|----------------------------|-------------------------|----------------------|
| `REACT_APP_API_BASE_URL`   | `http://localhost:7002` | Backend API base URL |

Set in a `.env` file at the project root:

```env
REACT_APP_API_BASE_URL=http://localhost:7002
```

---

## Available Scripts

| Script           | Description                              |
|------------------|------------------------------------------|
| `pnpm dev`       | Start CRA dev server with hot reload     |
| `pnpm build`     | Production build to `build/`             |
| `pnpm typecheck` | Type-check JS/JSX files via tsconfig     |
| `pnpm test`      | Run tests                                |

---

## Project Structure

```
src/
├── index.js                    # Entry point
├── index.css                   # Tailwind imports + global styles
├── app/                        # App component, routing setup
├── components/
│   ├── common/                 # Reusable components (tables, forms, modals)
│   ├── layout/
│   │   ├── AppLayout.jsx       # Main layout wrapper
│   │   ├── Header.jsx          # Top bar (search, notifications, profile)
│   │   ├── Sidebar.jsx         # Collapsible sidebar with menu groups
│   │   ├── HorizontalLayout.jsx # Horizontal nav layout variant
│   │   ├── TwoColumnLayout.jsx # Two-column layout variant
│   │   ├── ThemeCustomizer.jsx # Floating theme/layout settings panel
│   │   ├── SearchDropdown.jsx  # Global search in header
│   │   ├── NotificationDropdown.jsx
│   │   ├── LanguageDropdown.jsx
│   │   ├── LightDarkToggle.jsx
│   │   ├── FullscreenToggle.jsx
│   │   └── QuickLinksDropdown.jsx
│   └── ui/                     # shadcn/ui primitives
│       ├── button.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── input.jsx
│       ├── table.jsx
│       └── ...
├── core/
│   ├── auth/                   # AuthContext, JWT handling, login/logout
│   ├── menu/                   # MenuContext, dynamic menu from bootstrap
│   ├── feature-flags/          # FeatureFlagContext, UI flag hooks
│   ├── router/                 # Route guards (auth + permission checks)
│   ├── theme/                  # ThemeContext, dark/light CSS class toggling
│   ├── i18n/                   # i18next setup, language files
│   └── api/                    # API client setup
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (cn helper for Tailwind classes)
├── modules/
│   ├── auth/                   # Login page
│   ├── charts/                 # Chart.js and ApexCharts pages
│   ├── docs/                   # Documentation viewer
│   ├── pages/                  # Static pages (profile, FAQ, error, pricing, etc.)
│   ├── system/                 # Settings, branding, roles, permissions, audit log
│   ├── DashboardPage.js        # Main dashboard with KPIs
│   ├── ModuleWorkspacePage.js  # Generic workspace for simple modules
│   ├── ModuleRecordsPage.js    # Generic CRUD records page
│   ├── PaymentCallbackPage.js  # Payment provider callbacks
│   └── deep/                   # 13 business module UIs
│       ├── calendar/
│       ├── chat/
│       ├── crm/
│       ├── ecommerce/
│       ├── file-manager/
│       ├── invoices/
│       ├── job/
│       ├── mailbox/
│       ├── projects/
│       ├── support-tickets/
│       ├── tasks/
│       ├── todo/
│       └── api-management/
└── shared/                     # Inlined shared packages
    ├── types/                  # TypeScript types and constants
    ├── sdk/                    # API client functions per module
    └── rbac/                   # Permission helpers
```

---

## Modules

13 business modules, each with its own UI under `src/modules/deep/`:

| Module             | Description                              |
|--------------------|------------------------------------------|
| **Calendar**       | Event scheduling with FullCalendar       |
| **Chat**           | Conversations and messages               |
| **Mailbox**        | Email-like inbox with folders            |
| **eCommerce**      | Products, orders, payment processing     |
| **Projects**       | Project tracking with status and members |
| **Tasks**          | Task board with drag-and-drop            |
| **CRM**            | Contacts, deals, pipeline management     |
| **Invoices**       | Invoice creation and tracking            |
| **Support Tickets**| Helpdesk ticket system                   |
| **File Manager**   | File upload and browsing                 |
| **ToDo**           | Personal todo list                       |
| **Job**            | Job postings and applications            |
| **API Management** | API key generation and management        |

Modules can be enabled/disabled by a super admin via Settings > Feature Config. Disabled modules are hidden from the sidebar and their routes return 403 from the backend.

---

## Authentication Flow

1. User visits the app - `AuthProvider` checks localStorage for a saved JWT
2. No token → renders `LoginPage`
3. User submits email + password → `POST /api/v1/auth/login` → receives JWT
4. Token stored in localStorage → `AuthProvider` calls session-bootstrap
5. Session loaded → app renders the main layout with sidebar and content
6. All API calls include the token via `Authorization: Bearer <token>` header
7. On 401 response → auto-logout, redirect to login

---

## Permissions & Feature Flags

### Permission Gates

The `MenuContext` provides per-page permissions based on the user's custom role:

| Permission | Controls                  |
|------------|---------------------------|
| `read`     | Can view the page/data    |
| `create`   | Shows "Add New" buttons   |
| `update`   | Shows "Edit" buttons      |
| `delete`   | Shows "Delete" buttons    |
| `export`   | Shows "Export" buttons    |

Super admins bypass all permission checks.

### Feature Flags

Two levels of feature flags:

1. **Module flags** - enable/disable entire modules (hides sidebar item + blocks route)
2. **UI feature flags** - 30+ fine-grained toggles for header elements, layout options, sidebar sections, and page visibility

Both are returned by session-bootstrap and consumed via `useFeatureEnabled(key)` hook.

---

## Layout System

The app supports 3 layout modes, switchable via the Theme Customizer panel:

| Layout          | Description                                            |
|-----------------|--------------------------------------------------------|
| **Vertical**    | Default - collapsible sidebar on the left              |
| **Horizontal**  | Navigation bar across the top                          |
| **Two-Column**  | Narrow icon sidebar + expanded menu panel              |

The Theme Customizer (gear icon) also controls sidebar width, color scheme, and other layout preferences.

---

## Theming

- **Dark / Light mode** - toggleable via header button or Theme Customizer
- **Tailwind CSS** - dark mode via `dark` class on `<html>` element
- **shadcn/ui components** - consistent design primitives (button, card, dialog, table, etc.)
- Theme preference persisted in localStorage
- Branding (company name, logo, colors) configurable by super admin via Settings > Branding

---

## Internationalization

Built-in i18n support via `i18next`:

- Language files in `src/core/i18n/locales/`
- Language switcher in the header dropdown
- Add new languages by adding a JSON file to the locales directory

---

## Pairing with the Backend

This frontend requires [AdminPanel-Server](https://github.com/CanteenX/AdminPanel-Server) as its backend.

1. Start the backend on `http://localhost:7002`
2. Set `CORS_ORIGINS=http://localhost:3000` in the backend's `.env`
3. Start this frontend with `pnpm dev`
4. Login with the seeded credentials from the backend

---

## Deployment

### Build

```bash
pnpm build
```

Outputs static files to `build/`.

### Serve with any static host

The `build/` folder can be deployed to any static hosting service (Vercel, Netlify, S3 + CloudFront, Nginx, etc.).

### Nginx example

```nginx
server {
    listen 80;
    root /var/www/admin-panel-classic/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> The `try_files` fallback to `index.html` is required for client-side routing to work.

### Docker example

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile && pnpm build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Tech Stack

| Library               | Purpose                        |
|-----------------------|--------------------------------|
| React 19              | UI framework                   |
| JSX                   | Component syntax (no TypeScript in components) |
| Create React App      | Build tool + dev server        |
| CRACO                 | CRA config override            |
| Tailwind CSS 3        | Utility-first CSS framework    |
| shadcn/ui             | Radix-based UI primitives      |
| React Router 7        | Client-side routing            |
| React Hook Form + Zod | Form handling + validation     |
| FullCalendar          | Calendar module                |
| Chart.js + ApexCharts | Dashboard charts               |
| Leaflet               | Map components                 |
| i18next               | Internationalization           |
| Axios                 | HTTP client                    |
| Sonner                | Toast notifications            |
| Lucide React          | Icon library                   |
| @hello-pangea/dnd     | Drag and drop                  |

---

## License

Private - all rights reserved.
