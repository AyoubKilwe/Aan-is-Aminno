import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Logo, { Wordmark } from '../components/Logo.jsx'
import { HagbadRing, TrustRing } from '../components/Rings.jsx'
import { Segmented } from '../components/UI.jsx'
import AIWidget from '../components/AIWidget.jsx'
import { Player } from './Learn.jsx'
import { SEED_LESSONS } from '../lib/videos.js'
import './landing.css'
import { Coin, Shield3D, Leaf3D, Spark, Scribble, CountUp, Words, Intro, useIntro, usePointerVars, useCardTilt } from '../components/Motion3D.jsx'

// Display font for the landing page headlines (loaded once).
if (typeof document !== 'undefined' && !document.getElementById('lx-font')) {
  const l = document.createElement('link')
  l.id = 'lx-font'; l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap'
  document.head.appendChild(l)
}

const COPY = {
  en: {
    nav_how: 'How it works',
    nav_features: 'Features',
    nav_trust: 'Trust score',
    open: 'Open the app',
    eyebrow: 'For women’s savings groups',
    h1a: 'Your hagbad has grown.',
    h1b: 'Now let it work — safely.',
    lead: 'Aan Is Aamino helps savings groups find local businesses to invest in, check them before trusting them, and sign a halal profit-sharing agreement — together.',
    cta: 'Start investing',
    cta2: 'See how it works',
    proof1: 'Halal · no riba',
    proof2: 'English & Somali',
    proof3: 'Works on any phone',
    float1: 'Verified in person',
    float1b: '+15 trust points',
    float2: 'Mudaraba signed',
    float2b: 'Shared on WhatsApp',
    m_title: 'Our Hagbad',
    m_avail: 'available to invest',
    m_sav: 'Savings', m_inv: 'Invested', m_res: 'Reserve',
    m_b1: 'Nasra Tailoring', m_b1s: 'Earns back in 9 months',
    m_b2: 'Ubax Cosmetics', m_b2s: 'Earns back in 10 months',

    p_kicker: 'The problem',
    p_title: 'Saving is the easy part. Investing is where groups get stuck.',
    p1t: 'No way to compare', p1: 'Every business owner says their shop is doing well. Without numbers side by side, it’s guesswork.',
    p2t: 'Fear of losing it all', p2: 'Years of contributions could disappear in one bad decision, so the money sits idle.',
    p3t: 'Hard to agree', p3: 'Ten or twenty members need one clear, fair, written decision they all trust.',

    h_kicker: 'How it works',
    h_title: 'From savings to a signed agreement in four steps',
    s1t: 'Businesses apply', s1: 'Owners answer 8 simple questions and get a transparent trust score.',
    s2t: 'Your group compares', s2: 'See what each needs, its profit, and how fast your money comes back — even in a bad month.',
    s3t: 'Verify in person', s3: 'Two members visit, see the record book, and speak to the guarantor.',
    s4t: 'Sign & track', s4: 'Create a Mudaraba agreement, share it on WhatsApp, and record monthly profit.',

    f_kicker: 'Features',
    f_title: 'Everything a savings group needs to invest with confidence',
    f1t: 'Trust score', f1: 'A 0–100 score with a reason for every point, so nobody has to take the owner’s word for it.',
    f2t: 'Bad-month check', f2: 'See how long it takes to earn your money back if sales drop by 30%.',
    f3t: 'Safety reserve', f3: '20% of your savings is always kept aside for emergencies.',
    f4t: 'AI advisor', f4: 'Ask questions in English or Somali. Halal-only advice that knows your savings and local options.',
    f5t: 'Halal agreements', f5: 'Mudaraba profit-sharing contracts — no interest, no guaranteed returns, clear terms.',
    f6t: 'Monthly tracking', f6: 'Record profit each month and watch your investment earn itself back.',

    t_kicker: 'Trust score',
    t_title: 'A score that can’t be faked by talking',
    t_sub: 'Owners can earn up to 85 points from their own answers. The last 15 only come when your group checks in person.',
    t1: 'Every point comes with a written reason',
    t2: 'Self-reported claims are clearly marked',
    t3: 'Visiting, seeing the record book and meeting the guarantor each add 5 points',
    t_demo: 'Nasra Tailoring',
    t_l1: 'Running 3+ years', t_l2: 'Keeps a money record book', t_l3: 'Earns back within 12 months', t_l4: 'Verified in person (2 of 3)',

    v_kicker: 'Learn',
    v_title: 'Short lessons for every member',
    v_sub: 'Watch, learn, and add your own videos for your group.',
    v_more: 'See all lessons',
    nav_learn: 'Learn',
    c_title: 'Put your hagbad to work',
    c_sub: 'Open the app, enter your group’s savings, and compare the businesses near you.',
    c_btn: 'Open the app',
    footer: 'Built for women’s savings groups in Somalia. Demo data shown is sample data.',
    st1: 'kept aside as a safety reserve', st2: 'trust score, every point explained', st3: 'steps from savings to a signed deal',
    ft_tag: 'Halal investing for women’s savings groups.', ft_app: 'App', ft_rights: 'Hackathon project · 2026',
  },
  so: {
    nav_how: 'Sida uu u shaqeeyo',
    nav_features: 'Adeegyada',
    nav_trust: 'Dhibcaha kalsoonida',
    open: 'Fur app-ka',
    eyebrow: 'Kooxaha hagbadda haweenka',
    h1a: 'Hagbaddiinnu way kortay.',
    h1b: 'Hadda ha idiin shaqayso — si ammaan ah.',
    lead: 'Aan Is Aamino waxay kooxaha hagbadda ka caawisaa inay helaan ganacsiyo xaafadda ah oo ay maalgeliyaan, inay hubiyaan ka hor intaanay aaminin, oo ay saxiixaan heshiis xalaal ah — wadajir.',
    cta: 'Bilow maalgelinta',
    cta2: 'Eeg sida uu u shaqeeyo',
    proof1: 'Xalaal · ribo la’aan',
    proof2: 'Ingiriis & Soomaali',
    proof3: 'Telefoon kasta',
    float1: 'Si toos ah loo hubiyay',
    float1b: '+15 dhibcood',
    float2: 'Mudaaraba la saxiixay',
    float2b: 'WhatsApp lagu wadaagay',
    m_title: 'Hagbaddeenna',
    m_avail: 'diyaar u ah maalgelin',
    m_sav: 'Lacagta', m_inv: 'La geliyay', m_res: 'Kayd',
    m_b1: 'Nasra Tailoring', m_b1s: 'Soo celin 9 bilood',
    m_b2: 'Ubax Cosmetics', m_b2s: 'Soo celin 10 bilood',

    p_kicker: 'Dhibaatada',
    p_title: 'Kaydintu waa fududdahay. Maalgelinta ayaa kooxaha ku adag.',
    p1t: 'Isbarbardhig ma jiro', p1: 'Milkiile kastaa wuxuu leeyahay ganacsigaygu wuu fiican yahay. Tirooyin la’aan, waa mala-awaal.',
    p2t: 'Cabsida khasaaraha', p2: 'Sannado kayd ah ayaa hal go’aan xun ku lumi kara, sidaa darteed lacagtu way fadhidaa.',
    p3t: 'Heshiis adag', p3: 'Toban ama labaatan xubnood waxay u baahan yihiin hal go’aan oo cad, caddaalad ah oo qoran.',

    h_kicker: 'Sida uu u shaqeeyo',
    h_title: 'Laga bilaabo kayd ilaa heshiis la saxiixay — afar tallaabo',
    s1t: 'Ganacsiyadu way codsadaan', s1: 'Milkiiluhu wuxuu ka jawaabaa 8 su’aalood, wuxuuna helaa dhibco kalsooni oo cad.',
    s2t: 'Kooxdu way isbarbardhigtaa', s2: 'Eeg waxa uu u baahan yahay, faa’iidada, iyo inta lacagtu ku soo noqonayso — xataa bil xun.',
    s3t: 'Hubi adigoo jooga', s3: 'Laba xubnood ayaa booqda, arka buugga lacagta, lana hadla dammiinka.',
    s4t: 'Saxiix & la soco', s4: 'Samee heshiis Mudaaraba, ku wadaag WhatsApp, diiwaangeli faa’iidada bil kasta.',

    f_kicker: 'Adeegyada',
    f_title: 'Wax kasta oo kooxdu u baahan tahay si ay kalsooni ugu maalgeliso',
    f1t: 'Dhibcaha kalsoonida', f1: 'Dhibco 0–100 ah, dhibic kastaana sabab qoran bay leedahay.',
    f2t: 'Hubinta bisha xun', f2: 'Eeg inta lacagtu ku soo noqonayso haddii iibku 30% hoos u dhaco.',
    f3t: 'Kayd badbaado', f3: '20% lacagtiinna mar walba dhinac ayaa loo dhigaa xaaladaha degdegga ah.',
    f4t: 'Lataliye AI', f4: 'Weydii Ingiriis ama Soomaali. Talo xalaal ah oo og lacagtiinna iyo fursadaha xaafadda.',
    f5t: 'Heshiisyo xalaal ah', f5: 'Heshiisyo Mudaaraba — ribo la’aan, faa’iido go’an ma jirto, shuruudo cad.',
    f6t: 'La socod bille ah', f6: 'Diiwaangeli faa’iidada bil kasta oo arag maalgelintu inay soo noqonayso.',

    t_kicker: 'Dhibcaha kalsoonida',
    t_title: 'Dhibco aan hadal lagu been abuuri karin',
    t_sub: 'Milkiiluhu jawaabahiisa wuxuu kaga heli karaa ilaa 85 dhibcood. 15-ka ugu dambeeya waxaa la helaa oo kaliya marka kooxdu si toos ah u hubiso.',
    t1: 'Dhibic kastaa waxay leedahay sabab qoran',
    t2: 'Sheegashada milkiilaha si cad ayaa loo calaamadeeyaa',
    t3: 'Booqasho, arkidda buugga iyo la hadalka dammiinka mid kastaa 5 dhibcood',
    t_demo: 'Nasra Tailoring',
    t_l1: 'Wuxuu shaqaynayay 3+ sano', t_l2: 'Wuxuu hayaa buug lacageed', t_l3: 'Soo celin 12 bilood gudahood', t_l4: 'Si toos ah loo hubiyay (2 ee 3)',

    v_kicker: 'Baro',
    v_title: 'Casharro gaaban oo xubin kasta ah',
    v_sub: 'Daawo, baro, oo kooxdaada ugu dar muuqaallo kale.',
    v_more: 'Eeg casharrada oo dhan',
    nav_learn: 'Baro',
    c_title: 'Hagbaddiinna ha shaqayso',
    c_sub: 'Fur app-ka, geli lacagta kooxda, oo isbarbardhig ganacsiyada kuu dhow.',
    c_btn: 'Fur app-ka',
    footer: 'Waxaa loo dhisay kooxaha hagbadda haweenka Soomaaliyeed. Xogta muuqata waa tusaale.',
    st1: 'loo dhigo kayd badbaado', st2: 'dhibcaha kalsoonida, dhibic kastaa sabab leh', st3: 'tallaabo, kayd ilaa heshiis la saxiixay',
    ft_tag: 'Maalgelin xalaal ah oo loogu talagalay kooxaha hagbadda haweenka.', ft_app: 'App-ka', ft_rights: 'Mashruuc hackathon · 2026',
  },
}

