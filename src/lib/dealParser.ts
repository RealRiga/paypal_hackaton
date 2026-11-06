import type { CommercialQuote, Milestone, QuoteItem } from "../types";

export interface DealEvaluation {
  status: "ok" | "invalid" | "needs_clarification";
  service_type: string;
  base_price: number | null;
  discount_rate: number | null;
  deposit_rate: number | null;
  total: number | null;
  deposit: number | null;
  remaining: number | null;
  milestones: number | null;
  issue:
    | "invalid_discount"
    | "invalid_deposit"
    | "invalid_price"
    | "missing_price"
    | "missing_deposit"
    | "self_correction_use_last_value"
    | null;
}

export const SERVICE_TAXONOMY: Record<
  string,
  { phrases: string[]; title: string; deliverables: [string, string] }
> = {
  enterprise_ai_audit: {
    phrases: ["enterprise AI audit", "AI audit for my company", "an AI readiness audit"],
    title: "Enterprise AI & Readiness Audit",
    deliverables: [
      "AI Architecture, Threat Modeling & Readiness Assessment",
      "Compliance Verification, Governance Report & Executive Roadmap",
    ],
  },
  brand_identity: {
    phrases: ["brand identity design", "a full rebrand", "logo and brand guide"],
    title: "Brand Identity & Visual System Package",
    deliverables: [
      "Logo Architecture, Typography & Color System",
      "Comprehensive Brand Guidelines & Asset Kit",
    ],
  },
  website_redesign: {
    phrases: ["website redesign", "a new company website", "landing page rebuild"],
    title: "Corporate Website Redesign & Engineering",
    deliverables: [
      "UX/UI Wireframes, Responsive Design & Copy Layout",
      "Next.js Frontend Implementation, Performance & SEO Launch",
    ],
  },
  mobile_app_mvp: {
    phrases: ["mobile app MVP", "an MVP for my app idea", "a small iOS/Android app"],
    title: "Cross-Platform Mobile App MVP Build",
    deliverables: [
      "Mobile UI/UX Prototypes, Auth & Core API Backend",
      "iOS/Android App Build, PayPal SDK Integration & QA",
    ],
  },
  seo_audit: {
    phrases: ["SEO audit", "a technical SEO review", "SEO audit + keyword plan"],
    title: "Technical SEO Audit & Keyword Growth Strategy",
    deliverables: [
      "Core Web Vitals, Crawlability & Technical SEO Audit",
      "High-Intent Keyword Plan & On-Page Optimization Spec",
    ],
  },
  bi_dashboard: {
    phrases: ["Power BI dashboard", "a sales dashboard in Tableau", "a data dashboard"],
    title: "Executive BI & Analytics Dashboard",
    deliverables: [
      "Data Warehouse Modeling, ETL & KPI Definitions",
      "Interactive Tableau / Power BI Executive Views",
    ],
  },
  social_media_mgmt: {
    phrases: [
      "3 months of social media management",
      "social media content calendar",
      "Instagram + LinkedIn management",
    ],
    title: "Multi-Channel Social Media Management Retainer",
    deliverables: [
      "Content Strategy, Editorial Calendar & Creative Assets",
      "Instagram & LinkedIn Publishing, Community & Analytics",
    ],
  },
  copywriting: {
    phrases: [
      "copywriting package",
      "website copy and 4 blog posts",
      "email sequence copywriting",
    ],
    title: "Conversion Copywriting & Content Package",
    deliverables: [
      "Brand Voice Messaging, Landing Page & Funnel Copy",
      "SEO Blog Articles & Automated Email Lifecycle Sequence",
    ],
  },
  video_editing: {
    phrases: [
      "video editing for my YouTube channel",
      "10 short-form video edits",
      "promo video editing",
    ],
    title: "Pro Video Editing & Motion Graphics Package",
    deliverables: [
      "Rough Cut Assembly, Color Grading & Sound Design",
      "Motion Titles, Captions & Multi-Format Exports",
    ],
  },
  crm_setup: {
    phrases: ["HubSpot CRM setup", "CRM setup and automation", "Zoho CRM configuration"],
    title: "Enterprise CRM Setup & Workflow Automation",
    deliverables: [
      "Pipeline Architecture, Custom Fields & Data Migration",
      "Automated Lead Scoring, Email Sequences & Reporting",
    ],
  },
  market_research: {
    phrases: ["market research report", "competitor analysis report", "customer research study"],
    title: "Market Intelligence & Competitor Research Study",
    deliverables: [
      "Competitor Benchmarking, Pricing & TAM Analysis",
      "Customer Segmentation Survey & Strategic Synthesis Deck",
    ],
  },
  ecommerce_setup: {
    phrases: ["Shopify store setup", "e-commerce store build", "online shop setup with payments"],
    title: "Full-Stack E-Commerce Store & Payment Setup",
    deliverables: [
      "Storefront Theme Customization, Catalog & Product Schema",
      "PayPal Smart Checkout, Shipping & Tax Automation",
    ],
  },
  data_cleaning: {
    phrases: [
      "data cleaning and analysis",
      "SQL database design",
      "spreadsheet cleanup and reporting",
    ],
    title: "SQL Database Architecture & Data Cleaning",
    deliverables: [
      "Relational Schema Design, Indexing & Normalization",
      "Automated Data Deduplication, Validation & Reporting",
    ],
  },
  pitch_deck: {
    phrases: ["investor pitch deck", "pitch deck design", "a 15-slide sales deck"],
    title: "Venture Investor Pitch Deck & Narrative Design",
    deliverables: [
      "Storyline Structuring, Financial Modeling & Slide Copy",
      "Custom 15-Slide Visual Design & Editable Master Deck",
    ],
  },
};

