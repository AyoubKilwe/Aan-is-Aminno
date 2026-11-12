import { useCallback, useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import { makeT } from './i18n.js'
import { usePersisted } from './lib/storage.js'
import { SEED_BUSINESSES, DEFAULT_GROUP } from './data/businesses.js'
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
  const [role, setRole] = usePersisted('aia_role', null) // 'group' | 'owner'
  const [group, setGroup] = usePersisted('aia_group', DEFAULT_GROUP)
  const [businesses, setBusinesses] = usePersisted('aia_businesses_v3', SEED_BUSINESSES)
  const [mineIds, setMineIds] = usePersisted('aia_mine_v1', []) // businesses this owner registered
  const [agreements, setAgreements] = usePersisted('aia_agreements_v1', [])
  const [chat, setChat] = usePersisted('aia_chat_v2', [])
  const [lessons, setLessons] = usePersisted('aia_lessons_v1', [])

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

  const switchRole = () => { setRole(null); setDetail({}); setSheet(null) }
  const updateBusiness = (id, patch) => setBusinesses((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  const shared = { t, lang, group, businesses, agreements, invested, go }
  const biz = businesses.find((b) => b.id === detail.biz)
  const agr = agreements.find((a) => a.id === detail.agr)

  return (
    <div className="app">
      <AppHeader t={t} tabs={tabs} tab={current === 'agr' ? 'home' : current} onTab={onTab} lang={lang} setLang={setLang} onLogo={() => { window.location.hash = '#/' }} />

      {current === 'home' && <Home {...shared} setGroup={setGroup} onSwitchRole={switchRole} />}
      {current === 'mine' && <OwnerHome t={t} businesses={businesses} mineIds={mineIds} openRegister={() => setSheet({ type: 'register' })} onSwitchRole={switchRole} />}

      {current === 'biz' && !biz && <Businesses {...shared} />}
      {current === 'biz' && biz && (
        <BusinessDetail
          {...shared}
          biz={biz}
          onBack={() => setDetail((d) => ({ ...d, biz: null }))}
          onVerify={(key, val) => updateBusiness(biz.id, { verified: { ...biz.verified, [key]: val } })}
          onAsk={() => { setPendingQuestion(t('adv_evaluate', { name: biz.name })); go('advisor') }}
          onInvest={() => setSheet({ type: 'agreement', bizId: biz.id })}
        />
      )}

      {current === 'advisor' && (
        <Advisor {...shared} chat={chat} setChat={setChat} pendingQuestion={pendingQuestion} clearPending={() => setPendingQuestion(null)} />
      )}

      {current === 'agr' && !agr && <Agreements {...shared} />}
      {current === 'agr' && agr && (
        <AgreementDetail
          {...shared}
          agr={agr}
          onBack={() => setDetail((d) => ({ ...d, agr: null }))}
          onPayment={(amount) =>
            setAgreements((list) => list.map((a) => (a.id === agr.id ? { ...a, payments: [...a.payments, { amount, date: new Date().toISOString() }] } : a)))
          }
        />
      )}

      {current === 'learn' && <Learn t={t} lang={lang} lessons={lessons} setLessons={setLessons} />}

      <TabBar t={t} tabs={tabs} tab={current === 'agr' ? 'home' : current} onTab={onTab} />

      {sheet?.type === 'register' && (
        <RegisterSheet
          t={t}
          onCancel={() => setSheet(null)}
          onAdd={(b) => { setBusinesses((list) => [b, ...list]); setMineIds((ids) => [b.id, ...ids]) }}
          onView={() => { setSheet(null); go('mine') }}
        />
      )}
      {sheet?.type === 'agreement' && (
        <AgreementSheet
          {...shared}
          biz={businesses.find((b) => b.id === sheet.bizId)}
          onCancel={() => setSheet(null)}
          onCreate={(a) => { setAgreements((list) => [a, ...list]); setSheet(null); go('agr', a.id) }}
        />
      )}
    </div>
  )
}
