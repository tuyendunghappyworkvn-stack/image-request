import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const presentationId = formData.get("presentationId") as string;
    const slideID_mau = formData.get("slideID_mau") as string;

    if (!presentationId || !slideID_mau) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    /* =========================
       TODO: UPLOAD TEMPLATE
       (ảnh, style, jobCount...)
    ========================= */

    /* =========================
       GỌI WEBHOOK N8N (ADMIN)
    ========================= */
    await fetch(
      "https://n8n.happywork.com.vn/webhook-test/nhan_ban_slide_edit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PresentationID: presentationId,
          slideID_mau: slideID_mau,
        }),
      }
    );

    return NextResponse.json({
      success: true,
      message: "Admin upload + trigger n8n OK",
    });
  } catch (err) {
    console.error("❌ ADMIN upload error:", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
