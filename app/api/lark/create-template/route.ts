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

    /* ===== NEW FIELDS (CŨ) ===== */
    const presentationId = String(
      formData.get("presentation_id") || ""
    ).trim();

    const slideIdMau = String(
      formData.get("slide_id_mau") || ""
    ).trim();

    const textJD =
      String(formData.get("text_jd") || "").toLowerCase() === "true";

    /* ===== 4 FIELD MỚI (CHỈ THÊM – KHÔNG ĐỔI LOGIC) ===== */
    const congViecLimit = Number(formData.get("cong_viec_limit") || 0);
    const quyenLoiLimit = Number(formData.get("quyen_loi_limit") || 0);
    const yeuCauLimit = Number(formData.get("yeu_cau_limit") || 0);
    const dauDong = String(formData.get("Dấu đầu dòng") || "");

    /* ===== VALIDATE ===== */
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
       (CHỈ BỔ SUNG FIELD – KHÔNG ĐỔI KEY CŨ)
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

            // 🔒 GIỮ NGUYÊN KEY CŨ (đang chạy)
            PresentationID: presentationId,
            slideID_mau: slideIdMau,
            text_jd: textJD,

            // ✅ CHỈ THÊM 4 CỘT MỚI
            cong_viec_limit: congViecLimit,
            quyen_loi_limit: quyenLoiLimit,
            yeu_cau_limit: yeuCauLimit,
            "Dấu đầu dòng": dauDong,
          },
        }),
      }
    );

    const larkData = await larkRes.json();

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
