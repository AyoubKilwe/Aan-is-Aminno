import { useState } from 'react'

export default function Home({ t, group, setGroup, go }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(group)

  const save = () => {
    setGroup({
      name: draft.name.trim() || group.name,
      savings: Math.max(0, Number(draft.savings) || 0),
      members: Math.max(1, Number(draft.members) || 1),
    })
    setEditing(false)
  }

  return (
    <div className="page">
      <section className="hero card">
        <p className="muted">{t('home_hello')} 👋</p>
        {!editing ? (
          <>
            <h1>{group.name}</h1>
            <p className="muted">{t('home_savings')}</p>
            <p className="big-money">${group.savings.toLocaleString()}</p>
            <p className="muted">👩‍👩‍👧 {group.members} {t('home_members')}</p>
            <button className="link" onClick={() => { setDraft(group); setEditing(true) }}>
              ✏️ {t('home_edit')}
            </button>
          </>
        ) : (
          <div className="form">
            <label>{t('home_groupName')}
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>{t('home_savingsLabel')}
              <input type="number" inputMode="numeric" value={draft.savings} onChange={(e) => setDraft({ ...draft, savings: e.target.value })} />
            </label>
            <label>{t('home_membersLabel')}
              <input type="number" inputMode="numeric" value={draft.members} onChange={(e) => setDraft({ ...draft, members: e.target.value })} />
            </label>
            <button className="btn primary" onClick={save}>{t('home_save')}</button>
          </div>
        )}
      </section>

      <h2>{t('home_q')}</h2>
      <div className="actions">
        <button className="action" onClick={() => go('opps')}><span>🏪</span>{t('home_btn_opps')}</button>
        <button className="action" onClick={() => go('advisor')}><span>🤖</span>{t('home_btn_advisor')}</button>
        <button className="action" onClick={() => go('register')}><span>📝</span>{t('home_btn_register')}</button>
      </div>

      <h2>{t('home_how')}</h2>
      <ol className="steps card">
        <li>⭐ {t('home_step1')}</li>
        <li>📊 {t('home_step2')}</li>
        <li>🤖 {t('home_step3')}</li>
        <li>📄 {t('home_step4')}</li>
      </ol>
    </div>
  )
}
