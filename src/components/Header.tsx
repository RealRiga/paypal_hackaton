"use client";

import React, { useState } from "react";
import { Bot, Zap, Sparkles, X, Copy, Check, Sun, Moon, ExternalLink, KeyRound, Mail } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const sandboxBuyerEmail =
    process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_BUYER_EMAIL || "sb-buyer@personal.example.com";
  const sandboxBuyerPassword =
    process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_BUYER_PASSWORD || "PayPal123!";

  const copyEmail = () => {
    navigator.clipboard.writeText(sandboxBuyerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(sandboxBuyerPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <>
      <header className="border-b border-slate-200 dark:border-[#1E293B] bg-white/95 dark:bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#003087] via-[#0070BA] to-[#38BDF8] p-px shadow-lg shadow-[#0070BA]/20">
            <div className="w-full h-full bg-white dark:bg-[#0B101D] rounded-[11px] flex items-center justify-center transition-colors">
              <Bot className="w-5 h-5 text-[#0070BA] dark:text-[#38BDF8]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center">
                Pay<span className="text-[#0070BA] dark:text-[#38BDF8]">Agent</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] dark:bg-[#0070BA]/20 dark:text-[#38BDF8] border border-[#0070BA]/20 dark:border-[#0070BA]/40">
                Agentic Commerce
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] hidden sm:block">
              Autonomous AI Contract Negotiation & Instant PayPal Settlement
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PayPal Sandbox Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-700 dark:text-[#E2E8F0] transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="hidden md:inline text-slate-500 dark:text-[#94A3B8]">PayPal:</span>
            <span className="font-mono text-emerald-600 dark:text-[#10B981] font-medium">Sandbox Live</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-[#0F172A] dark:hover:bg-[#1E293B] dark:text-slate-300 dark:border-[#1E293B]"
          >
            {theme === "light" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Hackathon Guide Modal Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0070BA]/10 text-[#0070BA] hover:bg-[#0070BA]/20 border border-[#0070BA]/30 dark:text-[#38BDF8] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Guide</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>
      </header>

      {/* Demo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative transition-colors max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-4">
              <div className="p-2 rounded-lg bg-[#0070BA]/10 text-[#0070BA] dark:bg-[#0070BA]/20 dark:text-[#38BDF8]">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">PayPal AI Hackathon Judge & Demo Guide</h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8]">
              {/* How Judges Test Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] space-y-3">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>How Judges Test Instant Payments:</span>
                  <span className="text-[11px] text-[#0070BA] dark:text-[#38BDF8] font-normal">PayPal Sandbox Mode</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Click the golden <strong>PayPal</strong> button in the terminal or agreement. When the PayPal popup appears, sign in using a <strong>Personal (Buyer) Sandbox Account</strong> to approve simulated funds.
                </p>

                {/* Account Details Box */}
                <div className="space-y-2 text-xs">
                  <div className="bg-white dark:bg-[#07090E] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8] shrink-0" />
                      <span className="font-mono text-slate-800 dark:text-slate-300 truncate">
                        {sandboxBuyerEmail}
                      </span>
                    </div>
                    <button
                      onClick={copyEmail}
                      className="flex items-center space-x-1 text-[#0070BA] dark:text-[#38BDF8] hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                    </button>
                  </div>

                  <div className="bg-white dark:bg-[#07090E] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <KeyRound className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8] shrink-0" />
                      <span className="font-mono text-slate-800 dark:text-slate-300">
                        {sandboxBuyerPassword}
                      </span>
                    </div>
                    <button
                      onClick={copyPassword}
                      className="flex items-center space-x-1 text-[#0070BA] dark:text-[#38BDF8] hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? "Copied" : "Copy Password"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Need your own custom Sandbox Buyer account?</span>
                  <a
                    href="https://developer.paypal.com/dashboard/accounts"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0070BA] dark:text-[#38BDF8] inline-flex items-center space-x-1 hover:underline"
                  >
                    <span>Developer Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5">Key Innovation Highlights:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li><strong>Agentic Commerce:</strong> Autonomous scope negotiation, itemization, and dynamic milestone escrowing.</li>
                  <li><strong>Native PayPal REST API v2:</strong> Live `/v2/checkout/orders` creation and instant capture with receipt ledger.</li>
                  <li><strong>PayPal Invoicing v2:</strong> Official digital invoice generator with sequential numbering and email dispatch.</li>
                  <li><strong>Verified Ledger:</strong> Cryptographic audit trail with immutable Capture IDs and timestamps.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Got It, Let&apos;s Try!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
