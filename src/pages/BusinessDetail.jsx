import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { NavBar } from '../components/UI.jsx'
import { scoreBusiness, paybackMonths, fmt, VERIFY_CHECKS } from '../lib/trustScore.js'

// One business, in plain words: what it is, the numbers, good signs, warnings, then actions.
export default function BusinessDetail({ t, lang, biz, onBack, onVerify, onAsk, onInvest }) {
  const s = scoreBusiness(biz)
  const bad = paybackMonths(biz.amountNeeded, biz.monthlyProfit, 0.4, 0.3)
  const pitch = typeof biz.pitch === 'object' ? biz.pitch[lang] || biz.pitch.en : biz.pitch
  const reasons = s.reasons.filter((r) => !('verifiedCount' in r))
  const good = reasons.filter((r) => r.points > 0)
  const warn = reasons.filter((r) => r.points === 0)

  return (
    <>
      <NavBar onBack={onBack} backLabel={t('tab_biz')} />
      <main className="screen narrow">
        <div className="card" style={{ padding: 20 }}>
          <div className="detail-head" style={{ margin: 0 }}>
            <TrustRing score={s.score} level={s.level} size={84} stroke={8} label={t('trust_of', { n: s.score })} />
            <div>
              <h1 className="title2">{biz.name}</h1>
              <div className="biz-meta" style={{ marginBottom: 6 }}><Icon name="pin" size={14} /> {biz.area} · {biz.owner}</div>
              <span className={`level-pill ${s.level}`}>{t(`lvl_${s.level}`)}</span>
            </div>
          </div>
          {pitch && <p style={{ margin: '16px 0 0', fontSize: 16 }}>{pitch}</p>}
        </div>

        <div className="stack" style={{ marginTop: 16 }}>
          <button className="btn btn-primary btn-lg" onClick={onInvest}><Icon name="doc" size={20} /> {t('det_invest')}</button>
          <button className="btn btn-tinted" onClick={onAsk}><Icon name="sparkle" size={20} /> {t('det_ask')}</button>
        </div>

        <h2 className="section-label">{t('det_numbers')}</h2>
        <div className="group">
          <div className="row kv"><span>{t('card_needs')}</span><span className="val tnum">{fmt(biz.amountNeeded)}</span></div>
          <div className="row kv"><span>{t('biz_profit')}</span><span className="val tnum">{fmt(biz.monthlyProfit)}</span></div>
          <div className="row kv"><span>{t('card_back')}</span><span className="val tnum">{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</span></div>
          <div className="row kv warn"><span>{t('det_bad')}</span><span className="val tnum">{Number.isFinite(bad) ? t('months', { n: bad }) : '—'}</span></div>
        </div>

        {good.length > 0 && (
          <>
            <h2 className="section-label">{t('d_good')}</h2>
            <div className="group"><ul className="list-plain good">{good.map((r) => <li key={r.key}><Icon name="check" size={20} /> {t(r.key)}</li>)}</ul></div>
          </>
        )}
        {warn.length > 0 && (
          <>
            <h2 className="section-label">{t('d_warn')}</h2>
            <div className="group"><ul className="list-plain warn">{warn.map((r) => <li key={r.key}><Icon name="warn" size={20} /> {t(r.key)}</li>)}</ul></div>
          </>
        )}

        <h2 className="section-label">{t('d_check')}</h2>
        <div className="group">
          {VERIFY_CHECKS.map((k) => {
            const on = Boolean(biz.verified?.[k])
            return (
              <button key={k} className="row" role="checkbox" aria-checked={on} onClick={() => onVerify(k, !on)}>
                <span className={`check-box ${on ? 'on' : ''}`}><Icon name="check" size={16} /></span>
                <span className="row-body subhead">{t(`v_${k}`)}</span>
              </button>
            )
          })}
        </div>
      </main>
    </>
  )
}
