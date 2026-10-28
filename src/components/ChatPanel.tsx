"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  CreditCard,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";
import PayPalButtonWrapper from "./PayPalButtonWrapper";

export interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  thoughtProcess?: string[];
  action?: any;
  timestamp: string;
}

interface ChatPanelProps {
  currentQuote: any;
  onUpdateQuote: (quote: any) => void;
  onPaymentComplete: (transaction: any) => void;
}

const PRESET_PROMPTS = [
  "💼 Build an AI Mobile App with 40% upfront deposit ($2,400)",
  "🎨 Brand Identity Design with a 15% discount for immediate PayPal checkout ($750)",
  "⚡ Settle instant payment for Cloud Maintenance retainer ($350)",
];

export default function ChatPanel({
  currentQuote,
  onUpdateQuote,
  onPaymentComplete,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "agent",
      text: "Hello! I am **PayAgent**, your autonomous commercial negotiation and settlement partner.\n\nTell me what services, deliverables, or items you wish to buy or sell, or propose your budget terms. I will autonomously draft contracts, negotiate milestones, and orchestrate real-time **PayPal** checkout.",
      thoughtProcess: [
        "Initialized PayAgent Commerce core.",
        "Verified PayPal REST sandbox connection.",
        "Awaiting user commercial intent or scope specifications.",
      ],
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: data.reply,
        thoughtProcess: data.thoughtProcess,
        action: data.action,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: `Error processing request: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B101D] border-r border-[#1E293B]">
      {/* Chat Sub-header */}
      <div className="px-5 py-3 border-b border-[#1E293B] bg-[#0E1526]/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Agentic Dialogue
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Powered by PayPal REST + AI Reasoning
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
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
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                    isUser
                      ? "bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30"
                      : "bg-[#0070BA]/20 text-[#38BDF8] border border-[#0070BA]/40"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#0070BA] text-white rounded-tr-xs"
                        : "bg-[#111A2E] text-slate-200 border border-[#1E293B] rounded-tl-xs shadow-md"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1.5 flex justify-end ${
                        isUser ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Agent Thought Process Accordion */}
                  {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                    <div className="rounded-xl bg-[#07090E]/80 border border-[#1E293B] overflow-hidden text-xs">
                      <button
                        onClick={() => toggleThoughts(msg.id)}
                        className="w-full px-3 py-2 text-[11px] font-mono text-[#38BDF8] hover:bg-[#0F172A] flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Agent Thought Process ({msg.thoughtProcess.length} steps)</span>
                        </span>
                        {expandedThoughts[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {expandedThoughts[msg.id] && (
                        <div className="px-3 pb-3 pt-1 border-t border-[#1E293B]/60 space-y-1.5">
                          {msg.thoughtProcess.map((step, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] text-slate-400 font-mono flex items-start space-x-2"
                            >
                              <span className="text-[#38BDF8] shrink-0 font-bold">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Action Widget (e.g. PayPal Checkout) */}
                  {msg.action && msg.action.type === "CHECKOUT_READY" && (
                    <div className="p-4 rounded-xl bg-gradient-to-b from-[#0F172A] to-[#0B101D] border border-[#0070BA]/40 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                          <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                          <span>PayPal Instant Checkout</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ${(msg.action.quote?.totalAmount || 450).toFixed(2)} USD
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {msg.action.quote?.title || "Negotiated Agreement Settlement"}
                      </p>
                      <PayPalButtonWrapper
                        amount={msg.action.quote?.totalAmount || 450}
                        currency="USD"
                        description={msg.action.quote?.title}
                        items={msg.action.quote?.items}
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
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-2">
            <div className="w-6 h-6 rounded-lg bg-[#0070BA]/20 border border-[#0070BA]/40 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-[#38BDF8] animate-bounce" />
            </div>
            <span className="animate-pulse">PayAgent is analyzing commercial terms & PayPal routes...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-[#1E293B]/60 bg-[#0E1526]/40 flex flex-nowrap overflow-x-auto gap-2 text-xs no-scrollbar">
        {PRESET_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg bg-[#111A2E] hover:bg-[#1A2640] border border-[#1E293B] text-[11px] text-slate-300 whitespace-nowrap hover:text-white transition-all cursor-pointer flex items-center space-x-1 shrink-0"
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
        className="p-3 sm:p-4 border-t border-[#1E293B] bg-[#0B101D] flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Negotiate a $900 website redesign with 30% deposit..."
          disabled={loading}
          className="flex-1 bg-[#111A2E] border border-[#1E293B] focus:border-[#0070BA] focus:outline-none rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] disabled:opacity-50 disabled:hover:bg-[#0070BA] text-white font-medium transition-colors flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
