# Notion-Linked Journal System

A calm, mobile-first journaling app connected to Notion.

## What it does

- Saves daily journal entries into your `Daily Journal` Notion database
- Tracks emotional state, nervous system state, body anchors, home, business, money and identity reflections
- Pulls the last 7 days for weekly review
- Saves weekly check-ins into your `Weekly Check-In` Notion database
- Shows simple patterns from recent entries

## Setup

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add these Vercel environment variables:

```bash
NOTION_TOKEN=your_notion_integration_secret
NOTION_DAILY_JOURNAL_DB_ID=48148640433d47cb9a0ce518672e4751
NOTION_WEEKLY_CHECKIN_DB_ID=7dc913a085124e41a1c9848a4623b3fa
```

4. Make sure your Notion integration has access to:
   - Daily Journal database
   - Weekly Check-In database

5. Deploy.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.
