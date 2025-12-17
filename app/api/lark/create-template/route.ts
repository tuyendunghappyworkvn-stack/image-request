import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { style, job_count, thumbnail } = body;

    const template_code = `${style}_${job_count}`;

    /* 1️⃣ LẤY TENANT ACCESS TOKEN */
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

    const tokenData = await tokenRes.json();

    if (!tokenData.tenant_access_token) {
      return NextResponse.json(
        { error: "Không lấy được tenant_access_token", tokenData },
        { status: 500 }
      );
    }

    const accessToken = tokenData.tenant_access_token;

    /* 2️⃣ GHI RECORD VÀO LARK BASE */
    const createRes = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.LARK_BASE_ID}/tables/${process.env.LARK_TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            template_code,
            style,
            job_count,
            thumbnail, // URL ảnh blob
            is_active: true,
          },
        }),
      }
    );

    const createData = await createRes.json();

    if (createData.code !== 0) {
      return NextResponse.json(
        { error: "Lark Base error", createData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template_code,
      thumbnail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
