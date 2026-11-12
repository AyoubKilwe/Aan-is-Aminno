import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { PageHead } from '../components/UI.jsx'
import { RoleBar } from './RoleSelect.jsx'
import { scoreBusiness, fmt } from '../lib/trustScore.js'
import { Funding } from '../components/BizCard.jsx'

// Business owner home: register once, see the score and money received, and the groups that can invest.
export default function OwnerHome({ t, businesses, groups, mineIds, openRegister, onSwitchRole }) {
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
                  <Funding t={t} b={b} />
                  <div className="biz-back" style={{ marginTop: 12 }}>{t('card_back')}: <b>{Number.isFinite(s.months) ? t('months', { n: s.months }) : '—'}</b></div>
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

      <div className="home-head"><h2>{t('o_groups')}</h2></div>
      <p className="home-sub">{t('o_groups_sub')}</p>
      <div className="stack-list">
        {groups.map((g) => (
          <div key={g.id} className="group-card">
            <span className="group-ava"><Icon name="users" size={24} /></span>
            <div style={{ minWidth: 0 }}>
              <b>{g.name}</b>
              <span className="gc-meta">{t('o_members', { n: g.members })}{g.deals > 0 && ` · ${t('o_deals', { n: g.deals })}`}</span>
            </div>
            <div className="gc-money"><span>{t('o_can')}</span><b>{fmt(g.available)}</b></div>
          </div>
        ))}
      </div>

      <RoleBar t={t} role="owner" onChange={onSwitchRole} />
    </main>
  )
}
