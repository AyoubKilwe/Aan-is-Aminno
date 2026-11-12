import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { Sheet } from '../components/UI.jsx'
import { RoleBar } from './RoleSelect.jsx'
import { fmt } from '../lib/trustScore.js'
import { RESERVE_RATIO } from '../data/businesses.js'

// Savings group home: their money in one card, then four big buttons.
export default function Home({ t, group, setGroup, invested, agreements, go, onSwitchRole }) {
  const [editing, setEditing] = useState(false)
  const reserve = Math.round(group.savings * RESERVE_RATIO)
  const available = Math.max(0, group.savings - reserve - invested)

  return (
    <main className="screen narrow">
      <h1 className="large-title" style={{ margin: '4px 0 2px' }}>{group.name}</h1>
      <p className="secondary" style={{ margin: '0 0 16px' }}>{t('home_members', { n: group.members })}</p>

      <section className="money-card" aria-label={t('g_can')}>
        <div className="label">{t('g_can')}</div>
        <div className="big tnum">{fmt(available)}</div>
        <dl className="money-row">
          <div><dt>{t('g_total')}</dt><dd className="tnum">{fmt(group.savings)}</dd></div>
          <div><dt>{t('g_invested')}</dt><dd className="tnum">{fmt(invested)}</dd></div>
          <div><dt>{t('g_keep')}</dt><dd className="tnum">{fmt(reserve)}</dd></div>
        </dl>
        <button className="text-btn" onClick={() => setEditing(true)}>✎ {t('home_edit')}</button>
      </section>

      <h2 className="section-label">{t('g_what')}</h2>
      <div className="big-actions">
        <button className="big-action" onClick={() => go('biz')}><span className="ba-ico"><Icon name="store" size={28} /></span>{t('act_biz')}</button>
        <button className="big-action" onClick={() => go('advisor')}><span className="ba-ico blue"><Icon name="sparkle" size={28} /></span>{t('act_ai')}</button>
        <button className="big-action" onClick={() => go('agr')}><span className="ba-ico gold"><Icon name="doc" size={28} /></span>{t('act_agr')}{agreements.length > 0 && ` (${agreements.length})`}</button>
        <button className="big-action" onClick={() => go('learn')}><span className="ba-ico rose"><Icon name="play" size={28} /></span>{t('act_learn')}</button>
      </div>

      <RoleBar t={t} role="group" onChange={onSwitchRole} />

      {editing && <EditGroup t={t} group={group} onCancel={() => setEditing(false)} onSave={(g) => { setGroup(g); setEditing(false) }} />}
    </main>
  )
}

function EditGroup({ t, group, onCancel, onSave }) {
  const [d, setD] = useState({ ...group })
  const valid = d.name.trim() && Number(d.savings) >= 0 && Number(d.members) >= 1
  const save = () => valid && onSave({ name: d.name.trim(), savings: Math.round(Number(d.savings)), members: Math.round(Number(d.members)) })
  return (
    <Sheet title={t('home_edit')} onCancel={onCancel} cancelLabel={t('cancel')}
      action={<button className="nav-btn strong" disabled={!valid} onClick={save}>{t('save')}</button>}>
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
