import { NextResponse } from "next/server";

const BASE_ID = "GfsDbDUd5aRCNSsRzmKlURVagQg";
const TABLE_ID = "tblASMdXPDdQjAW5";

/* =========================
   GET TENANT ACCESS TOKEN
========================= */
async function getTenantToken(): Promise<string> {
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

  if (!data?.tenant_access_token) {
    console.error("❌ Cannot get tenant token:", data);
    throw new Error("Cannot get tenant access token");
  }

  return data.tenant_access_token;
}

/* =========================
   FETCH ALL RECORDS (PAGINATION)
========================= */
async function fetchAllRecords(token: string): Promise<any[]> {
  let allRecords: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore: boolean = true;

  while (hasMore) {
    const url: string =
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records?page_size=500` +
      (pageToken ? `&page_token=${pageToken}` : "");

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const json = await res.json();

    const items = json?.data?.items || [];
    allRecords = allRecords.concat(items);

    hasMore = json?.data?.has_more === true;
    pageToken = json?.data?.page_token;
  }

  return allRecords;
}

/* =========================
   GET COMPANY + JOB OPTIONS
========================= */
export async function GET() {
  try {
    const token = await getTenantToken();

    // ✅ LẤY TOÀN BỘ RECORDS
    const records = await fetchAllRecords(token);

    /**
     * OUTPUT STRUCTURE
     * companies: string[]
     * jobsByCompany: {
     *   [company]: [{ position, code }]
     * }
     */
    const companySet = new Set<string>();
    const jobsByCompany: Record<
      string,
      { position: string; code: string }[]
    > = {};

    records.forEach((item: any) => {
      const fields = item.fields || {};

      const code = fields["Mã"];        // 👈 CỘT MÃ (JOB.xxxx)
      const company = fields["Công ty"];
      const position = fields["Công việc"];

      if (!code || !company || !position) return;

      companySet.add(company);

      if (!jobsByCompany[company]) {
        jobsByCompany[company] = [];
      }

      // ❌ tránh trùng position + code
      const existed = jobsByCompany[company].some(
        (j) => j.code === code
      );

      if (!existed) {
        jobsByCompany[company].push({
          position,
          code,
        });
      }
    });

    const companies = Array.from(companySet).map((name) => ({
      id: name, // dùng name làm id cho select
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
