import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Logo, { LogoMark } from '../components/Logo.jsx'
import { HagbadRing, TrustRing } from '../components/Rings.jsx'
import { Segmented } from '../components/UI.jsx'
import AIWidget from '../components/AIWidget.jsx'
import { Player } from './Learn.jsx'
import { SEED_LESSONS } from '../lib/videos.js'

const COPY = {
  en: {
    nav_how: 'How it works', nav_features: 'Features', nav_learn: 'Learn', open: 'Open app',
    eyebrow: 'For women’s savings groups',
    h1a: 'Your hagbad,', h1b: 'working for you.',
    lead: 'Find trusted local businesses, check them together, and invest with a halal agreement.',
    cta: 'Start now', cta2: 'How it works',
    proof: ['Halal · no riba', 'Somali & English', 'Any phone'],
    m_title: 'Our Hagbad', m_avail: 'available', m_sav: 'Savings', m_inv: 'Invested', m_res: 'Reserve',
    m_b1s: 'Back in 9 months', m_b2s: 'Back in 10 months',
    f1: 'Checked in person', f1b: '+15 points', f2: 'Agreement signed', f2b: 'Sent on WhatsApp',
    stats: [['20%', 'always kept as reserve'], ['0–100', 'trust score per business'], ['0%', 'interest — halal only']],
    h_kicker: 'How it works', h_title: 'Four simple steps',
    steps: [
      ['store', 'Businesses apply', 'Owners answer a few questions.'],
      ['shield', 'See the score', 'Each one gets a trust score.'],
      ['eye', 'Visit them', 'Two members check in person.'],
      ['doc', 'Sign & track', 'Halal agreement, monthly profit.'],
    ],
    f_kicker: 'Features', f_title: 'Everything in one place',
    ai_t: 'AI advisor in Somali', ai_p: 'Ask anything. It knows your savings and the businesses.',
    ai_q: 'Which business is safest for us?', ai_a: 'Nasra Tailoring — score 95, earns back in 9 months, keeps a record book.',
    ai_q2: 'How much can we invest?', ai_a2: 'Up to $4,000. We keep $1,000 (20%) as a reserve.',
    tr_t: 'Trust score', tr_p: 'Every point has a reason.',
    tr_l: [['Running 3+ years', '20'], ['Keeps a record book', '15'], ['Back within 12 months', '20']],
    rs_t: '20% reserve', rs_p: 'Kept aside for emergencies.',
    ag_t: 'Halal agreement', ag_p: 'Mudaraba contract, shared on WhatsApp, profit tracked monthly.',
    ag_paid: 'paid back',
    v_kicker: 'Learn', v_title: 'Short video lessons', v_more: 'All lessons',
    c_title: 'Put your hagbad to work', c_sub: 'Free. Works on any phone.', c_btn: 'Open the app',
    footer: 'Built for women’s savings groups in Somalia. Sample data.',
  },
  so: {
    nav_how: 'Sida uu u shaqeeyo', nav_features: 'Adeegyada', nav_learn: 'Baro', open: 'Fur app-ka',
    eyebrow: 'Kooxaha hagbadda haweenka',
    h1a: 'Hagbaddiinna,', h1b: 'ha idiin shaqayso.',
    lead: 'Hel ganacsiyo la isku halleyn karo, wadajir u hubiya, oo ku maalgeliya heshiis xalaal ah.',
    cta: 'Bilow hadda', cta2: 'Sida uu u shaqeeyo',
    proof: ['Xalaal · ribo la’aan', 'Soomaali & Ingiriis', 'Telefoon kasta'],
    m_title: 'Hagbaddeenna', m_avail: 'diyaar', m_sav: 'Lacagta', m_inv: 'La geliyay', m_res: 'Kayd',
    m_b1s: 'Soo celin 9 bilood', m_b2s: 'Soo celin 10 bilood',
    f1: 'Si toos ah loo hubiyay', f1b: '+15 dhibcood', f2: 'Heshiis la saxiixay', f2b: 'WhatsApp lagu diray',
    stats: [['20%', 'kayd ahaan mar walba la dhigo'], ['0–100', 'dhibcaha kalsoonida ganacsi kasta'], ['0%', 'ribo — xalaal oo kaliya']],
    h_kicker: 'Sida uu u shaqeeyo', h_title: 'Afar tallaabo oo fudud',
    steps: [
      ['store', 'Ganacsiyadu way codsadaan', 'Milkiiluhu su’aalo yar ayuu ka jawaabaa.'],
      ['shield', 'Eeg dhibcaha', 'Ganacsi kastaa dhibco kalsooni ayuu helaa.'],
      ['eye', 'Booqo', 'Laba xubnood ayaa si toos ah u hubiya.'],
      ['doc', 'Saxiix & la soco', 'Heshiis xalaal ah, faa’iido bil kasta.'],
    ],
    f_kicker: 'Adeegyada', f_title: 'Wax walba hal meel',
    ai_t: 'Lataliye AI af-Soomaali ah', ai_p: 'Wax walba weydii. Wuu og yahay lacagtiinna iyo ganacsiyada.',
    ai_q: 'Ganacsigee ugu ammaan badan?', ai_a: 'Nasra Tailoring — dhibco 95, lacagtu waxay soo noqonaysaa 9 bilood, buug lacageed ayay haysaa.',
    ai_q2: 'Immisa ayaan gelin karnaa?', ai_a2: 'Ilaa $4,000. $1,000 (20%) kayd ahaan ayaa la hayaa.',
    tr_t: 'Dhibcaha kalsoonida', tr_p: 'Dhibic kastaa sabab bay leedahay.',
    tr_l: [['3+ sano shaqaynayay', '20'], ['Buug lacageed hayaa', '15'], ['Soo celin 12 bilood', '20']],
    rs_t: '20% kayd', rs_p: 'Xaaladaha degdegga ah loo dhigo.',
    ag_t: 'Heshiis xalaal ah', ag_p: 'Heshiis Mudaaraba, WhatsApp lagu wadaago, faa’iidada bil kasta la qoro.',
    ag_paid: 'soo noqday',
    v_kicker: 'Baro', v_title: 'Casharro muuqaal ah oo gaaban', v_more: 'Casharrada oo dhan',
    c_title: 'Hagbaddiinna ha shaqayso', c_sub: 'Bilaash. Telefoon kasta wuu ka shaqeeyaa.', c_btn: 'Fur app-ka',
    footer: 'Waxaa loo dhisay kooxaha hagbadda haweenka Soomaaliyeed. Xog tusaale ah.',
  },
}

