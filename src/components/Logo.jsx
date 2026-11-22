// Wordmark: "aan is aamino" drawn as one monoline, no icon.
// - the final "o" is the hagbad: 8 members around one shared pot
// - the dots of the two "i"s are seeds
// - a swoosh runs under the name and rises at the end: the savings growing
// Every letter is drawn by hand on a 40-unit x-height (baseline y=60), stroke 7, round ends.

const R = 16.5 // bowl radius (centre line)
const TOP = 20 + 3.5 // top of x-height, centre line
const BASE = 60 - 3.5 // baseline, centre line

const a = (x) => `M${x + 20 + R} ${TOP}V${BASE}M${x + 20 + R} 40A${R} ${R} 0 1 0 ${x + 20 - R} 40A${R} ${R} 0 1 0 ${x + 20 + R} 40`
const n = (x) => `M${x + 3.5} ${TOP}V${BASE}M${x + 3.5} 40A${R} ${R} 0 0 1 ${x + 3.5 + 2 * R} 40V${BASE}`
const i = (x) => `M${x + 3.5} 30V${BASE}`
const m = (x) => `M${x + 3.5} ${TOP}V${BASE}M${x + 3.5} 36A12 12 0 0 1 ${x + 27.5} 36V${BASE}M${x + 27.5} 36A12 12 0 0 1 ${x + 51.5} 36V${BASE}`
const s = (x) => `M${x + 24} 28C${x + 21} 22.5 ${x + 15} 21.5 ${x + 12} 21.5C${x + 6} 21.5 ${x + 3.5} 25 ${x + 3.5} 30C${x + 3.5} 38 ${x + 24.5} 36 ${x + 24.5} 47C${x + 24.5} 54 ${x + 19} 57.5 ${x + 13} 57.5C${x + 8} 57.5 ${x + 4.5} 55.5 ${x + 3} 52`

// One path per letter, so the intro animation can draw them one after another.
const GLYPHS = [a(0), a(45), n(91), i(153), s(167), a(217), a(262), m(308), i(369), n(383)]
const HAGBAD_O = { cx: 449, cy: 40 }
const SEEDS = [[156.5, 12], [372.5, 12]]
// The tail of the "s" loops once, then runs under the whole name and rises: the savings growing.
const FLOURISH = 'M170 52C168 66 174 79 187 79C199 79 202 66 192 64C181 62 178 80 208 83C290 90 395 86 476 58'

export function Wordmark({ height = 32, title = 'Aan Is Aamino' }) {
  const circ = 2 * Math.PI * R
  return (
    <svg className="wordmark" height={height} viewBox="-2 2 482 86" role="img" aria-label={title}>
      <title>{title}</title>
      <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS.map((d, k) => <path key={k} className="wm-glyph" d={d} pathLength="1" style={{ '--k': k }} />)}
      </g>
      {/* the hagbad "o": eight members around the shared pot */}
      <circle className="wm-o" cx={HAGBAD_O.cx} cy={HAGBAD_O.cy} r={R} fill="none" stroke="currentColor" strokeWidth="7"
        strokeDasharray={`${circ / 8 - 4} 4`} transform={`rotate(-90 ${HAGBAD_O.cx} ${HAGBAD_O.cy})`} />
      <circle cx={HAGBAD_O.cx} cy={HAGBAD_O.cy} r="5.5" className="wm-accent" />
      {SEEDS.map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" className="wm-accent" />)}
      <path className="wm-swoosh" d={FLOURISH} fill="none" strokeWidth="4.5" strokeLinecap="round" pathLength="1" />
    </svg>
  )
}

export default function Logo({ size = 36, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="logo" onClick={onClick} aria-label="Aan Is Aamino">
      <Wordmark height={Math.round(size * 1.35)} />
    </Tag>
  )
}
