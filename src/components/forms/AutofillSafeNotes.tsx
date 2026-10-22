"use client";

import { useState, type ClipboardEvent, type FormEvent } from "react";

type Props = {
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
};

/**
 * Free-form notes that deliberately are not a form text control.
 * Mobile Safari can ignore autocomplete="off" and inject a saved street address
 * into nearby textareas. A contenteditable editor avoids that heuristic while a
 * hidden input preserves the existing FormData/API contract.
 */
export function AutofillSafeNotes({
  name,
  label,
  hint,
  placeholder = "Add a note only if there is something our team should know.",
  maxLength = 500,
}: Props) {
  const [value, setValue] = useState("");
  const editorId = `${name}-editor`;
  const hintId = `${editorId}-hint`;
  const countId = `${editorId}-count`;

  function moveCaretToEnd(element: HTMLDivElement) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function onInput(event: FormEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const raw = element.innerText.replace(/\u00a0/g, " ");
    const next = raw.slice(0, maxLength);
    if (raw !== next) {
      element.innerText = next;
      moveCaretToEnd(element);
    }
    setValue(next);
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const currentLength = event.currentTarget.innerText.replace(/\u00a0/g, " ").length;
    const room = Math.max(0, maxLength - currentLength);
    const pasted = event.clipboardData.getData("text/plain").replace(/\u00a0/g, " ").slice(0, room);
    const node = document.createTextNode(pasted);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    setValue(event.currentTarget.innerText.replace(/\u00a0/g, " ").slice(0, maxLength));
  }

  return (
    <div>
      <div id={`${editorId}-label`} className="field-label">
        {label}<span className="field-hint"> (optional)</span>
        {hint && <span id={hintId} className="field-hint block text-sm">{hint}</span>}
      </div>
      <div
        id={editorId}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${editorId}-label`}
        aria-describedby={[hint ? hintId : "", countId].filter(Boolean).join(" ")}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        data-form-type="other"
        data-1p-ignore="true"
        data-lpignore="true"
        className="field autofill-safe-notes"
        onInput={onInput}
        onPaste={onPaste}
      />
      <div className="autofill-safe-notes-meta">
        <span id={countId}>{value.length}/{maxLength}</span>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