const openApp = () => { window.location.hash = '#/app' }
const scrollTo = (id) => (e) => { e?.preventDefault(); document.getElementById(id)?.scrollIntoView() }

export default function Landing({ lang, setLang }) {
  const c = COPY[lang] || COPY.en
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <div className="landing">
      <header className={`l-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="l-container l-nav-inner">
          <Logo size={36} />
          <nav className="l-links">
            <a href="#how" onClick={scrollTo('how')}>{c.nav_how}</a>
            <a href="#features" onClick={scrollTo('features')}>{c.nav_features}</a>
            <a href="#learn" onClick={scrollTo('learn')}>{c.nav_learn}</a>
          </nav>
          <div className="l-nav-end">
            <Segmented label="Language" value={lang} onChange={setLang} options={[{ value: 'so', label: 'SO' }, { value: 'en', label: 'EN' }]} />
            <button className="btn btn-primary btn-auto l-nav-cta" onClick={openApp}>{c.open}</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="l-container">
        <section className="l-hero">
          <div className="l-hero-grid">
            <div className="l-hero-text">
              <span className="l-eyebrow"><span className="l-eyebrow-dot" /> {c.eyebrow}</span>
              <h1 className="l-h1">{c.h1a}<br /><span>{c.h1b}</span></h1>
              <p className="l-lead">{c.lead}</p>
              <div className="l-cta">
                <button className="btn btn-gold btn-lg btn-auto" onClick={openApp}>{c.cta} <Icon name="chevron" size={18} /></button>
                <button className="btn btn-ghost btn-lg btn-auto" onClick={scrollTo('how')}>{c.cta2}</button>
              </div>
              <ul className="l-proof">
                {c.proof.map((p) => <li key={p}><Icon name="check" size={16} /> {p}</li>)}
              </ul>
            </div>

            <div className="l-hero-art" aria-hidden="true">
              <div className="phone">
                <div className="phone-screen">
                  <div className="phone-notch" />
                  <div className="phone-title">{c.m_title}</div>
                  <div className="hero">
                    <HagbadRing members={10} committedRatio={0.3}>
                      <div className="hagbad-amount" style={{ fontSize: 24 }}>$2,500</div>
                      <div className="hagbad-label">{c.m_avail}</div>
                    </HagbadRing>
                    <dl className="legend">
                      <div><dt>{c.m_sav}</dt><dd>$5,000</dd></div>
                      <div><dt>{c.m_inv}</dt><dd>$1,500</dd></div>
                      <div><dt>{c.m_res}</dt><dd>$1,000</dd></div>
                    </dl>
                  </div>
                  <div className="mini-biz"><TrustRing score={95} level="green" size={40} stroke={5} /><div><b>Nasra Tailoring</b><span>{c.m_b1s}</span></div></div>
                  <div className="mini-biz"><TrustRing score={75} level="green" size={40} stroke={5} /><div><b>Ubax Cosmetics</b><span>{c.m_b2s}</span></div></div>
                </div>
              </div>
              <div className="float-card fc-1"><span className="fc-icon"><Icon name="shield" size={20} /></span><div><b>{c.f1}</b>{c.f1b}</div></div>
              <div className="float-card fc-2"><span className="fc-icon wa"><Icon name="doc" size={20} /></span><div><b>{c.f2}</b>{c.f2b}</div></div>
            </div>
          </div>
        </section>

        <div className="l-stats">
          {c.stats.map(([n, t]) => <div key={t}><b>{n}</b><span>{t}</span></div>)}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="l-section" id="how">
        <div className="l-container">
          <div className="l-head">
            <div className="l-kicker">{c.h_kicker}</div>
            <h2 className="l-h2">{c.h_title}</h2>
          </div>
          <ol className="l-timeline">
            {c.steps.map(([ic, h, p], i) => (
              <li key={h}>
                <div className="l-tl-icon"><Icon name={ic} size={24} /><span>{i + 1}</span></div>
                <h3>{h}</h3>
                <p>{p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features (bento) ── */}
      <section className="l-section alt" id="features">
        <div className="l-container">
          <div className="l-head">
            <div className="l-kicker">{c.f_kicker}</div>
            <h2 className="l-h2">{c.f_title}</h2>
          </div>
          <div className="l-bento">
            <article className="bento bento-ai">
              <div className="bento-icon dark"><Icon name="sparkle" size={22} /></div>
              <h3>{c.ai_t}</h3>
              <p>{c.ai_p}</p>
              <div className="chat-demo">
                <div className="cd-q">{c.ai_q}</div>
                <div className="cd-a"><Icon name="sparkle" size={16} /> <span>{c.ai_a}</span></div>
                <div className="cd-q">{c.ai_q2}</div>
                <div className="cd-a"><Icon name="sparkle" size={16} /> <span>{c.ai_a2}</span></div>
              </div>
            </article>

            <article className="bento bento-trust">
              <div className="bento-row">
                <div>
                  <div className="bento-icon"><Icon name="shield" size={22} /></div>
                  <h3>{c.tr_t}</h3>
                  <p>{c.tr_p}</p>
                </div>
                <TrustRing score={95} level="green" size={76} stroke={7} />
              </div>
              <ul className="tr-lines">
                {c.tr_l.map(([l, n]) => <li key={l}><span><Icon name="check" size={16} /> {l}</span><b>+{n}</b></li>)}
              </ul>
            </article>

            <article className="bento bento-reserve">
              <div className="bento-icon gold"><Icon name="coins" size={22} /></div>
              <h3>{c.rs_t}</h3>
              <p>{c.rs_p}</p>
              <div className="rs-bar"><span style={{ width: '20%' }} /></div>
            </article>

            <article className="bento bento-agr">
              <div className="bento-icon"><Icon name="doc" size={22} /></div>
              <h3>{c.ag_t}</h3>
              <p>{c.ag_p}</p>
              <div className="ag-track">
                <div className="ag-head"><b>Nasra Tailoring</b><span>$720 / $1,200 · 60% {c.ag_paid}</span></div>
                <div className="rs-bar green"><span style={{ width: '60%' }} /></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── Learn ── */}
      <section className="l-section" id="learn">
        <div className="l-container">
          <div className="l-head row">
            <div>
              <div className="l-kicker">{c.v_kicker}</div>
              <h2 className="l-h2">{c.v_title}</h2>
            </div>
            <button className="btn btn-tinted btn-auto" onClick={() => { window.location.hash = '#/app/learn' }}><Icon name="play" size={18} /> {c.v_more}</button>
          </div>
          <div className="l-videos">
            {SEED_LESSONS.map((l) => (
              <div key={l.id} className="l-video">
                <Player lesson={l} />
                <div className="l-video-text"><h3>{l.title[lang] || l.title.en}</h3><p>{l.desc[lang] || l.desc.en}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="l-section" style={{ paddingTop: 0 }}>
        <div className="l-container">
          <div className="l-cta-band">
            <LogoMark size={52} />
            <h2 className="l-h2">{c.c_title}</h2>
            <p>{c.c_sub}</p>
            <button className="btn btn-gold btn-lg btn-auto" onClick={openApp}>{c.c_btn} <Icon name="chevron" size={18} /></button>
          </div>
        </div>
      </section>

      <AIWidget lang={lang} />

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <Logo size={28} />
          <span>{c.footer}</span>
        </div>
      </footer>
    </div>
  )
}
