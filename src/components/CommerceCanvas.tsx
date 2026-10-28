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
  Download,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import PayPalButtonWrapper from "./PayPalButtonWrapper";

interface CommerceCanvasProps {
  quote: any;
  transactions: any[];
  onPaymentComplete: (tx: any) => void;
}

export default function CommerceCanvas({
  quote,
  transactions,
  onPaymentComplete,
}: CommerceCanvasProps) {
  const [activeTab, setActiveTab] = useState<"agreement" | "terminal" | "ledger">("agreement");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);
  const [clientEmail, setClientEmail] = useState("buyer-demo@sandbox.paypal.com");
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const fallbackQuote = {
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

  const current = quote || fallbackQuote;

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
          items: current.items.map((it: any) => ({
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
    } catch (err: any) {
      alert(`Invoice Creation: ${err.message}`);
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
    <div className="flex flex-col h-full bg-[#07090E]">
      {/* Top Navigation Tabs */}
      <div className="border-b border-[#1E293B] bg-[#0B101D] px-4 pt-2 flex items-center justify-between">
        <div className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab("agreement")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "agreement"
                ? "bg-[#07090E] text-[#38BDF8] border-t-2 border-[#0070BA] font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Commercial Agreement</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "terminal"
                ? "bg-[#07090E] text-[#38BDF8] border-t-2 border-[#0070BA] font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PayPal Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 cursor-pointer relative ${
              activeTab === "ledger"
                ? "bg-[#07090E] text-[#38BDF8] border-t-2 border-[#0070BA] font-semibold"
                : "text-slate-400 hover:text-white"
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

        <div className="text-[11px] text-slate-400 font-mono hidden md:block">
          Total: <span className="text-emerald-400 font-bold">${current.totalAmount?.toFixed(2)}</span> {current.currency}
        </div>
      </div>

      {/* Tab 1: Agreement Canvas */}
      {activeTab === "agreement" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#0B101D] to-[#07090E] border border-[#1E293B] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#0070BA]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-[#0070BA]/20 text-[#38BDF8] border border-[#0070BA]/30">
                  Live Dynamic Contract
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-2 mb-1">
                  {current.title}
                </h2>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Total Settlement</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight flex items-center justify-end">
                  <span className="text-[#38BDF8] mr-1">$</span>
                  {current.totalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">PayPal Instant Eligible</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-2xl bg-[#0B101D] border border-[#1E293B] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1E293B] bg-[#0E1526]/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Deliverables & Pricing Breakdown</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {current.items?.length || 0} line items
              </span>
            </div>

            <div className="divide-y divide-[#1E293B]">
              {current.items?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm hover:bg-[#0F172A]/40 transition-colors">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-medium text-white flex items-center space-x-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        Qty: {item.quantity || 1}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400">{item.description}</p>
                    )}
                  </div>
                  <div className="font-mono font-semibold text-white whitespace-nowrap">
                    ${Number(item.price).toFixed(2)} USD
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Escrow Breakdown */}
          {current.milestones && current.milestones.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smart Milestone Releases</span>
                </span>
                <span className="text-[11px] text-slate-400">Agentic Escrow Protocol</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {current.milestones.map((ms: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      ms.status === "released"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-[#0F172A] border-[#1E293B]"
                    } space-y-1.5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{ms.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ms.status === "released"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {ms.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{ms.percentage}% of contract</span>
                      <span className="font-mono font-bold text-white">
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
            <div className="p-4 rounded-2xl bg-[#0B101D] border border-[#0070BA]/40 space-y-3">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                <span>Instant PayPal Smart Checkout</span>
              </div>
              <p className="text-xs text-slate-400">
                Execute payment immediately using PayPal sandbox test account.
              </p>
              <button
                onClick={() => setActiveTab("terminal")}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-[#0070BA]/20"
              >
                <span>Launch PayPal Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Official PayPal Invoicing */}
            <div className="p-4 rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-3">
              <div className="flex items-center space-x-2 text-white text-xs font-semibold">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Create Official PayPal Invoice</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Client email address..."
                  className="flex-1 bg-[#111A2E] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleGenerateInvoice}
                  disabled={invoiceLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium cursor-pointer transition-colors"
                >
                  {invoiceLoading ? "Sending..." : "Create"}
                </button>
              </div>

              {invoiceResult && (
                <div className="text-[11px] p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  Created Invoice: <span className="font-mono font-bold">{invoiceResult.invoiceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PayPal Terminal */}
      {activeTab === "terminal" && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0B101D] border border-[#1E293B] shadow-2xl space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#0070BA]/20 border border-[#0070BA]/40 text-[#38BDF8] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">PayPal Smart Settlement Terminal</h3>
              <p className="text-xs text-slate-400">
                Settling: <strong className="text-white">{current.title}</strong>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#07090E] border border-[#1E293B] flex items-center justify-between text-xs">
              <span className="text-slate-400">Authorized Settlement Amount</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Autonomous Settlement Audit Ledger</h3>
              <p className="text-xs text-slate-400">
                Cryptographically verifiable proof of payment records logged by PayAgent.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {transactions.length} Verified
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0B101D] border border-[#1E293B] space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-1" />
              <h4 className="text-xs font-semibold text-slate-300">No settlements executed yet</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Complete a test transaction using the PayPal Smart Buttons in the agreement or terminal to view verified ledger receipts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0B101D] border border-emerald-500/30 space-y-3 hover:border-emerald-500/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        {tx.captureId || tx.orderId}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      +${Number(tx.amount || 0).toFixed(2)} {tx.currency || "USD"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-[#07090E] p-2.5 rounded-lg border border-[#1E293B] font-mono">
                    <div>
                      <span className="text-slate-500 block">Status:</span>
                      <span className="text-emerald-300 font-bold">{tx.status || "COMPLETED"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payer:</span>
                      <span className="text-slate-300 truncate block">{tx.payerName || "Sandbox Buyer"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Time:</span>
                      <span className="text-slate-300">{tx.timestamp || "Just now"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Protocol: PayPal v2 Orders Capture</span>
                    <button
                      onClick={() => copyId(tx.captureId || tx.orderId)}
                      className="flex items-center space-x-1 text-[#38BDF8] hover:text-white cursor-pointer"
                    >
                      {copiedTx === (tx.captureId || tx.orderId) ? (
                        <Check className="w-3 h-3 text-emerald-400" />
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
