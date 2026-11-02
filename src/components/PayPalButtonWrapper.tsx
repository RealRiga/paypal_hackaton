"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TransactionRecord, QuoteItem } from "@/types";

interface PayPalButtonWrapperProps {
  amount: number;
  currency?: string;
  description?: string;
  items?: QuoteItem[];
  settlementType?: "deposit" | "full";
  onSuccess?: (details: TransactionRecord) => void;
  onError?: (error: unknown) => void;
}

async function computeSha256Hex(input: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return `sha256-${Date.now().toString(16)}`;
}

export default function PayPalButtonWrapper({
  amount,
  currency = "USD",
  description = "PayAgent Commercial Settlement",
  items,
  settlementType = "full",
  onSuccess,
  onError,
}: PayPalButtonWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<TransactionRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0070BA", "#38BDF8", "#10B981", "#F59E0B"],
      });
    } catch {
      // safe fallback if confetti unavailable
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const itemsSum =
        items?.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity || 1), 0) ?? 0;
      const matchesTotal = Math.abs(itemsSum - amount) < 0.02;

      const normalizedItems =
        items && items.length > 0 && matchesTotal
          ? items.map((it) => ({
              name: it.name,
              quantity: String(it.quantity || "1"),
              unit_amount: {
                currency_code: currency,
                value: Number(it.price).toFixed(2),
              },
            }))
          : [
              {
                name: description,
                quantity: "1",
                unit_amount: {
                  currency_code: currency,
                  value: Number(amount).toFixed(2),
                },
              },
            ];

      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          description,
          items: normalizedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || "Failed to initialize PayPal order");
      }
      return data.orderId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate payment";
      console.error("PayPal create order failed:", err);
      setErrorMessage(msg);
      setLoading(false);
      onError?.(err);
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: data.orderID }),
      });

      const captureResult = await res.json();
      if (!res.ok || !captureResult.success) {
        throw new Error(captureResult.error || "Capture execution failed");
      }

      const timestamp = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      }).format(new Date());

      const hash = await computeSha256Hex(
        `${captureResult.captureId || captureResult.orderId}|${amount}|${currency}|${timestamp}`
      );

      const enrichedResult: TransactionRecord = {
        ...captureResult,
        amount: Number(captureResult.amount || amount),
        currency: captureResult.currency || currency,
        timestamp,
        settlementType,
        sha256Hash: hash,
      };

      setLoading(false);
      setSuccessData(enrichedResult);
      fireCelebration();
      onSuccess?.(enrichedResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment capture failed";
      console.error("PayPal capture failed:", err);
      setErrorMessage(msg);
      setLoading(false);
      onError?.(err);
    }
  };

  if (!clientId) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs flex items-center space-x-2 transition-colors">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>PayPal Client ID missing. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {successData ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-center animate-in zoom-in-95 transition-colors">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Payment Successfully Captured!</h4>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8] mb-2">
            Capture ID:{" "}
            <span className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">
              {successData.captureId || successData.orderId}
            </span>
          </p>
          <div className="text-[11px] text-slate-700 dark:text-slate-400 bg-white dark:bg-[#07090E] p-2 rounded-lg border border-slate-200 dark:border-[#1E293B] transition-colors">
            Payer: {successData.payerName || "Sandbox Customer"} ({successData.payerEmail || "Verified"})
          </div>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-[#0B101D]/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center rounded-xl transition-colors">
              <Loader2 className="w-6 h-6 text-[#0070BA] dark:text-[#38BDF8] animate-spin mb-2" />
              <span className="text-xs text-slate-800 dark:text-[#E2E8F0]">Processing with PayPal Sandbox...</span>
            </div>
          )}

          <PayPalScriptProvider
            options={{
              clientId,
              currency: currency,
              intent: "capture",
              components: "buttons",
            }}
          >
            <PayPalButtons
              forceReRender={[amount, currency, description, settlementType]}
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "paypal",
                height: 44,
              }}
              createOrder={handleCreateOrder}
              onApprove={handleApprove}
              onError={(err) => {
                console.error("PayPal Button error event:", err);
                setErrorMessage("An error occurred during payment execution.");
                setLoading(false);
              }}
              onCancel={() => {
                setLoading(false);
              }}
            />
          </PayPalScriptProvider>

          {errorMessage && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300 text-xs flex items-center space-x-2 transition-colors">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
