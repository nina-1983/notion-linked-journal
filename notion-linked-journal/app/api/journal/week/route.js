import { NextResponse } from "next/server";
import { notion, DAILY_DB_ID } from "@/lib/notion";

function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function plain(prop) {
  return prop?.rich_text?.map((t) => t.plain_text).join("") || "";
}

function multi(prop) {
  return prop?.multi_select?.map((item) => item.name) || [];
}

function titleText(prop) {
  return prop?.title?.map((t) => t.plain_text).join("") || "";
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

function countList(entries, key) {
  const counts = {};
  entries.forEach((entry) => {
    const items = Array.isArray(entry[key]) ? entry[key] : entry[key] ? [entry[key]] : [];
    items.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start") || isoDate(getStartOfWeek());
    const endDate = new Date(`${start}T12:00:00`);
    endDate.setDate(endDate.getDate() + 7);

    const result = await notion.databases.query({
      database_id: DAILY_DB_ID,
      page_size: 30,
      filter: {
        and: [
          { property: "Date", date: { on_or_after: start } },
          { property: "Date", date: { before: isoDate(endDate) } },
        ],
      },
      sorts: [{ property: "Date", direction: "ascending" }],
    });

    const entries = result.results.map(simplifyPage);
    const energyValues = entries.map((e) => e.energyLevel).filter((n) => typeof n === "number");
    const averageEnergy =
      energyValues.length > 0
        ? Math.round((energyValues.reduce((sum, n) => sum + n, 0) / energyValues.length) * 10) / 10
        : null;

    const summary = {
      entryCount: entries.length,
      averageEnergy,
      moodCounts: countList(entries, "mood"),
      stateCounts: countList(entries, "nervousSystemState"),
      patternCounts: countList(entries, "patternTags"),
      rootCauseCounts: countList(entries, "rootCauseTags"),
      supportCounts: countList(entries, "whatHelped"),
      carryForward: entries.map((e) => e.carryForward).filter(Boolean),
      heavy: entries.map((e) => e.whatFeltHeavy).filter(Boolean),
      worked: entries.map((e) => e.whatWorked).filter(Boolean),
    };

    return NextResponse.json({ start, end: isoDate(endDate), entries, summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Could not load weekly journal entries." }, { status: 500 });
  }
}
