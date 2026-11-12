import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { HagbadRing } from '../components/Rings.jsx'
import { NavBar, Segmented, Sheet } from '../components/UI.jsx'
import { fmt } from '../lib/trustScore.js'
import { RESERVE_RATIO } from '../data/businesses.js'

export default function Home({ t, lang, setLang, group, setGroup, businesses, invested, go, openRegister }) {
  const [editing, setEditing] = useState(false)
  const reserve = Math.round(group.savings * RESERVE_RATIO)
  const maxInvest = group.savings - reserve
  const available = Math.max(0, maxInvest - invested)
  const committed = group.savings ? Math.min(1, invested / group.savings) : 0

  return (
    <>
      <NavBar
        title={t('home_title')}
        trailing={
          <Segmented
            label={t('language')}
            value={lang}
            onChange={setLang}
            options={[{ value: 'en', label: 'EN' }, { value: 'so', label: 'SO' }]}
          />
        }
      />
      <main className="screen">
        <h1 className="large-title">{t('home_title')}</h1>

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
            <span className="subhead secondary">{group.name} · {t('home_members', { n: group.members })}</span>
            <button className="text-btn" onClick={() => setEditing(true)}>{t('home_edit')}</button>
          </div>
        </section>

        <h2 className="section-label">{t('home_plan')}</h2>
        <div className="note-card">
          <Icon name="shield" />
          <p>{t('home_plan_body', { reserve: fmt(reserve), max: fmt(maxInvest) })}</p>
        </div>

        <h2 className="section-label">{t('home_next')}</h2>
        <div className="group">
          <button className="row" onClick={() => go('biz')}>
            <span className="row-icon" style={{ background: 'var(--accent)' }}><Icon name="store" size={18} /></span>
            <span className="row-body">
              <span className="row-title">{t('home_next_compare')}</span>
              <div className="row-sub">{t('home_next_compare_sub', { n: businesses.length })}</div>
            </span>
            <Icon name="chevron" size={18} className="chev" />
          </button>
          <button className="row" onClick={() => go('advisor')}>
            <span className="row-icon" style={{ background: '#6e56cf' }}><Icon name="sparkle" size={18} /></span>
            <span className="row-body">
              <span className="row-title">{t('home_next_ask')}</span>
              <div className="row-sub">{t('home_next_ask_sub')}</div>
            </span>
            <Icon name="chevron" size={18} className="chev" />
          </button>
          <button className="row" onClick={openRegister}>
            <span className="row-icon" style={{ background: '#1e7f3a' }}><Icon name="plus" size={18} /></span>
            <span className="row-body">
              <span className="row-title">{t('home_next_list')}</span>
              <div className="row-sub">{t('home_next_list_sub')}</div>
            </span>
            <Icon name="chevron" size={18} className="chev" />
          </button>
        </div>

        <h2 className="section-label">{t('home_how')}</h2>
        <ol className="group steps">
          {['home_how1', 'home_how2', 'home_how3', 'home_how4'].map((k, i) => (
            <li key={k} className="row plain">
              <span className="step-num">{i + 1}</span>
              <span className="row-body subhead">{t(k)}</span>
            </li>
          ))}
        </ol>
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
    </Sheet>
  )
}
