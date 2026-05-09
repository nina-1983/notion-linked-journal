"use client";

import { useState } from "react";

const moods = ["Calm", "Clear", "Heavy", "Foggy", "Tender", "Grounded"];
const states = ["Regulated", "Activated", "Dysregulated", "Foggy", "Overdriven"];
const supports = ["walk", "protein breakfast", "silence", "movement", "journaling"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="pills">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "pill active" : "pill"}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MultiPills({ options, values, onChange }) {
  function toggle(option) {
    if (values.includes(option)) {
      onChange(values.filter((x) => x !== option));
    } else {
      onChange([...values, option]);
    }
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

export default function Home() {
  const [tab, setTab] = useState("morning");
  const [message, setMessage] = useState("");

  const [morning, setMorning] = useState({
    entryType: "Morning",
    date: todayIso(),
    mood: "",
    nervousSystemState: "",
    energyLevel: 5,
    emotionalReflection: "",
    openLoops: "",
    carryForward: "",
    whatHelped: [],
  });

  const [evening, setEvening] = useState({
    entryType: "Evening",
    date: todayIso(),
    mood: "",
    nervousSystemState: "",
    energyLevel: 5,
    whatWorked: "",
    whatFeltHeavy: "",
    eveningReflection: "",
    carryForward: "",
    whatHelped: [],
  });

  async function saveEntry(data) {
    setMessage("Saving to Notion...");

    const res = await fetch("/api/journal/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setMessage("Saved into Notion 🌿");
    } else {
      setMessage("Something went wrong");
    }
  }

  return (
    <main className="wrap">
      <section className="hero">
        <p className="eyebrow">Nina’s Journal</p>
        <h1>A calmer way to check in.</h1>
      </section>

      <nav className="tabs">
        <button className={tab === "morning" ? "active" : ""} onClick={() => setTab("morning")}>
          Morning
        </button>

        <button className={tab === "evening" ? "active" : ""} onClick={() => setTab("evening")}>
          Evening
        </button>
      </nav>

      {message ? <div className="notice">{message}</div> : null}

      {tab === "morning" ? (
        <section className="panel">
          <h2>Morning check-in</h2>

          <label>
            <span>How do I feel?</span>
            <PillGroup
              options={moods}
              value={morning.mood}
              onChange={(v) => setMorning({ ...morning, mood: v })}
            />
          </label>

          <label>
            <span>Nervous system</span>
            <PillGroup
              options={states}
              value={morning.nervousSystemState}
              onChange={(v) => setMorning({ ...morning, nervousSystemState: v })}
            />
          </label>

          <label>
            <span>Energy: {morning.energyLevel}/10</span>
            <input
              type="range"
              min="1"
              max="10"
              value={morning.energyLevel}
              onChange={(e) => setMorning({ ...morning, energyLevel: e.target.value })}
            />
          </label>

          <label>
            <span>What’s circling?</span>
            <textarea
              value={morning.openLoops}
              onChange={(e) => setMorning({ ...morning, openLoops: e.target.value })}
            />
          </label>

          <label>
            <span>What do I need today?</span>
            <textarea
              value={morning.emotionalReflection}
              onChange={(e) => setMorning({ ...morning, emotionalReflection: e.target.value })}
            />
          </label>

          <label>
            <span>Supports</span>
            <MultiPills
              options={supports}
              values={morning.whatHelped}
              onChange={(v) => setMorning({ ...morning, whatHelped: v })}
            />
          </label>

          <button className="save" onClick={() => saveEntry(morning)}>
            Save morning to Notion
          </button>
        </section>
      ) : (
        <section className="panel">
          <h2>Evening reflection</h2>

          <label>
            <span>How do I feel now?</span>
            <PillGroup
              options={moods}
              value={evening.mood}
              onChange={(v) => setEvening({ ...evening, mood: v })}
            />
          </label>

          <label>
            <span>Nervous system</span>
            <PillGroup
              options={states}
              value={evening.nervousSystemState}
              onChange={(v) => setEvening({ ...evening, nervousSystemState: v })}
            />
          </label>

          <label>
            <span>Energy: {evening.energyLevel}/10</span>
            <input
              type="range"
              min="1"
              max="10"
              value={evening.energyLevel}
              onChange={(e) => setEvening({ ...evening, energyLevel: e.target.value })}
            />
          </label>

          <label>
            <span>What worked?</span>
            <textarea
              value={evening.whatWorked}
              onChange={(e) => setEvening({ ...evening, whatWorked: e.target.value })}
            />
          </label>

          <label>
            <span>What felt heavy?</span>
            <textarea
              value={evening.whatFeltHeavy}
              onChange={(e) => setEvening({ ...evening, whatFeltHeavy: e.target.value })}
            />
          </label>

          <label>
            <span>What needs carrying forward?</span>
            <textarea
              value={evening.carryForward}
              onChange={(e) => setEvening({ ...evening, carryForward: e.target.value })}
            />
          </label>

          <label>
            <span>Supports</span>
            <MultiPills
              options={supports}
              values={evening.whatHelped}
              onChange={(v) => setEvening({ ...evening, whatHelped: v })}
            />
          </label>

          <button className="save" onClick={() => saveEntry(evening)}>
            Save evening to Notion
          </button>
        </section>
      )}
    </main>
  );
}
