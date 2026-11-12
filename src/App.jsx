import { useCallback, useEffect, useState } from 'react'
import Landing from './pages/Landing.jsx'
import { makeT } from './i18n.js'
import { usePersisted } from './lib/storage.js'
import { SEED_BUSINESSES, DEFAULT_GROUP } from './data/businesses.js'
import { TabBar, AppHeader } from './components/UI.jsx'

// The landing page lives at "#/", the app at "#/app".
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
import Home from './pages/Home.jsx'
import Businesses from './pages/Businesses.jsx'
import BusinessDetail from './pages/BusinessDetail.jsx'
import RegisterSheet from './pages/RegisterSheet.jsx'
import Advisor from './pages/Advisor.jsx'
import Agreements from './pages/Agreements.jsx'
import AgreementDetail from './pages/AgreementDetail.jsx'
import AgreementSheet from './pages/AgreementSheet.jsx'
import Learn from './pages/Learn.jsx'

const TAB_IDS = ['home', 'biz', 'advisor', 'agr', 'learn']

export default function App() {
  const route = useRoute()
  const [lang, setLang] = usePersisted('aia_lang', 'en')
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  if (route === 'landing') return <Landing lang={lang} setLang={setLang} />
  return <AppMain lang={lang} setLang={setLang} />
}

function AppMain({ lang, setLang }) {
  const [group, setGroup] = usePersisted('aia_group', DEFAULT_GROUP)
  const [businesses, setBusinesses] = usePersisted('aia_businesses_v3', SEED_BUSINESSES)
  const [agreements, setAgreements] = usePersisted('aia_agreements_v1', [])
  const [chat, setChat] = usePersisted('aia_chat_v2', [])
  const [lessons, setLessons] = usePersisted('aia_lessons_v1', [])

  // Navigation: one tab bar, a pushed detail view per tab, and at most one sheet.
  // "#/app/learn" opens a tab directly (used by the landing page).
  const [tab, setTab] = useState(() => {
    const id = window.location.hash.split('/')[2]
    return TAB_IDS.includes(id) ? id : 'home'
  })
  const [detail, setDetail] = useState({}) // { biz: id, agr: id }
  const [sheet, setSheet] = useState(null) // { type: 'register' } | { type: 'agreement', bizId }
  const [pendingQuestion, setPendingQuestion] = useState(null)

  const t = makeT(lang)
  const invested = agreements.reduce((s, a) => s + a.amount, 0)

  const go = useCallback((nextTab, detailId) => {
    setTab(nextTab)
    setDetail((d) => ({ ...d, [nextTab]: detailId ?? null }))
    window.scrollTo(0, 0)
  }, [])

  const onTab = (id) => {
    // Tapping the current tab returns to its root, like iOS.
    if (id === tab) setDetail((d) => ({ ...d, [id]: null }))
    setTab(id)
    window.scrollTo(0, 0)
  }

  const updateBusiness = (id, patch) =>
    setBusinesses((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)))

  const shared = { t, lang, group, businesses, agreements, invested, go }

  const biz = businesses.find((b) => b.id === detail.biz)
  const agr = agreements.find((a) => a.id === detail.agr)

  return (
    <div className="app">
      <AppHeader t={t} tab={tab} onTab={onTab} lang={lang} setLang={setLang} onLogo={() => { window.location.hash = '#/' }} />
      {tab === 'home' && (
        <Home {...shared} setGroup={setGroup} openRegister={() => setSheet({ type: 'register' })} />
      )}

      {tab === 'biz' && !biz && (
        <Businesses {...shared} openRegister={() => setSheet({ type: 'register' })} />
      )}
      {tab === 'biz' && biz && (
        <BusinessDetail
          {...shared}
          biz={biz}
          onBack={() => setDetail((d) => ({ ...d, biz: null }))}
          onVerify={(key, val) => updateBusiness(biz.id, { verified: { ...biz.verified, [key]: val } })}
          onAsk={() => { setPendingQuestion(t('adv_evaluate', { name: biz.name })); go('advisor') }}
          onInvest={() => setSheet({ type: 'agreement', bizId: biz.id })}
        />
      )}

      {tab === 'advisor' && (
        <Advisor
          {...shared}
          chat={chat}
          setChat={setChat}
          pendingQuestion={pendingQuestion}
          clearPending={() => setPendingQuestion(null)}
        />
      )}

      {tab === 'agr' && !agr && <Agreements {...shared} />}
      {tab === 'agr' && agr && (
        <AgreementDetail
          {...shared}
          agr={agr}
          onBack={() => setDetail((d) => ({ ...d, agr: null }))}
          onPayment={(amount) =>
            setAgreements((list) =>
              list.map((a) => (a.id === agr.id ? { ...a, payments: [...a.payments, { amount, date: new Date().toISOString() }] } : a)),
            )
          }
        />
      )}

      {tab === 'learn' && <Learn t={t} lang={lang} lessons={lessons} setLessons={setLessons} />}

      <TabBar t={t} tab={tab} onTab={onTab} />

      {sheet?.type === 'register' && (
        <RegisterSheet
          t={t}
          onCancel={() => setSheet(null)}
          onAdd={(b) => setBusinesses((list) => [b, ...list])}
          onView={(id) => { setSheet(null); go('biz', id) }}
        />
      )}
      {sheet?.type === 'agreement' && (
        <AgreementSheet
          {...shared}
          biz={businesses.find((b) => b.id === sheet.bizId)}
          onCancel={() => setSheet(null)}
          onCreate={(a) => {
            setAgreements((list) => [a, ...list])
            setSheet(null)
            go('agr', a.id)
          }}
        />
      )}
    </div>
  )
}
