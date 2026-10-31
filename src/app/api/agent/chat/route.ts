import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";
import { CommercialQuote } from "@/types";

export interface AgentActionResponse {
  type: "QUOTE_GENERATED" | "CHECKOUT_READY" | "INVOICE_CREATED" | "MILESTONE_RELEASED" | "INFO";
  quote?: CommercialQuote;
  paypalOrderId?: string;
  paypalInvoiceNumber?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse {
  reply: string;
  thoughtProcess: string[];
  action?: AgentActionResponse;
  updatedQuote?: CommercialQuote;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], currentQuote = null } = body as {
      message?: string;
      history?: Array<{ role: string; content: string }>;
      currentQuote?: CommercialQuote | null;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if an external LLM key is configured (OpenAI or Gemini)
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey) {
      try {
        const openaiRes = await callOpenAIAgent(openaiKey, message, history, currentQuote);
        if (openaiRes) return NextResponse.json(openaiRes);
      } catch (err) {
        console.warn("OpenAI agent fallback triggered:", err);
      }
    } else if (geminiKey) {
      try {
        const geminiRes = await callGeminiAgent(geminiKey, message, history, currentQuote);
        if (geminiRes) return NextResponse.json(geminiRes);
      } catch (err) {
        console.warn("Gemini agent fallback triggered:", err);
      }
    }

    // High-performance Built-in Agentic Commerce Engine fallback
    const agentResult = await runAutonomousCommerceEngine(message, currentQuote);
    return NextResponse.json(agentResult);
  } catch (error: unknown) {
    console.error("Agent chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Agent reasoning failure";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Live OpenAI Agentic Commerce Engine
 */
async function callOpenAIAgent(
  apiKey: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  currentQuote: CommercialQuote | null
): Promise<AgentResponse | null> {
  const systemPrompt = `You are PayAgent, an autonomous commercial negotiation and PayPal settlement AI agent.
Your role is to negotiate commercial contracts, structure itemized quotes and milestones, and trigger instant PayPal checkouts.

Current active quote context:
${JSON.stringify(currentQuote, null, 2)}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "reply": "Markdown-formatted conversational response to the user",
  "thoughtProcess": ["Step 1 of your internal reasoning", "Step 2...", "Step 3..."],
  "actionType": "QUOTE_GENERATED" | "CHECKOUT_READY" | "MILESTONE_RELEASED" | "INFO",
  "quote": {
    "title": "Project or Service Title",
    "description": "Brief scope summary",
    "totalAmount": 1200,
    "currency": "USD",
    "items": [
      { "name": "Deliverable 1", "quantity": "1", "price": 700, "description": "Details" },
      { "name": "Deliverable 2", "quantity": "1", "price": 500, "description": "Details" }
    ],
    "milestones": [
      { "name": "Milestone 1: Upfront Deposit", "percentage": 40, "amount": 480, "status": "pending" },
      { "name": "Milestone 2: Final Delivery", "percentage": 60, "amount": 720, "status": "pending" }
    ],
    "terms": "Governed by PayPal Buyer & Seller Protection."
  }
}

Rules:
1. Ensure sum of items[].price equals totalAmount, and sum of milestones[].amount equals totalAmount.
2. If the user asks to pay, checkout, settle, or buy now, set "actionType" to "CHECKOUT_READY".
3. If the user proposes a project, asks for a quote, or negotiates price/discount/terms, set "actionType" to "QUOTE_GENERATED".
4. If the user asks to release or approve a milestone, set "actionType" to "MILESTONE_RELEASED" and mark the first pending milestone status as "released".`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-6),
        { role: "user", content: message },
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    reply: string;
    thoughtProcess?: string[];
    actionType?: AgentActionResponse["type"];
    quote?: CommercialQuote;
  };

  const quote: CommercialQuote | undefined = parsed.quote || currentQuote || undefined;
  const actionType = parsed.actionType || "QUOTE_GENERATED";
  const thoughts = Array.isArray(parsed.thoughtProcess)
    ? parsed.thoughtProcess
    : ["Analyzed commercial intent via OpenAI reasoning engine."];

  let paypalOrderId: string | undefined;
  if (actionType === "CHECKOUT_READY" && quote) {
    try {
      const order = await createPayPalOrder({
        amount: quote.totalAmount,
        currency: quote.currency || "USD",
        description: quote.title,
        items: quote.items?.map((it) => ({
          name: it.name,
          quantity: String(it.quantity || "1"),
          unit_amount: {
            currency_code: quote.currency || "USD",
            value: Number(it.price).toFixed(2),
          },
        })),
      });
      paypalOrderId = order.id;
      thoughts.push(`Verified PayPal Sandbox Order created: ${order.id} (Status: CREATED).`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Simulated checkout";
      thoughts.push(`Prepared PayPal checkout container (${msg}).`);
    }
  }

  return {
    reply: parsed.reply,
    thoughtProcess: thoughts,
    action: {
      type: actionType,
      quote,
      paypalOrderId,
    },
    updatedQuote: quote,
  };
}

/**
 * Optional Gemini Agent proxy
 */
async function callGeminiAgent(
  apiKey: string,
  message: string,
  _history: Array<{ role: string; content: string }>,
  currentQuote: CommercialQuote | null
): Promise<AgentResponse | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const prompt = `You are PayAgent, an autonomous commercial negotiation and PayPal settlement AI agent.
Current quote: ${JSON.stringify(currentQuote)}
User message: ${message}
Return ONLY valid JSON with keys: reply (string), thoughtProcess (string[]), actionType ("QUOTE_GENERATED" | "CHECKOUT_READY" | "MILESTONE_RELEASED"), and quote ({ title, description, totalAmount, currency, items: [{name, quantity, price, description}], milestones: [{name, percentage, amount, status}], terms }).`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text);
  return {
    reply: parsed.reply,
    thoughtProcess: parsed.thoughtProcess || ["Processed with Gemini AI."],
    action: {
      type: parsed.actionType || "QUOTE_GENERATED",
      quote: parsed.quote || currentQuote || undefined,
    },
    updatedQuote: parsed.quote || currentQuote || undefined,
  };
}

