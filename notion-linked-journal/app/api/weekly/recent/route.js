import { NextResponse } from "next/server";
import { notion, WEEKLY_DB_ID } from "@/lib/notion";

function plain(prop) {
  return prop?.rich_text?.map((t) => t.plain_text).join("") || "";
}

function titleText(prop) {
  return prop?.title?.map((t) => t.plain_text).join("") || "";
}

export async function GET() {
  try {
    const result = await notion.databases.query({
      database_id: WEEKLY_DB_ID,
      page_size: 10,
      sorts: [{ property: "Week Start", direction: "descending" }],
    });

    const reviews = result.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        url: page.url,
        name: titleText(p.Name),
        weekStart: p["Week Start"]?.date?.start || "",
        weekEnd: p["Week End"]?.date?.start || "",
        overallState: p["Overall State"]?.select?.name || "",
        dominantMood: p["Dominant Mood"]?.select?.name || "",
        averageEnergy: p["Average Energy"]?.number ?? null,
        carryIntoNextWeek: plain(p["Carry Into Next Week"]),
      };
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Could not load weekly reviews." }, { status: 500 });
  }
}
