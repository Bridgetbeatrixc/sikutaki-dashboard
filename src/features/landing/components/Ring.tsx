/** Progress ring with a centered label. */
export function Ring({ value, size = 64, color = "#0A66F5", track = "#E8E8ED", textColor = "var(--color-ink)", label }: {
  value: number; size?: number; color?: string; track?: string; textColor?: string; label?: string;
}) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={track} strokeWidth={6} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`} transform={`rotate(-90 ${mid} ${mid})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={textColor} fontWeight={600} style={{ fontSize: size * 0.26 }}>
        {label ?? value}
      </text>
    </svg>
  );
}
