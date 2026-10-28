/**
 * PayPal REST API v2 Integration Module
 * Handles OAuth2 authentication, Orders API, and Invoicing API.
 */

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

/**
 * Retrieves a valid OAuth2 bearer access token using client credentials grant.
 * Caches token until 60 seconds before expiration.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    return cachedToken.accessToken;
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "Missing PayPal credentials. Ensure NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are defined in .env.local"
    );
  }

  const authString = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal OAuth failed:", errorText);
    throw new Error(`PayPal OAuth authentication failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

export interface LineItem {
  name: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  description?: string;
}

/**
 * Creates a PayPal Order using Orders API v2
 */
export async function createPayPalOrder(params: {
  amount: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  items?: LineItem[];
}) {
  const accessToken = await getPayPalAccessToken();
  const currency = params.currency || "USD";
  const amountStr = params.amount.toFixed(2);

  const purchaseUnit: any = {
    reference_id: params.referenceId || `PAYAGENT-${Date.now()}`,
    description: params.description || "PayAgent Autonomous Commercial Settlement",
    amount: {
      currency_code: currency,
      value: amountStr,
    },
  };

  if (params.items && params.items.length > 0) {
    purchaseUnit.items = params.items;
    purchaseUnit.amount.breakdown = {
      item_total: {
        currency_code: currency,
        value: amountStr,
      },
    };
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      application_context: {
        brand_name: "PayAgent Commerce",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: "https://localhost:3000/checkout/success",
        cancel_url: "https://localhost:3000/checkout/cancel",
      },
    }),
  });

  const orderData = await response.json();
  if (!response.ok) {
    console.error("Failed to create PayPal order:", orderData);
    throw new Error(orderData.message || "Failed to create order with PayPal");
  }

  return orderData;
}

/**
 * Captures payment for an authorized PayPal Order
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `capture-${Date.now()}`,
    },
  });

  const captureData = await response.json();
  if (!response.ok) {
    console.error("Failed to capture PayPal order:", captureData);
    throw new Error(captureData.message || "Failed to capture payment with PayPal");
  }

  return captureData;
}

/**
 * Generates an official draft/send PayPal Invoice using Invoicing API v2
 */
export async function createPayPalInvoice(params: {
  recipientEmail: string;
  recipientName: string;
  items: LineItem[];
  currency?: string;
  note?: string;
  terms?: string;
}) {
  const accessToken = await getPayPalAccessToken();
  const currency = params.currency || "USD";

  // Step 1: Generate next invoice number
  const numRes = await fetch(`${PAYPAL_API_BASE}/v2/invoicing/generate-next-invoice-number`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const numData = await numRes.json();
  const invoiceNumber = numData.invoice_number || `INV-${Date.now().toString().slice(-6)}`;

  // Step 2: Create draft invoice
  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const invoicePayload = {
    detail: {
      invoice_number: invoiceNumber,
      invoice_date: today,
      payment_term: {
        term_type: "NET_14",
        due_date: dueDate,
      },
      currency_code: currency,
      note: params.note || "Negotiated and verified via PayAgent Autonomous Commerce",
      terms_and_conditions: params.terms || "Standard commercial agreement subject to deliverable satisfaction.",
    },
    invoicer: {
      name: {
        given_name: "PayAgent",
        surname: "Commerce Merchant",
      },
      email_address: "merchant@payagent.ai",
    },
    primary_recipients: [
      {
        billing_info: {
          name: {
            given_name: params.recipientName.split(" ")[0] || "Valued",
            surname: params.recipientName.split(" ")[1] || "Client",
          },
          email_address: params.recipientEmail,
        },
      },
    ],
    items: params.items.map((it) => ({
      name: it.name,
      description: it.description || "",
      quantity: it.quantity,
      unit_amount: {
        currency_code: it.unit_amount.currency_code,
        value: it.unit_amount.value,
      },
      unit_of_measure: "QUANTITY",
    })),
  };

  const createRes = await fetch(`${PAYPAL_API_BASE}/v2/invoicing/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoicePayload),
  });

  const invoiceRes = await createRes.json();
  if (!createRes.ok) {
    console.error("Failed to create PayPal invoice:", invoiceRes);
    throw new Error(invoiceRes.message || "Failed to create PayPal invoice");
  }

  return {
    ...invoiceRes,
    invoice_number: invoiceNumber,
  };
}
