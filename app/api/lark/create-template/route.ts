import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const APP_ID = process.env.LARK_APP_ID!;
const TABLE_ID = process.env.LARK_TABLE_ID!;
const TENANT_TOKEN = process.env.LARK_TENANT_TOKEN!;

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const templateCode = formData.get("template_code") as string;
  const style = formData.get("style") as string;
  const jobCount = Number(formData.get("job_count"));

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // 1. Upload ảnh lên Vercel Blob (public)
  const blob = await put(
    `templates/${templateCode}-${Date.now()}.png`,
    file,
    { access: "public" }
  );

  // 2. Ghi vào Lark Base
  const larkRes = await fetch(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${APP_ID}/tables/${TABLE_ID}/records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TENANT_TOKEN}`,
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

  const larkData = await larkRes.json();

  return NextResponse.json({
    success: true,
    template_code: templateCode,
    thumbnail: blob.url,
    lark: larkData,
  });
}
