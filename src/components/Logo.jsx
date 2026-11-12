// Mark: a circle of members (the hagbad) around one shared pot that is growing.
export function LogoMark({ size = 36 }) {
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * 2 * Math.PI - Math.PI / 2
    return [32 + 19.5 * Math.cos(a), 32 + 19.5 * Math.sin(a)]
  })
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#047857" />
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.2" fill="#fff" />)}
      <circle cx="32" cy="32" r="11" fill="#FBBF24" />
      <path d="M32 39v-9" stroke="#065F46" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 31c0-4 3-6.5 6.5-6.5 0 4-3 6.5-6.5 6.5z" fill="#065F46" />
      <path d="M32 33.5c0-3-2.4-5-5.2-5 0 3 2.4 5 5.2 5z" fill="#065F46" />
    </svg>
  )
}

export default function Logo({ size = 36, onClick }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="logo" onClick={onClick} aria-label="Aan Is Aamino">
      <LogoMark size={size} />
      <span className="logo-word">Aan Is <b>Aamino</b></span>
    </Tag>
  )
}
