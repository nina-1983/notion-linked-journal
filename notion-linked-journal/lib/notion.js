import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const DAILY_DB_ID = process.env.NOTION_DAILY_JOURNAL_DB_ID;
export const WEEKLY_DB_ID = process.env.NOTION_WEEKLY_CHECKIN_DB_ID;

export function rich(text = "") {
  return {
    rich_text: text
      ? [
          {
            type: "text",
            text: { content: String(text).slice(0, 1900) },
          },
        ]
      : [],
  };
}

export function title(text = "") {
  return {
    title: [
      {
        type: "text",
        text: { content: String(text || "Untitled").slice(0, 1900) },
      },
    ],
  };
}

export function select(name) {
  return name ? { select: { name } } : { select: null };
}

export function multiSelect(values = []) {
  const clean = Array.isArray(values) ? values.filter(Boolean) : [];
  return { multi_select: clean.map((name) => ({ name })) };
}

export function checkbox(value) {
  return { checkbox: Boolean(value) };
}

export function dateProp(value) {
  return value ? { date: { start: value } } : { date: null };
}

export function numberProp(value) {
  const num = Number(value);
  return Number.isFinite(num) ? { number: num } : { number: null };
}

export function getIsoWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}
