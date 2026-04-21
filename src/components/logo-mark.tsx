interface Props {
  className?: string;
}

export default function LogoMark({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fiq-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="26" height="18" rx="5" fill="url(#fiq-logo-g)" />
      <path d="M10 22 L7 28 L16 22 Z" fill="url(#fiq-logo-g)" />
      <circle cx="11" cy="13" r="1.7" fill="#ffffff" />
      <circle cx="16" cy="13" r="1.7" fill="#ffffff" />
      <circle cx="21" cy="13" r="1.7" fill="#ffffff" />
    </svg>
  );
}
