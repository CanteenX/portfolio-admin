import {
  createInvoiceDocument,
  getInvoiceInsights,
  listInvoiceDocuments,
  transitionInvoiceDocument
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { AlertCircle, FileText, Plus } from "lucide-react";

export function InvoicesModulePage() {
  const { api } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    description: "",
    quantity: 1,
    unitPriceMinor: 0,
    taxMinor: 0,
    discountMinor: 0
  });
  const [amountUpdates, setAmountUpdates] = useState({});

  async function loadAll() {
    setError(null);
    try {
      const [documentsResult, insightsResult] = await Promise.all([
        listInvoiceDocuments(api),
        getInvoiceInsights(api)
      ]);
      setDocuments(documentsResult);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load invoices data");
    }
  }

  useEffect(() => {
    void loadAll();
  }, [api]);

  async function onCreateInvoice(event) {
    event.preventDefault();
    try {
      await createInvoiceDocument(api, {
        lineItems: [
          {
            description: form.description,
            quantity: Number(form.quantity),
            unitPriceMinor: Number(form.unitPriceMinor)
          }
        ],
        taxMinor: Number(form.taxMinor),
        discountMinor: Number(form.discountMinor)
      });
      setForm({ description: "", quantity: 1, unitPriceMinor: 0, taxMinor: 0, discountMinor: 0 });
      await loadAll();
    } catch {
      setError("Failed to create invoice");
    }
  }

  async function onTransition(invoiceId, to) {
    try {
      const amountPaidMinor = amountUpdates[invoiceId];
      await transitionInvoiceDocument(api, invoiceId, {
        to,
        amountPaidMinor: Number.isFinite(amountPaidMinor) ? amountPaidMinor : undefined
      });
      await loadAll();
    } catch {
      setError("Failed to transition invoice");
    }
  }

  return (
    <section className="space-y-6">
      <Breadcrumb title="Invoices" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Invoices" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Draft</span>
              <span className="ml-2 font-bold">{insights.counts.draft}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Sent</span>
              <span className="ml-2 font-bold">{insights.counts.sent}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Paid</span>
              <span className="ml-2 font-bold">{insights.counts.paid}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Overdue</span>
              <span className="ml-2 font-bold">{insights.counts.overdue}</span>
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
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Invoice (single-line quick form)</h3>
          <form onSubmit={onCreateInvoice} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Line Description</Label>
              <Input
                placeholder="Line description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={(event) => setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Unit Price (minor)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Unit price (minor)"
                  value={form.unitPriceMinor}
                  onChange={(event) => setForm((prev) => ({ ...prev, unitPriceMinor: Number(event.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Tax (minor)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Tax (minor)"
                  value={form.taxMinor}
                  onChange={(event) => setForm((prev) => ({ ...prev, taxMinor: Number(event.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Discount (minor)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Discount (minor)"
                  value={form.discountMinor}
                  onChange={(event) => setForm((prev) => ({ ...prev, discountMinor: Number(event.target.value) }))}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Invoice
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold uppercase tracking-tight">Invoice Documents</h3>
        {documents.length === 0 ? (
          <Card className="industrial-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No invoices found</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((document) => (
            <Card key={document._id} className="industrial-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{document.invoiceNumber}</span>
                  <Badge variant="secondary" className="text-xs">{document.status}</Badge>
                  <span className="text-sm text-muted-foreground">total {document.grandTotalMinor}</span>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                  <div className="space-y-1">
                    <Label className="uppercase tracking-wider text-xs font-bold">Amount Paid (minor)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="amount paid (minor)"
                      className="w-48"
                      value={amountUpdates[document._id] ?? document.amountPaidMinor}
                      onChange={(event) =>
                        setAmountUpdates((prev) => ({ ...prev, [document._id]: Number(event.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {document.status === "draft" ? (
                    <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "issued")}>
                      Issue
                    </Button>
                  ) : null}
                  {document.status === "issued" ? (
                    <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "sent")}>
                      Mark Sent
                    </Button>
                  ) : null}
                  {document.status === "sent" || document.status === "overdue" ? (
                    <>
                      <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "partially_paid")}>
                        Partial
                      </Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "paid")}>
                        Mark Paid
                      </Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "overdue")}>
                        Mark Overdue
                      </Button>
                    </>
                  ) : null}
                  {document.status === "partially_paid" ? (
                    <>
                      <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "paid")}>
                        Mark Paid
                      </Button>
                      <Button variant="outline" size="sm" type="button" onClick={() => onTransition(document._id, "overdue")}>
                        Mark Overdue
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
