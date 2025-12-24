import { NextResponse } from "next/server";

/**
 * ENV
 */
const LARK_BASE_ID = process.env.LARK_BASE_ID!;
const LARK_APP_ID = process.env.LARK_APP_ID!;
const LARK_APP_SECRET = process.env.LARK_APP_SECRET!;
const TABLE_ID = "tblAsMdxPDDQJAWS"; // bảng có cột Công ty + Công việc

/**
 * LẤY TENANT ACCESS TOKEN (ĐÚNG CHUẨN LARK)
 */
async function getTenantToken() {
  const res = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    }
  );

  const data = await res.json();

  if (!data.tenant_access_token) {
    console.error("❌ LARK TOKEN ERROR:", data);
    throw new Error("Cannot get tenant_access_token");
  }

  return data.tenant_access_token;
}

/**
 * API GET /api/lark/options
 */
export async function GET() {
  try {
    // 👉 LẤY TOKEN
    const token = await getTenantToken();

    // 👉 LOG TOKEN ĐỂ DEBUG (XEM TRONG VERCEL LOGS)
    console.log("✅ LARK TOKEN =", token);

    // 👉 GỌI BITABLE
    const res = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_ID}/tables/${TABLE_ID}/records?page_size=500`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    // 👉 LOG RESPONSE LARK (CỰC QUAN TRỌNG)
    console.log("📦 LARK RESPONSE =", JSON.stringify(json));

    const records = json?.data?.items || [];

    const companySet = new Set<string>();
    const positionSet = new Set<string>();

    records.forEach((item: any) => {
      const fields = item.fields || {};

      // ⚠️ TÊN CỘT PHẢI TRÙNG 100% VỚI LARK
      if (fields["Công ty"]) {
        companySet.add(fields["Công ty"]);
      }

      if (fields["Công việc"]) {
        positionSet.add(fields["Công việc"]);
      }
    });

    return NextResponse.json({
      companies: Array.from(companySet).map((name) => ({
        id: name,
        name,
      })),
      positions: Array.from(positionSet).map((name) => ({
        id: name,
        name,
      })),
    });
  } catch (error: any) {
    console.error("🔥 API ERROR:", error);

    return NextResponse.json(
      { companies: [], positions: [] },
      { status: 500 }
    );
  }
}
