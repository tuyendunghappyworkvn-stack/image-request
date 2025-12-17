import { NextResponse } from "next/server";

const APP_ID = process.env.LARK_APP_ID!;
const APP_SECRET = process.env.LARK_APP_SECRET!;
const BASE_APP_ID = process.env.LARK_BASE_APP_ID!;
const TABLE_ID = process.env.LARK_TABLE_ID!;

// Lấy tenant access token
async function getTenantToken() {
  const res = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: APP_ID,
        app_secret: APP_SECRET,
      }),
    }
  );

  const data = await res.json();
  return data.tenant_access_token;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = await getTenantToken();

    const res = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_APP_ID}/tables/${TABLE_ID}/records`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            template_code: body.template_code,
            style: body.style,
            job_count: body.job_count,
            thumbnail: body.thumbnail, // URL ảnh public
            description: body.description,
            is_active: body.is_active,
          },
        }),
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Create template failed" },
      { status: 500 }
    );
  }
}