const openApp = () => { window.location.hash = '#/app' }
const scrollTo = (id) => (e) => { e?.preventDefault(); document.getElementById(id)?.scrollIntoView() }

export default function Landing({ lang, setLang }) {
  const c = COPY[lang] || COPY.en
  const [scrolled, setScrolled] = useState(false)
  const heroRef = usePointerVars()
  const [intro, endIntro] = useIntro()
  const pageRef = useRef(null)
  useCardTilt(pageRef, '.lx-card, .lx-step, .lx-score')
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  // Cards fade up gently as they scroll into view (skipped when the phone asks for less motion).
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const root = document.querySelector('.lx')
    root?.classList.add('lx-anim')
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -8% 0px' })
    root?.querySelectorAll('.lx-card, .lx-step, .lx-score, .lx-video, .lx-band, .lx-head, .lx-split .lx-h2').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className={`lx ${intro ? 'lx-intro-on' : ''}`} ref={pageRef}>
      {intro && <Intro onDone={endIntro}><Wordmark height={120} /></Intro>}
      <header className={`lx-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lx-wrap lx-nav-inner">
          <Logo size={34} />
          <nav className="lx-links">
            <a href="#how" onClick={scrollTo('how')}>{c.nav_how}</a>
            <a href="#features" onClick={scrollTo('features')}>{c.nav_features}</a>
            <a href="#trust" onClick={scrollTo('trust')}>{c.nav_trust}</a>
            <a href="#learn" onClick={scrollTo('learn')}>{c.nav_learn}</a>
          </nav>
          <div className="lx-nav-end">
            <Segmented label="Language" value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'so', label: 'SO' }]} />
            <button className="lx-btn dark lx-hide-sm" onClick={openApp}>{c.open}</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="lx-wrap">
        <div className="lx-hero" ref={heroRef}>
          <div className="lx-watermark" aria-hidden="true">HAGBAD</div>
          <div className="lx-moss a" aria-hidden="true" />
          <div className="lx-moss b" aria-hidden="true" />

          <div className="lx-hero-grid">
            <div className="lx-hero-text">
              <span className="lx-tag lime">{c.eyebrow}</span>
              <h1 className="lx-h1"><span className="l1"><Words text={c.h1a} /></span> <span className="l2"><Words text={c.h1b} base={c.h1a.split(' ').length} /></span><Scribble className="lx-scribble" /><span className="lx-doodle" aria-hidden="true"><i /><i /><i /></span></h1>
              <p className="lx-lead">{c.lead}</p>
              <div className="lx-cta">
                <button className="lx-btn dark lg" onClick={openApp}>{c.cta} <span className="lx-arrow"><Icon name="chevron" size={16} /></span></button>
                <button className="lx-btn ghost lg" onClick={scrollTo('how')}>{c.cta2}</button>
              </div>
            </div>

            <div className="lx-hero-art">
              <svg className="lx-orbit" viewBox="0 0 400 400" aria-hidden="true">
                <circle cx="200" cy="200" r="186" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeDasharray="2 8" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeOpacity="0.1" />
                <circle className="lx-beam" cx="200" cy="200" r="186" pathLength="100" />
                <circle className="lx-beam rev" cx="200" cy="200" r="140" pathLength="100" />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * 2 * Math.PI - Math.PI / 2
                  return <circle key={i} cx={200 + 186 * Math.cos(a)} cy={200 + 186 * Math.sin(a)} r={i % 3 === 0 ? 7 : 4.5} className={i % 3 === 0 ? 'lime' : ''} />
                })}
              </svg>
              <div className="lx-float lx-p1" aria-hidden="true"><div className="lx-bob"><Coin size={76} /></div></div>
              <div className="lx-float lx-p2" aria-hidden="true"><div className="lx-bob slow"><Coin size={50} /></div></div>
              <div className="lx-float lx-p3" aria-hidden="true"><div className="lx-bob"><Shield3D size={82} /></div></div>
              <div className="lx-float lx-p4" aria-hidden="true"><div className="lx-bob fast"><Leaf3D size={60} /></div></div>
              <div className="lx-float lx-p5" aria-hidden="true"><div className="lx-twinkle"><Spark size={30} /></div></div>
              <div className="lx-float lx-p6" aria-hidden="true"><div className="lx-twinkle late"><Spark size={20} color="#fbbf24" /></div></div>
              <div className="lx-tilt">
              <div className="phone" aria-hidden="true">
                <div className="phone-screen">
                  <div className="phone-notch" />
                  <div style={{ fontWeight: 800, fontSize: 20, margin: '4px 2px 10px' }}>{c.m_title}</div>
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
                  <div className="mini-biz"><TrustRing score={95} level="green" size={40} stroke={5} /><div><b>{c.m_b1}</b><span>{c.m_b1s}</span></div></div>
                  <div className="mini-biz"><TrustRing score={75} level="green" size={40} stroke={5} /><div><b>{c.m_b2}</b><span>{c.m_b2s}</span></div></div>
                </div>
              </div>
              </div>
              <div className="lx-chip top"><TrustRing score={95} level="green" size={40} stroke={5} /><div><b>{c.t_demo}</b><span>{c.float1b}</span></div></div>
              <div className="lx-chip bottom"><span className="lx-chip-ic"><Icon name="doc" size={18} /></span><div><b>{c.float2}</b><span>{c.float2b}</span></div></div>
            </div>
          </div>

          <div className="lx-hero-foot">
            <div className="lx-stats">
              <div><CountUp to={20} suffix="%" ready={!intro} /><span>{c.st1}</span></div>
              <div><CountUp to={100} prefix="0–" ready={!intro} /><span>{c.st2}</span></div>
              <div><CountUp to={4} ms={900} ready={!intro} /><span>{c.st3}</span></div>
            </div>
            <div className="lx-proof">
              <span><Icon name="shield" size={16} /> {c.proof1}</span>
              <span><Icon name="advisor" size={16} /> {c.proof2}</span>
              <span><Icon name="check" size={16} /> {c.proof3}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="lx-section">
        <div className="lx-wrap">
          <div className="lx-head">
            <span className="lx-tag">{c.p_kicker}</span>
            <h2 className="lx-h2"><Words text={c.p_title} /></h2>
          </div>
          <div className="lx-cards three">
            {[['search', c.p1t, c.p1], ['warn', c.p2t, c.p2], ['users', c.p3t, c.p3]].map(([ic, h, p], i) => (
              <div key={h} className={`lx-card ${i === 2 ? 'dark' : ''}`}>
                <span className="lx-pill-num">0{i + 1}</span>
                <div className="lx-card-ic"><Icon name={ic} size={30} /></div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lx-section" id="how">
        <div className="lx-wrap">
          <div className="lx-head">
            <span className="lx-tag">{c.h_kicker}</span>
            <h2 className="lx-h2"><Words text={c.h_title} /></h2>
          </div>
          <div className="lx-steps">
            {[[c.s1t, c.s1], [c.s2t, c.s2], [c.s3t, c.s3], [c.s4t, c.s4]].map(([h, p], i) => (
              <div key={h} className="lx-step">
                <div className="lx-step-num">0{i + 1}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lx-section lx-forest" id="features">
        <div className="lx-wrap">
          <div className="lx-head">
            <span className="lx-tag">{c.f_kicker}</span>
            <h2 className="lx-h2"><Words text={c.f_title} /></h2>
          </div>
          <div className="lx-cards">
            {[['shield', c.f1t, c.f1], ['trend', c.f2t, c.f2], ['coins', c.f3t, c.f3], ['sparkle', c.f4t, c.f4], ['doc', c.f5t, c.f5], ['eye', c.f6t, c.f6]].map(([ic, h, p], i) => (
              <div key={h} className={`lx-card ${i === 3 ? 'dark' : ''}`}>
                <div className="lx-card-ic"><Icon name={ic} size={28} /></div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust score ── */}
      <section className="lx-section" id="trust">
        <div className="lx-wrap lx-split">
          <div>
            <span className="lx-tag">{c.t_kicker}</span>
            <h2 className="lx-h2 left"><Words text={c.t_title} /></h2>
            <p className="lx-sub">{c.t_sub}</p>
            <ul className="lx-checks">
              {[c.t1, c.t2, c.t3].map((x) => <li key={x}><span><Icon name="check" size={16} /></span>{x}</li>)}
            </ul>
          </div>
          <div className="lx-score">
            <div className="lx-score-head">
              <TrustRing score={95} level="green" size={72} stroke={7} />
              <div><b>{c.t_demo}</b><span>Wadajir</span></div>
              <span className="lx-tag lime small">95 / 100</span>
            </div>
            {[[c.t_l1, '20/20'], [c.t_l2, '15/15'], [c.t_l3, '20/20']].map(([l, v]) => (
              <div key={l} className="lx-score-line"><span><Icon name="check" size={16} /> {l}</span><b>{v}</b></div>
            ))}
            <div className="lx-score-line locked"><span><Icon name="shield" size={16} /> {c.t_l4}</span><b>10/15</b></div>
          </div>
        </div>
      </section>

      {/* ── Learn ── */}
      <section className="lx-section" id="learn">
        <div className="lx-wrap">
          <div className="lx-head">
            <span className="lx-tag">{c.v_kicker}</span>
            <h2 className="lx-h2"><Words text={c.v_title} /></h2>
            <p className="lx-sub">{c.v_sub}</p>
          </div>
          <div className="lx-videos">
            {SEED_LESSONS.slice(0, 2).map((l) => (
              <div key={l.id} className="lx-video">
                <Player lesson={l} />
                <div className="lx-video-text"><h3>{l.title[lang] || l.title.en}</h3><p>{l.desc[lang] || l.desc.en}</p></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button className="lx-btn ghost lg" onClick={() => { window.location.hash = '#/app/learn' }}><Icon name="play" size={18} /> {c.v_more}</button>
          </div>
        </div>
      </section>

      {/* ── Call to action ── */}
      <section className="lx-section">
        <div className="lx-wrap">
          <div className="lx-band">
            <div className="lx-moss b" aria-hidden="true" />
            <h2><Words text={c.c_title} /></h2>
            <p>{c.c_sub}</p>
            <button className="lx-btn lime lg" onClick={openApp}>{c.c_btn} <span className="lx-arrow dark"><Icon name="chevron" size={16} /></span></button>
          </div>
        </div>
      </section>

      <AIWidget lang={lang} />

      <footer className="lx-wrap lx-footer">
        <div className="lx-footer-top">
          <div className="lx-footer-brand"><Logo size={32} /><p>{c.ft_tag}</p></div>
          <nav className="lx-footer-links">
            <a href="#how" onClick={scrollTo('how')}>{c.nav_how}</a>
            <a href="#features" onClick={scrollTo('features')}>{c.nav_features}</a>
            <a href="#trust" onClick={scrollTo('trust')}>{c.nav_trust}</a>
            <a href="#learn" onClick={scrollTo('learn')}>{c.nav_learn}</a>
            <a href="#/app" onClick={(e) => { e.preventDefault(); openApp() }}>{c.ft_app}</a>
          </nav>
        </div>
        <div className="lx-footer-bottom"><span>{c.footer}</span><span>{c.ft_rights}</span></div>
      </footer>
    </div>
  )
}
