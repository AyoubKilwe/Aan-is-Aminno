import Icon from '../components/Icon.jsx'
import { PageHead, NavBar } from '../components/UI.jsx'
import { fmt } from '../lib/trustScore.js'

export default function Agreements({ t, agreements, go }) {
  return (
    <>
      <NavBar onBack={() => go('home')} backLabel={t('back_home')} />
      <main className="screen narrow">
        <PageHead title={t('agr_title')} />
        {agreements.length === 0 ? (
          <div className="empty">
            <Icon name="doc" size={44} />
            <h2>{t('agr_empty')}</h2>
            <p>{t('agr_empty_sub')}</p>
            <button className="btn btn-primary" style={{ maxWidth: 280 }} onClick={() => go('biz')}>{t('agr_browse')}</button>
          </div>
        ) : (
          <div className="group">
            {agreements.map((a) => {
              const got = a.payments.reduce((s, p) => s + p.amount, 0)
              const pct = Math.min(100, Math.round((got / a.amount) * 100))
              return (
                <button key={a.id} className="row" onClick={() => go('agr', a.id)}>
                  <span className="row-icon"><Icon name="doc" size={20} /></span>
                  <span className="row-body">
                    <span className="row-title">{a.businessName}</span>
                    <div className="row-sub tnum">{fmt(a.amount)} · {a.share}% · {t('months', { n: a.duration })}</div>
                    <div className="meter" aria-label={t('agr_returned', { a: fmt(got), b: fmt(a.amount) })}><div style={{ width: `${pct}%` }} /></div>
                  </span>
                  <Icon name="chevron" size={18} className="chev" />
                </button>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
