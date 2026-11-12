import Icon from './Icon.jsx'
import { TrustRing } from './Rings.jsx'
import { scoreBusiness, fmt } from '../lib/trustScore.js'

// How much a business still needs, and a bar showing what groups have already put in.
export function Funding({ t, b }) {
  const raised = b.raised || 0
  const left = Math.max(0, b.amountNeeded - raised)
  const pct = Math.min(100, Math.round((raised / b.amountNeeded) * 100))
  return (
    <div className="funding">
      <div className="funding-top">
        <span>{left === 0 ? t('funded') : t('still_needs')}</span>
        {left > 0 && <b className="tnum">{fmt(left)}</b>}
      </div>
      <div className="funding-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{ width: `${pct}%` }} /></div>
      {raised > 0 && <div className="funding-note">{t('raised_of', { a: fmt(raised), b: fmt(b.amountNeeded) })}</div>}
    </div>
  )
}

// One business: trust ring, name, where it is and what it is, money still needed, payback time.
export default function BizCard({ t, b, onOpen }) {
  const s = scoreBusiness(b)
  return (
    <button className="biz-card" onClick={onOpen}>
      <div className="biz-top">
        <TrustRing score={s.score} level={s.level} size={56} label={t('trust_of', { n: s.score })} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="biz-name">{b.name}</p>
          <p className="biz-meta"><Icon name="pin" size={14} /> {b.area} · {t(`cat_${b.category}`)}</p>
          <span className={`level-pill ${s.level}`}>{t(`lvl_${s.level}`)}</span>
        </div>
        <Icon name="chevron" size={18} className="chev" />
      </div>
      <Funding t={t} b={b} />
      <div className="biz-back">{t('card_back')}: <b>{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</b></div>
    </button>
  )
}