function r2(x: number): number {
  return Math.round((x + 1e-9) * 100) / 100;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function hasFuzzyWord(text: string, target: string, maxDist = 2): boolean {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const t = target.toLowerCase();
  for (const tok of tokens) {
    if (tok === t) return true;
    if (Math.abs(tok.length - t.length) <= maxDist && levenshtein(tok, t) <= maxDist) {
      return true;
    }
  }
  return false;
}

export function classifyServiceType(prompt: string): string {
  const lower = prompt.toLowerCase();

  // If formatted like "... i need <service>: ...", extract <service>
  const colonIdx = lower.indexOf(":");
  let candidate = lower;
  if (colonIdx !== -1) {
    const beforeColon = lower.slice(0, colonIdx);
    const needIdx = beforeColon.lastIndexOf("need ");
    if (needIdx !== -1) {
      candidate = beforeColon.slice(needIdx + 5).trim();
    } else {
      candidate = beforeColon.trim();
    }
  }

  let bestKey = "enterprise_ai_audit";
  let bestScore = Infinity;

  for (const [key, info] of Object.entries(SERVICE_TAXONOMY)) {
    for (const phrase of info.phrases) {
      const pLower = phrase.toLowerCase();
      if (candidate === pLower) return key;
      const dist = levenshtein(candidate, pLower) / Math.max(pLower.length, 1);
      if (dist < bestScore) {
        bestScore = dist;
        bestKey = key;
      }
    }
  }

  if (bestScore < 0.45) {
    return bestKey;
  }

  // Fallback keyword matching for general conversational prompts
  if (lower.includes("shopify") || lower.includes("e-commerce") || lower.includes("ecommerce") || lower.includes("shop"))
    return "ecommerce_setup";
  if (lower.includes("crm") || lower.includes("hubspot") || lower.includes("zoho"))
    return "crm_setup";
  if (lower.includes("tableau") || lower.includes("power bi") || lower.includes("dashboard"))
    return "bi_dashboard";
  if (lower.includes("sql") || lower.includes("spreadsheet") || lower.includes("data clean"))
    return "data_cleaning";
  if (lower.includes("pitch") || lower.includes("deck"))
    return "pitch_deck";
  if (lower.includes("youtube") || lower.includes("video"))
    return "video_editing";
  if (lower.includes("copy") || lower.includes("blog") || lower.includes("email sequence"))
    return "copywriting";
  if (lower.includes("social") || lower.includes("instagram") || lower.includes("linkedin"))
    return "social_media_mgmt";
  if (lower.includes("seo") || lower.includes("keyword"))
    return "seo_audit";
  if (lower.includes("market") || lower.includes("competitor") || lower.includes("customer research"))
    return "market_research";
  if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android") || lower.includes("mvp"))
    return "mobile_app_mvp";
  if (lower.includes("website") || lower.includes("landing page"))
    return "website_redesign";
  if (lower.includes("brand") || lower.includes("logo") || lower.includes("rebrand") || lower.includes("design"))
    return "brand_identity";

  return "enterprise_ai_audit";
}

const WORD_PCTS: Array<[string, number]> = [
  ["twenty-five", 25],
  ["fifteen", 15],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["five", 5],
  ["ten", 10],
];

function extractPercentagesFromClause(clause: string): number[] {
  const results: Array<{ index: number; value: number }> = [];
  const lower = clause.toLowerCase();

  // 1. Numeric percentages e.g. 15%, 15 %, 15 percent, 15 pecent
  const numRegex = /(\d+(?:\.\d+)?)\s*(?:%|([a-z]{5,9}))/gi;
  let match: RegExpExecArray | null;
  while ((match = numRegex.exec(lower)) !== null) {
    const val = parseFloat(match[1]);
    const wordAfter = match[2];
    if (!wordAfter || levenshtein(wordAfter, "percent") <= 2) {
      results.push({ index: match.index, value: val });
    }
  }

  // 2. Word percentages e.g. "twenty-five percent", "fifteen pecent"
  const tokens = lower.split(/\s+/);
  let charPos = 0;
  for (let i = 0; i < tokens.length; i++) {
    const cleanTok = tokens[i].replace(/[^a-z-]/g, "");
    const nextTok = (tokens[i + 1] || "").replace(/[^a-z]/g, "");
    if (cleanTok && nextTok && levenshtein(nextTok, "percent") <= 2) {
      // Check hyphenated like twenty-five (with possible typo)
      if (cleanTok.includes("-")) {
        results.push({ index: charPos, value: 25 });
      } else {
        let bestVal: number | null = null;
        let bestDist = 3;
        for (const [w, v] of WORD_PCTS) {
          if (w.includes("-")) continue;
          const d = levenshtein(cleanTok, w);
          const allowed = w.length <= 4 ? 1 : 2;
          if (d <= allowed && d < bestDist) {
            bestDist = d;
            bestVal = v;
          }
        }
        if (bestVal !== null) {
          results.push({ index: charPos, value: bestVal });
        }
      }
    }
    charPos += tokens[i].length + 1;
  }

  results.sort((a, b) => a.index - b.index);
  return results.map((r) => r.value);
}

function extractMoneyFromClause(clause: string): number | null {
  // Check for k notation first: e.g. 5k, $5k, 1k
  const kMatch = clause.match(/\$?\b(\d+)\s*k\b/i);
  if (kMatch) {
    return parseInt(kMatch[1], 10) * 1000;
  }

  // Check for $-500, $0, $1,080, USD 1,080, 10850 USD, 950 dollars
  const moneyRegex =
    /\$\s*(-?\d{1,3}(?:,\d{3})+|-?\d+(?:\.\d+)?)|(?:usd\s*)(-?\d{1,3}(?:,\d{3})+|-?\d+(?:\.\d+)?)|(-?\d{1,3}(?:,\d{3})+|-?\d+(?:\.\d+)?)\s*(?:usd|d[a-z]{4,7}s?)\b/i;
  const m = clause.match(moneyRegex);
  if (m) {
    const raw = (m[1] || m[2] || m[3]).replace(/,/g, "");
    const val = parseFloat(raw);
    if (!isNaN(val)) return val;
  }
  return null;
}

function extractMilestoneCount(clause: string): number | null {
  const numMatch = clause.match(/\b([234])\b/);
  if (numMatch) return parseInt(numMatch[1], 10);
  if (hasFuzzyWord(clause, "two", 1)) return 2;
  if (hasFuzzyWord(clause, "three", 2)) return 3;
  if (hasFuzzyWord(clause, "four", 1)) return 4;
  return null;
}

/**
 * Evaluates a natural language deal prompt using the rules and guardrails from agent_training_file.
 */
export function evaluateDealPrompt(prompt: string): DealEvaluation {
  const service_type = classifyServiceType(prompt);

  // Extract body after ':' if present, else full prompt
  const colonIdx = prompt.indexOf(":");
  const body = colonIdx !== -1 ? prompt.slice(colonIdx + 1) : prompt;

  // Split body into clauses (commas inside numbers like 1,000 have no space after the comma)
  const clauses = body
    .split(
      /;|\s+-\s+|\.(?!\d)|,\s+|\s+and\s+(?=(?:a\s+)?\d|\b(?:put|pay|deposit|with|take|can|split|budget|base|around|my))|(?=\(\$\d)/i
    )
    .map((c) => c.trim())
    .filter(Boolean);

  let base_price: number | null = null;
  let d_pct: number | null = null;
  let r_pct: number | null = null;
  let dep_amt: number | null = null;
  let milestones: number | null = null;
  let selfCorrection = false;
  let explicitMissingPrice = false;

  for (const clause of clauses) {
    const lower = clause.toLowerCase();
    const pcts = extractPercentagesFromClause(clause);

    // 1. Check for self-correction on discount ("10% off... actually make it 20% off")
    if (
      (clause.includes("..") || hasFuzzyWord(clause, "actually", 2) || lower.includes("make it")) &&
      pcts.length >= 2
    ) {
      d_pct = pcts[pcts.length - 1];
      selfCorrection = true;
      continue;
    }

    // 2. Check for milestone split clause ("split the rest into 3 milestones", "two milestones for the balance", "3 payments after the deposit")
    const isMilestoneSplit =
      hasFuzzyWord(clause, "split", 2) ||
      hasFuzzyWord(clause, "balance", 2) ||
      lower.includes("after the") ||
      hasFuzzyWord(clause, "payments", 2) ||
      (hasFuzzyWord(clause, "milestones", 2) && !pcts.length);

    if (isMilestoneSplit) {
      const mc = extractMilestoneCount(clause);
      if (mc !== null) {
        milestones = mc;
        continue;
      }
    }

    // 3. Check for discount clause
    const isDiscount =
      /\boff\b/i.test(clause) ||
      hasFuzzyWord(clause, "discount", 2) ||
      hasFuzzyWord(clause, "knock", 1) ||
      hasFuzzyWord(clause, "promised", 2) ||
      hasFuzzyWord(clause, "returning", 2);

    if (isDiscount && pcts.length > 0) {
      d_pct = pcts[pcts.length - 1];
      continue;
    }

    // 4. Check for deposit rate clause
    const isDepositRate =
      pcts.length > 0 &&
      (hasFuzzyWord(clause, "deposit", 2) ||
        hasFuzzyWord(clause, "upfront", 2) ||
        hasFuzzyWord(clause, "milestone", 2) ||
        hasFuzzyWord(clause, "delivery", 2) ||
        hasFuzzyWord(clause, "start", 2) ||
        hasFuzzyWord(clause, "first", 2) ||
        lower.includes("put down"));

    if (isDepositRate) {
      r_pct = pcts[0];
      continue;
    }

    // 5. Check for explicit missing budget ("not sure on budget yet")
    if (lower.includes("not sure") || (hasFuzzyWord(clause, "budget", 2) && extractMoneyFromClause(clause) === null)) {
      explicitMissingPrice = true;
      continue;
    }

    // 6. Check for deposit amount vs base price
    const moneyVal = extractMoneyFromClause(clause);
    if (moneyVal !== null) {
      const isDepositAmt =
        hasFuzzyWord(clause, "deposit", 2) ||
        hasFuzzyWord(clause, "upfront", 2) ||
        lower.includes("i'll pay") ||
        lower.includes("ill pay");

      if (isDepositAmt) {
        dep_amt = moneyVal;
      } else {
        base_price = moneyVal;
      }
    }
  }

  // Default discount to 0.0 when not mentioned
  const d = d_pct !== null ? d_pct / 100 : 0.0;
  const r = r_pct !== null ? r_pct / 100 : null;

  // Guardrail 1: Invalid discount (>= 100%)
  if (d_pct !== null && d_pct >= 100) {
    return {
      status: "invalid",
      service_type,
      base_price,
      discount_rate: null,
      deposit_rate: r,
      total: null,
      deposit: null,
      remaining: null,
      milestones: null,
      issue: "invalid_discount",
    };
  }

  // Guardrail 2: Invalid deposit (> 100%)
  if (r_pct !== null && r_pct > 100) {
    const total = base_price !== null && base_price > 0 ? r2(base_price * (1 - d)) : null;
    return {
      status: "invalid",
      service_type,
      base_price,
      discount_rate: d,
      deposit_rate: null,
      total,
      deposit: null,
      remaining: null,
      milestones: null,
      issue: "invalid_deposit",
    };
  }

  // Guardrail 3: Non-positive base price (<= 0)
  if (base_price !== null && base_price <= 0) {
    return {
      status: "invalid",
      service_type,
      base_price,
      discount_rate: d,
      deposit_rate: r,
      total: null,
      deposit: null,
      remaining: null,
      milestones: null,
      issue: "invalid_price",
    };
  }

  // Guardrail 4: Missing base price
  if (base_price === null || explicitMissingPrice) {
    return {
      status: "needs_clarification",
      service_type,
      base_price: null,
      discount_rate: d,
      deposit_rate: r,
      total: null,
      deposit: null,
      remaining: null,
      milestones: null,
      issue: "missing_price",
    };
  }

  const total = r2(base_price * (1 - d));

  // Guardrail 5: Missing deposit
  if (r === null && dep_amt === null) {
    return {
      status: "needs_clarification",
      service_type,
      base_price,
      discount_rate: d,
      deposit_rate: null,
      total,
      deposit: null,
      remaining: null,
      milestones: null,
      issue: "missing_deposit",
    };
  }

  // Valid deal calculation: Total = P(1 - d), Deposit = r * Total (or dep_amt)
  let deposit: number;
  let finalDepositRate: number;
  if (dep_amt !== null) {
    deposit = r2(dep_amt);
    finalDepositRate = Number((deposit / total).toFixed(4));
  } else {
    finalDepositRate = r!;
    deposit = r2(finalDepositRate * total);
  }
  const remaining = r2(total - deposit);

  return {
    status: "ok",
    service_type,
    base_price,
    discount_rate: d,
    deposit_rate: finalDepositRate,
    total,
    deposit,
    remaining,
    milestones,
    issue: selfCorrection ? "self_correction_use_last_value" : null,
  };
}

/**
 * Converts a valid DealEvaluation into a structured CommercialQuote for the CommerceCanvas.
 */
export function buildQuoteFromEvaluation(evalResult: DealEvaluation): CommercialQuote {
  const taxonomy =
    SERVICE_TAXONOMY[evalResult.service_type] || SERVICE_TAXONOMY.enterprise_ai_audit;
  const total = evalResult.total ?? 807.5;
  const basePrice = evalResult.base_price ?? 950;
  const discountRate = evalResult.discount_rate ?? 0;
  const depositRate = evalResult.deposit_rate ?? 0.4;
  const deposit = evalResult.deposit ?? r2(total * depositRate);
  const remaining = evalResult.remaining ?? r2(total - deposit);

  const item1Price = r2(total * 0.6);
  const item2Price = r2(total - item1Price);

  const items: QuoteItem[] = [
    {
      name: taxonomy.deliverables[0],
      quantity: "1",
      price: item1Price,
      description: "Scoped and verified by PayAgent autonomous reasoning engine.",
    },
    {
      name: taxonomy.deliverables[1],
      quantity: "1",
      price: item2Price,
      description: "Final production delivery governed by PayPal Milestone Escrow.",
    },
  ];

  const depositPct = Math.round(depositRate * 100);
  const remPct = Math.max(0, 100 - depositPct);
  const numBalanceMilestones = evalResult.milestones || 1;

  const milestoneList: Milestone[] = [
    {
      name: "Milestone 1: Upfront Escrow Deposit",
      percentage: depositPct,
      amount: deposit,
      status: "pending",
    },
  ];

  if (numBalanceMilestones <= 1) {
    milestoneList.push({
      name: "Milestone 2: Final Delivery & Sign-off",
      percentage: remPct,
      amount: remaining,
      status: "pending",
    });
  } else {
    let allocatedAmount = 0;
    let allocatedPct = 0;
    for (let i = 1; i <= numBalanceMilestones; i++) {
      const isLast = i === numBalanceMilestones;
      const mAmt = isLast
        ? r2(remaining - allocatedAmount)
        : r2(remaining / numBalanceMilestones);
      const mPct = isLast
        ? Math.max(1, remPct - allocatedPct)
        : Math.floor(remPct / numBalanceMilestones);
      allocatedAmount = r2(allocatedAmount + mAmt);
      allocatedPct += mPct;
      milestoneList.push({
        name: `Milestone ${i + 1}: Balance Tranche ${i}/${numBalanceMilestones}`,
        percentage: mPct,
        amount: mAmt,
        status: "pending",
      });
    }
  }

  return {
    title: taxonomy.title,
    description: `Structured ${evalResult.service_type.replace(/_/g, " ")} contract (${
      discountRate > 0 ? `${Math.round(discountRate * 100)}% discount, ` : ""
    }${depositPct}% upfront deposit${
      evalResult.milestones ? `, balance split across ${evalResult.milestones} milestones` : ""
    }).`,
    basePrice,
    discountRate,
    depositRate,
    totalAmount: total,
    currency: "USD",
    items,
    milestones: milestoneList,
    terms: "Governed by PayPal Buyer & Seller Protection. Funds released upon milestone verification.",
  };
}
