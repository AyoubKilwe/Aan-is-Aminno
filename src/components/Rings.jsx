// The signature element: the circle.
// A hagbad is a circle of women around one shared pot; trust is drawn as the same ring.

const LEVEL_COLOR = { green: 'var(--good)', yellow: 'var(--caution)', red: 'var(--bad)' }

export function TrustRing({ score, level, size = 56, stroke = 6, label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c
  return (
    <div className="trust-ring" style={{ width: size, height: size }} role="img" aria-label={label || `Trust ${score} of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={LEVEL_COLOR[level]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="trust-num" style={{ fontSize: size * 0.32 }}>{score}</span>
    </div>
  )
}

// Home: members as dots around the pot; the arc shows how much of the pot is committed.
export function HagbadRing({ members, committedRatio, children }) {
  const size = 200
  const cx = size / 2
  const dotsR = 88
  const arcR = 70
  const c = 2 * Math.PI * arcR
  const n = Math.min(Math.max(members, 1), 30)
  const dots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2
    return [cx + dotsR * Math.cos(a), cx + dotsR * Math.sin(a)]
  })
  return (
    <div className="hagbad-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={n > 16 ? 3.5 : 5} fill="var(--accent)" opacity="0.85" />)}
        <circle cx={cx} cy={cx} r={arcR} fill="none" stroke="var(--fill)" strokeWidth="12" />
        {committedRatio > 0 && (
          <circle
            cx={cx} cy={cx} r={arcR} fill="none"
            stroke="var(--gold)" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${committedRatio * c} ${c}`}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        )}
      </svg>
      <div className="hagbad-center">{children}</div>
    </div>
  )
}
