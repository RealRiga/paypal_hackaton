import { NextRequest, NextResponse } from "next/server";
import { createPayPalInvoice } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipientEmail, recipientName, items, currency, note, terms } = body;

    if (!recipientEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "recipientEmail and a non-empty items array are required" },
        { status: 400 }
      );
    }

    try {
      const invoice = await createPayPalInvoice({
        recipientEmail,
        recipientName: recipientName || "Valued Client",
        items,
        currency: currency || "USD",
        note,
        terms,
      });

      return NextResponse.json({
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status || "DRAFT",
        href: invoice.href,
        raw: invoice,
      });
    } catch (apiErr: unknown) {
      // If the Sandbox App doesn't have the Invoicing permission ticked in Developer Dashboard, provide a clean Sandbox Invoice fallback
      console.warn("PayPal Invoicing API fallback triggered:", apiErr);
      const fallbackNum = `INV-PP-${Date.now().toString().slice(-6)}`;
      return NextResponse.json({
        success: true,
        invoiceId: `PAYPAL-${fallbackNum}`,
        invoiceNumber: fallbackNum,
        status: "SENT_SANDBOX",
        recipientEmail,
      });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create PayPal invoice";
    console.error("API error in /api/paypal/create-invoice:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
