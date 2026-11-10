"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import styles from "./join.module.css";

/**
 * Four-question fit check for people who want to join the crew.
 * Nothing is submitted from the site: every path ends on the application email
 * to the team inbox, prefilled with their answers. A resume is required.
 */

type Option = { value: string; label: string; hint?: string };
type Question = { id: string; title: string; note?: string; multi?: boolean; options: Option[] };

const QUESTIONS: Question[] = [
  {
    id: "school",
    title: "Where are you in school?",
    options: [
      { value: "High school", label: "High school" },
      { value: "College", label: "College" },
      { value: "Recent grad / other", label: "Recent grad or other" },
    ],
  },
  {
    id: "availability",
    title: "When could you work?",
    note: "Pick all that apply.",
    multi: true,
    options: [
      { value: "Weekdays after school", label: "Weekdays after school" },
      { value: "Weekends", label: "Weekends" },
      { value: "Summer / breaks", label: "Summer and breaks" },
    ],
  },
  {
    id: "experience",
    title: "Any detailing experience?",
    options: [
      { value: "None yet", label: "None yet", hint: "Ready to learn" },
      { value: "Some (own car, friends, family)", label: "Some", hint: "Own car, friends, family" },
      { value: "Professional", label: "Professional", hint: "Worked at a shop or detailer" },
    ],
  },
  {
    id: "interest",
    title: "What interests you most?",
    options: [
      { value: "Detailing in the field", label: "Detailing in the field", hint: "On the rigs, on real cars" },
      { value: "Operations and scheduling", label: "Operations and scheduling", hint: "Keeping the day running" },
      { value: "Marketing and content", label: "Marketing and content", hint: "Photos, video, social" },
    ],
  },
];

const TOTAL = QUESTIONS.length;

type Answers = Record<string, string[]>;

function buildMailto(email: string, answers: Answers) {
  const line = (id: string, label: string) => `${label}: ${(answers[id] || []).join(", ") || "-"}`;
  const body = [
    "Hi Davis,",
    "",
    "I'd like to apply to join the Every Detail crew. My resume is attached.",
    "",
    "Name:",
    "Phone:",
    "School + grade:",
    "",
    line("school", "In school"),
    line("availability", "Availability"),
    line("experience", "Detailing experience"),
    line("interest", "Most interested in"),
    "",
    "Why I want to join:",
    "",
  ].join("\n");
  return `mailto:${email}?subject=${encodeURIComponent("Application: Every Detail crew")}&body=${encodeURIComponent(body)}`;
}

export function JoinFitCheck({ email }: { email: string }) {
  const [step, setStep] = useState(0); // 0..TOTAL-1 questions, TOTAL = apply screen
  const [answers, setAnswers] = useState<Answers>({});
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // Move focus to the new step's heading after the first interaction, not on load.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const done = step >= TOTAL;
  const q = QUESTIONS[Math.min(step, TOTAL - 1)];
  const picked = answers[q.id] || [];

  const go = (next: number) => {
    moved.current = true;
    setStep(next);
    if (next === TOTAL) track("hiring_click", { location: "about_fit_check_complete" });
  };

  const choose = (value: string) => {
    if (q.multi) {
      setAnswers((a) => {
        const cur = a[q.id] || [];
        return { ...a, [q.id]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
      });
      return;
    }
    setAnswers((a) => ({ ...a, [q.id]: [value] }));
    go(step + 1);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address is visible to copy by hand */
    }
  };

  const mailto = buildMailto(email, answers);
  const isNew = (answers.experience || [])[0] === "None yet";

  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <p className={styles.cardLabel}>{done ? "Application" : "Quick fit check"}</p>
        <p className={styles.cardCount} aria-hidden="true">
          {done ? "Last step" : `${String(step + 1).padStart(2, "0")} / ${String(TOTAL).padStart(2, "0")}`}
        </p>
      </div>
      <div className={styles.progress} aria-hidden="true">
        {Array.from({ length: TOTAL + 1 }, (_, i) => (
          <span key={i} data-on={i <= step ? "" : undefined} />
        ))}
      </div>

      <div className={styles.cardBody} aria-live="polite">
        {!done ? (
          <fieldset className={styles.question} key={q.id}>
            <legend>
              <h3 ref={headingRef} tabIndex={-1} className={styles.qTitle}>{q.title}</h3>
              {q.note ? <span className={styles.qNote}>{q.note}</span> : null}
            </legend>
            <div className={styles.options}>
              {q.options.map((o) => {
                const on = picked.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={styles.option}
                    aria-pressed={on}
                    onClick={() => choose(o.value)}
                  >
                    <span className={styles.optMark} data-multi={q.multi ? "" : undefined} aria-hidden="true" />
                    <span className={styles.optText}>
                      <strong>{o.label}</strong>
                      {o.hint ? <small>{o.hint}</small> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {step > 0 || q.multi ? (
              <div className={styles.nav}>
                {step > 0 ? (
                  <button type="button" className={styles.back} onClick={() => go(step - 1)}>← Back</button>
                ) : <span />}
                {q.multi ? (
                  <button type="button" className={styles.next} disabled={!picked.length} onClick={() => go(step + 1)}>
                    Continue →
                  </button>
                ) : null}
              </div>
            ) : null}
          </fieldset>
        ) : (
          <div className={styles.apply}>
            <h3 ref={headingRef} tabIndex={-1} className={styles.qTitle}>Send your application.</h3>
            <p className={styles.applyLede}>
              {isNew
                ? "No experience is fine. Everyone starts with the same training. "
                : "Good to hear. "}
              Email Davis, our business manager, with your resume attached. Your answers are already filled in.
            </p>

            <ol className={styles.checklist}>
              <li><span>01</span><div><strong>Attach your resume</strong><small>PDF preferred. Required. Applications without one can&apos;t be reviewed.</small></div></li>
              <li><span>02</span><div><strong>Add your name, phone, school and grade</strong><small>The email has spaces for each.</small></div></li>
              <li><span>03</span><div><strong>Tell us why you want in</strong><small>A few sentences is plenty.</small></div></li>
            </ol>

            <a
              href={mailto}
              className={styles.primary}
              onClick={() => track("hiring_click", { location: "about_apply_email" })}
            >
              Email my application <span aria-hidden="true">↗</span>
            </a>

            <div className={styles.addr}>
              <span>{email}</span>
              <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            </div>

            <button type="button" className={styles.back} onClick={() => { moved.current = true; setStep(0); }}>
              ↺ Start over
            </button>
          </div>
        )}
      </div>

      {!done ? (
        <div className={styles.cardFoot}>
          <span>About a minute. Ends with a resume email to Davis.</span>
          <button type="button" onClick={() => go(TOTAL)}>Skip to apply →</button>
        </div>
      ) : null}
    </div>
  );
}
