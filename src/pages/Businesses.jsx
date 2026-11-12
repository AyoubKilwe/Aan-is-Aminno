import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { NavBar, Segmented } from '../components/UI.jsx'
import { scoreBusiness, fmt } from '../lib/trustScore.js'
import { RESERVE_RATIO } from '../data/businesses.js'

export default function Businesses({ t, group, businesses, invested, go, openRegister }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const available = Math.max(0, group.savings * (1 - RESERVE_RATIO) - invested)

  const rows = businesses
    .map((b) => ({ b, s: scoreBusiness(b) }))
    .filter(({ b }) => {
      const needle = q.trim().toLowerCase()
      return !needle || b.name.toLowerCase().includes(needle) || b.area.toLowerCase().includes(needle)
    })
    .filter(({ b, s }) => (filter === 'trusted' ? s.level === 'green' : filter === 'afford' ? b.amountNeeded <= available : true))
    .sort((x, y) => y.s.score - x.s.score)

  return (
    <>
      <NavBar
        title={t('biz_title')}
        trailing={
          <button className="nav-btn" onClick={openRegister} aria-label={t('biz_list')}>
            <Icon name="plus" size={24} />
          </button>
        }
      />
      <main className="screen">
        <h1 className="large-title">{t('biz_title')}</h1>
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('biz_search')} aria-label={t('biz_search')} />
        </label>
        <Segmented
          wide
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('biz_all') },
            { value: 'trusted', label: t('biz_trusted') },
            { value: 'afford', label: t('biz_afford') },
          ]}
        />

        {rows.length === 0 ? (
          <div className="empty">
            <Icon name="search" size={40} />
            <p>{t('biz_empty')}</p>
          </div>
        ) : (
          <div className="biz-list">
            {rows.map(({ b, s }) => (
              <button key={b.id} className="biz-card" onClick={() => go('biz', b.id)}>
                <div className="biz-top">
                  <TrustRing score={s.score} level={s.level} size={52} label={t('trust_of', { n: s.score })} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="biz-name">{b.name}</p>
                    <div className="biz-meta"><Icon name="pin" size={14} /> {b.area}</div>
                  </div>
                  <Icon name="chevron" size={18} className="chev" />
                </div>
                <dl className="biz-stats">
                  <div><dt>{t('biz_needs')}</dt><dd className="tnum">{fmt(b.amountNeeded)}</dd></div>
                  <div><dt>{t('biz_profit')}</dt><dd className="tnum">{fmt(b.monthlyProfit)}</dd></div>
                  <div><dt>{t('biz_payback')}</dt><dd className="tnum">{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</dd></div>
                </dl>
                <div>
                  {s.verifiedCount > 0
                    ? <span className="badge good"><Icon name="shield" size={14} /> {t('biz_verified', { n: s.verifiedCount })}</span>
                    : <span className="badge neutral">{t('biz_unverified')}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
