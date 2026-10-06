"use client";

import { useState, type FormEvent } from "react";

type Props = {
  name: string;
  label: string;
  hint?: string;
};

/**
 * Free-form notes that deliberately are not a form text control.
 * Mobile Safari can ignore autocomplete="off" and inject a saved street address
 * into nearby textareas. A contenteditable editor avoids that heuristic while a
 * hidden input preserves the existing FormData/API contract.
 */
export function AutofillSafeNotes({ name, label, hint }: Props) {
  const [value, setValue] = useState("");
  const editorId = `${name}-editor`;

  function onInput(event: FormEvent<HTMLDivElement>) {
    setValue(event.currentTarget.innerText.replace(/\u00a0/g, " "));
  }

  return (
    <div>
      <div id={`${editorId}-label`} className="field-label">
        {label}<span className="field-hint"> (optional)</span>
        {hint && <span className="field-hint block text-sm">{hint}</span>}
      </div>
      <div
        id={editorId}
        role="textbox"
        aria-multiline="true"
        aria-labelledby={`${editorId}-label`}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        data-placeholder="Add a note only if there is something our team should know."
        data-form-type="other"
        data-1p-ignore="true"
        data-lpignore="true"
        className="field autofill-safe-notes"
        onInput={onInput}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
