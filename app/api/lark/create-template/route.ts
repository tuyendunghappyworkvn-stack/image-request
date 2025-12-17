import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const style = String(formData.get("style") || "").trim();
    const jobCount = Number(formData.get("jobCount"));

    if (!file || !style || !jobCount) {
      return NextResponse.json(
        { error: "Missing file / style / jobCount" },
        { status: 400 }
      );
    }

    // 1️⃣ Sinh template_code
    const templateCode = `${style}_${jobCount}`;

    // 2️⃣ Upload ảnh lên Vercel Blob
    const blob = await put(
      `templates/${templateCode}-${Date.now()}.png`,
      file,
      { access: "public" }
    );

    // 3️⃣ Lấy tenant_access_token
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

    if (!tenantToken) {
      return NextResponse.json(
        { error: "Cannot get tenant_access_token", tokenJson },
        { status: 500 }
      );
    }

    // 4️⃣ Ghi record vào Lark Base
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
            style: style,
            job_count: jobCount,
            thumbnail: blob.url,
            is_active: true,
          },
        }),
      }
    );

    const larkJson = await larkRes.json();

    return NextResponse.json({
      success: true,
      template_code: templateCode,
      thumbnail: blob.url,
      lark: larkJson,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
