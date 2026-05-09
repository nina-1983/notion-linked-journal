"use client";

import { useState } from "react";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getSessionType() {
  const day = new Date().getDay();
  const hour = new Date().getHours();
  if (day === 6) return hour < 14 ? "saturday_morning" : "saturday_evening";
  if (day === 0) return hour < 14 ? "sunday_morning" : "sunday_evening";
  return hour < 14 ? "morning" : "evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SESSION_CONFIG = {
  morning: {
    label: "Morning check-in",
    heading: "Good morning.",
    sub: "A moment to arrive before the day begins.",
    prompts: [
      { field: "emotionalReflection", label: "How are you arriving today?",          placeholder: "No need to dress it up…" },
      { field: "whatFeltHeavy",        label: "What's sitting with you right now?",   placeholder: "Whatever is present…" },
      { field: "carryForward",         label: "What do you need most today?",         placeholder: "One thing, held lightly…" },
    ],
  },
  evening: {
    label: "Evening reflection",
    heading: "The day is closing.",
    sub: "A gentle close before you rest.",
    prompts: [
      { field: "eveningReflection",    label: "How did today actually feel?",                   placeholder: "Honest is enough…" },
      { field: "openLoops",            label: "What are you putting down before tomorrow?",     placeholder: "Set it here, leave it here…" },
      { field: "carryForward",         label: "What do you want to carry forward?",             placeholder: "One thread worth keeping…" },
    ],
  },
  saturday_morning: {
    label: "Saturday morning",
    heading: "The week is behind you.",
    sub: "Decompress. You don't have to figure anything out yet.",
    prompts: [
      { field: "emotionalReflection", label: "How are you arriving into the weekend?",  placeholder: "Where are you landing…" },
      { field: "nervousSystemState",  label: "What does your body need today?",          placeholder: "Rest, movement, quiet, company…" },
      { field: "whatFeltHeavy",       label: "What are you letting go of from the week?", placeholder: "Name it so you can set it down…" },
    ],
  },
  saturday_evening: {
    label: "Saturday evening",
    heading: "Settling into the evening.",
    sub: "No agenda. Just noticing.",
    prompts: [
      { field: "eveningReflection",   label: "How did today feel?",        placeholder: "Whatever comes up…" },
      { field: "whatWorked",          label: "What did you enjoy today?",  placeholder: "Big or small…" },
      { field: "carryForward",        label: "What do you need tonight?",  placeholder: "Rest, connection, quiet…" },
    ],
  },
  sunday_morning: {
    label: "Sunday morning",
    heading: "A slower morning.",
    sub: "Space to restore and look gently ahead.",
    prompts: [
      { field: "emotionalReflection", label: "How are you feeling after the rest?",         placeholder: "Whatever is true…" },
      { field: "whatWorked",          label: "What restored you this weekend?",              placeholder: "People, stillness, small pleasures…" },
      { field: "carryForward",        label: "What do you want to carry into the new week?", placeholder: "A feeling, an intention, a word…" },
    ],
  },
  sunday_evening: {
    label: "Sunday evening",
    heading: "The weekend is closing.",
    sub: "A quiet moment before the week begins.",
    prompts: [
      { field: "eveningReflection",   label: "What's your energy like heading into the week?", placeholder: "Honest is fine…" },
      { field: "emotionalReflection", label: "What are you feeling about tomorrow?",            placeholder: "No need to fix it, just name it…" },
      { field: "carryForward",        label: "What would help you feel ready?",                 placeholder: "One small thing…" },
    ],
  },
};

const MOODS = ["Calm", "Foggy", "Anxious", "Clear", "Tired", "Present", "Reactive", "Creative", "Heavy", "Grounded"];

function MicroLabel({ children }) {
  return <span className="j-micro">{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`j-card ${className}`}>{children}</div>;
}

export default function Home() {
  const sessionType = getSessionType();
  const config = SESSION_CONFIG[sessionType];

  const [message, setMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  const [entry, setEntry] = useState({
    entryType: sessionType,
    date: todayIso(),
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

  function update(field, value) {
    setEntry((prev) => ({ ...prev, [field]: value }));
  }

  function pickMood(mood) {
    setSelectedMood(mood);
    update("mood", mood);
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

  const saveLabel = {
    saving: "Saving…",
    saved: "Saved to Notion",
    error: "Something went wrong",
  };

  return (
    <main className="j-wrap">

      <div className="j-datebar">
        <span className="j-date">{formatDate()}</span>
      </div>

      <header className="j-hero">
        <p className="j-eyebrow">{config.label}</p>
        <h1 className="j-title">{config.heading}</h1>
        <p className="j-sub">{config.sub}</p>
      </header>

      <Card>
        <div className="j-card-head">
          <MicroLabel>Mood</MicroLabel>
        </div>
        <div className="j-mood-grid">
          {MOODS.map((mood) => (
            <button
              key={mood}
              className={`j-mood-pill ${selectedMood === mood ? "j-mood-active" : ""}`}
              onClick={() => pickMood(mood)}
            >
              {mood}
            </button>
          ))}
        </div>

        <div className="j-energy-row">
          <MicroLabel>Energy — {entry.energyLevel} / 10</MicroLabel>
          <input
            className="j-range"
            type="range"
            min="1"
            max="10"
            value={entry.energyLevel}
            onChange={(e) => update("energyLevel", e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="j-prompts">
          {config.prompts.map(({ field, label, placeholder }) => (
            <div className="j-prompt" key={field}>
              <MicroLabel>{label}</MicroLabel>
              <textarea
                className="j-textarea"
                placeholder={placeholder}
                value={entry[field]}
                onChange={(e) => update(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="j-save-row">
        {message && (
          <span className={`j-message ${message === "error" ? "j-message-error" : ""}`}>
            {saveLabel[message]}
          </span>
        )}
        <button
          className="j-save"
          onClick={saveEntry}
          disabled={message === "saving"}
        >
          Save {config.label} to Notion
        </button>
      </div>

    </main>
  );
}
