 "use client";

import { useEffect, useMemo, useState } from "react";

const moods = ["Calm", "Clear", "Heavy", "Foggy", "Activated", "Overstimulated", "Tender", "Grounded"];
const states = ["Regulated", "Activated", "Dysregulated", "Shutdown", "Overdriven", "Calm/Productive", "Foggy", "Avoidant"];
const patternTags = ["Overstimulated", "Calm", "Avoidance", "Financial Stress", "Clear", "Connected", "Foggy", "Regulated", "Creative", "Tired", "Present", "Reactive"];
const rootCauses = ["lack of sleep", "too much input", "clutter", "money fear", "people pleasing", "uncertainty", "decision fatigue", "no alone time", "rushed morning", "overstimulation", "lack of movement"];
const supports = ["walk", "protein breakfast", "voice note", "journaling", "admin hour", "clean kitchen", "body movement", "silence", "earlier bedtime", "saying no", "asking for help"];
const emotionalThemes = ["avoidance", "money fear", "confidence", "clarity", "overwhelm", "sadness", "connection", "creative"];
const overallStates = ["Stabilise", "Simplify", "Strengthen", "Expand"];

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultJournal = {
  date: todayIso(),
  mood: "",
  energyLevel: 5,
  nervousSystemState: "",
  emotionalThemes: [],
  patternTags: [],
  rootCauseTags: [],
  whatHelped: [],
  anchors: {
    water: false,
    breakfast: false,
    lunch: false,
    dinner: false,
    movement: false,
    aloneTime: false,
    nervousSystemReset: false,
  },
  emotionalReflection: "",
  openLoops: "",
  homeReflection: "",
  businessReflection: "",
  moneyReflection: "",
  identityReflection: "",
  eveningReflection: "",
  whatWorked: "",
  whatFeltHeavy: "",
  carryForward: "",
};

