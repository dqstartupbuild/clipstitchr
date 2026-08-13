type StudioCutMarkProps = {
  className?: string;
};

export function StudioCutMark({ className }: StudioCutMarkProps) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6.25h7.4l2.2 2.2H20v9.3h-7.4l-2.2-2.2H4v-9.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m9.3 5.1 5.4 13.8M7.4 9.8h3.2m2.8 4.4h3.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
