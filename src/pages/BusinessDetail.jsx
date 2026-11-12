import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { NavBar } from '../components/UI.jsx'
import { Funding } from '../components/BizCard.jsx'
import { scoreBusiness, paybackMonths, fmt, VERIFY_CHECKS } from '../lib/trustScore.js'

// One business, in plain words: what it is, the numbers, good signs, warnings, then actions.
export default function BusinessDetail({ t, lang, biz, onBack, onVerify, onAsk, onInvest }) {
  const s = scoreBusiness(biz)
  const bad = paybackMonths(biz.amountNeeded, biz.monthlyProfit, 0.4, 0.3)
  const pitch = typeof biz.pitch === 'object' ? biz.pitch[lang] || biz.pitch.en : biz.pitch

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
          <div style={{ marginTop: 16 }}><Funding t={t} b={biz} /></div>
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

        <h2 className="section-label">{t('sc_title')}</h2>
        <p className="sc-who"><Icon name="shield" size={18} /> {t('sc_who')}</p>
        <div className="group">
          {s.reasons.map((r) => {
            const src = 'verifiedCount' in r ? 'group' : r.key.startsWith('r_payback') ? 'app' : 'owner'
            return (
              <div key={r.key} className={`row plain sc-row ${r.points ? 'ok' : 'no'}`}>
                <Icon name={r.points ? 'check' : 'warn'} size={20} />
                <div className="row-body">
                  <div className="subhead">{t(r.key)}</div>
                  <span className={`src-tag ${src}`}>{t(`src_${src}`)}</span>
                </div>
                <span className="pts">{r.points}/{r.max}</span>
              </div>
            )
          })}
          <div className="row plain sc-total"><span className="row-body">{t('sc_total')}</span><b>{s.score}/100</b></div>
        </div>

        <h2 className="section-label">{t('d_check')}</h2>
        <p className="sc-who">{t('d_check_sub')}</p>
        <div className="group">
          {VERIFY_CHECKS.map((k) => {
            const on = Boolean(biz.verified?.[k])
            return (
              <button key={k} className="row" role="checkbox" aria-checked={on} onClick={() => onVerify(k, !on)}>
                <span className={`check-box ${on ? 'on' : ''}`}><Icon name="check" size={16} /></span>
                <span className="row-body subhead">{t(`v_${k}`)}</span>
                <span className="pts">+5</span>
              </button>
            )
          })}
        </div>
      </main>
    </>
  )
}
