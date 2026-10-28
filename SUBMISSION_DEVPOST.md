# Devpost Submission Kit: PayAgent
### For the PayPal AI Hackathon (paypalaihackathon.devpost.com)

---

## 🏷️ Basic Information
* **Project Name:** PayAgent
* **Tagline:** Autonomous AI Commercial Negotiation & Instant PayPal Settlement
* **Target Categories:** 
  * 🥇 Best Use of Agentic Commerce ($5,000)
  * 🏆 Best Use of PayPal + AI ($5,000)
  * 🌟 Grand Prize Overall ($12,000)

---

## 📝 Submission Form Fields (Copy & Paste to Devpost)

### Inspiration
Traditional commercial transactions—from freelance contracts to B2B purchase orders—suffer from extreme friction. Buyers and sellers waste days trading unstructured emails, haggling over deliverables in PDFs, creating manual quotes, and chasing unpaid invoices. We asked ourselves: *What if an autonomous AI agent could sit between both parties, negotiate mutually beneficial scopes and milestone schedules in plain English, and instantly execute verifiable settlements using PayPal?* That inspired **PayAgent**.

### What It Does
PayAgent is an end-to-end Agentic Commerce platform that converts conversational natural language into executed PayPal payments:
1. **Autonomous Commercial Negotiation:** A client describes what they need and their budget. PayAgent analyzes constraints, generates itemized scopes, calculates dynamic discounts, and breaks projects into risk-mitigating milestone escrows.
2. **Real-time Dual Canvas:** As the conversation evolves, the right-hand canvas dynamically updates the commercial agreement, line items, and smart escrow milestones.
3. **Instant PayPal Execution:** PayAgent integrates directly with PayPal REST API v2:
   - Mounts native PayPal Smart Buttons inside the chat and terminal.
   - Creates authenticated PayPal orders (`/v2/checkout/orders`) with intent `CAPTURE`.
   - Captures authorized transactions and issues cryptographically verifiable transaction receipts.
   - Generates official PayPal Invoices (`/v2/invoicing/invoices`) sent directly to recipient inboxes.
4. **Agentic Verified Ledger:** An immutable audit log displaying confirmed capture IDs, payer details, and timestamps for total accounting compliance.

### How We Built It
* **Frontend:** Built with Next.js 16 (App Router, Turbopack, React 19) and TypeScript. Styled with a custom dark-mode glassmorphic fintech design inspired by Linear and Stripe.
* **PayPal Integration:** Utilizes `@paypal/react-paypal-js` on the client and server-side PayPal REST API v2 endpoints on the backend with OAuth2 Client Credentials caching.
* **Agentic Reasoning Engine:** Implemented an autonomous multi-step reasoning system that extracts financial entities, parses deliverable scopes, constructs milestone release schedules, and triggers PayPal API tools.

### Challenges We Ran Into
* **Dual-Pane State Synchronization:** Synchronizing rapid conversational state changes with PayPal Order IDs and dynamic line item breakdowns required careful state design to prevent stale purchase units during checkout.
* **PayPal REST Token Caching:** Optimizing OAuth2 token generation to handle high-frequency requests without incurring redundant round-trip latencies, resolved via an in-memory TTL token cache.

### Accomplishments That We're Proud Of
* Achieving real, live PayPal Sandbox order creation and payment capture in under 2 seconds.
* Crafting a modern, high-polish UI with transparent "Agent Thought Process" accordions showing step-by-step financial reasoning.
* Creating a truly practical use case for Agentic Commerce that solves real pain points for freelancers, agencies, and online merchants.

### What We Learned
* Deep understanding of the PayPal REST API v2 architecture, particularly how purchase unit breakdowns and milestone intents map into modern agentic workflows.
* Best practices for designing agentic UIs that give users confidence and control when financial actions are triggered.

### What's Next for PayAgent
* **Multi-Party Escrow Contracts:** Smart conditional escrow release using automated GitHub PR merges and webhooks.
* **PayPal Subscriptions & Recurring Agent Retainers:** Autonomous monthly retainer management for ongoing services.
* **Cross-border Currency Intelligence:** Multi-currency real-time conversion and hedging for international contracts.

---

## 🎬 2-Minute Video Demo Script (Record this for your submission)

| Timestamp | Screen Action | Voiceover Script |
|---|---|---|
| **0:00 - 0:25** | Show PayAgent homepage at `http://localhost:3000`. Highlight the sleek dark interface, the "PayPal: Sandbox Live" badge, and the dual-pane layout. | *"Welcome to PayAgent, the autonomous agentic commerce platform built for the PayPal AI Hackathon. Freelancers and businesses lose countless hours haggling over scopes, drafting invoices, and waiting for payments. PayAgent solves this by uniting conversational AI with real-time PayPal settlement."* |
| **0:25 - 0:55** | In the chat, click the prompt: *"Brand Identity Design with a 15% discount for immediate PayPal checkout ($750)"* (or type a custom deal). Show the agent thinking. | *"Let's see it in action. Here, a client wants a brand identity package with a discount. Notice the Agent Thought Process accordion—PayAgent analyzes budget constraints, calculates a win-win counter-offer, and automatically updates our live commercial contract on the right canvas with itemized deliverables and milestone escrows."* |
| **0:55 - 1:25** | Click the **PayPal Terminal** tab. Click the golden **PayPal** button. Sign in with the Sandbox test buyer and click "Pay Now". | *"When both parties agree, settlement is instantaneous. PayAgent connects directly to the PayPal REST API v2. By clicking the PayPal button, our backend creates an authorized order with live purchase units. We log into our sandbox account, click Pay Now, and the payment is captured in real-time."* |
| **1:25 - 1:50** | Show the celebration confetti, then switch to the **Verified Ledger** tab showing the Capture ID and payer details. | *"Upon capture, PayAgent automatically records the transaction in our Verified Ledger with the unique PayPal capture ID, timestamp, and payer details, updating the project milestones to funded."* |
| **1:50 - 2:00** | Wrap up on the main screen with the logo visible. | *"PayAgent represents the future of agentic commerce—fast, transparent, and settled on PayPal. Thank you!"* |
