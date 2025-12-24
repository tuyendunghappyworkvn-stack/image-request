import { NextResponse } from "next/server";

/* =====================
   ENV
===================== */
const LARK_BASE_ID = process.env.LARK_BASE_ID!;
const LARK_APP_ID = process.env.LARK_APP_ID!;
const LARK_APP_SECRET = process.env.LARK_APP_SECRET!;
const TABLE_ID = "tblAsMdxPDDQJAWS"; // bảng chứa Công ty + Công việc

/* =====================
   GET TENANT TOKEN
===================== */
async function getTenantToken() {
  const res = await fetch(
    "https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    }
  );

  const data = await res.json();
  return data.tenant_access_token;
}

/* =====================
   GET OPTIONS
===================== */
export async function GET() {
  try {
    const token = await getTenantToken();

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

    const companies = Array.from(companySet).map((name) => ({
      id: name,
      name,
    }));

    const positions = Array.from(positionSet).map((name) => ({
      id: name,
      name,
    }));

    return NextResponse.json({
      companies,
      positions,
    });
  } catch (err) {
    console.error("Lark options error:", err);
    return NextResponse.json(
      { companies: [], positions: [] },
      { status: 500 }
    );
  }
}
