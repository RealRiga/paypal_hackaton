"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import ChatPanel from "@/components/ChatPanel";
import CommerceCanvas from "@/components/CommerceCanvas";

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<any>({
    title: "Autonomous AI Commerce & Infrastructure Sprint",
    description: "Itemized scope and commercial deliverables synthesized by PayAgent.",
    totalAmount: 1400,
    currency: "USD",
    items: [
      {
        name: "Discovery, Specification & Schema Design",
        quantity: "1",
        price: 560,
        description: "Technical scope definition, schema design, and API mapping.",
      },
      {
        name: "Implementation, PayPal SDK Integration & Testing",
        quantity: "1",
        price: 840,
        description: "Full implementation with unit tests, CI validation, and staging deployment.",
      },
    ],
    milestones: [
      { name: "Phase 1: Architecture Sign-off", percentage: 50, amount: 700, status: "pending" },
      { name: "Phase 2: Final Delivery & PayPal Handover", percentage: 50, amount: 700, status: "pending" },
    ],
    terms: "Payments processed via PayPal Sandbox with dispute mediation by PayAgent.",
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  const handlePaymentComplete = (tx: any) => {
    setTransactions((prev) => [tx, ...prev]);

    // Automatically update quote milestone status
    if (currentQuote && currentQuote.milestones) {
      setCurrentQuote((prev: any) => ({
        ...prev,
        milestones: prev.milestones.map((ms: any, idx: number) =>
          idx === 0 ? { ...ms, status: "released" } : ms
        ),
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E]">
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
        <section className="lg:col-span-7 h-[50vh] lg:h-full flex flex-col overflow-hidden border-t lg:border-t-0 border-[#1E293B]">
          <CommerceCanvas
            quote={currentQuote}
            transactions={transactions}
            onPaymentComplete={handlePaymentComplete}
          />
        </section>
      </main>
    </div>
  );
}
