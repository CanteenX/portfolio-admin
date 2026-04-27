import { canReadModule } from "@admin-platform/shared-rbac";
import { createModuleRecord, deleteModuleRecord, listModuleRecords } from "@admin-platform/shared-sdk";
import { MODULE_DEFINITIONS, MODULE_KEYS } from "@admin-platform/shared-types";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Database, Plus, AlertCircle } from "lucide-react";

export function ModuleRecordsPage() {
  const { moduleKey } = useParams();
  const { api, session } = useAuth();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  const validModuleKey = useMemo(() => {
    if (!moduleKey) return null;
    return MODULE_KEYS.includes(moduleKey) ? moduleKey : null;
  }, [moduleKey]);

  const moduleLabel = useMemo(
    () => MODULE_DEFINITIONS.find((item) => item.key === validModuleKey)?.label || "Unknown Module",
    [validModuleKey]
  );

  const canRead = useMemo(() => {
    if (!session || !validModuleKey) return false;
    return canReadModule(session.user.role, new Set(session.permissions), session.features, validModuleKey);
  }, [session, validModuleKey]);

  async function loadData() {
    if (!validModuleKey) return;
    try {
      const response = await listModuleRecords(api, validModuleKey);
      setItems(response.items);
    } catch {
      setError("Failed to load records");
    }
  }

  useEffect(() => {
    if (!validModuleKey || !session || !canRead) {
      return;
    }
    loadData();
  }, [validModuleKey, session, canRead]);

  async function onCreate(event) {
    event.preventDefault();
    if (!validModuleKey) return;
    try {
      await createModuleRecord(api, validModuleKey, { title, description });
      setTitle("");
      setDescription("");
      await loadData();
    } catch {
      setError("Failed to create");
    }
  }

  async function onDelete(id) {
    if (!validModuleKey) return;
    try {
      await deleteModuleRecord(api, validModuleKey, id);
      await loadData();
    } catch {
      setError("Failed to delete");
    }
  }

  if (!validModuleKey) {
    return (
      <Card className="industrial-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Invalid module route</p>
        </CardContent>
      </Card>
    );
  }

  if (!canRead) {
    return (
      <Card className="industrial-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Access denied for {moduleLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb title={moduleLabel} items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: moduleLabel }]} />

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <Card className="industrial-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Add Record</h3>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Title</Label>
              <Input
                placeholder={`${moduleLabel} title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
          </form>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="industrial-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold">{item.title}</span>
                  <span className="text-sm text-muted-foreground ml-2">- {item.status}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
