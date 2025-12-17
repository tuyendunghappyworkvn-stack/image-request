import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    // 1️⃣ Lấy form-data (KHÔNG parse JSON)
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const style = formData.get("style") as string;
    const jobCountRaw = formData.get("job_count") as string;

    if (!file || !style || !jobCountRaw) {
      return NextResponse.json(
        { error: "Missing file / style / job_count" },
        { status: 400 }
      );
    }

    // 2️⃣ Ép số job
    const job_count = Number(jobCountRaw);
    if (isNaN(job_count)) {
      return NextResponse.json(
        { error: "job_count must be a number" },
        { status: 400 }
      );
    }

    // 3️⃣ Tạo template_code
    const template_code = `${style}_${job_count}`;

    // 4️⃣ Upload ảnh lên Vercel Blob
    const blob = await put(
      `templates/${template_code}-${Date.now()}.png`,
      file,
      {
        access: "public",
        contentType: file.type,
      }
    );

    const thumbnailUrl = blob.url;

    // 5️⃣ (TẠM THỜI) Trả kết quả – chưa ghi Lark
    return NextResponse.json({
      success: true,
      template_code,
      thumbnail: thumbnailUrl,
    });
  } catch (err: any) {
    console.error("CREATE TEMPLATE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
