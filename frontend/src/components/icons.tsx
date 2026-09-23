type IconProps = { className?: string };

const base = "shrink-0";

export function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M5 2.5h7l3 3v12a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-14a.5.5 0 0 1 .5-.5Z" strokeLinejoin="round" />
      <path d="M12 2.5v3h3" strokeLinejoin="round" />
      <path d="M7 10h6M7 12.5h6M7 15h4" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <rect x="2.5" y="4" width="15" height="13.5" rx="1.5" />
      <path d="M2.5 8h15M6.5 2v3.5M13.5 2v3.5" strokeLinecap="round" />
    </svg>
  );
}

export function LinkArrowIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <path d="M8 5h7v7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 5 5 15" strokeLinecap="round" />
    </svg>
  );
}

export function SourceIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M7 3h7.5L17 5.5V17a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V3.5A.5.5 0 0 1 7 3Z" strokeLinejoin="round" />
      <path d="M6 6.5H3.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5H12" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckCircleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.5 10.2 8.8 12.5l4.7-5.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuestionCircleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.8 7.8a2.2 2.2 0 1 1 3.2 2c-.7.5-1 .9-1 1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="14" r="0.15" fill="currentColor" stroke="none" />
      <path d="M10 13.6v.1" strokeLinecap="round" strokeWidth={2.2} />
    </svg>
  );
}

export function XCircleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path d="M10 2.5 18 16.5H2L10 2.5Z" strokeLinejoin="round" />
      <path d="M10 8v3.5" strokeLinecap="round" />
      <path d="M10 14v.1" strokeLinecap="round" strokeWidth={2.2} />
    </svg>
  );
}

export function InboxIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M3 11.5 5.5 4h9L17 11.5" strokeLinejoin="round" />
      <path d="M3 11.5v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3h-4.2a2.8 2.8 0 0 1-5.6 0H3Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M10 2.5 16.5 5v5c0 4-2.7 6.7-6.5 7.5C6.2 16.7 3.5 14 3.5 10V5L10 2.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M3 4.5h14v9H8.5L5 16.5v-3H3v-9Z" strokeLinejoin="round" />
      <path d="M6.5 8h7M6.5 10.5h4.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <circle cx="10" cy="6.5" r="3.25" />
      <path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowDownIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <path d="M10 3.5v12M10 15.5 5.5 11M10 15.5l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CircleDotIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="6.5" />
    </svg>
  );
}

export function SendIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path d="M17 3 3 9.5l6 2.2M17 3l-5.5 14-2.5-5.3M17 3 9.5 11.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SlidersIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className={`${base} ${className}`}>
      <path d="M3 6h9M15.5 6H17M3 14h5.5M11 14H17" strokeLinecap="round" />
      <circle cx="11.5" cy="6" r="1.75" />
      <circle cx="8.5" cy="14" r="1.75" />
    </svg>
  );
}

export function SparkleIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path
        d="M10 2.5c.5 3 2 4.5 5 5-3 .5-4.5 2-5 5-.5-3-2-4.5-5-5 3-.5 4.5-2 5-5Z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M16 14v3M14.5 15.5h3" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M2.75 10h14.5M10 2.75c2 2.1 3 4.6 3 7.25s-1 5.15-3 7.25c-2-2.1-3-4.6-3-7.25s1-5.15 3-7.25Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} className={`${base} ${className}`}>
      <path d="M3.5 10h12M10 4.5 15.5 10 10 15.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BuildingIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className={`${base} ${className}`}>
      <path d="M4 17.5V4l6-2 6 2v13.5" strokeLinejoin="round" />
      <path d="M2 17.5h16M7 8h1.5M11.5 8H13M7 11h1.5M11.5 11H13M7 14h1.5M11.5 14H13" strokeLinecap="round" />
    </svg>
  );
}
