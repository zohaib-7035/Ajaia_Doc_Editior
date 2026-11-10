// Small inline SVG icons (stroke style), so the UI needs no icon dependency.
type P = { className?: string };
const base = (path: React.ReactNode, { className = "h-4 w-4" }: P = {}) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {path}
  </svg>
);

export const IconUndo = (p: P) => base(<><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>, p);
export const IconRedo = (p: P) => base(<><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" /></>, p);
export const IconBold = (p: P) => base(<path d="M6 12h9a4 4 0 0 1 0 8H6V4h8a4 4 0 0 1 0 8" />, p);
export const IconItalic = (p: P) => base(<><path d="M19 4h-9" /><path d="M14 20H5" /><path d="M15 4 9 20" /></>, p);
export const IconUnderline = (p: P) => base(<><path d="M6 4v6a6 6 0 0 0 12 0V4" /><path d="M4 20h16" /></>, p);
export const IconBullets = (p: P) => base(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>, p);
export const IconNumbers = (p: P) => base(<><path d="M10 6h11M10 12h11M10 18h11" /><path d="M4 6h1v4M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></>, p);
export const IconPlus = (p: P) => base(<><path d="M12 5v14M5 12h14" /></>, p);
export const IconUpload = (p: P) => base(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></>, p);
export const IconUsers = (p: P) => base(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>, p);
export const IconTrash = (p: P) => base(<><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>, p);
export const IconX = (p: P) => base(<><path d="M18 6 6 18M6 6l12 12" /></>, p);
export const IconCloudCheck = (p: P) => base(<><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /><path d="m9.5 13.5 2 2 4-4" /></>, p);
export const IconLock = (p: P) => base(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, p);
export const IconArrowLeft = (p: P) => base(<><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></>, p);

/** Document glyph used as the logo and in lists. */
export function DocGlyph({ className = "h-5 w-5", shared = false }: P & { shared?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill={shared ? "#f59e0b" : "#2563eb"} />
      <path d="M14 2v6h6" fill={shared ? "#fcd34d" : "#93c5fd"} />
      <path d="M8 13h8M8 17h5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

const AVATAR_COLORS = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-rose-600", "bg-amber-600", "bg-cyan-600"];
export function Avatar({ name, className = "h-8 w-8 text-sm" }: { name: string; className?: string }) {
  const color = AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${className}`} title={name}>
      {name[0]?.toUpperCase()}
    </span>
  );
}
