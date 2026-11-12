import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { PageHead, Segmented } from '../components/UI.jsx'
import { scoreBusiness, fmt } from '../lib/trustScore.js'

// Group view: businesses near you, safest first. Each card answers three questions:
// can we trust it, how much does it need, when does our money come back.
export default function Businesses({ t, businesses, go }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const rows = businesses
    .map((b) => ({ b, s: scoreBusiness(b) }))
    .filter(({ b }) => {
      const needle = q.trim().toLowerCase()
      return !needle || b.name.toLowerCase().includes(needle) || b.area.toLowerCase().includes(needle)
    })
    .filter(({ s }) => (filter === 'trusted' ? s.level === 'green' : true))
    .sort((x, y) => y.s.score - x.s.score)

  return (
    <main className="screen">
      <PageHead title={t('biz_title')} />
      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('biz_search')} aria-label={t('biz_search')} />
        </label>
        <Segmented wide label="Filter" value={filter} onChange={setFilter}
          options={[{ value: 'all', label: t('biz_all') }, { value: 'trusted', label: t('lvl_green') }]} />
      </div>

      {rows.length === 0 ? (
        <div className="empty"><Icon name="search" size={40} /><p>{t('biz_empty')}</p></div>
      ) : (
        <div className="biz-list">
          {rows.map(({ b, s }) => (
            <button key={b.id} className="biz-card" onClick={() => go('biz', b.id)}>
              <div className="biz-top">
                <TrustRing score={s.score} level={s.level} size={56} label={t('trust_of', { n: s.score })} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="biz-name">{b.name}</p>
                  <span className={`level-pill ${s.level}`}>{t(`lvl_${s.level}`)}</span>
                </div>
                <Icon name="chevron" size={18} className="chev" />
              </div>
              <div className="simple-stats">
                <div><span>{t('card_needs')}</span><b>{fmt(b.amountNeeded)}</b></div>
                <div><span>{t('card_back')}</span><b>{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</b></div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}
