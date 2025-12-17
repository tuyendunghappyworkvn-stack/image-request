import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const templateCode = formData.get("template_code") as string;
  const style = formData.get("style") as string;
  const jobCount = formData.get("job_count") as string;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // 🔥 Upload ảnh lên Vercel Blob (PUBLIC)
  const blob = await put(
    `templates/${templateCode}-${Date.now()}.png`,
    file,
    {
      access: "public",
    }
  );

  // 👉 blob.url là LINK ẢNH PUBLIC
  return NextResponse.json({
    success: true,
    template_code: templateCode,
    style,
    job_count: jobCount,
    thumbnail: blob.url,
  });
}
