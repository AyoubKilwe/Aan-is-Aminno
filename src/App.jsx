import { useCallback, useState } from 'react'
import { makeT } from './i18n.js'
import { usePersisted } from './lib/storage.js'
import { SEED_BUSINESSES, DEFAULT_GROUP } from './data/businesses.js'
import { TabBar } from './components/UI.jsx'
import Home from './pages/Home.jsx'
import Businesses from './pages/Businesses.jsx'
import BusinessDetail from './pages/BusinessDetail.jsx'
import RegisterSheet from './pages/RegisterSheet.jsx'
import Advisor from './pages/Advisor.jsx'
import Agreements from './pages/Agreements.jsx'
import AgreementDetail from './pages/AgreementDetail.jsx'
import AgreementSheet from './pages/AgreementSheet.jsx'

export default function App() {
  const [lang, setLang] = usePersisted('aia_lang', 'en')
  const [group, setGroup] = usePersisted('aia_group', DEFAULT_GROUP)
  const [businesses, setBusinesses] = usePersisted('aia_businesses_v3', SEED_BUSINESSES)
  const [agreements, setAgreements] = usePersisted('aia_agreements_v1', [])
  const [chat, setChat] = usePersisted('aia_chat_v2', [])

  // Navigation: one tab bar, a pushed detail view per tab, and at most one sheet.
  const [tab, setTab] = useState('home')
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
      {tab === 'home' && (
        <Home {...shared} setGroup={setGroup} setLang={setLang} openRegister={() => setSheet({ type: 'register' })} />
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
