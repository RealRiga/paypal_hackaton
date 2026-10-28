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
      status: invoice.status,
      href: invoice.href,
      raw: invoice,
    });
  } catch (error: any) {
    console.error("API error in /api/paypal/create-invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal invoice" },
      { status: 500 }
    );
  }
}
