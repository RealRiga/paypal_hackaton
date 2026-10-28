import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const captureResult = await capturePayPalOrder(orderId);

    // Extract key confirmation details for the Agentic Ledger
    const captureUnit = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const payer = captureResult.payer;

    return NextResponse.json({
      success: true,
      orderId: captureResult.id,
      status: captureResult.status,
      captureId: captureUnit?.id,
      amount: captureUnit?.amount?.value,
      currency: captureUnit?.amount?.currency_code,
      payerEmail: payer?.email_address,
      payerName: `${payer?.name?.given_name || ""} ${payer?.name?.surname || ""}`.trim(),
      raw: captureResult,
    });
  } catch (error: any) {
    console.error("API error in /api/paypal/capture-order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
