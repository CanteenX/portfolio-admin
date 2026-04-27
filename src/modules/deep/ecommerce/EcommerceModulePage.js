import {
  confirmEcommerceOrderPayment,
  createEcommerceOrder,
  createEcommerceProduct,
  getEcommerceInsights,
  initiateEcommerceOrderPayment,
  listEcommerceOrders,
  listEcommercePaymentProviders,
  listEcommerceProducts,
  transitionEcommerceOrder
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
import { AlertCircle, Plus, ShoppingCart, Package, DollarSign, Download, Edit, Trash2 } from "lucide-react";

const ECOMMERCE_PAYMENT_BANNER_STORAGE_KEY = "ecommerce_payment_banner";

function createCallbackUrl(provider, orderId, status) {
  const url = new URL("/payments/callback", window.location.origin);
  url.searchParams.set("provider", provider);
  url.searchParams.set("orderId", orderId);
  url.searchParams.set("status", status);
  const baseUrl = url.toString();
  if (provider === "stripe" && status === "success") {
    return `${baseUrl}&session_id={CHECKOUT_SESSION_ID}`;
  }
  return baseUrl;
}

let razorpayScriptPromise = null;

async function ensureRazorpayScriptLoaded() {
  if (window.Razorpay) {
    return true;
  }
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.remove();
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

const BANNER_CLASSES = {
  success: "bg-success/10 border-success/30 text-success",
  error: "bg-destructive/10 border-destructive/20 text-destructive",
  info: "bg-info/10 border-info/30 text-info"
};

export function EcommerceModulePage() {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [insights, setInsights] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProviderByOrder, setSelectedProviderByOrder] = useState({});
  const [paymentResponses, setPaymentResponses] = useState({});
  const [confirmInputsByOrder, setConfirmInputsByOrder] = useState({});
  const [error, setError] = useState(null);
  const [paymentBanner, setPaymentBanner] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [form, setForm] = useState({
    title: "",
    sku: "",
    description: "",
    priceMinor: "",
    stock: "",
    status: "active"
  });

  // Products filtering, sorting, pagination
  const {
    filteredData: filteredProducts,
    searchTerm: productSearchTerm,
    setSearchTerm: setProductSearchTerm,
    filters: productFilters,
    setFilter: setProductFilter
  } = useTableFilter(products, {
    searchFields: ["title", "sku"],
    exactFilters: { status: "" }
  });

  const {
    sortedData: sortedProducts,
    sortKey: productSortKey,
    sortDirection: productSortDirection,
    handleSort: handleProductSort
  } = useTableSort(filteredProducts);

  const {
    paginatedData: paginatedProducts,
    currentPage: productCurrentPage,
    totalPages: productTotalPages,
    pageSize: productPageSize,
    setCurrentPage: setProductCurrentPage,
    setPageSize: setProductPageSize,
    startIndex: productStartIndex,
    PAGE_SIZE_OPTIONS: PRODUCT_PAGE_SIZE_OPTIONS
  } = usePagination(sortedProducts, 10);

  // Orders filtering, sorting, pagination
  const {
    filteredData: filteredOrders,
    searchTerm: orderSearchTerm,
    setSearchTerm: setOrderSearchTerm,
    filters: orderFilters,
    setFilter: setOrderFilter
  } = useTableFilter(orders, {
    searchFields: ["orderNumber", "customerName"],
    exactFilters: { status: "" }
  });

  const {
    sortedData: sortedOrders,
    sortKey: orderSortKey,
    sortDirection: orderSortDirection,
    handleSort: handleOrderSort
  } = useTableSort(filteredOrders);

  const {
    paginatedData: paginatedOrders,
    currentPage: orderCurrentPage,
    totalPages: orderTotalPages,
    pageSize: orderPageSize,
    setCurrentPage: setOrderCurrentPage,
    setPageSize: setOrderPageSize,
    startIndex: orderStartIndex,
    PAGE_SIZE_OPTIONS: ORDER_PAGE_SIZE_OPTIONS
  } = usePagination(sortedOrders, 10);

  async function loadAll() {
    setError(null);
    try {
      const [productsResult, ordersResult, insightsResult, providersResult] = await Promise.all([
        listEcommerceProducts(api),
        listEcommerceOrders(api),
        getEcommerceInsights(api),
        listEcommercePaymentProviders(api)
      ]);
      setProducts(productsResult);
      setOrders(ordersResult);
      setInsights(insightsResult);
      setProviders(providersResult.filter((item) => item.enabled));
    } catch {
      setError("Failed to load eCommerce data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, [api]);

  useEffect(() => {
    const rawBanner = sessionStorage.getItem(ECOMMERCE_PAYMENT_BANNER_STORAGE_KEY);
    if (!rawBanner) {
      return;
    }
    sessionStorage.removeItem(ECOMMERCE_PAYMENT_BANNER_STORAGE_KEY);

    try {
      const parsed = JSON.parse(rawBanner);
      if (!parsed?.text) {
        return;
      }
      const kind = parsed.kind === "success" || parsed.kind === "error" || parsed.kind === "info" ? parsed.kind : "info";
      setPaymentBanner({ kind, text: parsed.text });
    } catch {
      return;
    }

    const timeoutId = window.setTimeout(() => setPaymentBanner(null), 6000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  async function onCreateProduct(event) {
    event.preventDefault();
    try {
      await createEcommerceProduct(api, {
        title: form.title,
        sku: form.sku,
        description: form.description,
        priceMinor: Math.round(parseFloat(form.priceMinor) * 100),
        stock: Number(form.stock),
        status: form.status
      });
      setForm({ title: "", sku: "", description: "", priceMinor: "", stock: "", status: "active" });
      setShowProductDialog(false);
      await loadAll();
    } catch {
      setError("Failed to create product");
    }
  }

  async function onTransitionOrder(orderId, to) {
    try {
      await transitionEcommerceOrder(api, orderId, to);
      await loadAll();
    } catch {
      setError("Failed to transition order");
    }
  }

  async function onInitiatePayment(orderId) {
    try {
      const provider = selectedProviderByOrder[orderId];
      if (!provider) {
        setError("Select a payment provider first");
        return;
      }

      const idempotencyKey =
        typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const response = await initiateEcommerceOrderPayment(
        api,
        orderId,
        {
          provider,
          successUrl: createCallbackUrl(provider, orderId, "success"),
          cancelUrl: createCallbackUrl(provider, orderId, "cancel")
        },
        idempotencyKey
      );

      setPaymentResponses((prev) => ({ ...prev, [orderId]: response }));
      setConfirmInputsByOrder((prev) => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          providerOrderId: response.providerOrderId,
          razorpayOrderId: response.providerOrderId
        }
      }));

      if (provider === "razorpay" && response.mode === "razorpay_order") {
        const order = orders.find((item) => item._id === orderId);
        if (!order) {
          setError("Order context not found for Razorpay checkout");
          return;
        }
        if (!response.keyId || !response.providerOrderId) {
          setError("Razorpay session details are incomplete");
          return;
        }

        const scriptLoaded = await ensureRazorpayScriptLoaded();
        if (!scriptLoaded || !window.Razorpay) {
          setError("Could not load Razorpay checkout script");
          return;
        }

        const razorpay = new window.Razorpay({
          key: response.keyId,
          amount: order.grandTotalMinor,
          currency: order.currency,
          name: "Admin Platform",
          description: `Order ${order.orderNumber}`,
          order_id: response.providerOrderId,
          prefill: {
            name: order.customerName,
            email: order.customerEmail
          },
          handler: async (result) => {
            try {
              await confirmEcommerceOrderPayment(api, orderId, {
                provider: "razorpay",
                razorpayOrderId: response.providerOrderId,
                razorpayPaymentId: result.razorpay_payment_id,
                razorpaySignature: result.razorpay_signature
              });
              await loadAll();
            } catch {
              setError("Razorpay payment confirmation failed");
            }
          }
        });
        razorpay.open();
      } else if (response.mode === "redirect_url" && response.approvalUrl) {
        window.location.assign(response.approvalUrl);
        return;
      }

      await loadAll();
    } catch {
      setError("Failed to initiate payment");
    }
  }

  async function onConfirmPayment(orderId) {
    try {
      const provider = selectedProviderByOrder[orderId];
      if (!provider) {
        setError("Select a payment provider first");
        return;
      }

      const confirmInputs = confirmInputsByOrder[orderId] ?? {};
      if (provider === "stripe") {
        await confirmEcommerceOrderPayment(api, orderId, {
          provider: "stripe",
          providerPaymentId: paymentResponses[orderId]?.providerPaymentId
        });
      } else if (provider === "paypal") {
        if (!confirmInputs.providerOrderId) {
          setError("PayPal providerOrderId is required");
          return;
        }
        await confirmEcommerceOrderPayment(api, orderId, {
          provider: "paypal",
          providerOrderId: confirmInputs.providerOrderId
        });
      } else {
        if (!confirmInputs.razorpayOrderId || !confirmInputs.razorpayPaymentId || !confirmInputs.razorpaySignature) {
          setError("Razorpay order id, payment id, and signature are required");
          return;
        }
        await confirmEcommerceOrderPayment(api, orderId, {
          provider: "razorpay",
          razorpayOrderId: confirmInputs.razorpayOrderId,
          razorpayPaymentId: confirmInputs.razorpayPaymentId,
          razorpaySignature: confirmInputs.razorpaySignature
        });
      }

      await loadAll();
    } catch {
      setError("Failed to confirm payment");
    }
  }

  function handleExportProducts() {
    exportToExcel({
      data: sortedProducts,
      columns: [
        { header: "Title", key: "title" },
        { header: "SKU", key: "sku" },
        { header: "Price", key: "priceMinor", transform: (v) => `$${(v / 100).toFixed(2)}` },
        { header: "Stock", key: "stock" },
        { header: "Status", key: "status" }
      ],
      fileName: "ecommerce-products"
    });
  }

  function handleExportOrders() {
    exportToExcel({
      data: sortedOrders,
      columns: [
        { header: "Order Number", key: "orderNumber" },
        { header: "Customer", key: "customerName" },
        { header: "Email", key: "customerEmail" },
        { header: "Items", key: "items", transform: (v) => v?.length ?? 0 },
        { header: "Total", key: "grandTotalMinor", transform: (v) => `$${(v / 100).toFixed(2)}` },
        { header: "Status", key: "status" },
        { header: "Payment Status", key: "payment", transform: (v) => v?.status ?? "none" }
      ],
      fileName: "ecommerce-orders"
    });
  }

  function getStatusBadgeVariant(status) {
    switch (status) {
      case "paid":
      case "completed":
        return "default";
      case "shipped":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb title="eCommerce" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "eCommerce" }]} />
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </section>
    );
  }

  const activeProducts = products.filter((p) => p.status === "active").length;
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "completed" || o.status === "shipped")
    .reduce((sum, o) => sum + (o.grandTotalMinor ?? 0), 0);

  return (
    <section className="space-y-6">
      <Breadcrumb title="eCommerce" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "eCommerce" }]} />

      {paymentBanner ? (
        <div className={`flex items-center gap-2 text-sm border rounded-sm px-3 py-2 ${BANNER_CLASSES[paymentBanner.kind] ?? BANNER_CLASSES.info}`}>
          {paymentBanner.text}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={Package}
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={Package}
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={`$${(totalRevenue / 100).toFixed(2)}`}
          icon={DollarSign}
        />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <TableSearch
                value={productSearchTerm}
                onChange={setProductSearchTerm}
                placeholder="Search by title, SKU..."
              />
              <Select
                value={productFilters.status ?? ""}
                onValueChange={(value) => setProductFilter("status", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportProducts} className="uppercase tracking-wider font-bold">
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button size="sm" onClick={() => setShowProductDialog(true)} className="uppercase tracking-wider font-bold">
                <Plus className="w-4 h-4" /> New Product
              </Button>
            </div>
          </div>

          <Card className="industrial-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Title"
                        sortKey="title"
                        currentSortKey={productSortKey}
                        sortDirection={productSortDirection}
                        onSort={handleProductSort}
                      />
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Price"
                        sortKey="priceMinor"
                        currentSortKey={productSortKey}
                        sortDirection={productSortDirection}
                        onSort={handleProductSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Stock"
                        sortKey="stock"
                        currentSortKey={productSortKey}
                        sortDirection={productSortDirection}
                        onSort={handleProductSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Status"
                        sortKey="status"
                        currentSortKey={productSortKey}
                        sortDirection={productSortDirection}
                        onSort={handleProductSort}
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product, index) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{productStartIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>${(product.priceMinor / 100).toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <TablePagination
            currentPage={productCurrentPage}
            totalPages={productTotalPages}
            pageSize={productPageSize}
            onPageChange={setProductCurrentPage}
            onPageSizeChange={setProductPageSize}
            pageSizeOptions={PRODUCT_PAGE_SIZE_OPTIONS}
            totalItems={sortedProducts.length}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <TableSearch
                value={orderSearchTerm}
                onChange={setOrderSearchTerm}
                placeholder="Search by order number, customer..."
              />
              <Select
                value={orderFilters.status ?? ""}
                onValueChange={(value) => setOrderFilter("status", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportOrders} className="uppercase tracking-wider font-bold">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </div>

          <Card className="industrial-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Order #"
                        sortKey="orderNumber"
                        currentSortKey={orderSortKey}
                        sortDirection={orderSortDirection}
                        onSort={handleOrderSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Customer"
                        sortKey="customerName"
                        currentSortKey={orderSortKey}
                        sortDirection={orderSortDirection}
                        onSort={handleOrderSort}
                      />
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Total"
                        sortKey="grandTotalMinor"
                        currentSortKey={orderSortKey}
                        sortDirection={orderSortDirection}
                        onSort={handleOrderSort}
                      />
                    </TableHead>
                    <TableHead>
                      <SortableHeader
                        label="Status"
                        sortKey="status"
                        currentSortKey={orderSortKey}
                        sortDirection={orderSortDirection}
                        onSort={handleOrderSort}
                      />
                    </TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order, index) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{orderStartIndex + index + 1}</TableCell>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.items?.length ?? 0}</TableCell>
                        <TableCell>${(order.grandTotalMinor / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {order.payment?.status ?? "none"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {order.status === "open" ? (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => onTransitionOrder(order._id, "paid")}>
                                  Mark Paid
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onTransitionOrder(order._id, "cancelled")}>
                                  Cancel
                                </Button>
                              </>
                            ) : null}
                            {order.status === "paid" ? (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => onTransitionOrder(order._id, "shipped")}>
                                  Ship
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onTransitionOrder(order._id, "refunded")}>
                                  Refund
                                </Button>
                              </>
                            ) : null}
                            {order.status === "shipped" ? (
                              <Button variant="ghost" size="sm" onClick={() => onTransitionOrder(order._id, "completed")}>
                                Complete
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <TablePagination
            currentPage={orderCurrentPage}
            totalPages={orderTotalPages}
            pageSize={orderPageSize}
            onPageChange={setOrderCurrentPage}
            onPageSizeChange={setOrderPageSize}
            pageSizeOptions={ORDER_PAGE_SIZE_OPTIONS}
            totalItems={sortedOrders.length}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider font-bold">Create Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={onCreateProduct} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Title</Label>
              <Input
                placeholder="Product title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">SKU</Label>
              <Input
                placeholder="Product SKU"
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description</Label>
              <Input
                placeholder="Product description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.priceMinor}
                  onChange={(event) => setForm((prev) => ({ ...prev, priceMinor: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Stock</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="uppercase tracking-wider font-bold">
                Create Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
