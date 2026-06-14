// ChalkMind mark — nested subway-tunnel rings diving toward the light at the
// end of the screen. Ties directly to the "dive into the laptop" concept.
export default function Logo({ size = 34, className = '' }) {
  const rings = [
    { i: 1.5, w: 1.6, c: '#FF003C', o: 0.45 },
    { i: 6, w: 1.8, c: '#00F0FF', o: 0.6 },
    { i: 11, w: 2, c: '#00F0FF', o: 0.95 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <defs>
        <radialGradient id="cm-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {rings.map((r, idx) => {
        const s = 40 - r.i * 2;
        return (
          <rect
            key={idx}
            x={r.i}
            y={r.i}
            width={s}
            height={s}
            rx={s / 3.4}
            stroke={r.c}
            strokeWidth={r.w}
            opacity={r.o}
          />
        );
      })}
      <circle cx="20" cy="20" r="8" fill="url(#cm-core)" />
      <circle cx="20" cy="20" r="2.6" fill="#ffffff" />
    </svg>
  );
}
