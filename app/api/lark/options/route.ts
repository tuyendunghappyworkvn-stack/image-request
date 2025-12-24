import { NextResponse } from "next/server";

const LARK_BASE_ID = process.env.LARK_BASE_ID!;
const LARK_APP_TOKEN = process.env.LARK_APP_TOKEN!;
const TABLE_ID = "tblASMdXPDdQjAW5"; // 👈 table chứa Công ty + Công việc

export async function GET() {
  try {
    const res = await fetch(
      `https://open.larksuite.com/open-apis/bitable/v1/apps/${LARK_BASE_ID}/tables/${TABLE_ID}/records?page_size=500`,
      {
        headers: {
          Authorization: `Bearer ${LARK_APP_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();
    const records = json.data?.items || [];

    // Lấy list { company, position }
    const rows = records
      .map((r: any) => ({
        company: r.fields["Công ty"],
        position: r.fields["Công việc"],
      }))
      .filter(
        (r: any) => r.company && r.position
      );

    // Unique company
    const companies = Array.from(
      new Set(rows.map((r: any) => r.company))
    ).map((name) => ({
      id: name,
      name,
    }));

    // Position gắn với company
    const positions = rows.map((r: any) => ({
      id: `${r.company}-${r.position}`,
      name: r.position,
      company_id: r.company,
    }));

    return NextResponse.json({
      companies,
      positions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load options" },
      { status: 500 }
    );
  }
}
