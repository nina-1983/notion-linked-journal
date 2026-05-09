import { NextResponse } from "next/server";
import {
  notion,
  DAILY_DB_ID,
  title,
  rich,
  select,
  multiSelect,
  checkbox,
  dateProp,
  numberProp,
  getIsoWeekString,
} from "@/lib/notion";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function POST(request) {
  try {
    if (!process.env.NOTION_TOKEN || !DAILY_DB_ID) {
      return NextResponse.json(
        { error: "Missing Notion environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const entryDate = body.date ? new Date(`${body.date}T12:00:00`) : new Date();

    const properties = {
      Name: title(
        body.name ||
          `${body.entryType || "Journal"} — ${entryDate.toLocaleDateString("en-GB")}`
      ),
      Date: dateProp(body.date),
      Day: select(days[entryDate.getDay()]),
      Week: rich(getIsoWeekString(entryDate)),
      Month: select(entryDate.toLocaleString("en-GB", { month: "long" })),

      Mood: select(body.mood),
      "Entry Type": select(body.entryType),
      "Energy Level": numberProp(body.energyLevel),
      "Nervous System State": select(body.nervousSystemState),

      "Emotional Themes": multiSelect(body.emotionalThemes),
      "Pattern Tags": multiSelect(body.patternTags),
      "Root Cause Tags": multiSelect(body.rootCauseTags),
      "What Helped": multiSelect(body.whatHelped),

      Water: checkbox(body.anchors?.water),
      Breakfast: checkbox(body.anchors?.breakfast),
      Lunch: checkbox(body.anchors?.lunch),
      Dinner: checkbox(body.anchors?.dinner),
      Movement: checkbox(body.anchors?.movement),
      "Alone Time": checkbox(body.anchors?.aloneTime),
      "Nervous System Reset": checkbox(body.anchors?.nervousSystemReset),

      "Emotional Reflection": rich(body.emotionalReflection),
      "Open Loops": rich(body.openLoops),
      "Home Reflection": rich(body.homeReflection),
      "Business Reflection": rich(body.businessReflection),
      "Money Reflection": rich(body.moneyReflection),
      "Identity Reflection": rich(body.identityReflection),
      "Evening Reflection": rich(body.eveningReflection),
      "What Worked": rich(body.whatWorked),
      "What Felt Heavy": rich(body.whatFeltHeavy),
      "Carry Forward": rich(body.carryForward),
    };

    const page = await notion.pages.create({
      parent: { database_id: DAILY_DB_ID },
      properties,
    });

    return NextResponse.json({
      ok: true,
      id: page.id,
      url: page.url,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Could not save journal entry." },
      { status: 500 }
    );
  }
}
