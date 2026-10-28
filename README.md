# PayAgent — Autonomous AI Agentic Commerce & Instant PayPal Settlement

> **Submitted to the PayPal AI Hackathon ($67,500 Cash Prize Pool)**  
> *Target Track: Best Use of Agentic Commerce & Overall Grand Prize*

PayAgent is an autonomous commerce platform that unites conversational AI negotiation with real-time **PayPal REST API v2** settlement. Instead of back-and-forth email chains, static PDF quotes, and manual billing, PayAgent enables buyers and sellers to negotiate custom deliverables, structured milestone escrows, and instant one-click checkouts directly through an intelligent agent.

---

## 🌟 Key Features

1. **Autonomous Commercial Reasoning:**
   - Interprets project scopes, deliverable breakdowns, and budget constraints.
   - Dynamically calculates line items, discounts, upfront deposits, and smart milestone release schedules.
   - Transparent **Agent Thought Process** accordion displaying every analytical and financial step.

2. **Native PayPal REST API v2 Integration:**
   - **PayPal Smart Buttons:** Client-side `@paypal/react-paypal-js` integration for zero-friction sandbox payments.
   - **Orders API v2:** Backend creation (`/v2/checkout/orders`) with intent `CAPTURE` and authorized verification.
   - **Invoicing API v2:** Instant generation of official draft and sent PayPal invoices (`/v2/invoicing/invoices`).
   - **Milestone Escrow:** Verifiable release protocol releasing milestone funds upon deliverable confirmation.

3. **Live Synchronized Canvas:**
   - Dual-pane interface: Conversational dialogue on the left, synchronized agreement canvas on the right.
   - Real-time updates as terms change during the chat.
   - **Verified Ledger:** Immutable audit trail logging PayPal capture IDs, payer information, and timestamps.

4. **Fintech Design Aesthetics:**
   - Dark-mode glassmorphic styling (Linear & Stripe inspired).
   - Animated status badges and celebration confetti upon confirmed PayPal captures.

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Languages:** TypeScript
- **Styling:** Tailwind CSS & Glassmorphism design system
- **Payment Engine:** PayPal REST API v2 & `@paypal/react-paypal-js`
- **Icons & Visuals:** `lucide-react`, `canvas-confetti`

---

## 🚀 Quickstart & Setup

### 1. Clone & Install Dependencies
```bash
cd me/hackaton
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with your PayPal Sandbox credentials:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# Optional: Add GEMINI_API_KEY or OPENAI_API_KEY
# (PayAgent includes a built-in reasoning engine that works without any external key!)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing with PayPal Sandbox

1. In PayAgent, click any of the preset prompts or type:
   > *"I need an enterprise AI audit with a 15% discount and 40% milestone deposit ($950)"*
2. PayAgent will synthesize the agreement and display it on the canvas.
3. Click **"Launch PayPal Terminal"** or click the golden **PayPal** button.
4. Log in using your PayPal Sandbox Buyer account (or test credentials).
5. Watch the payment capture, the confetti celebration, and inspect the newly created entry in the **Verified Ledger** tab!

---

## 📄 License
MIT License. Created for the PayPal AI Hackathon.
