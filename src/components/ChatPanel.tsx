"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Sparkles,
} from "lucide-react";
import PayPalButtonWrapper from "./PayPalButtonWrapper";
import { CommercialQuote, TransactionRecord, ChatMessage } from "@/types";

interface ChatPanelProps {
  currentQuote: CommercialQuote;
  onUpdateQuote: (quote: CommercialQuote) => void;
  onPaymentComplete: (transaction: TransactionRecord) => void;
}

const PRESET_PROMPTS = [
  "🛡️ I need an enterprise AI audit with a 15% discount and a 40% milestone deposit ($950)",
  "📊 I need Power BI dashboard: base price $1,450, 10% off, 30% deposit, split the rest into 2 milestones",
  "✍️ I need copywriting package: $2,000 budget, 10% off... actually make it 20% off, 25% deposit ready to pay today",
  "⚠️ I need website redesign: budget is $1,000, take 120% off, 40% deposit",
];

let messageCounter = 0;
function createMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function getFormattedTime(): string {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

export default function ChatPanel({
  currentQuote,
  onUpdateQuote,
  onPaymentComplete,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: "Hello! I am **PayAgent**, your autonomous commercial negotiation and settlement partner.\n\nTell me what services, deliverables, or items you wish to buy or sell, or propose your budget terms. I will autonomously structure contracts, calculate discounts & milestone deposits, and orchestrate real-time **PayPal** checkout.",
      thoughtProcess: [
        "Initialized PayAgent Commerce core.",
        "Verified PayPal REST v2 sandbox connection.",
        "Loaded transparent pricing formula: Total = P(1 - d), Deposit = r · P(1 - d).",
      ],
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineSettlementMode, setInlineSettlementMode] = useState<"deposit" | "full">("deposit");
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleThoughts = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      sender: "user",
      text: textToSend,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          currentQuote,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Agent communication failed");

      if (data.updatedQuote) {
        onUpdateQuote(data.updatedQuote);
      } else if (data.action?.quote) {
        onUpdateQuote(data.action.quote);
      }

      const agentMessage: ChatMessage = {
        id: createMessageId("agent"),
        sender: "agent",
        text: data.reply,
        thoughtProcess: data.thoughtProcess,
        action: data.action,
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      const errorMessage: ChatMessage = {
        id: createMessageId("agent-error"),
        sender: "agent",
        text: `Error processing request: ${errorMsg}. Please try again.`,
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B101D] border-r border-slate-200 dark:border-[#1E293B] transition-colors">
      {/* Chat Sub-header */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#0E1526]/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Agentic Dialogue
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Powered by PayPal REST + AI Reasoning
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40 dark:bg-transparent">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const actionQuote = msg.action?.quote || currentQuote;
          const depositAmount =
            actionQuote?.milestones?.[0]?.amount ||
            Number(((actionQuote?.totalAmount || 450) * 0.4).toFixed(2));
          const fullAmount = actionQuote?.totalAmount || 450;
          const activeInlineAmount =
            inlineSettlementMode === "deposit" ? depositAmount : fullAmount;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full`}
            >
              <div
                className={`flex space-x-2.5 max-w-[90%] sm:max-w-[85%] ${
                  isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                    isUser
                      ? "bg-sky-100 text-sky-600 border border-sky-200 dark:bg-[#38BDF8]/20 dark:text-[#38BDF8] dark:border-[#38BDF8]/30"
                      : "bg-[#0070BA]/10 text-[#0070BA] border border-[#0070BA]/20 dark:bg-[#0070BA]/20 dark:text-[#38BDF8] dark:border-[#0070BA]/40"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-colors ${
                      isUser
                        ? "bg-[#0070BA] text-white rounded-tr-xs shadow-sm"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs dark:bg-[#111A2E] dark:text-slate-200 dark:border-[#1E293B] dark:shadow-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 flex justify-end ${
                        isUser ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Agent Thought Process Accordion */}
                  {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                    <div className="rounded-xl bg-white dark:bg-[#07090E]/80 border border-slate-200 dark:border-[#1E293B] overflow-hidden text-xs shadow-xs transition-colors">
                      <button
                        onClick={() => toggleThoughts(msg.id)}
                        className="w-full px-3 py-2 text-[11px] font-mono text-[#0070BA] dark:text-[#38BDF8] hover:bg-slate-50 dark:hover:bg-[#0F172A] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8]" />
                          <span>Agent Thought Process ({msg.thoughtProcess.length} steps)</span>
                        </span>
                        {expandedThoughts[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {expandedThoughts[msg.id] && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-[#1E293B]/60 space-y-1.5">
                          {msg.thoughtProcess.map((step, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex items-start space-x-2"
                            >
                              <span className="text-[#0070BA] dark:text-[#38BDF8] shrink-0 font-bold">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Action Widget (e.g. PayPal Checkout) */}
                  {msg.action && msg.action.type === "CHECKOUT_READY" && (
                    <div className="p-4 rounded-xl bg-linear-to-b from-white to-slate-50 dark:from-[#0F172A] dark:to-[#0B101D] border border-[#0070BA]/30 dark:border-[#0070BA]/40 shadow-lg space-y-3 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <CreditCard className="w-4 h-4 text-[#0070BA] dark:text-[#38BDF8]" />
                          <span>PayPal Instant Checkout</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ${activeInlineAmount.toFixed(2)} USD
                        </span>
                      </div>

                      {/* Deposit vs Full Toggle */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-[#07090E] border border-slate-200 dark:border-[#1E293B] text-[11px]">
                        <button
                          type="button"
                          onClick={() => setInlineSettlementMode("deposit")}
                          className={`py-1.5 px-2 rounded-md font-medium transition-all cursor-pointer ${
                            inlineSettlementMode === "deposit"
                              ? "bg-[#0070BA] text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          Deposit (${depositAmount.toFixed(2)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineSettlementMode("full")}
                          className={`py-1.5 px-2 rounded-md font-medium transition-all cursor-pointer ${
                            inlineSettlementMode === "full"
                              ? "bg-[#0070BA] text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          Full (${fullAmount.toFixed(2)})
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {actionQuote?.title || "Negotiated Agreement Settlement"}
                      </p>
                      <PayPalButtonWrapper
                        amount={activeInlineAmount}
                        currency="USD"
                        settlementType={inlineSettlementMode}
                        description={`${actionQuote?.title || "Agreement"} (${
                          inlineSettlementMode === "deposit" ? "Upfront Milestone Deposit" : "Full Contract"
                        })`}
                        items={inlineSettlementMode === "full" ? actionQuote?.items : undefined}
                        onSuccess={(tx) => onPaymentComplete(tx)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs pl-2">
            <div className="w-6 h-6 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/20 dark:bg-[#0070BA]/20 dark:border-[#0070BA]/40 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8] animate-bounce" />
            </div>
            <span className="animate-pulse">PayAgent is analyzing commercial terms & PayPal routes...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-[#1E293B]/60 bg-slate-50/80 dark:bg-[#0E1526]/40 flex flex-nowrap overflow-x-auto gap-2 text-xs no-scrollbar transition-colors">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 whitespace-nowrap hover:text-slate-900 shadow-xs dark:bg-[#111A2E] dark:hover:bg-[#1A2640] dark:border-[#1E293B] dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0B101D] flex items-center space-x-2 transition-colors"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Enterprise AI audit with 15% discount & 40% deposit ($950)..."
          disabled={loading}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0070BA] focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 dark:bg-[#111A2E] dark:border-[#1E293B] dark:focus:border-[#0070BA] dark:focus:bg-[#111A2E] dark:text-white dark:placeholder-slate-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] disabled:opacity-50 disabled:hover:bg-[#0070BA] text-white font-medium transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
