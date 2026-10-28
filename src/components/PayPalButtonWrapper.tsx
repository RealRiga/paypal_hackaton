"use client";

import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface PayPalButtonWrapperProps {
  amount: number;
  currency?: string;
  description?: string;
  items?: Array<{ name: string; quantity: string; price: number; description?: string }>;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

export default function PayPalButtonWrapper({
  amount,
  currency = "USD",
  description = "PayAgent Commercial Settlement",
  items,
  onSuccess,
  onError,
}: PayPalButtonWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fireCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0070BA", "#38BDF8", "#10B981", "#F59E0B"],
      });
    } catch (e) {
      // safe fallback if confetti unavailable
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          description,
          items: items?.map((it) => ({
            name: it.name,
            quantity: it.quantity || "1",
            unit_amount: {
              currency_code: currency,
              value: Number(it.price).toFixed(2),
            },
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || "Failed to initialize PayPal order");
      }
      return data.orderId;
    } catch (err: any) {
      console.error("PayPal create order failed:", err);
      setErrorMessage(err.message || "Failed to initiate payment");
      setLoading(false);
      onError?.(err);
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
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

      setLoading(false);
      setSuccessData(captureResult);
      fireCelebration();
      onSuccess?.(captureResult);
    } catch (err: any) {
      console.error("PayPal capture failed:", err);
      setErrorMessage(err.message || "Payment capture failed");
      setLoading(false);
      onError?.(err);
    }
  };

  if (!clientId) {
    return (
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>PayPal Client ID missing. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env.local</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {successData ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center animate-in zoom-in-95">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Payment Successfully Captured!</h4>
          <p className="text-xs text-[#94A3B8] mb-2">
            Capture ID: <span className="font-mono text-emerald-300">{successData.captureId || successData.orderId}</span>
          </p>
          <div className="text-[11px] text-slate-400 bg-[#07090E] p-2 rounded-lg border border-[#1E293B]">
            Payer: {successData.payerName || "Sandbox Customer"} ({successData.payerEmail || "Verified"})
          </div>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-[#0B101D]/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center rounded-xl">
              <Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin mb-2" />
              <span className="text-xs text-[#E2E8F0]">Processing with PayPal Sandbox...</span>
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
            <div className="mt-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
