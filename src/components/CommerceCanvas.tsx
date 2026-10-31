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
} from "lucide-react";
import PayPalButtonWrapper from "./PayPalButtonWrapper";
import { CommercialQuote, TransactionRecord, QuoteItem, Milestone } from "@/types";

interface CommerceCanvasProps {
  quote: CommercialQuote;
  transactions: TransactionRecord[];
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
  onPaymentComplete,
}: CommerceCanvasProps) {
  const [activeTab, setActiveTab] = useState<"agreement" | "terminal" | "ledger">("agreement");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult | null>(null);
  const [clientEmail, setClientEmail] = useState("buyer-demo@sandbox.paypal.com");
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const fallbackQuote: CommercialQuote = {
    title: "AI Agent & Infrastructure Architecture Sprint",
    description: "Itemized scope and payment terms negotiated via PayAgent.",
    totalAmount: 1400,
    currency: "USD",
    items: [
      {
        name: "Discovery, Technical Spec & API Schema",
        quantity: "1",
        price: 560,
        description: "Core architecture, schema definition, and endpoint design.",
      },
      {
        name: "Implementation, PayPal SDK Integration & Testing",
        quantity: "1",
        price: 840,
        description: "Full implementation with unit tests, CI validation, and staging deployment.",
      },
    ],
    milestones: [
      { name: "Milestone 1: Architecture Sign-off", percentage: 50, amount: 700, status: "pending" },
      { name: "Milestone 2: Production Delivery & Verification", percentage: 50, amount: 700, status: "pending" },
    ],
    terms: "Governed by PayPal Sandbox Buyer & Seller protection. Funds released upon milestone completion.",
  };

  const current: CommercialQuote = quote || fallbackQuote;

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

        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono hidden md:block">
          Total: <span className="text-emerald-600 dark:text-emerald-400 font-bold">${current.totalAmount?.toFixed(2)}</span> {current.currency}
        </div>
      </div>

      {/* Tab 1: Agreement Canvas */}
      {activeTab === "agreement" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/30 dark:bg-transparent">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-blue-50/60 via-white to-slate-50 border border-slate-200 shadow-sm relative overflow-hidden dark:from-[#0F172A] dark:via-[#0B101D] dark:to-[#07090E] dark:border-[#1E293B] dark:shadow-xl transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0070BA]/5 dark:bg-[#0070BA]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#0070BA]/10 text-[#0070BA] border border-[#0070BA]/20 dark:bg-[#0070BA]/20 dark:text-[#38BDF8] dark:border-[#0070BA]/30">
                  Live Dynamic Contract
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2 mb-1">
                  {current.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Settlement</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center justify-end">
                  <span className="text-[#0070BA] dark:text-[#38BDF8] mr-1">$</span>
                  {current.totalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">PayPal Instant Eligible</span>
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
                <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/70 dark:hover:bg-[#0F172A]/40 transition-colors">
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

          {/* Milestones Escrow Breakdown */}
          {current.milestones && current.milestones.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>Smart Milestone Releases</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Agentic Escrow Protocol</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {current.milestones.map((ms: Milestone, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      ms.status === "released"
                        ? "bg-emerald-50/70 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                        : "bg-slate-50 border-slate-200 dark:bg-[#0F172A] dark:border-[#1E293B]"
                    } space-y-1.5`}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Direct Checkout & Invoicing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Instant PayPal Settlement Button */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0B101D] border border-[#0070BA]/30 dark:border-[#0070BA]/40 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white text-xs font-semibold">
                <CreditCard className="w-4 h-4 text-[#0070BA] dark:text-[#38BDF8]" />
                <span>Instant PayPal Smart Checkout</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Execute payment immediately using PayPal sandbox test account.
              </p>
              <button
                onClick={() => setActiveTab("terminal")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-[#0070BA]/20"
              >
                <span>Launch PayPal Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
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

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-[#07090E] dark:border-[#1E293B] flex items-center justify-between text-xs transition-colors">
              <span className="text-slate-600 dark:text-slate-400">Authorized Settlement Amount</span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${current.totalAmount?.toFixed(2)} {current.currency}
              </span>
            </div>

            {/* The Live PayPal Button */}
            <PayPalButtonWrapper
              amount={current.totalAmount}
              currency={current.currency || "USD"}
              description={current.title}
              items={current.items}
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

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>Protocol: PayPal v2 Orders Capture</span>
                    <button
                      onClick={() => copyId(tx.captureId || tx.orderId || "")}
                      className="flex items-center space-x-1 text-[#0070BA] dark:text-[#38BDF8] hover:underline cursor-pointer"
                    >
                      {copiedTx === (tx.captureId || tx.orderId) ? (
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>Copy Transaction ID</span>
                    </button>
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
