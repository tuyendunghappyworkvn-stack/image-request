import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobCount = searchParams.get("job_count");

  if (!jobCount) {
    return NextResponse.json({ data: [] });
  }

  const token = await getTenantToken();

  const res = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${process.env.LARK_APP_TOKEN}/tables/${process.env.LARK_TABLE_ID}/records?filter=CurrentValue.[job_count]=${jobCount}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  const templates =
    data?.data?.items
      ?.filter((item: any) => item.fields?.is_active)
      ?.map((item: any) => ({
        template_code: item.fields.template_code,
        style: item.fields.style,
        thumbnail: item.fields.thumbnail,
      })) || [];

  return NextResponse.json({ data: templates });
}
