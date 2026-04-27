import { confirmEcommerceOrderPayment } from "@admin-platform/shared-sdk";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../core/auth/AuthContext";

const ECOMMERCE_PAYMENT_BANNER_STORAGE_KEY = "ecommerce_payment_banner";
const CALLBACK_PROCESSING_TTL_MS = 2 * 60 * 1000;

export function PaymentCallbackPage() {
  const { api, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Processing payment result...");
  const [isError, setIsError] = useState(false);
  const lastProcessedFingerprintRef = useRef(null);

  useEffect(() => {
    const searchFingerprint = searchParams.toString();
    if (lastProcessedFingerprintRef.current === searchFingerprint) {
      return;
    }
    lastProcessedFingerprintRef.current = searchFingerprint;

    async function processCallback() {
      if (!token) {
        const redirectTarget = `/payments/callback?${searchParams.toString()}`;
        navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, { replace: true });
        return;
      }

      function redirectToEcommerce(kind, text) {
        sessionStorage.setItem(
          ECOMMERCE_PAYMENT_BANNER_STORAGE_KEY,
          JSON.stringify({
            kind,
            text,
            createdAt: Date.now()
          })
        );
        navigate("/modules/ecommerce", { replace: true });
      }

      const callbackFingerprint = [
        searchParams.get("provider") ?? "",
        searchParams.get("orderId") ?? "",
        searchParams.get("status") ?? "",
        searchParams.get("session_id") ?? "",
        searchParams.get("token") ?? ""
      ].join("|");
      const processedKey = `payment_callback_processed:${callbackFingerprint}`;
      let processedState = null;
      let processedAt = 0;
      const rawProcessedState = sessionStorage.getItem(processedKey);
      if (rawProcessedState) {
        try {
          const parsed = JSON.parse(rawProcessedState);
          if (parsed?.state === "processing" || parsed?.state === "done") {
            processedState = parsed.state;
            processedAt = typeof parsed?.processedAt === "number" ? parsed.processedAt : 0;
          }
        } catch {
          if (rawProcessedState === "processing" || rawProcessedState === "done") {
            processedState = rawProcessedState;
          }
        }
      }

      if (processedState === "done") {
        redirectToEcommerce("info", "Payment callback was already processed.");
        return;
      }
      if (processedState === "processing") {
        if (processedAt > 0 && Date.now() - processedAt > CALLBACK_PROCESSING_TTL_MS) {
          sessionStorage.removeItem(processedKey);
        } else {
          setMessage("Payment callback is already being processed...");
          return;
        }
      }

      const provider = searchParams.get("provider");
      const orderId = searchParams.get("orderId");
      const status = searchParams.get("status");

      if (!provider || !orderId) {
        setIsError(true);
        setMessage("Missing provider or order information in payment callback URL.");
        return;
      }

      if (status === "cancel") {
        sessionStorage.setItem(processedKey, JSON.stringify({ state: "done", processedAt: Date.now() }));
        redirectToEcommerce("info", "Payment was cancelled.");
        return;
      }

      try {
        if (provider === "stripe") {
          sessionStorage.setItem(processedKey, JSON.stringify({ state: "processing", processedAt: Date.now() }));
          const checkoutSessionId = searchParams.get("session_id")?.trim() || undefined;
          const response = await confirmEcommerceOrderPayment(api, orderId, {
            provider: "stripe",
            checkoutSessionId
          });
          sessionStorage.setItem(processedKey, JSON.stringify({ state: "done", processedAt: Date.now() }));
          redirectToEcommerce("success", `Stripe payment ${response.result.status}.`);
          return;
        }

        if (provider === "paypal") {
          const providerOrderId = searchParams.get("token");
          if (!providerOrderId) {
            setIsError(true);
            setMessage("Missing PayPal token in callback URL.");
            return;
          }
          sessionStorage.setItem(processedKey, JSON.stringify({ state: "processing", processedAt: Date.now() }));
          const response = await confirmEcommerceOrderPayment(api, orderId, {
            provider: "paypal",
            providerOrderId
          });
          sessionStorage.setItem(processedKey, JSON.stringify({ state: "done", processedAt: Date.now() }));
          redirectToEcommerce("success", `PayPal payment ${response.result.status}.`);
          return;
        }

        if (provider === "razorpay") {
          sessionStorage.setItem(processedKey, JSON.stringify({ state: "done", processedAt: Date.now() }));
          redirectToEcommerce("info", "Razorpay flow completes directly in checkout popup.");
          return;
        }

        setIsError(true);
        setMessage(`Unsupported payment provider in callback URL: ${provider}`);
      } catch {
        sessionStorage.removeItem(processedKey);
        setIsError(true);
        setMessage("Could not confirm payment from callback. Redirecting to eCommerce...");
        window.setTimeout(() => {
          redirectToEcommerce("error", "Payment confirmation failed. Please verify order status.");
        }, 900);
      }
    }

    void processCallback();
  }, [api, navigate, searchParams, token]);

  return (
    <section>
      <h2>Payment Callback</h2>
      <p style={isError ? { color: "crimson" } : undefined}>{message}</p>
    </section>
  );
}
