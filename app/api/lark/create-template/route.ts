import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const style = formData.get("style") as string;
    const jobCountRaw = formData.get("job_count") as string;

    if (!file || !style || !jobCountRaw) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const job_count = Number(jobCountRaw);
    const template_code = `${style}_${job_count}`;

    /* ======================
       1️⃣ Upload ảnh Blob
    ====================== */
    const blob = await put(
      `templates/${template_code}-${Date.now()}.png`,
      file,
      { access: "public", contentType: file.type }
    );

    const thumbnail = blob.url;

    /* ======================
       2️⃣ Lấy tenant token
    ====================== */
    const tokenRes = await fetch(
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

    const tokenJson = await tokenRes.json();
    const tenantToken = tokenJson.tenant_access_token;

    /* ======================
       3️⃣ Ghi vào Lark Base
    ====================== */
    const recordRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.LARK_BASE_ID}/tables/${process.env.LARK_TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tenantToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            template_code,
            style,
            job_count,
            thumbnail,
            is_active: true,
          },
        }),
      }
    );

    const recordJson = await recordRes.json();

    return NextResponse.json({
      success: true,
      template_code,
      thumbnail,
      lark: recordJson,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
