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

## Inspiration

Most commercial deals start with friction. Freelancers and small businesses trade emails, argue over scope in PDFs, hand-write quotes, and then chase invoices for weeks. We asked: **what if an agent could turn a plain-English conversation into a structured deal and settle it on the spot?** PayPal already handles trust and payments for millions of people, so pairing it with a conversational agent felt like a natural fit for agentic commerce.

## What it does

**PayAgent** is a dual-pane commerce app. The buyer chats on the left, and a live agreement canvas updates on the right.

1. **Describe the deal.** For example: *"I need an enterprise AI audit with a 15% discount and a 40% milestone deposit ($950)."*
2. **The agent structures it.** It extracts the budget and constraints, builds itemized deliverables, applies discounts, and proposes an upfront deposit plus a milestone schedule. An **Agent Thought Process** accordion shows each step of the reasoning.
3. **Pay with PayPal.** The backend creates a PayPal order (Orders API v2, intent `CAPTURE`) and the PayPal Smart Button completes checkout in the sandbox. PayAgent can also generate PayPal invoices via the Invoicing API v2.
4. **Verified Ledger.** After a successful capture, the app celebrates with confetti and records the capture ID, payer details, and timestamp.

The pricing logic is simple and transparent. For a base price \( P \), discount rate \( d \), and deposit rate \( r \):

$$
\text{Total} = P\,(1 - d), \qquad \text{Deposit} = r \cdot P\,(1 - d)
$$

For example, with \( P = 950 \), \( d = 0.15 \), and \( r = 0.40 \), the total is \$807.50 and the upfront deposit is \$323.00, leaving \$484.50 to be released across milestones.

## How we built it

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, and TypeScript in strict mode, styled with Tailwind CSS v4 in a dark/light glassmorphic fintech look inspired by Linear and Stripe.
- **Payments:** `@paypal/react-paypal-js` for the client-side Smart Buttons, with server-side calls to the PayPal REST API v2 for order creation, capture, and invoicing. OAuth2 client-credentials tokens are cached in memory with a TTL.
- **Agent engine:** a multi-step reasoning pipeline that extracts financial entities, parses scope, builds the milestone schedule, and triggers PayPal tools. It works out of the box with no external key, and Gemini or OpenAI keys can be added as optional extras.
- **Polish:** `lucide-react` icons and `canvas-confetti` for the payment celebration.

## Challenges we ran into

- **Keeping two panes in sync.** Conversation changes, line items, and PayPal order IDs all had to stay consistent, or a buyer could end up paying for a stale purchase unit. We designed the state so the order is always created from the latest agreed terms.
- **Token overhead.** Requesting a new PayPal OAuth2 token on every call added needless latency, so we added an in-memory TTL cache.
- **Building trust into the UI.** Financial actions need to feel safe, so we made the agent's reasoning visible and kept the buyer in control of the final payment click.

## Accomplishments that we're proud of

- A working end-to-end flow from chat to sandbox order creation to capture to ledger entry.
- A polished, transparent agent UI that shows its reasoning instead of acting as a black box.
- A practical use case for freelancers, agencies, and online merchants.

## What we learned

- How PayPal REST API v2 purchase units, captures, and invoices map onto an agentic workflow.
- How to design agent interfaces that give users confidence and control when money is involved.

## What's next for PayAgent

- **Conditional escrow release** triggered by deliverable events such as GitHub PR merges and webhooks.
- **PayPal Subscriptions** for recurring agent-managed retainers.
- **Multi-currency support** with real-time conversion for cross-border contracts.

---

## 🎬 2-Minute Video Demo Script (Record this for your submission)

| Timestamp | Screen Action | Voiceover Script |
|---|---|---|
| **0:00 - 0:25** | Show PayAgent homepage at `http://localhost:3000`. Highlight the sleek dark interface, the "PayPal: Sandbox Live" badge, and the dual-pane layout. | *"Welcome to PayAgent, the autonomous agentic commerce platform built for the PayPal AI Hackathon. Freelancers and businesses lose countless hours haggling over scopes, drafting invoices, and waiting for payments. PayAgent solves this by uniting conversational AI with real-time PayPal settlement."* |
| **0:25 - 0:55** | In the chat, click the prompt: *"Brand Identity Design with a 15% discount for immediate PayPal checkout ($750)"* (or type a custom deal). Show the agent thinking. | *"Let's see it in action. Here, a client wants a brand identity package with a discount. Notice the Agent Thought Process accordion—PayAgent analyzes budget constraints, calculates a win-win counter-offer, and automatically updates our live commercial contract on the right canvas with itemized deliverables and milestone escrows."* |
| **0:55 - 1:25** | Click the **PayPal Terminal** tab. Click the golden **PayPal** button. Sign in with the Sandbox test buyer and click "Pay Now". | *"When both parties agree, settlement is instantaneous. PayAgent connects directly to the PayPal REST API v2. By clicking the PayPal button, our backend creates an authorized order with live purchase units. We log into our sandbox account, click Pay Now, and the payment is captured in real-time."* |
| **1:25 - 1:50** | Show the celebration confetti, then switch to the **Verified Ledger** tab showing the Capture ID and payer details. | *"Upon capture, PayAgent automatically records the transaction in our Verified Ledger with the unique PayPal capture ID, timestamp, and payer details, updating the project milestones to funded."* |
| **1:50 - 2:00** | Wrap up on the main screen with the logo visible. | *"PayAgent represents the future of agentic commerce—fast, transparent, and settled on PayPal. Thank you!"* |
