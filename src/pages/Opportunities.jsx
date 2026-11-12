import { useState } from 'react'
import { scoreBusiness, paybackMonths } from '../lib/trustScore.js'
import ScoreBadge from '../components/ScoreBadge.jsx'

const ICON = { food: '🍲', retail: '🛍️', tailoring: '🧵', services: '🔧' }

export default function Opportunities({ t, group, businesses, onAsk, onInvest }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [bad, setBad] = useState(false)

  const rows = businesses
    .map((b) => ({ b, s: scoreBusiness(b) }))
    .filter(({ b, s }) =>
      filter === 'green' ? s.level === 'green' : filter === 'afford' ? b.amountNeeded <= group.savings : true,
    )
    .sort((x, y) => y.s.score - x.s.score)

  return (
    <div className="page">
      <h1>{t('opps_title')}</h1>
      <p className="muted">{t('opps_sub')}</p>

      <div className="chips">
        {['all', 'green', 'afford'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {t(`opps_filter_${f}`)}
          </button>
        ))}
      </div>

      <label className="toggle">
        <input type="checkbox" checked={bad} onChange={(e) => setBad(e.target.checked)} />
        <span>⚠️ {t('opps_bad')}</span>
      </label>

      {rows.length === 0 && <p className="muted center">{t('opps_empty')}</p>}

      {rows.map(({ b, s }) => {
        const months = bad ? paybackMonths(b.amountNeeded, b.monthlyProfit, 0.4, 0.3) : s.months
        const isOpen = open === b.id
        return (
          <article key={b.id} className={`card biz level-${s.level}`}>
            <div className="biz-head">
              <div>
                <h3>{ICON[b.category] || '🏪'} {b.name}</h3>
                <p className="muted">📍 {b.area} · {t('opps_owner')}: {b.owner}</p>
              </div>
              <ScoreBadge score={s.score} level={s.level} />
            </div>

            <dl className="stats">
              <div><dt>{t('opps_needs')}</dt><dd>${b.amountNeeded.toLocaleString()}</dd></div>
              <div><dt>{t('opps_profit')}</dt><dd>${b.monthlyProfit.toLocaleString()}</dd></div>
              <div className={bad ? 'warn' : ''}>
                <dt>{t('opps_payback')}</dt>
                <dd>{Number.isFinite(months) ? months : '—'} {t('opps_months')}</dd>
              </div>
            </dl>

            {isOpen && (
              <div className="why">
                <h4>{t('opps_why')}</h4>
                <ul>
                  {s.reasons.map((r) => (
                    <li key={r.key} className={r.points ? 'good' : 'bad'}>
                      <span>{r.points ? '✅' : '⚠️'} {t(r.key)}</span>
                      <b>{r.points ? `+${r.points}` : '0'}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="biz-actions">
              <button className="btn ghost" onClick={() => setOpen(isOpen ? null : b.id)}>
                {isOpen ? t('opps_hide') : t('opps_details')}
              </button>
              <button className="btn ghost" onClick={() => onAsk(b)}>🤖 {t('opps_askAI')}</button>
              <button className="btn primary" onClick={() => onInvest(b)}>📄 {t('opps_invest')}</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
