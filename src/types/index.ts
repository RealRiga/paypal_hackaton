export interface QuoteItem {
  name: string;
  quantity: string | number;
  price: number;
  description?: string;
}

export interface Milestone {
  name: string;
  percentage: number;
  amount: number;
  status: "pending" | "released" | "disputed";
}

export interface CommercialQuote {
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  items: QuoteItem[];
  milestones: Milestone[];
  terms: string;
}

export interface TransactionRecord {
  orderId?: string;
  captureId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  payerName?: string;
  payerEmail?: string;
  timestamp?: string;
  transactionId?: string;
}

export interface AgentAction {
  type: string;
  quote?: CommercialQuote;
  invoiceId?: string;
  payload?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  thoughtProcess?: string[];
  action?: AgentAction;
  timestamp: string;
}
