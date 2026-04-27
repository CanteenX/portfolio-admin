import type { EcommerceOrder, EcommerceProduct } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export type EcommercePaymentProvider = "stripe" | "paypal" | "razorpay";

export type EcommerceInitiatePaymentResponse = {
  provider: EcommercePaymentProvider;
  mode: "client_secret" | "redirect_url" | "razorpay_order";
  providerOrderId?: string;
  providerPaymentId?: string;
  clientSecret?: string;
  approvalUrl?: string;
  keyId?: string;
  expiresAt?: string;
  metadata?: Record<string, string>;
};

export async function listEcommerceProducts(api: AxiosInstance): Promise<EcommerceProduct[]> {
  const response = await api.get<{ items: EcommerceProduct[] }>("/api/v1/ecommerce/products");
  return response.data.items;
}

export async function createEcommerceProduct(
  api: AxiosInstance,
  payload: {
    title: string;
    sku: string;
    description?: string;
    priceMinor: number;
    currency?: string;
    stock?: number;
    status?: "draft" | "active" | "archived";
  }
): Promise<EcommerceProduct> {
  const response = await api.post<EcommerceProduct>("/api/v1/ecommerce/products", payload);
  return response.data;
}

export async function deleteEcommerceProduct(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/ecommerce/products/${id}`);
}

export async function listEcommerceOrders(api: AxiosInstance): Promise<EcommerceOrder[]> {
  const response = await api.get<{ items: EcommerceOrder[] }>("/api/v1/ecommerce/orders");
  return response.data.items;
}

export async function createEcommerceOrder(
  api: AxiosInstance,
  payload: {
    customerName: string;
    customerEmail: string;
    currency?: string;
    items: Array<{ productId: string; qty: number }>;
    taxMinor?: number;
    shippingMinor?: number;
  }
): Promise<EcommerceOrder> {
  const response = await api.post<EcommerceOrder>("/api/v1/ecommerce/orders", payload);
  return response.data;
}

export async function transitionEcommerceOrder(
  api: AxiosInstance,
  id: string,
  to: "open" | "paid" | "shipped" | "completed" | "cancelled" | "refunded"
): Promise<EcommerceOrder> {
  const response = await api.post<EcommerceOrder>(`/api/v1/ecommerce/orders/${id}/transition`, { to });
  return response.data;
}

export async function getEcommerceInsights(api: AxiosInstance): Promise<{
  counts: { products: number; orders: number; paidOrders: number };
}> {
  const response = await api.get<{ counts: { products: number; orders: number; paidOrders: number } }>(
    "/api/v1/ecommerce/insights"
  );
  return response.data;
}

export async function listEcommercePaymentProviders(api: AxiosInstance): Promise<
  Array<{ id: EcommercePaymentProvider; enabled: boolean; displayName: string }>
> {
  const response = await api.get<{
    providers: Array<{ id: EcommercePaymentProvider; enabled: boolean; displayName: string }>;
  }>("/api/v1/ecommerce/payments/providers");
  return response.data.providers;
}

export async function initiateEcommerceOrderPayment(
  api: AxiosInstance,
  orderId: string,
  payload: {
    provider: EcommercePaymentProvider;
    successUrl?: string;
    cancelUrl?: string;
  },
  idempotencyKey: string
): Promise<EcommerceInitiatePaymentResponse> {
  const response = await api.post<EcommerceInitiatePaymentResponse>(
    `/api/v1/ecommerce/orders/${orderId}/payments/initiate`,
    payload,
    {
      headers: {
        "Idempotency-Key": idempotencyKey
      }
    }
  );
  return response.data;
}

export async function confirmEcommerceOrderPayment(
  api: AxiosInstance,
  orderId: string,
  payload:
    | {
        provider: "stripe";
        providerPaymentId?: string;
        checkoutSessionId?: string;
      }
    | {
        provider: "paypal";
        providerOrderId: string;
      }
    | {
        provider: "razorpay";
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      }
): Promise<{
  result: {
    provider: EcommercePaymentProvider;
    status: "succeeded" | "pending_capture" | "failed" | "refunded";
    providerOrderId?: string;
    providerPaymentId?: string;
    message?: string;
  };
  order: EcommerceOrder;
}> {
  const response = await api.post<{
    result: {
      provider: EcommercePaymentProvider;
      status: "succeeded" | "pending_capture" | "failed" | "refunded";
      providerOrderId?: string;
      providerPaymentId?: string;
      message?: string;
    };
    order: EcommerceOrder;
  }>(`/api/v1/ecommerce/orders/${orderId}/payments/confirm`, payload);
  return response.data;
}
