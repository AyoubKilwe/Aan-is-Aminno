import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { HagbadRing } from '../components/Rings.jsx'
import { PageHead, Sheet } from '../components/UI.jsx'
import { fmt } from '../lib/trustScore.js'
import { RESERVE_RATIO } from '../data/businesses.js'

export default function Home({ t, group, setGroup, businesses, invested, go, openRegister }) {
  const [editing, setEditing] = useState(false)
  const reserve = Math.round(group.savings * RESERVE_RATIO)
  const maxInvest = group.savings - reserve
  const available = Math.max(0, maxInvest - invested)
  const committed = group.savings ? Math.min(1, invested / group.savings) : 0

  return (
    <>
      <main className="screen">
        <PageHead title={t('home_title')} sub={`${group.name} · ${t('home_members', { n: group.members })}`} />

        <div className="home-grid">
          <section className="hero" aria-label={t('home_savings')}>
            <HagbadRing members={group.members} committedRatio={committed}>
              <div className="hagbad-amount tnum">{fmt(available)}</div>
              <div className="hagbad-label">{t('home_available')}</div>
            </HagbadRing>
            <dl className="legend">
              <div><dt>{t('home_savings')}</dt><dd className="tnum">{fmt(group.savings)}</dd></div>
              <div><dt><span className="swatch" style={{ background: 'var(--gold)' }} />{t('home_invested')}</dt><dd className="tnum">{fmt(invested)}</dd></div>
              <div><dt>{t('home_reserve')}</dt><dd className="tnum">{fmt(reserve)}</dd></div>
            </dl>
            <div className="hero-meta">
              <span className="footnote">{t('home_plan_short', { reserve: fmt(reserve) })}</span>
              <button className="text-btn" onClick={() => setEditing(true)}>{t('home_edit')}</button>
            </div>
          </section>

          <div>
            <h2 className="section-label">{t('home_plan')}</h2>
            <div className="note-card">
              <Icon name="shield" />
              <p>{t('home_plan_body', { reserve: fmt(reserve), max: fmt(maxInvest) })}</p>
            </div>

            <h2 className="section-label">{t('home_next')}</h2>
            <div className="group">
              <button className="row" onClick={() => go('biz')}>
                <span className="row-icon"><Icon name="store" size={20} /></span>
                <span className="row-body">
                  <span className="row-title">{t('home_next_compare')}</span>
                  <span className="row-sub">{t('home_next_compare_sub', { n: businesses.length })}</span>
                </span>
                <Icon name="chevron" size={18} className="chev" />
              </button>
              <button className="row" onClick={() => go('advisor')}>
                <span className="row-icon blue"><Icon name="sparkle" size={20} /></span>
                <span className="row-body">
                  <span className="row-title">{t('home_next_ask')}</span>
                  <span className="row-sub">{t('home_next_ask_sub')}</span>
                </span>
                <Icon name="chevron" size={18} className="chev" />
              </button>
              <button className="row" onClick={openRegister}>
                <span className="row-icon gold"><Icon name="plus" size={20} /></span>
                <span className="row-body">
                  <span className="row-title">{t('home_next_list')}</span>
                  <span className="row-sub">{t('home_next_list_sub')}</span>
                </span>
                <Icon name="chevron" size={18} className="chev" />
              </button>
            </div>

            <h2 className="section-label">{t('home_how')}</h2>
            <ol className="group steps">
              {['home_how1', 'home_how2', 'home_how3', 'home_how4'].map((k, i) => (
                <li key={k} className="row">
                  <span className="step-num">{i + 1}</span>
                  <span className="row-body subhead">{t(k)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>

      {editing && <EditGroup t={t} group={group} onCancel={() => setEditing(false)} onSave={(g) => { setGroup(g); setEditing(false) }} />}
    </>
  )
}

function EditGroup({ t, group, onCancel, onSave }) {
  const [d, setD] = useState({ ...group })
  const valid = d.name.trim() && Number(d.savings) >= 0 && Number(d.members) >= 1
  const save = () => valid && onSave({ name: d.name.trim(), savings: Math.round(Number(d.savings)), members: Math.round(Number(d.members)) })
  return (
    <Sheet
      title={t('home_edit')}
      onCancel={onCancel}
      cancelLabel={t('cancel')}
      action={<button className="nav-btn strong" disabled={!valid} onClick={save}>{t('save')}</button>}
    >
      <div className="group" style={{ marginTop: 16 }}>
        <div className="field">
          <label htmlFor="g-name">{t('home_groupName')}</label>
          <input id="g-name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="g-sav">{t('home_savingsLabel')}</label>
          <input id="g-sav" type="number" inputMode="numeric" min="0" value={d.savings} onChange={(e) => setD({ ...d, savings: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="g-mem">{t('home_membersLabel')}</label>
          <input id="g-mem" type="number" inputMode="numeric" min="1" value={d.members} onChange={(e) => setD({ ...d, members: e.target.value })} />
        </div>
      </div>
      <div className="stack"><button className="btn btn-primary" disabled={!valid} onClick={save}>{t('save')}</button></div>
    </Sheet>
  )
}
