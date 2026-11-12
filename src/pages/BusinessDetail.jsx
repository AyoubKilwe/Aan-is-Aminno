import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { NavBar } from '../components/UI.jsx'
import { scoreBusiness, paybackMonths, fmt, VERIFY_CHECKS } from '../lib/trustScore.js'

export default function BusinessDetail({ t, lang, biz, onBack, onVerify, onAsk, onInvest }) {
  const s = scoreBusiness(biz)
  const bad = paybackMonths(biz.amountNeeded, biz.monthlyProfit, 0.4, 0.3)
  const pitch = typeof biz.pitch === 'object' ? biz.pitch[lang] || biz.pitch.en : biz.pitch

  return (
    <>
      <NavBar title={biz.name} onBack={onBack} backLabel={t('tab_biz')} />
      <main className="screen">
        <div className="detail-head">
          <TrustRing score={s.score} level={s.level} size={84} stroke={8} label={t('trust_of', { n: s.score })} />
          <div>
            <h1 className="title2">{biz.name}</h1>
            <div className="biz-meta"><Icon name="pin" size={14} /> {biz.area} · {biz.owner}</div>
          </div>
        </div>

        {pitch && (
          <>
            <h2 className="section-label">{t('det_about')}</h2>
            <div className="group"><div className="row plain"><span className="row-body">{pitch}</span></div></div>
          </>
        )}

        <h2 className="section-label">{t('det_numbers')}</h2>
        <div className="group">
          <div className="row plain kv"><span>{t('biz_needs')}</span><span className="val tnum">{fmt(biz.amountNeeded)}</span></div>
          <div className="row plain kv"><span>{t('biz_profit')}</span><span className="val tnum">{fmt(biz.monthlyProfit)}</span></div>
          <div className="row plain kv"><span>{t('biz_payback')}</span><span className="val tnum">{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</span></div>
          <div className="row plain kv warn"><span>{t('det_bad')}</span><span className="val tnum">{Number.isFinite(bad) ? t('det_bad_val', { n: bad }) : '—'}</span></div>
        </div>
        <p className="group-foot">{t('det_note')}</p>

        <h2 className="section-label">{t('det_why')}</h2>
        <div className="group">
          {s.reasons.map((r) => (
            <div key={r.key} className={`row plain reason ${r.points ? 'ok' : 'no'}`}>
              <Icon name={r.points ? 'check' : 'warn'} size={20} />
              <span className="row-body subhead">{t(r.key)}</span>
              <span className="pts">{r.points}/{r.max}</span>
            </div>
          ))}
        </div>

        <h2 className="section-label">{t('det_verify')}</h2>
        <div className="group">
          {VERIFY_CHECKS.map((k) => {
            const on = Boolean(biz.verified?.[k])
            return (
              <button key={k} className="row check-row" role="checkbox" aria-checked={on} onClick={() => onVerify(k, !on)}>
                <span className={`check-box ${on ? 'on' : ''}`}><Icon name="check" size={16} /></span>
                <span className="row-body subhead">{t(`v_${k}`)}</span>
                <span className="pts">+5</span>
              </button>
            )
          })}
        </div>
        <p className="group-foot">{t('det_verify_sub')}</p>

        <div className="stack">
          <button className="btn btn-primary" onClick={onInvest}><Icon name="doc" size={20} /> {t('det_invest')}</button>
          <button className="btn btn-tinted" onClick={onAsk}><Icon name="sparkle" size={20} /> {t('det_ask')}</button>
        </div>
      </main>
    </>
  )
}
