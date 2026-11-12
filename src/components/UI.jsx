import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

export function NavBar({ title, onBack, backLabel, trailing, showTitle }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div>
        {onBack && (
          <button className="nav-btn" onClick={onBack}>
            <Icon name="back" size={24} /> {backLabel}
          </button>
        )}
      </div>
      {(showTitle || scrolled) && title && <div className="navbar-title">{title}</div>}
      <div>{trailing}</div>
    </header>
  )
}

export function Sheet({ title, onCancel, cancelLabel, action, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onCancel])
  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grabber" aria-hidden="true" />
        <header className="navbar">
          <button className="nav-btn" onClick={onCancel}>{cancelLabel}</button>
          <div className="navbar-title">{title}</div>
          <div>{action}</div>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function Segmented({ options, value, onChange, wide, label }) {
  return (
    <div className={`segmented ${wide ? 'wide' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'home', icon: 'home', key: 'tab_home' },
  { id: 'biz', icon: 'store', key: 'tab_biz' },
  { id: 'advisor', icon: 'advisor', key: 'tab_advisor' },
  { id: 'agr', icon: 'doc', key: 'tab_agr' },
]

export function TabBar({ t, tab, onTab }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((x) => (
        <button key={x.id} className={tab === x.id ? 'on' : ''} onClick={() => onTab(x.id)} aria-current={tab === x.id ? 'page' : undefined}>
          <Icon name={x.icon} size={25} />
          <span className="lbl">{t(x.key)}</span>
        </button>
      ))}
    </nav>
  )
}

export function levelBadge(level) {
  return level === 'green' ? 'good' : level === 'yellow' ? 'caution' : 'bad'
}
