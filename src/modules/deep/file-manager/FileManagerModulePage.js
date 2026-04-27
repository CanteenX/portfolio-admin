import {
  createFileManagerFile,
  createFileManagerFolder,
  deleteFileManagerEntry,
  getFileManagerInsights,
  listFileManagerEntries,
  moveFileManagerEntry,
  transitionFileManagerEntry,
  updateFileManagerEntry
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  FolderOpen, Plus, AlertCircle, Folder, File, Star, Pencil,
  ArrowRightLeft, Trash2, RotateCcw, Search, ChevronUp
} from "lucide-react";

function parseTags(input) {
  return Array.from(new Set(input.split(",").map((item) => item.trim()).filter((item) => item.length > 0)));
}

export function FileManagerModulePage() {
  const { api } = useAuth();
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [folderTrail, setFolderTrail] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [fileForm, setFileForm] = useState({
    name: "",
    sizeBytes: 0,
    mimeType: "",
    tagsCsv: ""
  });

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [entriesResult, insightsResult] = await Promise.all([
        listFileManagerEntries(api, {
          parentId: currentFolderId,
          status: statusFilter,
          q: searchQuery || undefined,
          page: targetPage,
          limit
        }),
        getFileManagerInsights(api)
      ]);
      setEntries(entriesResult.items);
      setPage(entriesResult.page);
      setTotal(entriesResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load file manager data");
    }
  }

  useEffect(() => {
    void loadAll(page);
  }, [api, currentFolderId, page, statusFilter, searchQuery]);

  async function onCreateFolder(event) {
    event.preventDefault();
    try {
      await createFileManagerFolder(api, {
        name: folderName.trim(),
        parentId: currentFolderId
      });
      setFolderName("");
      await loadAll(1);
    } catch {
      setError("Failed to create folder");
    }
  }

  async function onCreateFile(event) {
    event.preventDefault();
    try {
      await createFileManagerFile(api, {
        name: fileForm.name.trim(),
        parentId: currentFolderId,
        sizeBytes: Number(fileForm.sizeBytes) || 0,
        mimeType: fileForm.mimeType.trim() || undefined,
        tags: parseTags(fileForm.tagsCsv)
      });
      setFileForm({ name: "", sizeBytes: 0, mimeType: "", tagsCsv: "" });
      await loadAll(1);
    } catch {
      setError("Failed to create file record");
    }
  }

  async function onRenameEntry(entry) {
    const nextName = window.prompt("New name", entry.name);
    if (!nextName || !nextName.trim()) {
      return;
    }
    try {
      await updateFileManagerEntry(api, entry._id, { name: nextName.trim() });
      await loadAll(page);
    } catch {
      setError("Failed to rename entry");
    }
  }

  async function onToggleStar(entry) {
    try {
      await updateFileManagerEntry(api, entry._id, { isStarred: !entry.isStarred });
      await loadAll(page);
    } catch {
      setError("Failed to update star");
    }
  }

  async function onMoveEntry(entry) {
    const nextParent = window.prompt("Target folder id (leave empty for root)");
    try {
      await moveFileManagerEntry(api, entry._id, {
        targetParentId: nextParent && nextParent.trim() ? nextParent.trim() : null
      });
      await loadAll(page);
    } catch {
      setError("Failed to move entry");
    }
  }

  async function onTransitionEntry(entry, to) {
    try {
      await transitionFileManagerEntry(api, entry._id, { to });
      await loadAll(page);
    } catch {
      setError("Failed to update entry status");
    }
  }

  async function onDeleteEntry(entry) {
    if (!window.confirm("Permanently delete this trashed entry?")) return;
    try {
      await deleteFileManagerEntry(api, entry._id);
      const remainingAfterDelete = total - 1;
      const maxPage = Math.max(1, Math.ceil(remainingAfterDelete / limit));
      await loadAll(Math.min(page, maxPage));
    } catch {
      setError("Failed to delete entry");
    }
  }

  function onOpenFolder(entry) {
    if (entry.kind !== "folder" || entry.status !== "active") {
      return;
    }
    setFolderTrail((prev) => [...prev, { id: entry._id, name: entry.name }]);
    setCurrentFolderId(entry._id);
    setPage(1);
    setSearchInput("");
    setSearchQuery("");
  }

  function onGoUp() {
    if (folderTrail.length === 0) {
      return;
    }
    const nextTrail = folderTrail.slice(0, -1);
    setFolderTrail(nextTrail);
    setCurrentFolderId(nextTrail.length > 0 ? nextTrail[nextTrail.length - 1].id : null);
    setPage(1);
    setSearchInput("");
    setSearchQuery("");
  }

  function onJumpToTrail(index) {
    const nextTrail = folderTrail.slice(0, index + 1);
    setFolderTrail(nextTrail);
    setCurrentFolderId(nextTrail[nextTrail.length - 1]?.id ?? null);
    setPage(1);
    setSearchInput("");
    setSearchQuery("");
  }

  function onApplySearch(event) {
    event.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <Breadcrumb title="File Manager" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "File Manager" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Files</span>
              <span className="ml-2 font-bold">{insights.counts.totalFiles}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Folders</span>
              <span className="ml-2 font-bold">{insights.counts.totalFolders}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Trashed</span>
              <span className="ml-2 font-bold">{insights.counts.trashedEntries}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Starred</span>
              <span className="ml-2 font-bold">{insights.counts.starredEntries}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total Bytes</span>
              <span className="ml-2 font-bold">{insights.counts.totalSizeBytes}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <Card className="industrial-card">
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-3">Location</h3>
          <div className="flex items-center gap-1 flex-wrap text-sm mb-3">
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setFolderTrail([]);
                setCurrentFolderId(null);
                setPage(1);
                setSearchInput("");
                setSearchQuery("");
              }}
              className="px-1"
            >
              Root
            </Button>
            {folderTrail.map((item, index) => (
              <span key={item.id} className="flex items-center">
                <span className="text-muted-foreground">/</span>
                <Button variant="link" size="sm" onClick={() => onJumpToTrail(index)} className="px-1">
                  {item.name}
                </Button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={onGoUp} disabled={folderTrail.length === 0}>
              <ChevronUp className="w-4 h-4" /> Up
            </Button>
            <div className="flex items-center gap-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Status</Label>
              <select
                className="flex h-9 rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="active">active</option>
                <option value="trashed">trashed</option>
                <option value="all">all</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-3">Search</h3>
          <form onSubmit={onApplySearch} className="flex gap-2">
            <Input
              placeholder="Search name"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="sm">
              <Search className="w-4 h-4" /> Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="industrial-card">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Folder</h3>
            <form onSubmit={onCreateFolder} className="flex gap-2">
              <Input
                placeholder="Folder name"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="industrial-card">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create File Record</h3>
            <form onSubmit={onCreateFile} className="space-y-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">File Name</Label>
                <Input
                  placeholder="File name (example: notes.txt)"
                  value={fileForm.name}
                  onChange={(event) => setFileForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Size (bytes)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Size in bytes"
                  value={fileForm.sizeBytes}
                  onChange={(event) => setFileForm((prev) => ({ ...prev, sizeBytes: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">MIME Type</Label>
                <Input
                  placeholder="MIME type (optional)"
                  value={fileForm.mimeType}
                  onChange={(event) => setFileForm((prev) => ({ ...prev, mimeType: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Tags</Label>
                <Input
                  placeholder="Tags CSV (optional)"
                  value={fileForm.tagsCsv}
                  onChange={(event) => setFileForm((prev) => ({ ...prev, tagsCsv: event.target.value }))}
                />
              </div>
              <Button type="submit" className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create File
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-display font-bold uppercase tracking-tight">Entries</span>
        <Badge variant="secondary">{entries.length} of {total}</Badge>
      </div>

      {entries.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No entries found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry._id} className="industrial-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {entry.kind === "folder" ? (
                        <Folder className="w-4 h-4" />
                      ) : (
                        <File className="w-4 h-4" />
                      )}
                      {entry.name}
                      {entry.isStarred ? (
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{entry.status}</Badge>
                      {entry.kind === "file" ? (
                        <span>
                          {entry.sizeBytes ?? 0} bytes{entry.mimeType ? ` - ${entry.mimeType}` : ""}
                        </span>
                      ) : null}
                      {entry.tags.length > 0 ? (
                        <span>tags: {entry.tags.join(", ")}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {entry.kind === "folder" && entry.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => onOpenFolder(entry)}>
                      <FolderOpen className="w-4 h-4" /> Open
                    </Button>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => onToggleStar(entry)}>
                    <Star className={`w-4 h-4 ${entry.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    {entry.isStarred ? "Unstar" : "Star"}
                  </Button>
                  {entry.status === "active" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onRenameEntry(entry)}>
                        <Pencil className="w-4 h-4" /> Rename
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onMoveEntry(entry)}>
                        <ArrowRightLeft className="w-4 h-4" /> Move
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onTransitionEntry(entry, "trashed")}>
                        <Trash2 className="w-4 h-4" /> Trash
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onTransitionEntry(entry, "active")}>
                        <RotateCcw className="w-4 h-4" /> Restore
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDeleteEntry(entry)}>
                        <Trash2 className="w-4 h-4" /> Delete Permanently
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
