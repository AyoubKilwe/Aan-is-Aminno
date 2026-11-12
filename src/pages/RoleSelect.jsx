import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { Segmented } from '../components/UI.jsx'

// First screen of the app: one question, two big choices.
export default function RoleSelect({ t, lang, setLang, onPick }) {
  return (
    <main className="role-screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <Logo size={40} onClick={() => { window.location.hash = '#/' }} />
        <Segmented label={t('language')} value={lang} onChange={setLang} options={[{ value: 'so', label: 'SO' }, { value: 'en', label: 'EN' }]} />
      </div>
      <h1>{t('role_title')}</h1>
      <p>{t('role_sub')}</p>
      <button className="role-card" onClick={() => onPick('group')}>
        <span className="role-ico"><Icon name="users" size={32} /></span>
        <span><b>{t('role_group')}</b><span>{t('role_group_sub')}</span></span>
      </button>
      <button className="role-card owner" onClick={() => onPick('owner')}>
        <span className="role-ico"><Icon name="store" size={32} /></span>
        <span><b>{t('role_owner')}</b><span>{t('role_owner_sub')}</span></span>
      </button>
    </main>
  )
}

export function RoleBar({ t, role, onChange }) {
  return (
    <div className="role-bar">
      <span>{t('role_now', { r: t(role === 'owner' ? 'role_owner' : 'role_group') })}</span>
      <button className="text-btn" onClick={onChange}>{t('role_switch')}</button>
    </div>
  )
}
