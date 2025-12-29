import { NextResponse } from "next/server";

let optionVersion = Date.now();

/**
 * n8n gọi khi Lark Base có thay đổi
 */
export async function POST() {
  optionVersion = Date.now();
  return NextResponse.json({ ok: true });
}

/**
 * Frontend gọi để kiểm tra version
 */
export async function GET() {
  return NextResponse.json({ version: optionVersion });
}
