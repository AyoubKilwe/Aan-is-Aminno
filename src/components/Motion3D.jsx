import { useEffect, useRef, useState } from 'react'

// Small 3D-looking objects for the landing page, drawn with SVG gradients (no images, no libraries).
let uid = 0
const useId = () => useRef(`o3d${++uid}`).current

export function Coin({ size = 64 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c98a12" /><stop offset="1" stopColor="#8a5a05" /></linearGradient>
        <radialGradient id={`${id}f`} cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#fff3b8" /><stop offset=".45" stopColor="#fbbf24" /><stop offset="1" stopColor="#d18b0c" /></radialGradient>
      </defs>
      <ellipse cx="32" cy="36" rx="26" ry="24" fill={`url(#${id}e)`} />
      <ellipse cx="32" cy="30" rx="26" ry="24" fill={`url(#${id}f)`} />
      <ellipse cx="32" cy="30" rx="18" ry="16.5" fill="none" stroke="#b7790b" strokeOpacity=".5" strokeWidth="2" />
      <text x="32" y="37.5" textAnchor="middle" fontSize="20" fontWeight="800" fill="#a8680a" fontFamily="Inter, sans-serif">$</text>
      <path d="M14 20c6-8 16-11 24-9" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function Shield3D({ size = 72 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7be3a6" /><stop offset=".5" stopColor="#16a361" /><stop offset="1" stopColor="#0b5e3a" /></linearGradient>
      </defs>
      <path d="M36 8 60 17v16c0 15-10 26-24 31C22 59 12 48 12 33V17z" fill="#08452b" transform="translate(0 4)" />
      <path d="M36 8 60 17v16c0 15-10 26-24 31C22 59 12 48 12 33V17z" fill={`url(#${id}s)`} />
      <path d="M25 35l8 8 15-16" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 20 34 14" stroke="#fff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Leaf3D({ size = 56 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#4d7c1f" /><stop offset=".6" stopColor="#9ad04a" /><stop offset="1" stopColor="#d9f99d" /></linearGradient>
      </defs>
      <path d="M8 48C8 22 24 8 50 6c0 26-14 42-42 42z" fill={`url(#${id}l)`} />
      <path d="M10 46C22 34 32 24 44 12" stroke="#2f5212" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M20 16c6-4 13-6 20-7" stroke="#fff" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function Spark({ size = 34, color = '#c8f169' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <path d="M17 2l3.6 10.4L31 16l-10.4 3.6L17 30l-3.6-10.4L3 16l10.4-3.6z" fill={color} />
    </svg>
  )
}

// A hand-drawn line that draws itself, like a marker under the headline.
export function Scribble({ className }) {
  return (
    <svg className={className} viewBox="0 0 420 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="M6 26C70 14 150 10 230 14c60 3 120 10 184 4" pathLength="1" />
      <path d="M40 34c90-10 200-12 300-6" pathLength="1" />
    </svg>
  )
}

// Counts from 0 up to the number when it scrolls into view.
export function CountUp({ to, prefix = '', suffix = '', ms = 1400, ready = true }) {
  const ref = useRef(null)
  const [n, setN] = useState(to)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    setN(0)
    if (!ready) return undefined
    let raf
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / ms)
        setN(Math.round(to * (1 - (1 - p) ** 3)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to, ms, ready])
  return <b ref={ref}>{prefix}{n}{suffix}</b>
}

// Splits a heading into words so they can appear one by one, coming out of a blur.
export function Words({ text, base = 0 }) {
  const words = String(text).split(' ')
  return words.map((w, i) => (
    <span key={i}><span className="w" style={{ '--i': base + i }}>{w}</span>{i < words.length - 1 ? ' ' : ''}</span>
  ))
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Opening scene: a dark screen, one lime dot, the name draws itself, then the scene closes into the dot
// and the page appears. Plays on every load and lasts 3 seconds; a tap skips it.
export function useIntro() {
  const [on, setOn] = useState(() => !reducedMotion())
  const done = () => setOn(false)
  return [on, done]
}

export function Intro({ onDone, children }) {
  const [phase, setPhase] = useState('draw') // draw → out
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  const timers = useRef([])
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    timers.current = [setTimeout(() => setPhase('out'), 2400), setTimeout(() => doneRef.current(), 3000)]
    return () => { timers.current.forEach(clearTimeout); document.body.style.overflow = '' }
  }, [])
  const skip = () => {
    if (phase === 'out') return
    timers.current.forEach(clearTimeout)
    setPhase('out')
    timers.current = [setTimeout(() => doneRef.current(), 650)]
  }
  return (
    <div className={`lx-intro ${phase}`} onClick={skip} role="presentation">
      <div className="lx-intro-glow" />
      <span className="lx-intro-dot" />
      <div className="lx-intro-mark">{children}</div>
    </div>
  )
}

// Follows the mouse over an element and writes --mx / --my (-1 … 1) on it, for tilt and parallax.
export function usePointerVars() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return undefined
    let raf
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width) * 2 - 1
      const y = ((e.clientY - r.top) / r.height) * 2 - 1
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => { el.style.setProperty('--mx', x.toFixed(3)); el.style.setProperty('--my', y.toFixed(3)) })
    }
    const leave = () => { el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf) }
  }, [])
  return ref
}

// Cards lean toward the mouse in 3D.
export function useCardTilt(rootRef, selector) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches) return undefined
    const move = (e) => {
      const card = e.target.closest(selector)
      if (!card) return
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
      card.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
      card.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
    }
    const out = (e) => {
      const card = e.target.closest(selector)
      if (card && !card.contains(e.relatedTarget)) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg') }
    }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerout', out)
    return () => { root.removeEventListener('pointermove', move); root.removeEventListener('pointerout', out) }
  }, [rootRef, selector])
}
