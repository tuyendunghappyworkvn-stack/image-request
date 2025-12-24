import { NextResponse } from "next/server";

const LARK_BASE_ID = process.env.LARK_BASE_ID!;
const LARK_APP_TOKEN = process.env.LARK_APP_TOKEN!;
const TABLE_ID = "tblAsMdxPDDQJAWS"; // bảng chứa Công ty + Công việc

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
    return NextResponse.json(
      { companies: [], positions: [] },
      { status: 500 }
    );
  }
}
