import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { PageHead } from '../components/UI.jsx'
import { RoleBar } from './RoleSelect.jsx'
import { scoreBusiness, fmt } from '../lib/trustScore.js'

// Business owner home: register once, then see the score and how to raise it.
export default function OwnerHome({ t, businesses, mineIds, openRegister, onSwitchRole }) {
  const mine = businesses.filter((b) => mineIds.includes(b.id))

  return (
    <main className="screen narrow">
      <PageHead title={t('o_title')} />

      {mine.length === 0 ? (
        <div className="empty">
          <Icon name="store" size={48} />
          <p style={{ fontSize: 17 }}>{t('o_empty')}</p>
          <button className="btn btn-primary btn-lg" style={{ maxWidth: 320 }} onClick={openRegister}><Icon name="plus" size={20} /> {t('o_register')}</button>
        </div>
      ) : (
        <>
          {mine.map((b) => {
            const s = scoreBusiness(b)
            const tips = s.warnings.map((w) => `tip_${w.key}`).filter((k) => t(k) !== k)
            return (
              <section key={b.id} style={{ marginBottom: 24 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div className="detail-head" style={{ margin: 0 }}>
                    <TrustRing score={s.score} level={s.level} size={84} stroke={8} label={t('trust_of', { n: s.score })} />
                    <div>
                      <h2 className="title2">{b.name}</h2>
                      <span className={`level-pill ${s.level}`}>{t(`lvl_${s.level}`)}</span>
                    </div>
                  </div>
                  <p className="secondary" style={{ margin: '14px 0 10px' }}>{t('o_listed')}</p>
                  <div className="simple-stats">
                    <div><span>{t('card_needs')}</span><b>{fmt(b.amountNeeded)}</b></div>
                    <div><span>{t('card_back')}</span><b>{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</b></div>
                  </div>
                </div>

                <h3 className="section-label">{t('o_improve')}</h3>
                <div className="group">
                  {tips.length === 0 ? (
                    <ul className="list-plain good"><li><Icon name="check" size={20} /> {t('o_perfect')}</li></ul>
                  ) : (
                    <ul className="list-plain">
                      {tips.map((k) => <li key={k}><Icon name="trend" size={20} className="chev" /> {t(k)}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            )
          })}
          <button className="btn btn-tinted" onClick={openRegister}><Icon name="plus" size={20} /> {t('o_new')}</button>
        </>
      )}

      <RoleBar t={t} role="owner" onChange={onSwitchRole} />
    </main>
  )
}
