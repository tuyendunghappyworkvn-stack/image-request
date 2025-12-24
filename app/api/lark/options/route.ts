import { NextResponse } from "next/server";

const BASE_ID = "GfsDbDUd5aRCNSsRzmKlURVagQg";
const TABLE_ID = "tblASMdXPDdQjAW5";

/* =========================
   GET TENANT ACCESS TOKEN
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
    console.error("❌ Cannot get tenant token:", data);
    throw new Error("Cannot get tenant access token");
  }

  console.log("✅ TENANT TOKEN OK");
  return data.tenant_access_token;
}

/* =========================
   GET COMPANY + JOB OPTIONS
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

    console.log(
      "📦 LARK RESPONSE =",
      JSON.stringify(json?.data?.items?.length)
    );

    const records = json?.data?.items || [];

    // =========================
    // BUILD DATA
    // =========================
    const companySet = new Set<string>();
    const jobsByCompany: Record<string, string[]> = {};

    records.forEach((item: any) => {
      const fields = item.fields || {};
      const company = fields["Công ty"];
      const job = fields["Công việc"];

      if (!company || !job) return;

      companySet.add(company);

      if (!jobsByCompany[company]) {
        jobsByCompany[company] = [];
      }

      if (!jobsByCompany[company].includes(job)) {
        jobsByCompany[company].push(job);
      }
    });

    const companies = Array.from(companySet).map((name) => ({
      id: name,
      name,
    }));

    return NextResponse.json({
      companies,
      jobsByCompany,
    });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { companies: [], jobsByCompany: {} },
      { status: 500 }
    );
  }
}
