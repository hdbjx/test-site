export function Stars({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-red" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={className} fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
