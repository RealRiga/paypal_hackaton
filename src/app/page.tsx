"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ChatPanel from "@/components/ChatPanel";
import CommerceCanvas from "@/components/CommerceCanvas";
import { CommercialQuote, TransactionRecord, Milestone } from "@/types";

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<CommercialQuote>({
    title: "Enterprise AI Audit & Security Architecture",
    description: "Itemized scope and commercial deliverables synthesized by PayAgent.",
    basePrice: 950,
    discountRate: 0.15,
    depositRate: 0.4,
    totalAmount: 807.5,
    currency: "USD",
    items: [
      {
        name: "Discovery, Threat Model & Agentic Architecture",
        quantity: "1",
        price: 484.5,
        description: "Technical scope definition, schema design, and security audit.",
      },
      {
        name: "Implementation, PayPal SDK Integration & Verification",
        quantity: "1",
        price: 323.0,
        description: "Full implementation with unit tests, CI validation, and staging deployment.",
      },
    ],
    milestones: [
      { name: "Milestone 1: Upfront Escrow Deposit", percentage: 40, amount: 323.0, status: "pending" },
      { name: "Milestone 2: Final Delivery & PayPal Handover", percentage: 60, amount: 484.5, status: "pending" },
    ],
    terms: "Payments processed via PayPal Sandbox with conditional milestone mediation by PayAgent.",
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const handlePaymentComplete = (tx: TransactionRecord) => {
    setTransactions((prev) => [tx, ...prev]);

    // Automatically update quote milestone status
    if (currentQuote && currentQuote.milestones) {
      setCurrentQuote((prev: CommercialQuote) => ({
        ...prev,
        milestones: prev.milestones.map((ms: Milestone, idx: number) =>
          tx.settlementType === "full" || idx === 0
            ? {
                ...ms,
                status: "released" as const,
                verifiedAt: tx.timestamp || "Just now",
              }
            : ms
        ),
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white dark:bg-[#07090E] transition-colors duration-200">
      <Header />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Chat & Agentic Negotiation Panel */}
        <section className="lg:col-span-5 h-[50vh] lg:h-full flex flex-col overflow-hidden">
          <ChatPanel
            currentQuote={currentQuote}
            onUpdateQuote={setCurrentQuote}
            onPaymentComplete={handlePaymentComplete}
          />
        </section>

        {/* Right: Dynamic Commerce Canvas & PayPal Terminal */}
        <section className="lg:col-span-7 h-[50vh] lg:h-full flex flex-col overflow-hidden border-t lg:border-t-0 border-slate-200 dark:border-[#1E293B]">
          <CommerceCanvas
            quote={currentQuote}
            transactions={transactions}
            onUpdateQuote={setCurrentQuote}
            onPaymentComplete={handlePaymentComplete}
          />
        </section>
      </main>
    </div>
  );
}
