"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "@/data/site";
import { track } from "@/lib/analytics";
import styles from "./chat.module.css";

type Msg = { role: "user" | "assistant"; content: string };

const STORE = "ed-chat-v1";
const GREETING = "Hey! I'm the Every Detail assistant. Ask me about packages, prices for your car, openings, or Detail+.";
const STARTERS = ["Which detail should I get?", "How much for my SUV?", "What's open this weekend?", "How does Detail+ work?"];
const HIDDEN_ON = ["/book", "/account", "/auth", "/info-form"];

/* ---- tiny safe markdown: **bold**, [text](/path), "- " lists. No HTML is ever injected. ---- */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${key}-${m.index}`}>{m[1]}</strong>);
    else {
      const href = m[3];
      const label = m[2];
      if (href.startsWith("/") && !href.startsWith("//")) out.push(<Link key={`${key}-${m.index}`} href={href}>{label}</Link>);
      else if (/^(tel|sms|mailto):/.test(href)) out.push(<a key={`${key}-${m.index}`} href={href}>{label}</a>);
      else out.push(label);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = (i: number) => {
    if (!list.length) return;
    blocks.push(<ul key={`ul-${i}`}>{list.map((li, j) => <li key={j}>{inline(li, `li-${i}-${j}`)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const bullet = line.match(/^[-•*]\s+(.*)$/);
    if (bullet) return void list.push(bullet[1]);
    flush(i);
    if (line) blocks.push(<p key={`p-${i}`}>{inline(line.replace(/^#+\s*/, ""), `p-${i}`)}</p>);
  });
  flush(-1);
  return <>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</>;
}

export function ChatWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || "[]");
      if (Array.isArray(saved)) setMessages(saved.slice(-30));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-30)));
      } catch {}
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, loaded]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const send = async (raw: string) => {
    const content = raw.trim().slice(0, 1200);
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    track("chat_message", { path: pathname, turn: next.filter((m) => m.role === "user").length });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-16) }),
      });
      const data = (await res.json().catch(() => null)) as { reply?: string } | null;
      setMessages([...next, { role: "assistant", content: data?.reply || `Something went wrong. Text us at ${site.phone.display}.` }]);
    } catch {
      setMessages([...next, { role: "assistant", content: `I couldn't connect. Text us at ${site.phone.display}.` }]);
    } finally {
      setBusy(false);
    }
  };

  const toggle = () => {
    if (!open) track("chat_open", { path: pathname });
    setOpen(!open);
  };

  return (
    <div className={styles.root} data-open={open}>
      {open && (
        <section className={styles.panel} role="dialog" aria-label="Chat with Every Detail">
          <header className={styles.head}>
            <div>
              <span className={styles.kicker}>Every Detail</span>
              <strong>Ask the crew</strong>
            </div>
            <div className={styles.headActions}>
              {messages.length > 0 && (
                <button type="button" className={styles.reset} onClick={() => setMessages([])}>New chat</button>
              )}
              <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </div>
          </header>

          <div className={styles.list} ref={listRef} aria-live="polite">
            <div className={`${styles.msg} ${styles.bot}`}><p>{GREETING}</p></div>
            {messages.length === 0 && (
              <div className={styles.starters}>
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.me : styles.bot}`}>
                {m.role === "user" ? <p>{m.content}</p> : <Rich text={m.content} />}
              </div>
            ))}
            {busy && (
              <div className={`${styles.msg} ${styles.bot} ${styles.typing}`} aria-label="Typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={1200}
              placeholder="Ask about your car, prices, openings…"
              aria-label="Message"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">↗</button>
          </form>
          <p className={styles.foot}>
            AI assistant · may make mistakes · <a href={site.phone.sms}>Text a human</a>
          </p>
        </section>
      )}

      <button type="button" className={styles.launcher} onClick={toggle} aria-expanded={open} aria-label={open ? "Close chat" : "Chat with Every Detail"}>
        {open ? <span className={styles.x}>×</span> : (
          <>
            <span className={styles.dot} aria-hidden />
            <span>Ask us</span>
          </>
        )}
      </button>
    </div>
  );
}
