import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "USD", description, items, referenceId } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "A valid positive numeric amount is required" },
        { status: 400 }
      );
    }

    const order = await createPayPalOrder({
      amount: Number(amount),
      currency,
      description,
      items,
      referenceId,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      links: order.links,
      raw: order,
    });
  } catch (error: any) {
    console.error("API error in /api/paypal/create-order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
