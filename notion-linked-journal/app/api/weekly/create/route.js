import { NextResponse } from "next/server";
import { notion, WEEKLY_DB_ID, title, rich, select, multiSelect, dateProp, numberProp } from "@/lib/notion";

export async function POST(request) {
  try {
    const body = await request.json();

    const properties = {
      Name: title(body.name || `Weekly Check-In — ${body.weekStart || ""}`),
      "Week Start": dateProp(body.weekStart),
      "Week End": dateProp(body.weekEnd),
      "Overall State": select(body.overallState),
      "Dominant Mood": select(body.dominantMood),
      "Average Energy": numberProp(body.averageEnergy),
      "Main Patterns": multiSelect(body.mainPatterns),
      "Top Supports": multiSelect(body.topSupports),
      "What Drained Me": rich(body.whatDrainedMe),
      "What Supported Me": rich(body.whatSupportedMe),
      "Repeated Patterns": rich(body.repeatedPatterns),
      "Body Review": rich(body.bodyReview),
      "Home Review": rich(body.homeReview),
      "Business Review": rich(body.businessReview),
      "Money Review": rich(body.moneyReview),
      "Growth Review": rich(body.growthReview),
      "Carry Into Next Week": rich(body.carryIntoNextWeek),
      Continue: rich(body.continueText),
      "Simplify Next": rich(body.simplifyNext),
      "Strengthen Next": rich(body.strengthenNext),
      "Expand Next": rich(body.expandNext),
    };

    const page = await notion.pages.create({
      parent: { database_id: WEEKLY_DB_ID },
      properties,
    });

    return NextResponse.json({ ok: true, id: page.id, url: page.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Could not save weekly check-in." }, { status: 500 });
  }
}
