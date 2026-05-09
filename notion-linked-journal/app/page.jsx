"use client";

import { useState } from "react";

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const today = todayIso();
const weekendMode = isWeekend();

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="j-field">
      <span className="j-label">{label}</span>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [mode, setMode] = useState("Morning");
  const [message, setMessage] = useState("");

  const [entry, setEntry] = useState({
    entryType: weekendMode ? "Weekend" : "Morning",
    date: today,
    mood: "",
    energyLevel: 5,
    nervousSystemState: "",
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
  });

  function update(field: string, value: string | number) {
    setEntry((prev) => ({ ...prev, [field]: value }));
  }

  function switchMode(nextMode: string) {
    setMode(nextMode);
    setEntry((prev) => ({ ...prev, entryType: nextMode }));
  }

  async function saveEntry() {
    setMessage("saving");
    const res = await fetch("/api/journal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      setMessage("saved");
      setTimeout(() => setMessage(""), 3500);
    } else {
      setMessage("error");
      setTimeout(() => setMessage(""), 3500);
    }
  }

  const messageText: Record<string, string> = {
    saving: "Saving…",
    saved: "Saved to Notion",
    error: "Something went wrong",
  };

  const sessionLabel = weekendMode
    ? "Weekend reset"
    : mode === "Morning"
    ? "Morning check-in"
    : "Evening reflection";

  const heading = weekendMode
    ? "A softer place to land."
    : mode === "Morning"
    ? "Good morning."
    : "The day is winding down.";

  return (
    <main className="j-wrap">

      {/* Header */}
      <header className="j-header">
        <div className="j-pulse-row">
          <span className="j-dot" />
          <span className="j-session-label">{sessionLabel}</span>
        </div>
        <h1 className="j-title">{heading}</h1>
        <p className="j-dateline">{formatDate()}</p>
      </header>

      <div className="j-rule" />

      {/* Mode toggle — weekdays only */}
      {!weekendMode && (
        <nav className="j-tabs">
          <button
            className={`j-tab ${mode === "Morning" ? "j-tab-active" : ""}`}
            onClick={() => switchMode("Morning")}
          >
            Morning
          </button>
          <button
            className={`j-tab ${mode === "Evening" ? "j-tab-active" : ""}`}
            onClick={() => switchMode("Evening")}
          >
            Evening
          </button>
        </nav>
      )}

      {/* Form */}
      <section className="j-form">

        {weekendMode && (
          <>
            <Field label="How do I actually feel today?">
              <textarea className="j-textarea" value={entry.emotionalReflection} onChange={(e) => update("emotionalReflection", e.target.value)} placeholder="No performance required here…" />
            </Field>
            <Field label="What does my nervous system need this weekend?">
              <textarea className="j-textarea" value={entry.nervousSystemState} onChange={(e) => update("nervousSystemState", e.target.value)} placeholder="Rest, quiet, movement, company…" />
            </Field>
            <Field label="What would make home feel calmer?">
              <textarea className="j-textarea" value={entry.homeReflection} onChange={(e) => update("homeReflection", e.target.value)} placeholder="Something small is enough…" />
            </Field>
            <Field label="What feels emotionally unfinished?">
              <textarea className="j-textarea" value={entry.openLoops} onChange={(e) => update("openLoops", e.target.value)} placeholder="What's still sitting with you…" />
            </Field>
            <Field label="What do I want less of next week?">
              <textarea className="j-textarea" value={entry.whatFeltHeavy} onChange={(e) => update("whatFeltHeavy", e.target.value)} placeholder="Name it, then set it down…" />
            </Field>
            <Field label="What would support me properly this week?">
              <textarea className="j-textarea" value={entry.carryForward} onChange={(e) => update("carryForward", e.target.value)} placeholder="An intention, a boundary, a softness…" />
            </Field>
          </>
        )}

        {!weekendMode && mode === "Morning" && (
          <>
            <Field label="How do I actually feel today?">
              <textarea className="j-textarea" value={entry.emotionalReflection} onChange={(e) => update("emotionalReflection", e.target.value)} placeholder="Notice what's present, without needing to change it…" />
            </Field>
            <Field label="What feels heavy right now?">
              <textarea className="j-textarea" value={entry.whatFeltHeavy} onChange={(e) => update("whatFeltHeavy", e.target.value)} placeholder="No need to fix it yet…" />
            </Field>
            <Field label="What feels supportive right now?">
              <textarea className="j-textarea" value={entry.whatWorked} onChange={(e) => update("whatWorked", e.target.value)} placeholder="People, rhythms, small things…" />
            </Field>
            <Field label="What do I need most today?">
              <textarea className="j-textarea" value={entry.carryForward} onChange={(e) => update("carryForward", e.target.value)} placeholder="One thing, held lightly…" />
            </Field>
            <Field label={`Energy today — ${entry.energyLevel} / 10`}>
              <input
                className="j-range"
                type="range"
                min="1"
                max="10"
                value={entry.energyLevel}
                onChange={(e) => update("energyLevel", e.target.value)}
              />
            </Field>
          </>
        )}

        {!weekendMode && mode === "Evening" && (
          <>
            <Field label="What worked today?">
              <textarea className="j-textarea" value={entry.whatWorked} onChange={(e) => update("whatWorked", e.target.value)} placeholder="A moment, a win, a conversation…" />
            </Field>
            <Field label="What felt hard today?">
              <textarea className="j-textarea" value={entry.whatFeltHeavy} onChange={(e) => update("whatFeltHeavy", e.target.value)} placeholder="Name it without judgment…" />
            </Field>
            <Field label="What drained me?">
              <textarea className="j-textarea" value={entry.openLoops} onChange={(e) => update("openLoops", e.target.value)} placeholder="Energy leaks worth noticing…" />
            </Field>
            <Field label="What regulated me?">
              <textarea className="j-textarea" value={entry.eveningReflection} onChange={(e) => update("eveningReflection", e.target.value)} placeholder="What brought you back to yourself…" />
            </Field>
            <Field label="What needs carrying forward?">
              <textarea className="j-textarea" value={entry.carryForward} onChange={(e) => update("carryForward", e.target.value)} placeholder="One thread to hold…" />
            </Field>
          </>
        )}

        {/* Save footer */}
        <div className="j-footer">
          {message && (
            <span className={`j-message ${message === "error" ? "j-message-error" : ""}`}>
              {messageText[message]}
            </span>
          )}
          <button className="j-save" onClick={saveEntry} disabled={message === "saving"}>
            Save to Notion
            <span className="j-save-line" />
          </button>
        </div>

      </section>
    </main>
  );
}
