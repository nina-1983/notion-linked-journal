import { NextResponse } from "next/server";
import { notion, DAILY_DB_ID } from "@/lib/notion";

function plain(prop) {
  return prop?.rich_text?.map((t) => t.plain_text).join("") || "";
}

function titleText(prop) {
  return prop?.title?.map((t) => t.plain_text).join("") || "";
}

function multi(prop) {
  return prop?.multi_select?.map((item) => item.name) || [];
}

function simplifyPage(page) {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    name: titleText(p.Name),
    date: p.Date?.date?.start || "",
    mood: p.Mood?.select?.name || "",
    energyLevel: p["Energy Level"]?.number ?? null,
    nervousSystemState: p["Nervous System State"]?.select?.name || "",
    patternTags: multi(p["Pattern Tags"]),
    rootCauseTags: multi(p["Root Cause Tags"]),
    whatHelped: multi(p["What Helped"]),
    emotionalReflection: plain(p["Emotional Reflection"]),
    openLoops: plain(p["Open Loops"]),
    homeReflection: plain(p["Home Reflection"]),
    businessReflection: plain(p["Business Reflection"]),
    moneyReflection: plain(p["Money Reflection"]),
    identityReflection: plain(p["Identity Reflection"]),
    whatWorked: plain(p["What Worked"]),
    whatFeltHeavy: plain(p["What Felt Heavy"]),
    carryForward: plain(p["Carry Forward"]),
  };
}

export async function GET() {
  try {
    const result = await notion.databases.query({
      database_id: DAILY_DB_ID,
      page_size: 21,
      sorts: [{ property: "Date", direction: "descending" }],
    });

    return NextResponse.json({ entries: result.results.map(simplifyPage) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Could not load entries." }, { status: 500 });
  }
}
