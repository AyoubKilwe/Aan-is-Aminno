import { useCallback, useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import { makeT } from './i18n.js'
import { usePersisted } from './lib/storage.js'
import { DEFAULT_GROUP } from './data/businesses.js'
import { api } from './lib/api.js'
import Icon from './components/Icon.jsx'
import Logo from './components/Logo.jsx'
import { TabBar, AppHeader, TABS_BY_ROLE } from './components/UI.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import Home from './pages/Home.jsx'
import OwnerHome from './pages/OwnerHome.jsx'
import Businesses from './pages/Businesses.jsx'
import BusinessDetail from './pages/BusinessDetail.jsx'
import RegisterSheet from './pages/RegisterSheet.jsx'
import Advisor from './pages/Advisor.jsx'
import Agreements from './pages/Agreements.jsx'
import AgreementDetail from './pages/AgreementDetail.jsx'
import AgreementSheet from './pages/AgreementSheet.jsx'
import Learn from './pages/Learn.jsx'

// The landing page lives at "#/", the app at "#/app" ("#/app/learn" opens a tab directly).
function useRoute() {
  const read = () => (window.location.hash.startsWith('#/app') ? 'app' : 'landing')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => { setRoute(read()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const [lang, setLang] = usePersisted('aia_lang', 'so')
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  if (route === 'landing') return <Landing lang={lang} setLang={setLang} />
  return <AppMain lang={lang} setLang={setLang} />
}

function AppMain({ lang, setLang }) {
  // Only personal choices stay in the browser; shared data lives in MongoDB via the Express API.
  const [role, setRole] = usePersisted('aia_role', null) // 'group' | 'owner'
  const [mineIds, setMineIds] = usePersisted('aia_mine_v2', []) // businesses this owner registered on this phone
  const [chat, setChat] = usePersisted('aia_chat_v2', [])

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [group, setGroupState] = useState(DEFAULT_GROUP)
  const [businesses, setBusinesses] = useState([])
  const [agreements, setAgreements] = useState([])
  const [lessons, setLessons] = useState([])
  const [groups, setGroups] = useState([])

  const load = useCallback(async () => {
    setStatus('loading')
    // The server can need a few seconds to reach the database after it starts, so try a few times before showing an error.
    for (let attempt = 1; attempt <= 8; attempt++) {
      try {
        const [g, b, a, l, gs] = await Promise.all([api.group(), api.businesses(), api.agreements(), api.lessons(), api.groups()])
        setGroupState(g); setBusinesses(b); setAgreements(a); setLessons(l); setGroups(gs)
        setStatus('ready')
        return
      } catch (e) {
        console.warn(`Loading data failed (attempt ${attempt}):`, e.message)
        if (attempt < 8) await new Promise((r) => setTimeout(r, 2000))
      }
    }
    setStatus('error')
  }, [])
  useEffect(() => { load() }, [load])

  const t = makeT(lang)
  const tabs = role ? TABS_BY_ROLE[role] : []
  const homeTab = role === 'owner' ? 'mine' : 'home'

  const [tab, setTab] = useState(() => window.location.hash.split('/')[2] || null)
  const [detail, setDetail] = useState({}) // { biz: id, agr: id }
  const [sheet, setSheet] = useState(null) // { type: 'register' } | { type: 'agreement', bizId }
  const [pendingQuestion, setPendingQuestion] = useState(null)

  // Keep the open section valid for the chosen role ("agr" is reached from the group's home).
  const allowed = role === 'group' ? ['home', 'biz', 'advisor', 'learn', 'agr'] : ['mine', 'advisor', 'learn']
  const current = allowed.includes(tab) ? tab : homeTab

  const invested = agreements.reduce((s, a) => s + a.amount, 0)

  const go = useCallback((nextTab, detailId) => {
    setTab(nextTab)
    setDetail((d) => ({ ...d, [nextTab]: detailId ?? null }))
    window.scrollTo(0, 0)
  }, [])

  const onTab = (id) => {
    if (id === current) setDetail((d) => ({ ...d, [id]: null }))
    setTab(id)
    window.scrollTo(0, 0)
  }

  if (!role) return <RoleSelect t={t} lang={lang} setLang={setLang} onPick={(r) => { setRole(r); setTab(null) }} />
  if (status !== 'ready') return <ServerState t={t} status={status} onRetry={load} />

  const switchRole = () => { setRole(null); setDetail({}); setSheet(null) }

  // ── Changes go to the server, then the screen updates with what the server saved ──
  const replace = (setter) => (doc) => setter((list) => list.map((x) => (x.id === doc.id ? doc : x)))
  const setGroup = async (g) => {
    try { setGroupState(await api.saveGroup(g)); api.groups().then(setGroups).catch(() => {}) } catch { window.alert(t('save_error')) }
  }
  const verifyBusiness = async (id, key, value) => {
    setBusinesses((list) => list.map((b) => (b.id === id ? { ...b, verified: { ...b.verified, [key]: value } } : b))) // instant feedback
    try { replace(setBusinesses)(await api.verify(id, key, value)) } catch { load() }
  }
  const addBusiness = async (b) => {
    const saved = await api.addBusiness(b)
    setBusinesses((list) => [...list, saved])
    setMineIds((ids) => [saved.id, ...ids])
    return saved
  }
  // The agreement appears at once; it is saved in the background. If saving fails, it is taken back off the screen.
  const addAgreement = (draft) => {
    const tmpId = `tmp-${Date.now()}`
    const temp = { ...draft, id: tmpId, business: draft.bizId, payments: [], pending: true }
    const addRaised = (n) => setBusinesses((list) => list.map((b) => (b.id === draft.bizId ? { ...b, raised: (b.raised || 0) + n } : b)))
    setAgreements((list) => [temp, ...list])
    addRaised(draft.amount)
    api.addAgreement({ businessId: draft.bizId, amount: draft.amount, share: draft.share, duration: draft.duration })
      .then((saved) => {
        setAgreements((list) => list.map((a) => (a.id === tmpId ? saved : a)))
        setDetail((d) => (d.agr === tmpId ? { ...d, agr: saved.id } : d))
        api.groups().then(setGroups).catch(() => {})
      })
      .catch(() => {
        setAgreements((list) => list.filter((a) => a.id !== tmpId))
        addRaised(-draft.amount)
        setDetail((d) => (d.agr === tmpId ? { ...d, agr: null } : d))
        window.alert(t('save_error'))
      })
    return temp
  }
  const addPayment = async (id, amount) => {
    const pay = { amount, date: new Date().toISOString() }
    setAgreements((list) => list.map((a) => (a.id === id ? { ...a, payments: [...a.payments, pay] } : a))) // instant
    try { replace(setAgreements)(await api.addPayment(id, amount)) } catch {
      setAgreements((list) => list.map((a) => (a.id === id ? { ...a, payments: a.payments.filter((p) => p !== pay) } : a)))
      window.alert(t('save_error'))
    }
  }
  const shared = { t, lang, group, businesses, agreements, invested, go }
  const biz = businesses.find((b) => b.id === detail.biz)
  const agr = agreements.find((a) => a.id === detail.agr)

  return (
    <div className="app">
      <AppHeader t={t} tabs={tabs} tab={current === 'agr' ? 'home' : current} onTab={onTab} lang={lang} setLang={setLang} onLogo={() => { window.location.hash = '#/' }} />

      {current === 'home' && <Home {...shared} setGroup={setGroup} onSwitchRole={switchRole} />}
      {current === 'mine' && <OwnerHome t={t} businesses={businesses} groups={groups} mineIds={mineIds} openRegister={() => setSheet({ type: 'register' })} onSwitchRole={switchRole} />}

      {current === 'biz' && !biz && <Businesses {...shared} />}
      {current === 'biz' && biz && (
        <BusinessDetail
          {...shared}
          biz={biz}
          onBack={() => setDetail((d) => ({ ...d, biz: null }))}
          onVerify={(key, val) => verifyBusiness(biz.id, key, val)}
          onAsk={() => { setPendingQuestion(makeT('so')('adv_evaluate', { name: biz.name })); go('advisor') }}
          onInvest={() => setSheet({ type: 'agreement', bizId: biz.id })}
        />
      )}

      {current === 'advisor' && (
        <Advisor {...shared} t={makeT('so')} lang="so" chat={chat} setChat={setChat} pendingQuestion={pendingQuestion} clearPending={() => setPendingQuestion(null)} />
      )}

      {current === 'agr' && !agr && <Agreements {...shared} />}
      {current === 'agr' && agr && (
        <AgreementDetail
          {...shared}
          agr={agr}
          onBack={() => setDetail((d) => ({ ...d, agr: null }))}
          onPayment={(amount) => addPayment(agr.id, amount)}
        />
      )}

      {current === 'learn' && (
        <Learn
          t={t}
          lang={lang}
          lessons={lessons}
          onAddLink={async (l) => { const saved = await api.addLesson(l); setLessons((list) => [...list, saved]) }}
          onUpload={async (form) => { const saved = await api.uploadLesson(form); setLessons((list) => [...list, saved]) }}
          onDelete={async (id) => { await api.deleteLesson(id); setLessons((list) => list.filter((x) => x.id !== id)) }}
        />
      )}

      <TabBar t={t} tabs={tabs} tab={current === 'agr' ? 'home' : current} onTab={onTab} />

      {sheet?.type === 'register' && (
        <RegisterSheet
          t={t}
          onCancel={() => setSheet(null)}
          onAdd={addBusiness}
          onView={() => { setSheet(null); go('mine') }}
        />
      )}
      {sheet?.type === 'agreement' && (
        <AgreementSheet
          {...shared}
          biz={businesses.find((b) => b.id === sheet.bizId)}
          onCancel={() => setSheet(null)}
          onCreate={(draft) => { const a = addAgreement(draft); setSheet(null); go('agr', a.id) }}
        />
      )}
    </div>
  )
}

// Shown while the data loads, or when the server can't be reached.
function ServerState({ t, status, onRetry }) {
  return (
    <main className="role-screen">
      <Logo size={40} />
      {status === 'loading' ? (
        <p style={{ marginTop: 40 }}>{t('srv_loading')}</p>
      ) : (
        <div className="empty" style={{ marginTop: 32 }}>
          <Icon name="warn" size={40} />
          <h2>{t('srv_error')}</h2>
          <p>{t('srv_error_sub')}</p>
          <button className="btn btn-primary" style={{ maxWidth: 240 }} onClick={onRetry}>{t('srv_retry')}</button>
        </div>
      )}
    </main>
  )
}
