import { NextResponse } from "next/server";

const BASE_ID = "GfsDbDUd5aRCNSsRzmKlURVagQg";
const TABLE_ID = "tblASMdXPDdQjAW5";

/* =========================
   GET TENANT TOKEN
========================= */
async function getTenantToken() {
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
  if (!data.tenant_access_token) {
    throw new Error("Cannot get tenant token");
  }
  return data.tenant_access_token;
}

/* =========================
   GET ALL RECORDS (PAGINATION)
========================= */
async function fetchAllRecords(token: string) {
  let allItems: any[] = [];
  let pageToken: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const url =
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${BASE_ID}/tables/${TABLE_ID}/records?page_size=500` +
      (pageToken ? `&page_token=${pageToken}` : "");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const json = await res.json();

    const items = json?.data?.items || [];
    allItems = allItems.concat(items);

    hasMore = json?.data?.has_more;
    pageToken = json?.data?.page_token;
  }

  return allItems;
}

/* =========================
   API
========================= */
export async function GET() {
  try {
    const token = await getTenantToken();
    const records = await fetchAllRecords(token);

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

    return NextResponse.json({
      companies: Array.from(companySet).map((name) => ({
        id: name,
        name,
      })),
      jobsByCompany,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { companies: [], jobsByCompany: {} },
      { status: 500 }
    );
  }
}
