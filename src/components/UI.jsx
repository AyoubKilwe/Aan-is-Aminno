import { useEffect } from 'react'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'

// Each kind of user sees only the sections they need.
export const TABS_BY_ROLE = {
  group: [
    { id: 'home', icon: 'home', key: 'tab_home' },
    { id: 'biz', icon: 'store', key: 'tab_biz' },
    { id: 'advisor', icon: 'advisor', key: 'tab_advisor' },
    { id: 'learn', icon: 'play', key: 'tab_learn' },
  ],
  owner: [
    { id: 'mine', icon: 'store', key: 'tab_mine' },
    { id: 'advisor', icon: 'advisor', key: 'tab_advisor' },
    { id: 'learn', icon: 'play', key: 'tab_learn' },
  ],
}

// Top bar of the app: logo with name, section links on desktop, language switch.
export function AppHeader({ t, tabs = [], tab, onTab, lang, setLang, onLogo }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Logo size={34} onClick={onLogo} />
        <nav className="app-nav" aria-label="Main">
          {tabs.map((x) => (
            <button key={x.id} className={tab === x.id ? 'on' : ''} onClick={() => onTab(x.id)} aria-current={tab === x.id ? 'page' : undefined}>
              <Icon name={x.icon} size={18} /> {t(x.key)}
            </button>
          ))}
        </nav>
        <div className="header-end">
          <Segmented label={t('language')} value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'so', label: 'SO' }]} />
        </div>
      </div>
    </header>
  )
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="large-title">{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// Back bar for pushed detail views.
export function NavBar({ onBack, backLabel, trailing }) {
  return (
    <div className="navbar">
      <div>
        {onBack && (
          <button className="nav-btn" onClick={onBack}>
            <Icon name="back" size={20} /> {backLabel}
          </button>
        )}
      </div>
      <div>{trailing}</div>
    </div>
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
        <button key={o.value} role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function TabBar({ t, tabs = [], tab, onTab }) {
  return (
    <nav className="tabbar" aria-label="Main" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      {tabs.map((x) => (
        <button key={x.id} className={tab === x.id ? 'on' : ''} onClick={() => onTab(x.id)} aria-current={tab === x.id ? 'page' : undefined}>
          <Icon name={x.icon} size={24} />
          <span className="lbl">{t(x.key)}</span>
        </button>
      ))}
    </nav>
  )
}
