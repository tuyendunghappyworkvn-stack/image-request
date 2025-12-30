import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

/* =========================
   GET TENANT TOKEN
========================= */
async function getTenantToken() {
  const res = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: process.env.LARK_APP_ID,
        app_secret: process.env.LARK_APP_SECRET,
      }),
    }
  );

  const data = await res.json();
  return data.tenant_access_token;
}

/* =========================
   CREATE TEMPLATE
========================= */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    /* ===== BASIC DATA (GIỮ NGUYÊN) ===== */
    const file = formData.get("file") as File;
    const style = String(formData.get("style") || "").trim();

    const jobCount =
      Number(formData.get("jobCount")) ||
      Number(formData.get("job_count")) ||
      Number(formData.get("job"));

    /* ===== FIELD CŨ (GIỮ NGUYÊN) ===== */
    const presentationId = String(
      formData.get("presentation_id") || ""
    ).trim();

    const slideIdMau = String(
      formData.get("slide_id_mau") || ""
    ).trim();

    const textJD =
      String(formData.get("text_jd") || "").toLowerCase() === "true";

    /* ===== 4 FIELD ĐÃ CÓ (GIỮ NGUYÊN) ===== */
    const congViecLimit = Number(formData.get("cong_viec_limit") || 0);
    const quyenLoiLimit = Number(formData.get("quyen_loi_limit") || 0);
    const yeuCauLimit = Number(formData.get("yeu_cau_limit") || 0);
    const dauDong = String(formData.get("Dấu đầu dòng") || "");

    /* ===== LINK SLIDE MẪU ===== */
    const slideLink = String(formData.get("slide_link") || "");

    /* ===== VALIDATE (GIỮ NGUYÊN) ===== */
    if (!file || !style || Number.isNaN(jobCount)) {
      return NextResponse.json(
        { error: "Missing file / style / jobCount" },
        { status: 400 }
      );
    }

    /* =========================
       1️⃣ UPLOAD IMAGE → BLOB
    ========================= */
    const templateCode = `${style}_${jobCount}`;

    const blob = await put(
      `templates/${templateCode}-${Date.now()}.png`,
      file,
      { access: "public" }
    );

    /* =========================
       2️⃣ GET TOKEN
    ========================= */
    const tenantToken = await getTenantToken();

    /* =========================
       3️⃣ CREATE LARK RECORD
       (GIỮ NGUYÊN LOGIC)
    ========================= */
    const larkRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.LARK_BASE_ID}/tables/${process.env.LARK_TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tenantToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            template_code: templateCode,
            style,
            job_count: Number(jobCount),
            thumbnail: blob.url,
            is_active: true,

            // 🔒 CỘT CŨ
            PresentationID: presentationId,
            slideID_mau: slideIdMau,
            text_jd: textJD,

            // 🔒 CỘT GIỚI HẠN
            cong_viec_limit: congViecLimit,
            quyen_loi_limit: quyenLoiLimit,
            yeu_cau_limit: yeuCauLimit,
            "Dấu đầu dòng": dauDong,

            // 🔒 LINK SLIDE MẪU
            "Link slide mẫu": slideLink,
          },
        }),
      }
    );

    const larkData = await larkRes.json();

    /* =========================
       4️⃣ GỌI WEBHOOK N8N
       (CHỈ GỬI DATA – KHÔNG ẢNH HƯỞNG USER)
    ========================= */
    if (presentationId && slideIdMau) {
      try {
        const n8nRes = await fetch(
          "https://n8n.happywork.com.vn/webhook-test/nhan_ban_slide_edit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              PresentationID: presentationId,
              slideID_mau: slideIdMau,
            }),
          }
        );

        const n8nText = await n8nRes.text();
        console.log("✅ N8N webhook response:", n8nRes.status, n8nText);
      } catch (err) {
        console.error("❌ Call n8n webhook failed:", err);
      }
    }

    /* =========================
       RESPONSE
    ========================= */
    return NextResponse.json({
      success: true,
      template_code: templateCode,
      thumbnail: blob.url,
      lark: larkData,
    });
  } catch (err: any) {
    console.error("CREATE TEMPLATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
