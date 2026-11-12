import { useState } from 'react'
import { makeT } from './i18n.js'
import { usePersisted } from './lib/storage.js'
import { SEED_BUSINESSES, DEFAULT_GROUP } from './data/businesses.js'
import BottomNav from './components/BottomNav.jsx'
import Home from './pages/Home.jsx'
import Opportunities from './pages/Opportunities.jsx'
import Register from './pages/Register.jsx'
import Advisor from './pages/Advisor.jsx'
import Agreement from './pages/Agreement.jsx'

export default function App() {
  const [lang, setLang] = usePersisted('aia_lang', 'en')
  const [group, setGroup] = usePersisted('aia_group', DEFAULT_GROUP)
  const [businesses, setBusinesses] = usePersisted('aia_businesses_v2', SEED_BUSINESSES)
  const [chat, setChat] = usePersisted('aia_chat', [])
  const [page, setPage] = useState('home')
  const [selectedId, setSelectedId] = useState(null) // business picked for agreement
  const [pendingQuestion, setPendingQuestion] = useState(null) // question sent from a card to the advisor

  const t = makeT(lang)

  const go = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

  const askAboutBusiness = (b) => {
    setPendingQuestion(`${t('adv_evaluate')}: ${b.name}`)
    go('advisor')
  }

  const startAgreement = (b) => {
    setSelectedId(b.id)
    go('agreement')
  }

  const addBusiness = (b) => setBusinesses((list) => [b, ...list])

  const shared = { t, lang, group, businesses, go }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => go('home')}>
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span>{t('appName')}</span>
        </button>
        <div className="lang" role="group" aria-label="Language">
          <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'so' ? 'on' : ''} onClick={() => setLang('so')}>SO</button>
        </div>
      </header>

      <main className="content">
        {page === 'home' && <Home {...shared} setGroup={setGroup} />}
        {page === 'opps' && (
          <Opportunities {...shared} onAsk={askAboutBusiness} onInvest={startAgreement} />
        )}
        {page === 'register' && <Register {...shared} onAdd={addBusiness} />}
        {page === 'advisor' && (
          <Advisor
            {...shared}
            chat={chat}
            setChat={setChat}
            pendingQuestion={pendingQuestion}
            clearPending={() => setPendingQuestion(null)}
          />
        )}
        {page === 'agreement' && (
          <Agreement {...shared} selectedId={selectedId} setSelectedId={setSelectedId} />
        )}
      </main>

      <BottomNav t={t} page={page} go={go} />
    </div>
  )
}
