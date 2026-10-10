import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Base = { label: string; name: string; hint?: string; error?: boolean; errorText?: string; optional?: boolean };

function Label({ label, name, optional, hint }: Base) {
  return (
    <label htmlFor={name} className="field-label">
      {label}
      {optional && <span className="field-hint"> (optional)</span>}
      {hint && <span className="field-hint block text-sm">{hint}</span>}
    </label>
  );
}

function Err({ name, error, errorText }: Base) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="field-error">
      {errorText ?? "This is required."}
    </p>
  );
}

export function TextField(p: Base & InputHTMLAttributes<HTMLInputElement>) {
  const { label, name, hint, error, errorText, optional, ...rest } = p;
  return (
    <div>
      <Label label={label} name={name} hint={hint} optional={optional} />
      <input
        id={name}
        name={name}
        className="field"
        required={!optional}
        aria-invalid={error || undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        {...rest}
      />
      <Err label={label} name={name} error={error} errorText={errorText} />
    </div>
  );
}

export function SelectField(p: Base & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const { label, name, hint, error, errorText, optional, children, ...rest } = p;
  return (
    <div>
      <Label label={label} name={name} hint={hint} optional={optional} />
      <div className="relative">
        <select
          id={name}
          name={name}
          className="field appearance-none pr-10"
          required={!optional}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          {...rest}
        >
          {children}
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
      <Err label={label} name={name} error={error} errorText={errorText} />
    </div>
  );
}

export function TextArea(p: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { label, name, hint, error, errorText, optional, ...rest } = p;
  return (
    <div>
      <Label label={label} name={name} hint={hint} optional={optional} />
      <textarea
        id={name}
        name={name}
        className="field"
        required={!optional}
        aria-invalid={error || undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        autoComplete={rest.autoComplete ?? "off"}
        data-1p-ignore="true"
        data-lpignore="true"
        {...rest}
      />
      <Err label={label} name={name} error={error} errorText={errorText} />
    </div>
  );
}

/** Hidden spam trap. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  return (
    <div role="alert" aria-live="assertive">
      {message && <p className="rounded-[var(--radius-panel)] border border-red bg-white p-4 text-red">{message}</p>}
    </div>
  );
}

/** FormData → plain object. Repeated names (checkbox groups) are joined with ", ". */
export function formToObject(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    const s = String(v);
    out[k] = out[k] ? `${out[k]}, ${s}` : s;
  });
  return out;
}

export function Success({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="panel panel-red p-8">
      <h2 className="t-h3">{title}</h2>
      <div className="mt-3 space-y-3 text-ink/80">{children}</div>
    </div>
  );
}
