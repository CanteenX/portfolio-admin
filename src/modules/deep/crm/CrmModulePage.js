import {
  createCrmContact,
  createCrmDeal,
  createCrmPipeline,
  getCrmInsights,
  listCrmContacts,
  listCrmDeals,
  listCrmPipelines,
  transitionCrmDealStage
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { TablePagination } from "../../../components/common/TablePagination";
import { TableSearch } from "../../../components/common/TableSearch";
import { SortableHeader } from "../../../components/common/SortableHeader";
import { StatCard } from "../../../components/dashboard/StatCard";
import { usePagination } from "../../../hooks/usePagination";
import { useTableFilter } from "../../../hooks/useTableFilter";
import { useTableSort } from "../../../hooks/useTableSort";
import { exportToExcel } from "../../../lib/exportToExcel";
import { AlertCircle, Plus, Users, Handshake, Trophy, XCircle, Edit, Download, ArrowRight } from "lucide-react";

export function CrmModulePage() {
  const { api } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [deals, setDeals] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [editContactDialogOpen, setEditContactDialogOpen] = useState(false);

  const [contactForm, setContactForm] = useState({
    displayName: "",
    primaryEmail: "",
    companyName: ""
  });
  const [pipelineName, setPipelineName] = useState("");
  const [dealForm, setDealForm] = useState({
    title: "",
    contactId: "",
    pipelineId: "",
    stageKey: "",
    amountValue: 0
  });

  const [dealStatusFilter, setDealStatusFilter] = useState("all");

  async function loadAll() {
    setError(null);
    try {
      const [contactsResult, pipelinesResult, dealsResult, insightsResult] = await Promise.all([
        listCrmContacts(api),
        listCrmPipelines(api),
        listCrmDeals(api),
        getCrmInsights(api)
      ]);
      setContacts(contactsResult);
      setPipelines(pipelinesResult);
      setDeals(dealsResult);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load CRM data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [api]);

  async function onCreateContact(event) {
    event.preventDefault();
    try {
      await createCrmContact(api, contactForm);
      setContactForm({ displayName: "", primaryEmail: "", companyName: "" });
      setContactDialogOpen(false);
      await loadAll();
    } catch {
      setError("Failed to create contact");
    }
  }

  async function onCreatePipeline(event) {
    event.preventDefault();
    try {
      await createCrmPipeline(api, {
        name: pipelineName,
        isDefault: pipelines.length === 0,
        stages: [
          { key: "qualified", label: "Qualified", order: 1 },
          { key: "proposal", label: "Proposal", order: 2 },
          { key: "won", label: "Won", order: 3, isTerminalWon: true },
          { key: "lost", label: "Lost", order: 4, isTerminalLost: true }
        ]
      });
      setPipelineName("");
      setPipelineDialogOpen(false);
      await loadAll();
    } catch {
      setError("Failed to create pipeline");
    }
  }

  async function onCreateDeal(event) {
    event.preventDefault();
    try {
      await createCrmDeal(api, {
        title: dealForm.title,
        contactId: dealForm.contactId,
        pipelineId: dealForm.pipelineId,
        stageKey: dealForm.stageKey,
        amountValue: Number(dealForm.amountValue)
      });
      setDealForm({ title: "", contactId: "", pipelineId: "", stageKey: "", amountValue: 0 });
      setDealDialogOpen(false);
      await loadAll();
    } catch {
      setError("Failed to create deal");
    }
  }

  async function onTransitionDeal(dealId, stageKey) {
    try {
      let lostReason;
      if (stageKey === "lost") {
        lostReason = window.prompt("Enter lost reason");
        if (!lostReason || !lostReason.trim()) {
          setError("Lost reason is required to move a deal to lost");
          return;
        }
      }
      await transitionCrmDealStage(api, dealId, { stageKey, lostReason });
      await loadAll();
    } catch {
      setError("Failed to transition deal");
    }
  }

  function getTerminalStageKey(pipelineId, target) {
    const pipeline = pipelines.find((item) => item._id === pipelineId);
    if (!pipeline?.stages) return undefined;
    const stage = pipeline.stages.find((item) =>
      target === "won" ? item.isTerminalWon : item.isTerminalLost
    );
    return stage?.key;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(dateString));
  }

  const { filteredData: filteredContacts, searchTerm: contactSearchTerm, setSearchTerm: setContactSearchTerm } = useTableFilter(contacts, {
    searchFields: ["displayName", "primaryEmail", "companyName"]
  });

  const { sortedData: sortedContacts, sortKey: contactSortKey, sortDirection: contactSortDirection, handleSort: handleContactSort } = useTableSort(filteredContacts);

  const { paginatedData: paginatedContacts, currentPage: contactsCurrentPage, totalPages: contactsTotalPages, pageSize: contactsPageSize, setCurrentPage: setContactsCurrentPage, setPageSize: setContactsPageSize, startIndex: contactsStartIndex, PAGE_SIZE_OPTIONS: CONTACTS_PAGE_SIZE_OPTIONS } = usePagination(sortedContacts, 10);

  const dealsWithStatusFilter = deals.filter((deal) => {
    if (dealStatusFilter === "all") return true;
    return deal.status === dealStatusFilter;
  });

  const { filteredData: filteredDeals, searchTerm: dealSearchTerm, setSearchTerm: setDealSearchTerm } = useTableFilter(dealsWithStatusFilter, {
    searchFields: ["title", "status", "stageKey"]
  });

  const { sortedData: sortedDeals, sortKey: dealSortKey, sortDirection: dealSortDirection, handleSort: handleDealSort } = useTableSort(filteredDeals);

  const { paginatedData: paginatedDeals, currentPage: dealsCurrentPage, totalPages: dealsTotalPages, pageSize: dealsPageSize, setCurrentPage: setDealsCurrentPage, setPageSize: setDealsPageSize, startIndex: dealsStartIndex, PAGE_SIZE_OPTIONS: DEALS_PAGE_SIZE_OPTIONS } = usePagination(sortedDeals, 10);

  function exportContacts() {
    exportToExcel({
      data: contacts,
      columns: [
        { header: "Name", key: "displayName" },
        { header: "Email", key: "primaryEmail" },
        { header: "Company", key: "companyName" },
        { header: "Created", key: "createdAt" }
      ],
      fileName: "crm-contacts"
    });
  }

  function exportDeals() {
    exportToExcel({
      data: deals,
      columns: [
        { header: "Title", key: "title" },
        { header: "Status", key: "status" },
        { header: "Stage", key: "stageKey" },
        { header: "Amount", key: "amountValue" }
      ],
      fileName: "crm-deals"
    });
  }

  function getContactById(contactId) {
    const contact = contacts.find((c) => c._id === contactId);
    return contact?.displayName || "-";
  }

  function getPipelineById(pipelineId) {
    return pipelines.find((p) => p._id === pipelineId);
  }

  function getStageLabel(pipelineId, stageKey) {
    const pipeline = getPipelineById(pipelineId);
    const stage = pipeline?.stages?.find((s) => s.key === stageKey);
    return stage?.label || stageKey;
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb title="CRM" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "CRM" }]} />
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb title="CRM" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "CRM" }]} />

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      {insights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Contacts"
            value={insights.counts.contacts}
            icon={Users}
            trend={null}
          />
          <StatCard
            title="Open Deals"
            value={insights.counts.openDeals}
            icon={Handshake}
            trend={null}
          />
          <StatCard
            title="Won Deals"
            value={insights.counts.wonDeals}
            icon={Trophy}
            trend={null}
          />
          <StatCard
            title="Lost Deals"
            value={insights.counts.lostDeals}
            icon={XCircle}
            trend={null}
          />
        </div>
      ) : null}

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="contacts" className="font-bold uppercase tracking-wider">Contacts</TabsTrigger>
          <TabsTrigger value="deals" className="font-bold uppercase tracking-wider">Deals</TabsTrigger>
          <TabsTrigger value="pipelines" className="font-bold uppercase tracking-wider">Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[240px]">
                  <TableSearch
                    searchTerm={contactSearchTerm}
                    onSearchChange={setContactSearchTerm}
                    placeholder="Search contacts..."
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportContacts}
                  className="font-bold uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => setContactDialogOpen(true)}
                  className="font-bold uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" /> New Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Name"
                          sortKey="displayName"
                          currentSortKey={contactSortKey}
                          currentSortDirection={contactSortDirection}
                          onSort={handleContactSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Email"
                          sortKey="primaryEmail"
                          currentSortKey={contactSortKey}
                          currentSortDirection={contactSortDirection}
                          onSort={handleContactSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Company"
                          sortKey="companyName"
                          currentSortKey={contactSortKey}
                          currentSortDirection={contactSortDirection}
                          onSort={handleContactSort}
                        />
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Tags</TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Created"
                          sortKey="createdAt"
                          currentSortKey={contactSortKey}
                          currentSortDirection={contactSortDirection}
                          onSort={handleContactSort}
                        />
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedContacts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No contacts found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedContacts.map((contact, index) => (
                        <TableRow key={contact._id}>
                          <TableCell className="font-medium">{contactsStartIndex + index + 1}</TableCell>
                          <TableCell className="font-medium">{contact.displayName || "-"}</TableCell>
                          <TableCell>{contact.primaryEmail || "-"}</TableCell>
                          <TableCell>{contact.companyName || "-"}</TableCell>
                          <TableCell>
                            {contact.tags && contact.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {contact.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>{formatDate(contact.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditContactDialogOpen(true)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {paginatedContacts.length > 0 && (
                <div className="border-t">
                  <TablePagination
                    currentPage={contactsCurrentPage}
                    totalPages={contactsTotalPages}
                    pageSize={contactsPageSize}
                    onPageChange={setContactsCurrentPage}
                    onPageSizeChange={setContactsPageSize}
                    pageSizeOptions={CONTACTS_PAGE_SIZE_OPTIONS}
                    totalItems={sortedContacts.length}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[240px]">
                  <TableSearch
                    searchTerm={dealSearchTerm}
                    onSearchChange={setDealSearchTerm}
                    placeholder="Search deals..."
                  />
                </div>
                <Select value={dealStatusFilter} onValueChange={setDealStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDeals}
                  className="font-bold uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => setDealDialogOpen(true)}
                  className="font-bold uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" /> New Deal
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">#</TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Title"
                          sortKey="title"
                          currentSortKey={dealSortKey}
                          currentSortDirection={dealSortDirection}
                          onSort={handleDealSort}
                        />
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Contact</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Stage</TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Amount"
                          sortKey="amountValue"
                          currentSortKey={dealSortKey}
                          currentSortDirection={dealSortDirection}
                          onSort={handleDealSort}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableHeader
                          label="Status"
                          sortKey="status"
                          currentSortKey={dealSortKey}
                          currentSortDirection={dealSortDirection}
                          onSort={handleDealSort}
                        />
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDeals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          <Handshake className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No deals found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedDeals.map((deal, index) => (
                        <TableRow key={deal._id}>
                          <TableCell className="font-medium">{dealsStartIndex + index + 1}</TableCell>
                          <TableCell className="font-medium">{deal.title}</TableCell>
                          <TableCell>{getContactById(deal.contactId)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {getStageLabel(deal.pipelineId, deal.stageKey)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(deal.amountValue || 0)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={deal.status === "won" ? "default" : deal.status === "lost" ? "destructive" : "secondary"}
                              className={deal.status === "won" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {deal.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deal.status === "open" ? (
                              <div className="flex gap-2">
                                {getTerminalStageKey(deal.pipelineId, "won") ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onTransitionDeal(deal._id, getTerminalStageKey(deal.pipelineId, "won"))}
                                    className="text-xs"
                                  >
                                    Won
                                  </Button>
                                ) : null}
                                {getTerminalStageKey(deal.pipelineId, "lost") ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onTransitionDeal(deal._id, getTerminalStageKey(deal.pipelineId, "lost"))}
                                    className="text-xs"
                                  >
                                    Lost
                                  </Button>
                                ) : null}
                              </div>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {paginatedDeals.length > 0 && (
                <div className="border-t">
                  <TablePagination
                    currentPage={dealsCurrentPage}
                    totalPages={dealsTotalPages}
                    pageSize={dealsPageSize}
                    onPageChange={setDealsCurrentPage}
                    onPageSizeChange={setDealsPageSize}
                    pageSizeOptions={DEALS_PAGE_SIZE_OPTIONS}
                    totalItems={sortedDeals.length}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setPipelineDialogOpen(true)}
              className="font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" /> New Pipeline
            </Button>
          </div>

          {pipelines.length === 0 ? (
            <Card className="industrial-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Handshake className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No pipelines found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pipelines.map((pipeline) => (
                <Card key={pipeline._id} className="industrial-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-bold uppercase tracking-tight">{pipeline.name}</h3>
                      {pipeline.isDefault ? (
                        <Badge variant="secondary" className="text-xs">DEFAULT</Badge>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {pipeline.stages && pipeline.stages.length > 0 ? (
                        pipeline.stages
                          .sort((a, b) => a.order - b.order)
                          .map((stage, index) => (
                            <div key={stage.key} className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex flex-col items-center">
                                <Badge
                                  variant={stage.isTerminalWon ? "default" : stage.isTerminalLost ? "destructive" : "secondary"}
                                  className={`text-xs px-3 py-1 ${stage.isTerminalWon ? "bg-green-600 hover:bg-green-700" : ""}`}
                                >
                                  {stage.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground mt-1">Order: {stage.order}</span>
                              </div>
                              {index < pipeline.stages.length - 1 ? (
                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : null}
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No stages defined</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Create Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreateContact} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Display Name</Label>
              <Input
                placeholder="Display name"
                value={contactForm.displayName}
                onChange={(event) => setContactForm((prev) => ({ ...prev, displayName: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Email</Label>
              <Input
                type="email"
                placeholder="Email"
                value={contactForm.primaryEmail}
                onChange={(event) => setContactForm((prev) => ({ ...prev, primaryEmail: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Company</Label>
              <Input
                placeholder="Company"
                value={contactForm.companyName}
                onChange={(event) => setContactForm((prev) => ({ ...prev, companyName: event.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Create Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreateDeal} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Deal Title</Label>
              <Input
                placeholder="Deal title"
                value={dealForm.title}
                onChange={(event) => setDealForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Contact</Label>
              <Select
                value={dealForm.contactId}
                onValueChange={(value) => setDealForm((prev) => ({ ...prev, contactId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact._id} value={contact._id}>
                      {contact.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Pipeline</Label>
              <Select
                value={dealForm.pipelineId}
                onValueChange={(value) => {
                  const pipeline = pipelines.find((item) => item._id === value);
                  setDealForm((prev) => ({
                    ...prev,
                    pipelineId: value,
                    stageKey: pipeline?.stages?.[0]?.key ?? ""
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pipeline" />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline._id} value={pipeline._id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Stage</Label>
              <Select
                value={dealForm.stageKey}
                onValueChange={(value) => setDealForm((prev) => ({ ...prev, stageKey: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {(pipelines.find((item) => item._id === dealForm.pipelineId)?.stages ?? []).map((stage) => (
                    <SelectItem key={stage.key} value={stage.key}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Deal Amount</Label>
              <Input
                type="number"
                placeholder="Deal amount"
                value={dealForm.amountValue}
                onChange={(event) => setDealForm((prev) => ({ ...prev, amountValue: Number(event.target.value) }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDealDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Create Pipeline</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreatePipeline} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Pipeline Name</Label>
              <Input
                placeholder="Pipeline name"
                value={pipelineName}
                onChange={(event) => setPipelineName(event.target.value)}
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Default stages will be created: Qualified, Proposal, Won, Lost
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPipelineDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-bold uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editContactDialogOpen} onOpenChange={setEditContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            <p>Edit functionality coming soon</p>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setEditContactDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
