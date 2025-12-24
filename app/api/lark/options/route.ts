import { NextResponse } from "next/server";

const BASE_ID = "GfsDbDUd5aRCNSsRzmKlURVagQg";
const TABLE_ID = "tblASMdXPDdQjAW5";

/* =========================
   LẤY TENANT ACCESS TOKEN
========================= */
async function getTenantToken() {
  const res = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: process.env.LARK_APP_ID,
        app_secret: process.env.LARK_APP_SECRET,
      }),
    }
  );

  const data = await res.json();

  if (!data.tenant_access_token) {
    console.error("❌ Lỗi lấy tenant token:", data);
    throw new Error("Cannot get tenant access token");
  }

  console.log("✅ TENANT TOKEN OK");

  return data.tenant_access_token;
}

/* =========================
   GET OPTIONS
========================= */
export async function GET() {
  try {
    const token = await getTenantToken();

    const res = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records?page_size=500`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    console.log("📦 LARK RESPONSE =", JSON.stringify(json));

    const records = json?.data?.items || [];

    const companySet = new Set<string>();
    const positionSet = new Set<string>();

    records.forEach((item: any) => {
      const fields = item.fields || {};

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
  } catch (err) {
    console.error("❌ API ERROR", err);
    return NextResponse.json(
      { companies: [], positions: [] },
      { status: 500 }
    );
  }
}
