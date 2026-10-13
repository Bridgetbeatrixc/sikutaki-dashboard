import type { ReactNode } from "react";

export type BlobIcon = "clip" | "lungs" | "smile";

/** Soft, slightly 3D thumbnail made from a radial gradient and a white glyph. */
export function Blob({ hue, icon }: { hue: string; icon: BlobIcon }) {
  const glyphs: Record<BlobIcon, ReactNode> = {
    clip: (<><rect x="17" y="13" width="22" height="30" rx="4" fill="#fff" fillOpacity=".9" /><path d="M22 22h12M22 28h12M22 34h8" stroke={hue} strokeWidth="2.6" strokeLinecap="round" /></>),
    lungs: (<path d="M28 14v12M28 24c-3 0-5 2-5 6v8c0 3-6 4-7 0-1-6 0-14 5-16 3-1 7 0 7 2zM28 24c3 0 5 2 5 6v8c0 3 6 4 7 0 1-6 0-14-5-16-3-1-7 0-7 2z" fill="#fff" fillOpacity=".92" stroke={hue} strokeWidth="1.6" />),
    smile: (<><circle cx="28" cy="28" r="12" fill="#fff" fillOpacity=".92" /><path d="M23 30.5a6 6 0 0 0 10 0" stroke={hue} strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d="M24 25h.01M32 25h.01" stroke={hue} strokeWidth="3" strokeLinecap="round" /></>),
  };
  return (
    <svg viewBox="0 0 56 56" className="block size-[52px]" aria-hidden="true">
      <defs>
        <radialGradient id={`blob-${icon}`} cx=".3" cy=".25" r=".9">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".55" stopColor={hue} stopOpacity=".35" />
          <stop offset="1" stopColor={hue} stopOpacity=".7" />
        </radialGradient>
      </defs>
      <rect width="56" height="56" rx="14" fill={`url(#blob-${icon})`} />
      {glyphs[icon]}
    </svg>
  );
}
