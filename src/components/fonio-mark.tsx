export function FonioMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M9 21.5c3.2-1.2 5.1-4.6 5.1-8.2V8.8h3.2v4.5c0 4.7 2.2 8.3 6.6 9.4l-.8 2.9c-5-1.2-7.7-4.6-8.6-8.6-.9 4-3.6 7.4-8.6 8.6l-.9-2.9Z"
        fill="white"
      />
    </svg>
  );
}
