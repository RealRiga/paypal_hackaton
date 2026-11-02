"use client";

import React, { useState } from "react";
import {
  FileText,
  CreditCard,
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  ExternalLink,
  Copy,
  Check,
  GitPullRequest,
  Download,
  Calculator,
  Loader2,
  Lock,
} from "lucide-react";
import PayPalButtonWrapper from "./PayPalButtonWrapper";
import { CommercialQuote, TransactionRecord, QuoteItem, Milestone } from "@/types";

interface CommerceCanvasProps {
  quote: CommercialQuote;
  transactions: TransactionRecord[];
  onUpdateQuote?: (quote: CommercialQuote) => void;
  onPaymentComplete: (tx: TransactionRecord) => void;
}

interface InvoiceResult {
  invoiceNumber?: string;
  invoiceId?: string;
  status?: string;
}

export default function CommerceCanvas({
  quote,
  transactions,
  onUpdateQuote,
  onPaymentComplete,
}: CommerceCanvasProps) {
  const [activeTab, setActiveTab] = useState<"agreement" | "terminal" | "ledger">("agreement");
  const [settlementMode, setSettlementMode] = useState<"deposit" | "full">("deposit");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
  const [clientEmail, setClientEmail] = useState("buyer-demo@sandbox.paypal.com");
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [verifyingIdx, setVerifyingIdx] = useState<number | null>(null);
  const [proofInputIdx, setProofInputIdx] = useState<number | null>(null);
  const [proofUrlInput, setProofUrlInput] = useState("https://github.com/RealRiga/paypal_hackaton/pull/1");

  const fallbackQuote: CommercialQuote = {
    title: "Enterprise AI Audit & Security Architecture",
    description: "Itemized scope and payment terms negotiated via PayAgent.",
    basePrice: 950,
    discountRate: 0.15,
    depositRate: 0.4,
    totalAmount: 807.5,
    currency: "USD",
    items: [
      {
        name: "Discovery, Technical Spec & API Schema",
        quantity: "1",
        price: 484.5,
        description: "Core architecture, schema definition, and endpoint design.",
      },
      {
        name: "Implementation, PayPal SDK Integration & Testing",
        quantity: "1",
        price: 323.0,
        description: "Full implementation with unit tests, CI validation, and staging deployment.",
      },
    ],
    milestones: [
      { name: "Milestone 1: Architecture Sign-off", percentage: 40, amount: 323.0, status: "pending" },
      { name: "Milestone 2: Production Delivery & Verification", percentage: 60, amount: 484.5, status: "pending" },
    ],
    terms: "Governed by PayPal Sandbox Buyer & Seller protection. Funds released upon milestone completion.",
  };

  const current: CommercialQuote = quote || fallbackQuote;

  // Pricing telemetry math: Total = P(1 - d), Deposit = r * P(1 - d)
  const depositMilestone = current.milestones?.[0];
  const depositPct = depositMilestone?.percentage ?? Math.round((current.depositRate ?? 0.4) * 100);
  const depositAmount =
    depositMilestone?.amount ?? Number((current.totalAmount * (depositPct / 100)).toFixed(2));
  const remainingAmount = Number((current.totalAmount - depositAmount).toFixed(2));
  const discountRate = current.discountRate ?? 0.15;
  const basePrice =
    current.basePrice ?? Number((current.totalAmount / (1 - discountRate)).toFixed(2));
  const savingsAmount = Math.max(0, Number((basePrice - current.totalAmount).toFixed(2)));

  const terminalAmount = settlementMode === "deposit" ? depositAmount : current.totalAmount;

  const handleGenerateInvoice = async () => {
    setInvoiceLoading(true);
    setInvoiceResult(null);
    try {
      const res = await fetch("/api/paypal/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: clientEmail,
          recipientName: "Enterprise Client",
          items: current.items.map((it: QuoteItem) => ({
            name: it.name,
            quantity: String(it.quantity || "1"),
            unit_amount: {
              currency_code: current.currency || "USD",
              value: Number(it.price).toFixed(2),
            },
          })),
          currency: current.currency || "USD",
          note: `PayAgent Commercial Agreement: ${current.title}`,
          terms: current.terms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      setInvoiceResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create invoice";
      alert(`Invoice Creation: ${msg}`);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleVerifyMilestone = (idx: number) => {
    setVerifyingIdx(idx);
    setTimeout(() => {
      const nowStr = new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());

      const updated: CommercialQuote = {
        ...current,
        milestones: current.milestones.map((m, i) =>
          i === idx
            ? {
                ...m,
                status: "released" as const,
                proofUrl: proofUrlInput,
                verifiedAt: nowStr,
              }
            : m
        ),
      };
      onUpdateQuote?.(updated);
      setVerifyingIdx(null);
      setProofInputIdx(null);
    }, 900);
  };

  const handleExportContract = () => {
    const content = [
      `============================================================`,
      `PAYAGENT AUTONOMOUS COMMERCIAL AGREEMENT & ESCROW SCHEDULE`,
      `============================================================`,
      `Contract Title: ${current.title}`,
      `Description:    ${current.description}`,
      `Generated At:   ${new Date().toISOString()}`,
      ``,
      `--- PRICING FORMULA TELEMETRY ---`,
      `Base Price (P):       $${basePrice.toFixed(2)} ${current.currency}`,
      `Discount Rate (d):    ${Math.round(discountRate * 100)}% (-$${savingsAmount.toFixed(2)})`,
      `Net Total P(1 - d):   $${current.totalAmount.toFixed(2)} ${current.currency}`,
      `Upfront Deposit (r):  ${depositPct}% ($${depositAmount.toFixed(2)} ${current.currency})`,
      `Remaining Escrow:     ${100 - depositPct}% ($${remainingAmount.toFixed(2)} ${current.currency})`,
      ``,
      `--- ITEMIZED DELIVERABLES ---`,
      ...current.items.map(
        (it, i) => `${i + 1}. ${it.name} (Qty: ${it.quantity}) — $${Number(it.price).toFixed(2)} ${current.currency}`
      ),
      ``,
      `--- SMART MILESTONE RELEASES ---`,
      ...current.milestones.map(
        (ms, i) =>
          `${i + 1}. ${ms.name} [${ms.percentage}%] — $${Number(ms.amount).toFixed(2)} (${ms.status.toUpperCase()})${
            ms.proofUrl ? ` | Verified Proof: ${ms.proofUrl}` : ""
          }`
      ),
      ``,
      `--- GOVERNING TERMS ---`,
      current.terms,
      `============================================================`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PayAgent-Contract-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReceipt = (tx: TransactionRecord) => {
    const receipt = {
      protocol: "PayAgent Autonomous Commerce Ledger v2",
      paypalNetwork: "Sandbox REST API v2",
      contractTitle: current.title,
      orderId: tx.orderId,
      captureId: tx.captureId,
      settlementType: tx.settlementType || "full",
      amount: tx.amount,
      currency: tx.currency || "USD",
      status: tx.status || "COMPLETED",
      payerName: tx.payerName || "Sandbox Buyer",
      payerEmail: tx.payerEmail || "verified@sandbox.paypal.com",
      timestamp: tx.timestamp,
      cryptographicSha256: tx.sha256Hash || "verified-paypal-capture",
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PayPal-Verified-Receipt-${tx.captureId || tx.orderId || Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#07090E] transition-colors">
      {/* Top Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#0B101D] px-4 pt-2 flex items-center justify-between transition-colors">
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab("agreement")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "agreement"
                ? "bg-white text-[#0070BA] border-t-2 border-[#0070BA] font-semibold shadow-xs dark:bg-[#07090E] dark:text-[#38BDF8]"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Commercial Agreement</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "terminal"
                ? "bg-white text-[#0070BA] border-t-2 border-[#0070BA] font-semibold shadow-xs dark:bg-[#07090E] dark:text-[#38BDF8]"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PayPal Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer relative ${
              activeTab === "ledger"
                ? "bg-white text-[#0070BA] border-t-2 border-[#0070BA] font-semibold shadow-xs dark:bg-[#07090E] dark:text-[#38BDF8]"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Verified Ledger</span>
            {transactions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold">
                {transactions.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportContract}
            title="Download signed commercial contract"
            className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#111A2E] dark:hover:bg-[#1E293B] dark:text-slate-300 dark:border-[#1E293B] transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-[#0070BA] dark:text-[#38BDF8]" />
            <span>Export Contract</span>
          </button>
          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono hidden md:block">
            Total: <span className="text-emerald-600 dark:text-emerald-400 font-bold">${current.totalAmount?.toFixed(2)}</span> {current.currency}
          </div>
        </div>
      </div>

      {/* Tab 1: Agreement Canvas */}
      {activeTab === "agreement" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30 dark:bg-transparent">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-blue-50/60 via-white to-slate-50 border border-slate-200 shadow-sm relative overflow-hidden dark:from-[#0F172A] dark:via-[#0B101D] dark:to-[#07090E] dark:border-[#1E293B] dark:shadow-xl transition-colors space-y-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0070BA]/5 dark:bg-[#0070BA]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#0070BA]/10 text-[#0070BA] border border-[#0070BA]/20 dark:bg-[#0070BA]/20 dark:text-[#38BDF8] dark:border-[#0070BA]/30">
                    Live Dynamic Contract
                  </span>
                  {savingsAmount > 0 && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      Saved ${savingsAmount.toFixed(2)} ({Math.round(discountRate * 100)}% off)
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                  {current.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Settlement</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center justify-end">
                  <span className="text-[#0070BA] dark:text-[#38BDF8] mr-1">$</span>
                  {current.totalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Deposit Today: ${depositAmount.toFixed(2)} ({depositPct}%)
                </span>
              </div>
            </div>

            {/* Live Pricing Formula Telemetry Bar */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white/80 dark:bg-[#07090E]/80 border border-slate-200/70 dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Calculator className="w-3 h-3 text-[#0070BA] dark:text-[#38BDF8]" />
                  <span>Base (P):</span>
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  ${basePrice.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 dark:bg-[#07090E]/80 border border-slate-200/70 dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Discount (d):</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {Math.round(discountRate * 100)}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 dark:bg-[#07090E]/80 border border-slate-200/70 dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total P(1-d):</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  ${current.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 dark:bg-[#07090E]/80 border border-slate-200/70 dark:border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deposit (r={depositPct}%):</span>
                <span className="font-mono font-semibold text-[#0070BA] dark:text-[#38BDF8]">
                  ${depositAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] overflow-hidden shadow-xs transition-colors">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0E1526]/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8]" />
                <span>Deliverables & Pricing Breakdown</span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {current.items?.length || 0} line items
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#1E293B]">
              {current.items?.map((item: QuoteItem, idx: number) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/70 dark:hover:bg-[#0F172A]/40 transition-colors"
                >
                  <div className="space-y-0.5 pr-4">
                    <div className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    )}
                  </div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    ${Number(item.price).toFixed(2)} USD
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Escrow Breakdown with Proof-of-Work Verifier */}
          {current.milestones && current.milestones.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Smart Milestone Releases & Deliverable Proof</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Conditional Escrow Protocol</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {current.milestones.map((ms: Milestone, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      ms.status === "released"
                        ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                        : "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#1E293B]"
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">{ms.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ms.status === "released"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        }`}
                      >
                        {ms.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{ms.percentage}% of contract</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ${Number(ms.amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Proof-of-Work / GitHub PR Verification Controls */}
                    {ms.status === "released" ? (
                      <div className="pt-1 border-t border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                        <span className="flex items-center space-x-1 truncate">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ms.proofUrl ? "PR Verified" : "Escrow Released"}</span>
                        </span>
                        <span>{ms.verifiedAt || "Verified"}</span>
                      </div>
                    ) : proofInputIdx === idx ? (
                      <div className="pt-1.5 space-y-1.5">
                        <input
                          type="url"
                          value={proofUrlInput}
                          onChange={(e) => setProofUrlInput(e.target.value)}
                          placeholder="GitHub PR or Deliverable URL..."
                          className="w-full px-2.5 py-1 text-[11px] rounded-md bg-white dark:bg-[#07090E] border border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 font-mono"
                        />
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyMilestone(idx)}
                            disabled={verifyingIdx === idx}
                            className="flex-1 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            {verifyingIdx === idx ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Verifying PR...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verify & Release</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProofInputIdx(null)}
                            className="py-1 px-2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setProofInputIdx(idx)}
                          className="text-[11px] font-medium text-[#0070BA] dark:text-[#38BDF8] hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <GitPullRequest className="w-3 h-3" />
                          <span>Verify Deliverable (GitHub PR)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Direct Checkout & Invoicing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Instant PayPal Settlement Button */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0B101D] border border-[#0070BA]/30 dark:border-[#0070BA]/40 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs font-semibold">
                  <CreditCard className="w-4 h-4 text-[#0070BA] dark:text-[#38BDF8]" />
                  <span>Instant PayPal Smart Checkout</span>
                </div>
                <span className="text-[10px] font-mono text-[#0070BA] dark:text-[#38BDF8] bg-[#0070BA]/10 px-2 py-0.5 rounded">
                  Deposit or Full
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Settle the <strong>${depositAmount.toFixed(2)} upfront deposit</strong> or full{" "}
                <strong>${current.totalAmount.toFixed(2)}</strong> via PayPal Sandbox.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSettlementMode("deposit");
                    setActiveTab("terminal");
                  }}
                  className="py-2 px-3 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>Pay Deposit (${depositAmount.toFixed(2)})</span>
                </button>
                <button
                  onClick={() => {
                    setSettlementMode("full");
                    setActiveTab("terminal");
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#111A2E] dark:hover:bg-[#1E293B] dark:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-slate-200 dark:border-[#1E293B]"
                >
                  <span>Pay Full (${current.totalAmount.toFixed(2)})</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Official PayPal Invoicing */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-xs transition-colors">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs font-semibold">
                <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Create Official PayPal Invoice</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client email address..."
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0070BA] focus:bg-white rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:bg-[#111A2E] dark:border-[#1E293B] dark:focus:border-[#0070BA] dark:text-white"
                />
                <button
                  onClick={handleGenerateInvoice}
                  disabled={invoiceLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
                >
                  {invoiceLoading ? "Sending..." : "Create"}
                </button>
              </div>

              {invoiceResult && (
                <div className="text-[11px] p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300">
                  Created Invoice: <span className="font-mono font-bold">{invoiceResult.invoiceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PayPal Terminal */}
      {activeTab === "terminal" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-50/40 dark:bg-transparent">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] shadow-xl space-y-5 transition-colors">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0070BA]/10 border border-[#0070BA]/20 text-[#0070BA] dark:bg-[#0070BA]/20 dark:border-[#0070BA]/40 dark:text-[#38BDF8] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">PayPal Smart Settlement Terminal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Settling: <strong className="text-slate-900 dark:text-white">{current.title}</strong>
              </p>
            </div>

            {/* Deposit vs Full Contract Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Select Payment Tranche
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#07090E] border border-slate-200 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setSettlementMode("deposit")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    settlementMode === "deposit"
                      ? "bg-white dark:bg-[#111A2E] border border-[#0070BA] shadow-xs"
                      : "hover:bg-white/50 dark:hover:bg-[#111A2E]/50"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#0070BA] dark:text-[#38BDF8]">
                    Milestone 1 ({depositPct}%)
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    ${depositAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Upfront Deposit</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementMode("full")}
                  className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    settlementMode === "full"
                      ? "bg-white dark:bg-[#111A2E] border border-[#0070BA] shadow-xs"
                      : "hover:bg-white/50 dark:hover:bg-[#111A2E]/50"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    Full Contract (100%)
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    ${current.totalAmount?.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Complete Settlement</div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-[#07090E] dark:border-[#1E293B] flex items-center justify-between text-xs transition-colors">
              <span className="text-slate-600 dark:text-slate-400">
                {settlementMode === "deposit"
                  ? `Upfront Deposit (${depositPct}% of $${current.totalAmount.toFixed(2)})`
                  : "Authorized Full Contract Amount"}
              </span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${terminalAmount.toFixed(2)} {current.currency}
              </span>
            </div>

            {/* The Live PayPal Button */}
            <PayPalButtonWrapper
              amount={terminalAmount}
              currency={current.currency || "USD"}
              settlementType={settlementMode}
              description={`${current.title} (${
                settlementMode === "deposit" ? `${depositPct}% Milestone Deposit` : "Full Settlement"
              })`}
              items={settlementMode === "full" ? current.items : undefined}
              onSuccess={(tx) => {
                onPaymentComplete(tx);
                setActiveTab("ledger");
              }}
            />

            <div className="text-center text-[11px] text-slate-500 space-y-1">
              <p>Connected to PayPal Sandbox REST API v2</p>
              <p>Buyer & Seller Protection enabled automatically</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Verified Ledger */}
      {activeTab === "ledger" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-transparent">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Autonomous Settlement Audit Ledger</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cryptographically verifiable proof of payment records logged by PayAgent.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full dark:border-emerald-500/30">
              {transactions.length} Verified
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] space-y-2 shadow-xs transition-colors">
              <History className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-1" />
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300">No settlements executed yet</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Complete a test transaction using the PayPal Smart Buttons in the agreement or terminal to view verified ledger receipts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#0B101D] border border-emerald-500/30 space-y-3 hover:border-emerald-500/60 shadow-xs transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {tx.captureId || tx.orderId}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#0070BA]/10 text-[#0070BA] dark:text-[#38BDF8]">
                        {tx.settlementType === "deposit" ? "Milestone Deposit" : "Full Settlement"}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      +${Number(tx.amount || 0).toFixed(2)} {tx.currency || "USD"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-slate-50 dark:bg-[#07090E] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B] font-mono transition-colors">
                    <div>
                      <span className="text-slate-500 block">Status:</span>
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">{tx.status || "COMPLETED"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payer:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{tx.payerName || "Sandbox Buyer"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Time:</span>
                      <span className="text-slate-700 dark:text-slate-300">{tx.timestamp || "Just now"}</span>
                    </div>
                  </div>

                  {tx.sha256Hash && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-[#07090E] border border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1.5 truncate">
                        <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">SHA-256 Proof: {tx.sha256Hash}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Protocol: PayPal v2 Orders Capture</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleExportReceipt(tx)}
                        className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Receipt (.json)</span>
                      </button>
                      <button
                        onClick={() => copyId(tx.captureId || tx.orderId || "")}
                        className="flex items-center space-x-1 text-[#0070BA] dark:text-[#38BDF8] hover:underline cursor-pointer"
                      >
                        {copiedTx === (tx.captureId || tx.orderId) ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy Capture ID</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