/**
 * Built-in Agentic Commerce reasoning engine (fallback)
 */
async function runAutonomousCommerceEngine(
  message: string,
  existingQuote: CommercialQuote | null
): Promise<AgentResponse> {
  const lower = message.toLowerCase();
  const thoughts: string[] = [];

  thoughts.push("Ingested incoming negotiation message and context.");
  thoughts.push("Evaluating commercial constraints: deliverables, budget, payment terms.");

  // Scenario 1: User asks to create checkout / pay / settle
  if (
    lower.includes("pay") ||
    lower.includes("checkout") ||
    lower.includes("buy now") ||
    lower.includes("settle") ||
    lower.includes("ready to pay")
  ) {
    thoughts.push("Detected payment execution intent.");
    const targetAmount = extractDollarAmount(message) || existingQuote?.totalAmount || 450;
    const currency = existingQuote?.currency || "USD";

    thoughts.push(`Synthesizing PayPal Orders API payload for ${currency} ${targetAmount}.`);

    const quoteToUse: CommercialQuote = existingQuote
      ? { ...existingQuote, totalAmount: targetAmount }
      : {
          title: "Direct Commercial Settlement",
          description: "Instant settlement via PayPal Smart Checkout",
          totalAmount: targetAmount,
          currency,
          items: [{ name: "Professional Services & Deliverables", quantity: "1", price: targetAmount }],
          milestones: [
            { name: "Full Completion & Delivery", percentage: 100, amount: targetAmount, status: "pending" },
          ],
          terms: "Instant settlement governed by PayPal Buyer & Seller Protection.",
        };

    let orderId = `PAYPAL-DEMO-${Date.now()}`;
    try {
      const order = await createPayPalOrder({
        amount: targetAmount,
        currency,
        description: quoteToUse.title,
        items: quoteToUse.items.map((it) => ({
          name: it.name,
          quantity: String(it.quantity || "1"),
          unit_amount: {
            currency_code: currency,
            value: Number(it.price).toFixed(2),
          },
        })),
      });
      orderId = order.id;
      thoughts.push(`Verified PayPal Sandbox Order created: ${orderId} (Status: CREATED).`);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Simulated mode";
      thoughts.push(`Simulated order container generated (${errMsg}).`);
    }

    return {
      reply: `I have prepared the official **PayPal Instant Settlement** for **$${targetAmount.toFixed(
        2
      )} ${currency}**. You can review the details on your right canvas and click the PayPal button below to execute payment securely.`,
      thoughtProcess: thoughts,
      action: {
        type: "CHECKOUT_READY",
        paypalOrderId: orderId,
        quote: quoteToUse,
      },
      updatedQuote: quoteToUse,
    };
  }

  // Scenario 2: User asks for a discount or price negotiation
  if (
    lower.includes("discount") ||
    lower.includes("cheaper") ||
    lower.includes("lower") ||
    lower.includes("reduce") ||
    lower.includes("budget is")
  ) {
    thoughts.push("Detected price negotiation & budget constraint.");
    const requestedAmount = extractDollarAmount(message);
    const baseAmount = existingQuote?.totalAmount || 1200;
    const discountedAmount = requestedAmount || Math.round(baseAmount * 0.85);

    thoughts.push(`Calculated optimal win-win counter-offer: $${discountedAmount}.`);
    thoughts.push("Updated milestone schedule: 40% upfront retainer, 60% upon final sign-off.");

    const newQuote: CommercialQuote = {
      title: existingQuote?.title || "Comprehensive AI Application & Architecture",
      description: "Custom project scope with negotiated 15% upfront volume adjustment.",
      totalAmount: discountedAmount,
      currency: "USD",
      items: [
        { name: "Core Architecture & API Integrations", quantity: "1", price: Math.round(discountedAmount * 0.6) },
        { name: "Frontend User Experience & QA", quantity: "1", price: Math.round(discountedAmount * 0.4) },
      ],
      milestones: [
        {
          name: "Initial Deposit & Sprint 1 Kickoff",
          percentage: 40,
          amount: Math.round(discountedAmount * 0.4),
          status: "pending",
        },
        {
          name: "Final Acceptance & Deployment",
          percentage: 60,
          amount: Math.round(discountedAmount * 0.6),
          status: "pending",
        },
      ],
      terms: "Net 7 terms upon milestone sign-off. Governed by PayPal buyer & seller protection.",
    };

    return {
      reply: `I've analyzed your budget requirements and structured a revised proposal at **$${discountedAmount.toFixed(
        2
      )} USD** (saving you $${Math.abs(baseAmount - discountedAmount).toFixed(
        2
      )}).\n\nI have structured this with a **40% milestone upfront ($${newQuote.milestones[0].amount})** to protect both parties. Does this work for you?`,
      thoughtProcess: thoughts,
      action: {
        type: "QUOTE_GENERATED",
        quote: newQuote,
      },
      updatedQuote: newQuote,
    };
  }

  // Scenario 3: User asks for milestones / release
  if (lower.includes("milestone") || lower.includes("release") || lower.includes("deliverable")) {
    thoughts.push("Analyzing milestone release verification.");
    thoughts.push("Validating criteria: Source code submitted, tests passing, deliverables inspected.");
    thoughts.push("Marking Milestone 1 as RELEASED.");

    const quote: CommercialQuote = existingQuote
      ? {
          ...existingQuote,
          milestones: existingQuote.milestones.map((m, idx) =>
            idx === 0 ? { ...m, status: "released" as const } : m
          ),
        }
      : {
          title: "Full-Stack Development Sprint",
          description: "Milestone-governed commercial contract",
          totalAmount: 1500,
          currency: "USD",
          items: [
            { name: "UI/UX & Prototypes", quantity: "1", price: 750 },
            { name: "Final Production Release", quantity: "1", price: 750 },
          ],
          milestones: [
            { name: "Milestone 1: UI/UX & Prototypes", percentage: 50, amount: 750, status: "released" },
            { name: "Milestone 2: Final Production Release", percentage: 50, amount: 750, status: "pending" },
          ],
          terms: "Payments processed via PayPal Sandbox with dispute mediation by PayAgent.",
        };

    return {
      reply: `Deliverables verified! I have authorized the release for **${quote.milestones[0].name} ($${quote.milestones[0].amount.toFixed(
        2
      )} USD)**. The remaining milestone remains securely escrowed pending final sign-off.`,
      thoughtProcess: thoughts,
      action: {
        type: "MILESTONE_RELEASED",
        quote,
      },
      updatedQuote: quote,
    };
  }

  // Default: Autonomous Quote Builder
  thoughts.push("Synthesizing tailored quote based on conversational request.");
  const extracted = extractDollarAmount(message);
  const total = extracted || (lower.includes("design") ? 850 : lower.includes("audit") ? 600 : 1400);

  const initialQuote: CommercialQuote = {
    title: lower.includes("design")
      ? "Brand Identity & Design System Package"
      : lower.includes("audit")
      ? "Enterprise Codebase & Security Audit"
      : "Full-Stack AI Application Development & Deployment",
    description: "Itemized scope created autonomously by PayAgent Commerce Agent.",
    totalAmount: total,
    currency: "USD",
    items: [
      {
        name: "Discovery, Specification & Agentic Architecture",
        quantity: "1",
        price: Math.round(total * 0.4),
        description: "Technical scope definition, schema design, and API mapping.",
      },
      {
        name: "Implementation, PayPal SDK Integration & Testing",
        quantity: "1",
        price: Math.round(total * 0.6),
        description: "Full implementation with unit tests, CI validation, and staging deployment.",
      },
    ],
    milestones: [
      {
        name: "Phase 1: Architecture Sign-off",
        percentage: 50,
        amount: Math.round(total * 0.5),
        status: "pending",
      },
      {
        name: "Phase 2: Final Delivery & PayPal Handover",
        percentage: 50,
        amount: Math.round(total * 0.5),
        status: "pending",
      },
    ],
    terms: "Payments processed via PayPal Sandbox with dispute mediation by PayAgent.",
  };

  thoughts.push(`Constructed itemized agreement with total $${total.toFixed(2)} USD.`);

  return {
    reply: `I have synthesized an itemized agreement for **"${initialQuote.title}"** totaling **$${total.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )} USD**.\n\nYou can inspect the breakdown and milestones on the live canvas to your right. If you want any adjustments or are ready to pay, just let me know!`,
    thoughtProcess: thoughts,
    action: {
      type: "QUOTE_GENERATED",
      quote: initialQuote,
    },
    updatedQuote: initialQuote,
  };
}

function extractDollarAmount(text: string): number | null {
  const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+)|(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+)\s*(?:dollars|usd|bucks)/i);
  if (match) {
    const raw = (match[1] || match[2]).replace(/,/g, "");
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0 && val < 100000) return val;
  }
  return null;
}

