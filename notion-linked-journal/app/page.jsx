"use client";

import { useState } from "react";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

const today = todayIso();
const weekendMode = isWeekend();

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

  function update(field, value) {
    setEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setEntry((prev) => ({
      ...prev,
      entryType: nextMode,
    }));
  }

  async function saveEntry() {
    setMessage("Saving to Notion...");

    const res = await fetch("/api/journal/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
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
        <p className="eyebrow">
          {weekendMode ? "Weekend Reset" : "Nina’s Journal"}
        </p>

        <h1>
          {weekendMode
            ? "A softer place to land."
            : "A calmer way to check in."}
        </h1>

        <p>
          {weekendMode
            ? "No pressure. Just notice what feels supportive, what needs softening, and what would help you reset."
            : "A simple reflection space for clarity, calm, regulation and aligned growth."}
        </p>
      </section>

      {!weekendMode && (
        <nav className="tabs">
          <button
            className={mode === "Morning" ? "active" : ""}
            onClick={() => switchMode("Morning")}
          >
            Morning
          </button>

          <button
            className={mode === "Evening" ? "active" : ""}
            onClick={() => switchMode("Evening")}
          >
            Evening
          </button>
        </nav>
      )}

      {message && <div className="notice">{message}</div>}

      <section className="panel">
        {weekendMode ? (
          <>
            <h2>Weekend reset</h2>

            <Field label="How do I actually feel today?">
              <textarea
                value={entry.emotionalReflection}
                onChange={(e) =>
                  update("emotionalReflection", e.target.value)
                }
              />
            </Field>

            <Field label="What does my nervous system need this weekend?">
              <textarea
                value={entry.nervousSystemState}
                onChange={(e) =>
                  update("nervousSystemState", e.target.value)
                }
              />
            </Field>

            <Field label="What would make home feel calmer?">
              <textarea
                value={entry.homeReflection}
                onChange={(e) =>
                  update("homeReflection", e.target.value)
                }
              />
            </Field>

            <Field label="What feels emotionally unfinished?">
              <textarea
                value={entry.openLoops}
                onChange={(e) => update("openLoops", e.target.value)}
              />
            </Field>

            <Field label="What do I want less of next week?">
              <textarea
                value={entry.whatFeltHeavy}
                onChange={(e) =>
                  update("whatFeltHeavy", e.target.value)
                }
              />
            </Field>

            <Field label="What would support me properly this week?">
              <textarea
                value={entry.carryForward}
                onChange={(e) =>
                  update("carryForward", e.target.value)
                }
              />
            </Field>

            <button className="save" onClick={saveEntry}>
              Save weekend reset to Notion
            </button>
          </>
        ) : mode === "Morning" ? (
          <>
            <h2>Morning check-in</h2>

            <Field label="How do I actually feel today?">
              <textarea
                value={entry.emotionalReflection}
                onChange={(e) =>
                  update("emotionalReflection", e.target.value)
                }
              />
            </Field>

            <Field label="What feels heavy right now?">
              <textarea
                value={entry.whatFeltHeavy}
                onChange={(e) =>
                  update("whatFeltHeavy", e.target.value)
                }
              />
            </Field>

            <Field label="What feels supportive right now?">
              <textarea
                value={entry.whatWorked}
                onChange={(e) => update("whatWorked", e.target.value)}
              />
            </Field>

            <Field label="What do I need most today?">
              <textarea
                value={entry.carryForward}
                onChange={(e) =>
                  update("carryForward", e.target.value)
                }
              />
            </Field>

            <Field label={`Energy level: ${entry.energyLevel}/10`}>
              <input
                type="range"
                min="1"
                max="10"
                value={entry.energyLevel}
                onChange={(e) => update("energyLevel", e.target.value)}
              />
            </Field>

            <button className="save" onClick={saveEntry}>
              Save morning to Notion
            </button>
          </>
        ) : (
          <>
            <h2>Evening reflection</h2>

            <Field label="What worked today?">
              <textarea
                value={entry.whatWorked}
                onChange={(e) => update("whatWorked", e.target.value)}
              />
            </Field>

            <Field label="What felt hard today?">
              <textarea
                value={entry.whatFeltHeavy}
                onChange={(e) =>
                  update("whatFeltHeavy", e.target.value)
                }
              />
            </Field>

            <Field label="What drained me?">
              <textarea
                value={entry.openLoops}
                onChange={(e) => update("openLoops", e.target.value)}
              />
            </Field>

            <Field label="What regulated me?">
              <textarea
                value={entry.eveningReflection}
                onChange={(e) =>
                  update("eveningReflection", e.target.value)
                }
              />
            </Field>

            <Field label="What needs carrying forward?">
              <textarea
                value={entry.carryForward}
                onChange={(e) =>
                  update("carryForward", e.target.value)
                }
              />
            </Field>

            <button className="save" onClick={saveEntry}>
              Save evening to Notion
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
