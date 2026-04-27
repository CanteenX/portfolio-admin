import {
  listJobPostings,
  createJobPosting,
  transitionJobPosting,
  deleteJobPosting,
  listJobApplications,
  createJobApplication,
  transitionJobApplication,
  deleteJobApplication,
  getJobInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { StatCard } from "../../../components/dashboard/StatCard";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { exportToExcel } from "../../../lib/exportToExcel";
import {
  Briefcase, Plus, AlertCircle, Trash2, Play, Square, CheckCircle,
  RotateCcw, Users, Send, FileDown, ClipboardList, Eye, MapPin,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const STATUS_BADGE = {
  draft: "secondary",
  open: "default",
  closed: "outline",
  filled: "default",
};

const APP_STATUS_BADGE = {
  submitted: "secondary",
  screening: "default",
  interview: "default",
  offered: "default",
  hired: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

export function JobModulePage() {
  const { api } = useAuth();
  const [postings, setPostings] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", department: "", location: "",
    employmentType: "full_time", experienceLevel: "mid", salary: "", currency: "USD", tags: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Applications state
  const [selectedPostingId, setSelectedPostingId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [appForm, setAppForm] = useState({
    applicantName: "", applicantEmail: "", resumeUrl: "", coverLetter: ""
  });
  const [deleteAppTarget, setDeleteAppTarget] = useState(null);

  const limit = 10;

  const loadAll = useCallback(async (targetPage = page) => {
    setError(null);
    try {
      const [postingsResult, insightsResult] = await Promise.all([
        listJobPostings(api, { page: targetPage, limit }),
        getJobInsights(api)
      ]);
      setPostings(postingsResult.items);
      setPage(postingsResult.page);
      setTotal(postingsResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load job postings");
    } finally {
      setLoading(false);
    }
  }, [api, page, limit]);

  const loadApplications = useCallback(async (postingId) => {
    setLoadingApps(true);
    try {
      const result = await listJobApplications(api, { postingId, page: 1, limit: 100 });
      setApplications(result.items);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  }, [api]);

  useEffect(() => { loadAll(page); }, [api, page]);

  useEffect(() => {
    if (selectedPostingId) {
      loadApplications(selectedPostingId);
    } else {
      setApplications([]);
    }
  }, [selectedPostingId, loadApplications]);

  async function handleCreatePosting(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagList = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      await createJobPosting(api, {
        title: form.title, description: form.description,
        department: form.department, location: form.location,
        employmentType: form.employmentType, experienceLevel: form.experienceLevel,
        salary: form.salary || undefined, currency: form.currency, tags: tagList
      });
      setForm({ title: "", description: "", department: "", location: "",
        employmentType: "full_time", experienceLevel: "mid", salary: "", currency: "USD", tags: "" });
      setCreateOpen(false);
      await loadAll(1);
    } catch {
      setError("Failed to create posting");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTransitionPosting(postingId, newStatus) {
    try {
      await transitionJobPosting(api, { postingId, newStatus });
      await loadAll(page);
    } catch {
      setError(`Failed to transition to ${newStatus}`);
    }
  }

  async function handleDeletePosting() {
    if (!deleteTarget) return;
    try {
      await deleteJobPosting(api, { postingId: deleteTarget });
      if (selectedPostingId === deleteTarget) setSelectedPostingId(null);
      setDeleteTarget(null);
      await loadAll(page);
    } catch {
      setError("Failed to delete posting");
    }
  }

  async function handleCreateApplication(e) {
    e.preventDefault();
    if (!selectedPostingId) return;
    setSubmitting(true);
    try {
      await createJobApplication(api, {
        postingId: selectedPostingId,
        applicantName: appForm.applicantName,
        applicantEmail: appForm.applicantEmail,
        resumeUrl: appForm.resumeUrl || undefined,
        coverLetter: appForm.coverLetter || undefined
      });
      setAppForm({ applicantName: "", applicantEmail: "", resumeUrl: "", coverLetter: "" });
      setAppDialogOpen(false);
      await loadApplications(selectedPostingId);
      await loadAll(page);
    } catch {
      setError("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTransitionApplication(applicationId, newStatus) {
    try {
      await transitionJobApplication(api, { applicationId, newStatus });
      if (selectedPostingId) await loadApplications(selectedPostingId);
      await loadAll(page);
    } catch {
      setError(`Failed to transition application to ${newStatus}`);
    }
  }

  async function handleDeleteApplication() {
    if (!deleteAppTarget) return;
    try {
      await deleteJobApplication(api, { applicationId: deleteAppTarget });
      setDeleteAppTarget(null);
      if (selectedPostingId) await loadApplications(selectedPostingId);
      await loadAll(page);
    } catch {
      setError("Failed to delete application");
    }
  }

  const totalPages = Math.ceil(total / limit);
  const selectedPosting = postings.find(p => p.postingId === selectedPostingId);

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb title="Jobs" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Jobs" }]} />
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb title="Job Postings & Applications" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Jobs" }]} />

      {/* Stats */}
      {insights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Open Positions" value={insights.open || 0} icon={Briefcase} color="primary" />
          <StatCard title="Filled" value={insights.filled || 0} icon={CheckCircle} color="green-500" />
          <StatCard title="Applications" value={insights.totalApplications || 0} icon={ClipboardList} color="sky-500" />
          <StatCard title="Hired" value={insights.hired || 0} icon={Users} color="emerald-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
          <Button variant="ghost" size="sm" className="ml-auto h-6" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <Tabs defaultValue="postings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="postings" className="uppercase tracking-wider text-xs font-bold">
            Postings ({total})
          </TabsTrigger>
          <TabsTrigger value="applications" className="uppercase tracking-wider text-xs font-bold">
            Applications {selectedPosting ? `— ${selectedPosting.title}` : ""}
          </TabsTrigger>
        </TabsList>

        {/* POSTINGS TAB */}
        <TabsContent value="postings" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {total} posting{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToExcel({
                data: postings,
                columns: [
                  { header: "Title", key: "title" },
                  { header: "Department", key: "department" },
                  { header: "Location", key: "location" },
                  { header: "Type", key: "employmentType" },
                  { header: "Level", key: "experienceLevel" },
                  { header: "Status", key: "status" },
                  { header: "Applications", key: "applicationCount" },
                ],
                fileName: "job-postings"
              })}>
                <FileDown className="w-4 h-4" /> Export
              </Button>
              <Button size="sm" className="gap-2 font-bold uppercase tracking-wider" onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4" /> New Posting
              </Button>
            </div>
          </div>

          <Card className="industrial-card">
            {postings.length === 0 ? (
              <CardContent className="p-8 text-center text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No job postings found.</p>
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase tracking-wider text-xs font-bold w-10">#</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Title</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Department</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Location</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Type</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Status</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Apps</TableHead>
                    <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postings.map((posting, idx) => (
                    <TableRow key={posting.postingId}>
                      <TableCell className="text-muted-foreground">{(page - 1) * limit + idx + 1}</TableCell>
                      <TableCell className="font-medium">{posting.title}</TableCell>
                      <TableCell className="text-muted-foreground">{posting.department}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{posting.location}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{posting.employmentType.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[posting.status] || "secondary"} className={`text-xs ${posting.status === "filled" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}`}>
                          {posting.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{posting.applicationCount || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View applications"
                            onClick={() => setSelectedPostingId(posting.postingId)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {posting.status === "draft" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500" title="Open"
                              onClick={() => handleTransitionPosting(posting.postingId, "open")}>
                              <Play className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {posting.status === "open" && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Close"
                                onClick={() => handleTransitionPosting(posting.postingId, "closed")}>
                                <Square className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500" title="Mark filled"
                                onClick={() => handleTransitionPosting(posting.postingId, "filled")}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {posting.status === "closed" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Reopen"
                              onClick={() => handleTransitionPosting(posting.postingId, "open")}>
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {posting.status === "draft" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete"
                              onClick={() => setDeleteTarget(posting.postingId)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* APPLICATIONS TAB */}
        <TabsContent value="applications" className="space-y-4">
          {!selectedPostingId ? (
            <Card className="industrial-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a job posting from the Postings tab to view applications.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold">{selectedPosting?.title}</span>
                  <span className="text-sm text-muted-foreground ml-2">— {applications.length} application{applications.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => exportToExcel({
                    data: applications,
                    columns: [
                      { header: "Name", key: "applicantName" },
                      { header: "Email", key: "applicantEmail" },
                      { header: "Status", key: "status" },
                      { header: "Applied", key: "appliedAt", transform: (v) => new Date(v).toLocaleDateString() },
                    ],
                    fileName: "job-applications"
                  })}>
                    <FileDown className="w-4 h-4" /> Export
                  </Button>
                  <Button size="sm" className="gap-2 font-bold uppercase tracking-wider" onClick={() => setAppDialogOpen(true)}>
                    <Plus className="w-4 h-4" /> New Application
                  </Button>
                </div>
              </div>

              <Card className="industrial-card">
                {loadingApps ? (
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  </CardContent>
                ) : applications.length === 0 ? (
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No applications yet.</p>
                  </CardContent>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="uppercase tracking-wider text-xs font-bold w-10">#</TableHead>
                        <TableHead className="uppercase tracking-wider text-xs font-bold">Applicant</TableHead>
                        <TableHead className="uppercase tracking-wider text-xs font-bold">Email</TableHead>
                        <TableHead className="uppercase tracking-wider text-xs font-bold">Status</TableHead>
                        <TableHead className="uppercase tracking-wider text-xs font-bold">Applied</TableHead>
                        <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app, idx) => (
                        <TableRow key={app.applicationId}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{app.applicantName}</TableCell>
                          <TableCell className="text-muted-foreground">{app.applicantEmail}</TableCell>
                          <TableCell>
                            <Badge variant={APP_STATUS_BADGE[app.status] || "secondary"} className={`text-xs ${
                              app.status === "hired" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                              app.status === "offered" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              app.status === "interview" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : ""
                            }`}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {app.status === "submitted" && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleTransitionApplication(app.applicationId, "screening")}>
                                  Screen
                                </Button>
                              )}
                              {app.status === "screening" && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleTransitionApplication(app.applicationId, "interview")}>
                                  Interview
                                </Button>
                              )}
                              {app.status === "interview" && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleTransitionApplication(app.applicationId, "offered")}>
                                  Offer
                                </Button>
                              )}
                              {app.status === "offered" && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-500" onClick={() => handleTransitionApplication(app.applicationId, "hired")}>
                                  Hire
                                </Button>
                              )}
                              {!["hired", "rejected", "withdrawn"].includes(app.status) && (
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleTransitionApplication(app.applicationId, "rejected")}>
                                  Reject
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteAppTarget(app.applicationId)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Posting Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Create Job Posting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePosting} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Title</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Department</Label>
                <Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Location</Label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Employment Type</Label>
                <Select value={form.employmentType} onValueChange={v => setForm(p => ({ ...p, employmentType: v }))}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Experience</Label>
                <Select value={form.experienceLevel} onValueChange={v => setForm(p => ({ ...p, experienceLevel: v }))}>
                  <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="react, node, remote" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="font-bold uppercase tracking-wider">
                {submitting ? "Creating..." : "Create Posting"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Application Dialog */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Submit Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Applicant Name</Label>
              <Input value={appForm.applicantName} onChange={e => setAppForm(p => ({ ...p, applicantName: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Email</Label>
              <Input type="email" value={appForm.applicantEmail} onChange={e => setAppForm(p => ({ ...p, applicantEmail: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Resume URL (optional)</Label>
              <Input type="url" value={appForm.resumeUrl} onChange={e => setAppForm(p => ({ ...p, resumeUrl: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Cover Letter (optional)</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={appForm.coverLetter} onChange={e => setAppForm(p => ({ ...p, coverLetter: e.target.value }))} rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAppDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="font-bold uppercase tracking-wider">
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Posting Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Job Posting"
        description="This will permanently delete this job posting and cannot be undone."
        onConfirm={handleDeletePosting}
        variant="destructive"
      />

      {/* Delete Application Confirm */}
      <ConfirmDialog
        open={!!deleteAppTarget}
        onOpenChange={(open) => { if (!open) setDeleteAppTarget(null); }}
        title="Delete Application"
        description="This will permanently delete this application."
        onConfirm={handleDeleteApplication}
        variant="destructive"
      />
    </div>
  );
}
