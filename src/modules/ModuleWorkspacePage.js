import { canReadModule } from "@admin-platform/shared-rbac";
import { MODULE_KEYS } from "@admin-platform/shared-types";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { ApiManagementModulePage } from "./deep/api-management/ApiManagementModulePage";
import { CalendarModulePage } from "./deep/calendar/CalendarModulePage";
import { ChatModulePage } from "./deep/chat/ChatModulePage";
import { CrmModulePage } from "./deep/crm/CrmModulePage";
import { EcommerceModulePage } from "./deep/ecommerce/EcommerceModulePage";
import { FileManagerModulePage } from "./deep/file-manager/FileManagerModulePage";
import { InvoicesModulePage } from "./deep/invoices/InvoicesModulePage";
import { JobModulePage } from "./deep/job/JobModulePage";
import { MailboxModulePage } from "./deep/mailbox/MailboxModulePage";
import { ProjectsModulePage } from "./deep/projects/ProjectsModulePage";
import { SupportTicketsModulePage } from "./deep/support-tickets/SupportTicketsModulePage";
import { TasksModulePage } from "./deep/tasks/TasksModulePage";
import { TodoModulePage } from "./deep/todo/TodoModulePage";
import { ModuleRecordsPage } from "./ModuleRecordsPage";

const MODULE_PAGE_MAP = {
  "ecommerce": EcommerceModulePage,
  "crm": CrmModulePage,
  "invoices": InvoicesModulePage,
  "api-management": ApiManagementModulePage,
  "support-tickets": SupportTicketsModulePage,
  "file-manager": FileManagerModulePage,
  "chat": ChatModulePage,
  "mailbox": MailboxModulePage,
  "projects": ProjectsModulePage,
  "tasks": TasksModulePage,
  "calendar": CalendarModulePage,
  "todo": TodoModulePage,
  "job": JobModulePage,
};

export function ModuleWorkspacePage() {
  const { moduleKey } = useParams();
  const { session } = useAuth();

  const validModuleKey = useMemo(() => {
    if (!moduleKey) return null;
    return MODULE_KEYS.includes(moduleKey) ? moduleKey : null;
  }, [moduleKey]);

  if (!validModuleKey) {
    return (
      <Card className="industrial-card max-w-md">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-destructive" />
          <p className="text-sm text-destructive font-bold uppercase tracking-wider">Invalid module route</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading session...</span>
      </div>
    );
  }

  const canRead = canReadModule(
    session.user.role,
    new Set(session.permissions),
    session.features,
    validModuleKey
  );

  if (!canRead) {
    return (
      <Card className="industrial-card max-w-md">
        <CardContent className="p-8 text-center">
          <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-destructive" />
          <p className="text-sm text-destructive font-bold uppercase tracking-wider">
            Access denied for {validModuleKey}
          </p>
        </CardContent>
      </Card>
    );
  }

  const PageComponent = MODULE_PAGE_MAP[validModuleKey];
  if (PageComponent) {
    return <PageComponent />;
  }

  return <ModuleRecordsPage />;
}
