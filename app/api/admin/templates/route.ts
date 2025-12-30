import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const presentationId = formData.get("presentationId") as string;
    const slideID_mau = formData.get("slideID_mau") as string;

    if (!presentationId || !slideID_mau) {
      return NextResponse.json(
        { success: false, message: "Missing PresentationID or slideID_mau" },
        { status: 400 }
      );
    }

    /* =========================
       GỌI WEBHOOK N8N (PRODUCTION)
    ========================= */
    const res = await fetch(
      "https://n8n.happywork.com.vn/webhook/nhan_ban_slide_edit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          PresentationID: presentationId,
          slideID_mau: slideID_mau,
        }),
      }
    );

    const text = await res.text();
    console.log("✅ N8N response:", res.status, text);

    return NextResponse.json({
      success: true,
      message: "Sent data to n8n webhook successfully",
    });
  } catch (err) {
    console.error("❌ ADMIN template POST error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
