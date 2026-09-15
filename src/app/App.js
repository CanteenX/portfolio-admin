import React, { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { PermissionProtected } from "../core/router/PermissionProtected";
import { FeatureFlagProvider } from "../core/feature-flags/FeatureFlagContext";
import { MenuProvider } from "../core/menu/MenuContext";
import { LayoutProvider } from "../core/layout/LayoutContext";
import { AppLayout } from "../components/layout/AppLayout";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { LoginPage } from "../modules/LoginPage";
import { Layers } from "lucide-react";

// Lazy-loaded page components
const DashboardPage = React.lazy(() => import("../modules/DashboardPage").then(m => ({ default: m.DashboardPage })));
const PaymentCallbackPage = React.lazy(() => import("../modules/PaymentCallbackPage").then(m => ({ default: m.PaymentCallbackPage })));
const ApexChartsPage = React.lazy(() => import("../modules/charts/ApexChartsPage"));
const ChartjsPage = React.lazy(() => import("../modules/charts/ChartjsPage"));
const AuditLogPage = React.lazy(() => import("../modules/system/AuditLogPage"));
const BrandingPage = React.lazy(() => import("../modules/system/BrandingPage"));
const CustomRolesPage = React.lazy(() => import("../modules/system/CustomRolesPage"));
const PermissionMatrixPage = React.lazy(() => import("../modules/system/PermissionMatrixPage"));
const NotificationsPage = React.lazy(() => import("../modules/system/NotificationsPage"));
const PaymentSettingsPage = React.lazy(() => import("../modules/system/PaymentSettingsPage"));
const SystemSettingsPage = React.lazy(() => import("../modules/system/SystemSettingsPage"));
const UIFeatureFlagsPage = React.lazy(() => import("../modules/system/UIFeatureFlagsPage"));
const Error404Page = React.lazy(() => import("../modules/pages/Error404Page"));
const Error500Page = React.lazy(() => import("../modules/pages/Error500Page"));
const OfflinePage = React.lazy(() => import("../modules/pages/OfflinePage"));
const ComingSoonPage = React.lazy(() => import("../modules/pages/ComingSoonPage"));
const MaintenancePage = React.lazy(() => import("../modules/pages/MaintenancePage"));
const FormElementsPage = React.lazy(() => import("../modules/pages/FormElementsPage"));
const EditorPage = React.lazy(() => import("../modules/pages/EditorPage"));
const LeafletMapsPage = React.lazy(() => import("../modules/pages/LeafletMapsPage"));
const GoogleMapsPage = React.lazy(() => import("../modules/pages/GoogleMapsPage"));
const ProfilePage = React.lazy(() => import("../modules/pages/ProfilePage"));
const TimelinePage = React.lazy(() => import("../modules/pages/TimelinePage"));
const GalleryPage = React.lazy(() => import("../modules/pages/GalleryPage"));
const SearchResultsPage = React.lazy(() => import("../modules/pages/SearchResultsPage"));
const AdvancedUiPage = React.lazy(() => import("../modules/pages/AdvancedUiPage"));
const RegisterPage = React.lazy(() => import("../modules/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = React.lazy(() => import("../modules/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = React.lazy(() => import("../modules/auth/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const LockScreenPage = React.lazy(() => import("../modules/auth/LockScreenPage").then(m => ({ default: m.LockScreenPage })));
const TwoStepVerificationPage = React.lazy(() => import("../modules/auth/TwoStepVerificationPage").then(m => ({ default: m.TwoStepVerificationPage })));
const SuccessMessagePage = React.lazy(() => import("../modules/auth/SuccessMessagePage").then(m => ({ default: m.SuccessMessagePage })));
const LogoutPage = React.lazy(() => import("../modules/auth/LogoutPage").then(m => ({ default: m.LogoutPage })));
const DocumentationPage = React.lazy(() => import("../modules/docs/DocumentationPage"));
const UserManagementPage = React.lazy(() => import("../modules/system/UserManagementPage"));
const MenuManagementPage = React.lazy(() => import("../modules/system/MenuManagementPage"));

// Deep module pages (MenuMaster routes)
const CalendarModulePage = React.lazy(() => import("../modules/deep/calendar/CalendarModulePage").then(m => ({ default: m.CalendarModulePage })));
const ChatModulePage = React.lazy(() => import("../modules/deep/chat/ChatModulePage").then(m => ({ default: m.ChatModulePage })));
const MailboxModulePage = React.lazy(() => import("../modules/deep/mailbox/MailboxModulePage").then(m => ({ default: m.MailboxModulePage })));
const ProjectsModulePage = React.lazy(() => import("../modules/deep/projects/ProjectsModulePage").then(m => ({ default: m.ProjectsModulePage })));
const TasksModulePage = React.lazy(() => import("../modules/deep/tasks/TasksModulePage").then(m => ({ default: m.TasksModulePage })));
const InvoicesModulePage = React.lazy(() => import("../modules/deep/invoices/InvoicesModulePage").then(m => ({ default: m.InvoicesModulePage })));
const SupportTicketsModulePage = React.lazy(() => import("../modules/deep/support-tickets/SupportTicketsModulePage").then(m => ({ default: m.SupportTicketsModulePage })));
const FileManagerModulePage = React.lazy(() => import("../modules/deep/file-manager/FileManagerModulePage").then(m => ({ default: m.FileManagerModulePage })));
const TodoModulePage = React.lazy(() => import("../modules/deep/todo/TodoModulePage").then(m => ({ default: m.TodoModulePage })));
const ApiManagementModulePage = React.lazy(() => import("../modules/deep/api-management/ApiManagementModulePage").then(m => ({ default: m.ApiManagementModulePage })));
const EcommerceModulePage = React.lazy(() => import("../modules/deep/ecommerce/EcommerceModulePage").then(m => ({ default: m.EcommerceModulePage })));
const CrmModulePage = React.lazy(() => import("../modules/deep/crm/CrmModulePage").then(m => ({ default: m.CrmModulePage })));
const JobModulePage = React.lazy(() => import("../modules/deep/job/JobModulePage").then(m => ({ default: m.JobModulePage })));

// Portfolio CMS pages
const PortfolioProjectsPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioProjectsPage").then(m => ({ default: m.PortfolioProjectsPage })));
const PortfolioTeamPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioTeamPage").then(m => ({ default: m.PortfolioTeamPage })));
const PortfolioSettingsPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioSettingsPage").then(m => ({ default: m.PortfolioSettingsPage })));
const PortfolioContactsPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioContactsPage").then(m => ({ default: m.PortfolioContactsPage })));
const PortfolioMastersPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioMastersPage").then(m => ({ default: m.PortfolioMastersPage })));
const PortfolioTechStackPage = React.lazy(() => import("../modules/deep/portfolio/PortfolioTechStackPage").then(m => ({ default: m.PortfolioTechStackPage })));

// RBAC pages
const RbacMenuMasterPage = React.lazy(() => import("../modules/rbac/MenuMasterPage"));
const RbacActionTypePage = React.lazy(() => import("../modules/rbac/ActionTypePage"));
const RbacRoleMasterPage = React.lazy(() => import("../modules/rbac/RoleMasterPage"));
const RbacRoleEditPage = React.lazy(() => import("../modules/rbac/RoleEditPage"));
const RbacEmployeePage = React.lazy(() => import("../modules/rbac/EmployeePage"));
const RbacTaskPage = React.lazy(() => import("../modules/rbac/TaskPage"));

const LazyFallback = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function AuthenticatedRoutes() {
  const { session } = useAuth();

  return (
    <FeatureFlagProvider flags={session?.uiFeatureFlags}>
      <MenuProvider
        menuGroups={session?.menuGroups}
        rolePermissions={session?.currentRolePermissions}
        isSuperAdmin={session?.user?.role === "super_admin"}
      >
        <LayoutProvider>
          <ScrollToTop />
          <AppLayout>
            <Suspense fallback={<LazyFallback />}>
            <PermissionProtected>
              <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/payments/callback" element={<PaymentCallbackPage />} />
              {/* Settings */}
              <Route path="/settings/payments" element={<PaymentSettingsPage />} />
              <Route path="/settings/audit-log" element={<AuditLogPage />} />
              <Route path="/settings/system" element={<SystemSettingsPage />} />
              <Route path="/settings/branding" element={<BrandingPage />} />
              <Route path="/settings/custom-roles" element={<CustomRolesPage />} />
              <Route path="/settings/custom-roles/:id/permissions" element={<PermissionMatrixPage />} />
              <Route path="/settings/feature-toggles" element={<UIFeatureFlagsPage />} />
              <Route path="/settings/users" element={<UserManagementPage />} />
              <Route path="/settings/menu-management" element={<MenuManagementPage />} />
              {/* RBAC */}
              <Route path="/rbac/menus" element={<RbacMenuMasterPage />} />
              <Route path="/rbac/actions" element={<RbacActionTypePage />} />
              <Route path="/rbac/roles" element={<RbacRoleMasterPage />} />
              <Route path="/rbac/roles/new" element={<RbacRoleEditPage />} />
              <Route path="/rbac/roles/:roleId/edit" element={<RbacRoleEditPage />} />
              <Route path="/rbac/employees" element={<RbacEmployeePage />} />
              <Route path="/rbac/tasks" element={<RbacTaskPage />} />
              {/* Module pages (MenuMaster routes) */}
              <Route path="/calendar" element={<CalendarModulePage />} />
              <Route path="/chat" element={<ChatModulePage />} />
              <Route path="/mailbox" element={<MailboxModulePage />} />
              <Route path="/projects" element={<ProjectsModulePage />} />
              <Route path="/tasks" element={<TasksModulePage />} />
              <Route path="/invoices" element={<InvoicesModulePage />} />
              <Route path="/support-tickets" element={<SupportTicketsModulePage />} />
              <Route path="/file-manager" element={<FileManagerModulePage />} />
              <Route path="/todo" element={<TodoModulePage />} />
              <Route path="/api-management" element={<ApiManagementModulePage />} />
              <Route path="/ecommerce" element={<EcommerceModulePage />} />
              <Route path="/ecommerce/products" element={<EcommerceModulePage />} />
              <Route path="/ecommerce/orders" element={<EcommerceModulePage />} />
              <Route path="/crm" element={<CrmModulePage />} />
              <Route path="/crm/contacts" element={<CrmModulePage />} />
              <Route path="/crm/deals" element={<CrmModulePage />} />
              <Route path="/crm/pipelines" element={<CrmModulePage />} />
              <Route path="/job" element={<JobModulePage />} />
              <Route path="/job/postings" element={<JobModulePage />} />
              <Route path="/job/applications" element={<JobModulePage />} />
              {/* Portfolio CMS */}
              <Route path="/portfolio/projects" element={<PortfolioProjectsPage />} />
              <Route path="/portfolio/team" element={<PortfolioTeamPage />} />
              <Route path="/portfolio/settings" element={<PortfolioSettingsPage />} />
              <Route path="/portfolio/contacts" element={<PortfolioContactsPage />} />
              {/* Portfolio Masters */}
              <Route path="/portfolio/projects/masters" element={<PortfolioMastersPage />} />
              <Route path="/portfolio/masters/tech-stacks" element={<PortfolioTechStackPage />} />
              {/* Charts */}
              <Route path="/charts/apex" element={<ApexChartsPage />} />
              <Route path="/charts/chartjs" element={<ChartjsPage />} />
              {/* Forms */}
              <Route path="/forms/basic" element={<FormElementsPage />} />
              <Route path="/forms/advanced" element={<FormElementsPage />} />
              <Route path="/forms/validation" element={<FormElementsPage />} />
              <Route path="/forms/editor" element={<EditorPage />} />
              {/* Maps */}
              <Route path="/maps/google" element={<GoogleMapsPage />} />
              <Route path="/maps/vector" element={<LeafletMapsPage />} />
              {/* Pages */}
              <Route path="/pages/profile" element={<ProfilePage />} />
              <Route path="/pages/timeline" element={<TimelinePage />} />
              <Route path="/pages/gallery" element={<GalleryPage />} />
              <Route path="/pages/search" element={<SearchResultsPage />} />
              {/* UI */}
              <Route path="/ui/advanced" element={<AdvancedUiPage />} />
              <Route path="/ui/alerts" element={<AdvancedUiPage />} />
              <Route path="/ui/badges" element={<AdvancedUiPage />} />
              <Route path="/ui/buttons" element={<AdvancedUiPage />} />
              <Route path="/ui/cards" element={<AdvancedUiPage />} />
              <Route path="/ui/modals" element={<AdvancedUiPage />} />
              {/* Notifications (always accessible) */}
              <Route path="/notifications" element={<NotificationsPage />} />
              {/* Group placeholder roots — redirect to dashboard */}
              <Route path="/group/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Error404Page />} />
            </Routes>
              </PermissionProtected>
          </Suspense>
          </AppLayout>
        </LayoutProvider>
      </MenuProvider>
    </FeatureFlagProvider>
  );
}

function App() {
  const { token, loading } = useAuth();
  const location = useLocation();
  const redirectTarget = encodeURIComponent(`${location.pathname}${location.search}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <Layers className="w-10 h-10 text-primary" />
          <h1 className="font-display text-xl font-bold tracking-tight uppercase text-foreground">
            Admin Platform
          </h1>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/error/404" element={<Error404Page />} />
        <Route path="/error/500" element={<Error500Page />} />
        <Route path="/error/offline" element={<OfflinePage />} />
        <Route path="/coming-soon" element={<ComingSoonPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/lock-screen" element={<LockScreenPage />} />
        <Route path="/auth/two-step" element={<TwoStepVerificationPage />} />
        <Route path="/auth/success" element={<SuccessMessagePage />} />
        <Route path="/auth/logout" element={<LogoutPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route
          path="/*"
          element={token ? <AuthenticatedRoutes /> : <Navigate to={`/login?redirect=${redirectTarget}`} replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
