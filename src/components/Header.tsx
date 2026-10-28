"use client";

import React, { useState } from "react";
import { Bot, ShieldCheck, Zap, Sparkles, HelpCircle, X, ExternalLink, Copy, Check } from "lucide-react";

export default function Header() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copySandboxTip = () => {
    navigator.clipboard.writeText("sb-buyer@business.example.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="border-b border-[#1E293B] bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003087] via-[#0070BA] to-[#38BDF8] p-[1px] shadow-lg shadow-[#0070BA]/20">
            <div className="w-full h-full bg-[#0B101D] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#38BDF8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center">
                Pay<span className="text-[#38BDF8]">Agent</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#0070BA]/20 text-[#38BDF8] border border-[#0070BA]/40">
                Agentic Commerce
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] hidden sm:block">
              Autonomous AI Contract Negotiation & Instant PayPal Settlement
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* PayPal Sandbox Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B] text-xs text-[#E2E8F0]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="hidden md:inline text-[#94A3B8]">PayPal:</span>
            <span className="font-mono text-[#10B981] font-medium">Sandbox Live</span>
          </div>

          {/* Hackathon Guide Modal Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0070BA]/10 text-[#38BDF8] hover:bg-[#0070BA]/20 border border-[#0070BA]/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hackathon Demo Guide</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </header>

      {/* Demo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-lg bg-[#0070BA]/20 text-[#38BDF8]">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">PayPal AI Hackathon Submission Guide</h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#94A3B8]">
              <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#1E293B]">
                <div className="font-semibold text-white mb-1 flex items-center justify-between">
                  <span>How Judges Can Test Instant Payments:</span>
                  <span className="text-[11px] text-[#38BDF8] font-normal">PayPal Sandbox Mode</span>
                </div>
                <p className="text-xs mb-2">
                  When you initiate a checkout in PayAgent, click the golden <strong>PayPal</strong> button. You can sign in using your PayPal Sandbox Buyer account or standard PayPal credentials.
                </p>
                <div className="text-xs bg-[#07090E] p-2 rounded-lg border border-[#1E293B] flex items-center justify-between">
                  <span className="font-mono text-slate-300">Default Buyer: personal sandbox account</span>
                  <button
                    onClick={copySandboxTip}
                    className="flex items-center space-x-1 text-[#38BDF8] hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">Key Innovation Highlights:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Agentic Commerce:</strong> Autonomous quote drafting, negotiation, and milestone breakdown.</li>
                  <li><strong>Native PayPal REST API v2:</strong> Generates real Sandbox Order IDs and captures transactions with verified receipts.</li>
                  <li><strong>Live Dynamic Canvas:</strong> Dual-pane synchronization as negotiation progresses.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-medium transition-colors"
                >
                  Got It, Let's Try!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
