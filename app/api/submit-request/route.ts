import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(
      "https://n8n.happywork.com.vn/webhook-test/tao-list-job",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: text },
        { status: 500 }
      );
    }

    // ✅ LẤY RESPONSE TỪ n8n
    const data = await res.json();

    // ✅ TRẢ NGUYÊN DATA VỀ FRONTEND
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