function startOfWeekIso() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(dateString, days) {
  const d = new Date(`${dateString}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
      {children}
    </label>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
    />
  );
}

function PillSelect({ options, value, onChange }) {
  return (
    <div className="pills">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "pill active" : "pill"}
          onClick={() => onChange(value === option ? "" : option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MultiPills({ options, values, onChange }) {
  function toggle(option) {
    if (values.includes(option)) onChange(values.filter((item) => item !== option));
    else onChange([...values, option]);
  }

  return (
    <div className="pills">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={values.includes(option) ? "pill active" : "pill"}
          onClick={() => toggle(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function Anchor({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={checked ? "anchor checked" : "anchor"}>
      <span>{checked ? "✓" : ""}</span>
      {label}
    </button>
  );
}

function PatternSummary({ summary }) {
  if (!summary) return null;

  const rows = [
    ["Entries", summary.entryCount || 0],
    ["Average energy", summary.averageEnergy ?? "—"],
    ["Top mood", summary.moodCounts?.[0]?.name || "—"],
    ["Top state", summary.stateCounts?.[0]?.name || "—"],
    ["Top pattern", summary.patternCounts?.[0]?.name || "—"],
    ["Top support", summary.supportCounts?.[0]?.name || "—"],
  ];

  return (
    <div className="summaryGrid">
      {rows.map(([label, value]) => (
        <div className="summaryTile" key={label}>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("today");
  const [journal, setJournal] = useState(defaultJournal);
  const [recentEntries, setRecentEntries] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [weeklyForm, setWeeklyForm] = useState({
    weekStart: startOfWeekIso(),
    weekEnd: addDaysIso(startOfWeekIso(), 6),
    overallState: "Stabilise",
    dominantMood: "",
    averageEnergy: "",
    mainPatterns: [],
    topSupports: [],
    whatDrainedMe: "",
    whatSupportedMe: "",
    repeatedPatterns: "",
    bodyReview: "",
    homeReview: "",
    businessReview: "",
    moneyReview: "",
    growthReview: "",
    carryIntoNextWeek: "",
    continueText: "",
    simplifyNext: "",
    strengthenNext: "",
    expandNext: "",
  });
  const [message, setMessage] = useState("");

  async function refreshRecent() {
    const res = await fetch("/api/journal/recent");
    const data = await res.json();
    if (data.entries) setRecentEntries(data.entries);
  }

  async function refreshWeek() {
    const res = await fetch(`/api/journal/week?start=${weeklyForm.weekStart}`);
    const data = await res.json();
    setWeekly(data);
    if (data.summary) {
      setWeeklyForm((prev) => ({
        ...prev,
        weekEnd: addDaysIso(prev.weekStart, 6),
        averageEnergy: data.summary.averageEnergy ?? "",
        dominantMood: data.summary.moodCounts?.[0]?.name || prev.dominantMood,
        mainPatterns: data.summary.patternCounts?.slice(0, 4).map((x) => x.name) || [],
        topSupports: data.summary.supportCounts?.slice(0, 4).map((x) => x.name) || [],
        whatDrainedMe: data.summary.heavy?.join("\n\n") || prev.whatDrainedMe,
        whatSupportedMe: data.summary.worked?.join("\n\n") || prev.whatSupportedMe,
        carryIntoNextWeek: data.summary.carryForward?.join("\n\n") || prev.carryIntoNextWeek,
      }));
    }
  }

  useEffect(() => {
    refreshRecent().catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "weekly" || tab === "patterns") {
      refreshWeek().catch(() => {});
    }
  }, [tab]);

  function updateJournal(key, value) {
    setJournal((prev) => ({ ...prev, [key]: value }));
  }

  function updateAnchor(key, value) {
    setJournal((prev) => ({
      ...prev,
      anchors: { ...prev.anchors, [key]: value },
    }));
  }

  async function saveJournal() {
    setMessage("Saving your journal entry…");
    const res = await fetch("/api/journal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(journal),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }
    setMessage("Saved into Notion 🌿");
    setJournal({ ...defaultJournal, date: todayIso() });
    refreshRecent();
  }

  async function saveWeekly() {
    setMessage("Saving weekly check-in…");
    const res = await fetch("/api/weekly/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weeklyForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Something went wrong.");
      return;
    }
    setMessage("Weekly check-in saved into Notion 🌙");
  }

  const anchorCount = useMemo(() => Object.values(journal.anchors).filter(Boolean).length, [journal.anchors]);

  return (
    <main className="wrap">
      <section className="hero">
        <p className="eyebrow">Nina’s Journal System</p>
        <h1>A calm place to notice what’s really going on.</h1>
        <p>
          Not productivity. Pattern awareness, nervous system support and grounded growth.
        </p>
      </section>

      <nav className="tabs">
        {[
          ["today", "Today"],
          ["weekly", "Weekly"],
          ["patterns", "Patterns"],
          ["archive", "Archive"],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {message ? <div className="notice">{message}</div> : null}

      {tab === "today" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Daily Entry</p>
              <h2>Today’s check-in</h2>
            </div>
            <div className="miniStat">
              <span>{anchorCount}/7</span>
              <small>body anchors</small>
            </div>
          </div>

          <Field label="Date">
            <input type="date" value={journal.date} onChange={(e) => updateJournal("date", e.target.value)} />
          </Field>

          <Field label="Mood" hint="What is the honest emotional weather?">
            <PillSelect options={moods} value={journal.mood} onChange={(v) => updateJournal("mood", v)} />
          </Field>

          <Field label="Energy level">
            <input type="range" min="1" max="10" value={journal.energyLevel} onChange={(e) => updateJournal("energyLevel", e.target.value)} />
            <div className="rangeReadout">{journal.energyLevel}/10</div>
          </Field>

          <Field label="Nervous system state">
            <PillSelect options={states} value={journal.nervousSystemState} onChange={(v) => updateJournal("nervousSystemState", v)} />
          </Field>

          <div className="card">
            <h3>Small body anchors</h3>
            <div className="anchors">
              {[
                ["water", "Water"],
                ["breakfast", "Breakfast"],
                ["lunch", "Lunch"],
                ["dinner", "Dinner"],
                ["movement", "Movement"],
                ["aloneTime", "Alone time"],
                ["nervousSystemReset", "Reset"],
              ].map(([key, label]) => (
                <Anchor key={key} label={label} checked={journal.anchors[key]} onChange={(v) => updateAnchor(key, v)} />
              ))}
            </div>
          </div>

          <Field label="How do I actually feel today?">
            <TextArea value={journal.emotionalReflection} onChange={(v) => updateJournal("emotionalReflection", v)} placeholder="Messy is allowed. Honest is useful." />
          </Field>

          <Field label="What keeps circling in my head?">
            <TextArea value={journal.openLoops} onChange={(v) => updateJournal("openLoops", v)} placeholder="Money, admin, unfinished jobs, conversations, emotional tension…" />
          </Field>

          <Field label="Home reflection">
            <TextArea value={journal.homeReflection} onChange={(v) => updateJournal("homeReflection", v)} placeholder="What drained the house? What made it calmer?" />
          </Field>

          <Field label="Business reflection">
            <TextArea value={journal.businessReflection} onChange={(v) => updateJournal("businessReflection", v)} placeholder="What gave energy? What drained? What matters?" />
          </Field>

          <Field label="Money reflection">
            <TextArea value={journal.moneyReflection} onChange={(v) => updateJournal("moneyReflection", v)} placeholder="Did money feel safe, unsafe, avoided, grounded?" />
          </Field>

          <Field label="Identity + growth">
            <TextArea value={journal.identityReflection} onChange={(v) => updateJournal("identityReflection", v)} placeholder="Where did I trust myself? Where did I shrink?" />
          </Field>

          <Field label="What worked?">
            <TextArea value={journal.whatWorked} onChange={(v) => updateJournal("whatWorked", v)} placeholder="Evidence. Supports. Tiny wins." />
          </Field>

          <Field label="What felt heavy?">
            <TextArea value={journal.whatFeltHeavy} onChange={(v) => updateJournal("whatFeltHeavy", v)} placeholder="Name it gently. No spiralling required." />
          </Field>

          <Field label="What needs carrying forward?">
            <TextArea value={journal.carryForward} onChange={(v) => updateJournal("carryForward", v)} placeholder="Only what genuinely matters." />
          </Field>

          <Field label="Pattern tags">
            <MultiPills options={patternTags} values={journal.patternTags} onChange={(v) => updateJournal("patternTags", v)} />
          </Field>

          <Field label="Root cause tags">
            <MultiPills options={rootCauses} values={journal.rootCauseTags} onChange={(v) => updateJournal("rootCauseTags", v)} />
          </Field>

          <Field label="What helped?">
            <MultiPills options={supports} values={journal.whatHelped} onChange={(v) => updateJournal("whatHelped", v)} />
          </Field>

          <Field label="Emotional themes">
            <MultiPills options={emotionalThemes} values={journal.emotionalThemes} onChange={(v) => updateJournal("emotionalThemes", v)} />
          </Field>

          <button className="save" onClick={saveJournal}>Save today into Notion</button>
        </section>
      )}

      {tab === "weekly" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Weekly Review</p>
              <h2>What did the week show me?</h2>
            </div>
          </div>

          <div className="two">
            <Field label="Week start">
              <input type="date" value={weeklyForm.weekStart} onChange={(e) => setWeeklyForm((p) => ({ ...p, weekStart: e.target.value, weekEnd: addDaysIso(e.target.value, 6) }))} />
            </Field>
            <Field label="Week end">
              <input type="date" value={weeklyForm.weekEnd} onChange={(e) => setWeeklyForm((p) => ({ ...p, weekEnd: e.target.value }))} />
            </Field>
          </div>

          <button className="secondary" onClick={refreshWeek}>Pull this week from Notion</button>

          <PatternSummary summary={weekly?.summary} />

          <Field label="Overall state">
            <PillSelect options={overallStates} value={weeklyForm.overallState} onChange={(v) => setWeeklyForm((p) => ({ ...p, overallState: v }))} />
          </Field>

          <Field label="Dominant mood">
            <PillSelect options={moods} value={weeklyForm.dominantMood} onChange={(v) => setWeeklyForm((p) => ({ ...p, dominantMood: v }))} />
          </Field>

          <Field label="Main patterns">
            <MultiPills options={patternTags} values={weeklyForm.mainPatterns} onChange={(v) => setWeeklyForm((p) => ({ ...p, mainPatterns: v }))} />
          </Field>

          <Field label="Top supports">
            <MultiPills options={supports} values={weeklyForm.topSupports} onChange={(v) => setWeeklyForm((p) => ({ ...p, topSupports: v }))} />
          </Field>

          {[
            ["whatDrainedMe", "What drained me most this week?"],
            ["whatSupportedMe", "What supported me most this week?"],
            ["repeatedPatterns", "What repeated more than once?"],
            ["bodyReview", "Body + nervous system review"],
            ["homeReview", "Home review"],
            ["businessReview", "Business review"],
            ["moneyReview", "Money review"],
            ["growthReview", "Growth review"],
            ["carryIntoNextWeek", "What needs carrying into next week?"],
            ["continueText", "Continue — what is clearly helping?"],
            ["simplifyNext", "Simplify — what feels too complex?"],
            ["strengthenNext", "Strengthen — what needs consistency?"],
            ["expandNext", "Expand — where am I ready for more?"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <TextArea value={weeklyForm[key]} onChange={(v) => setWeeklyForm((p) => ({ ...p, [key]: v }))} />
            </Field>
          ))}

          <button className="save" onClick={saveWeekly}>Save weekly check-in</button>
        </section>
      )}

      {tab === "patterns" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Patterns</p>
              <h2>What keeps showing up?</h2>
            </div>
          </div>

          <PatternSummary summary={weekly?.summary} />

          <div className="card">
            <h3>Repeated supports</h3>
            <ul>
              {(weekly?.summary?.supportCounts || []).slice(0, 8).map((item) => (
                <li key={item.name}>{item.name} <span>{item.count}</span></li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Recurring drains / roots</h3>
            <ul>
              {(weekly?.summary?.rootCauseCounts || []).slice(0, 8).map((item) => (
                <li key={item.name}>{item.name} <span>{item.count}</span></li>
              ))}
            </ul>
          </div>

          <div className="card soft">
            <h3>Gentle read</h3>
            <p>
              Look for the link between body anchors, open loops, home load and money/business avoidance.
              The aim is not to judge the pattern. The aim is to know what returns you to safety.
            </p>
          </div>
        </section>
      )}

      {tab === "archive" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Archive</p>
              <h2>Recent entries</h2>
            </div>
            <button className="secondary" onClick={refreshRecent}>Refresh</button>
          </div>

          <div className="entryList">
            {recentEntries.map((entry) => (
              <a href={entry.url} target="_blank" className="entryCard" key={entry.id}>
                <small>{entry.date}</small>
                <strong>{entry.name}</strong>
                <p>{entry.mood || "No mood"} · {entry.nervousSystemState || "No state"} · Energy {entry.energyLevel ?? "—"}</p>
                {entry.carryForward ? <em>{entry.carryForward.slice(0, 120)}</em> : null}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
