const ITEMS = [
  { id: 'home', icon: '🏠', key: 'nav_home' },
  { id: 'opps', icon: '🏪', key: 'nav_opps' },
  { id: 'advisor', icon: '🤖', key: 'nav_advisor' },
  { id: 'register', icon: '📝', key: 'nav_register' },
  { id: 'agreement', icon: '📄', key: 'nav_agreement' },
]

export default function BottomNav({ t, page, go }) {
  return (
    <nav className="bottomnav">
      {ITEMS.map((it) => (
        <button
          key={it.id}
          className={page === it.id ? 'active' : ''}
          onClick={() => go(it.id)}
          aria-current={page === it.id ? 'page' : undefined}
        >
          <span className="ico" aria-hidden="true">{it.icon}</span>
          <span className="lbl">{t(it.key)}</span>
        </button>
      ))}
    </nav>
  )
}
