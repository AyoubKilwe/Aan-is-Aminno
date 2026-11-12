import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Logo from '../components/Logo.jsx'
import { HagbadRing, TrustRing } from '../components/Rings.jsx'
import { Segmented } from '../components/UI.jsx'

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

    c_title: 'Put your hagbad to work',
    c_sub: 'Open the app, enter your group’s savings, and compare the businesses near you.',
    c_btn: 'Open the app',
    footer: 'Built for women’s savings groups in Somalia. Demo data shown is sample data.',
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

    c_title: 'Hagbaddiinna ha shaqayso',
    c_sub: 'Fur app-ka, geli lacagta kooxda, oo isbarbardhig ganacsiyada kuu dhow.',
    c_btn: 'Fur app-ka',
    footer: 'Waxaa loo dhisay kooxaha hagbadda haweenka Soomaaliyeed. Xogta muuqata waa tusaale.',
  },
}

const openApp = () => { window.location.hash = '#/app' }

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
            <a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById('how')?.scrollIntoView() }}>{c.nav_how}</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView() }}>{c.nav_features}</a>
            <a href="#trust" onClick={(e) => { e.preventDefault(); document.getElementById('trust')?.scrollIntoView() }}>{c.nav_trust}</a>
          </nav>
          <div className="l-nav-end">
            <Segmented label="Language" value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'so', label: 'SO' }]} />
            <button className="btn btn-primary btn-auto" onClick={openApp}>{c.open}</button>
          </div>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-container l-hero-grid">
          <div>
            <span className="eyebrow"><Icon name="users" size={16} /> {c.eyebrow}</span>
            <h1 className="l-h1">{c.h1a}<br /><em>{c.h1b}</em></h1>
            <p className="l-lead">{c.lead}</p>
            <div className="l-cta">
              <button className="btn btn-primary btn-lg btn-auto" onClick={openApp}>{c.cta} <Icon name="chevron" size={18} /></button>
              <button className="btn btn-tinted btn-lg btn-auto" onClick={() => document.getElementById('how')?.scrollIntoView()}>{c.cta2}</button>
            </div>
            <div className="l-proof">
              <span><Icon name="shield" size={18} /> {c.proof1}</span>
              <span><Icon name="advisor" size={18} /> {c.proof2}</span>
              <span><Icon name="check" size={18} /> {c.proof3}</span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
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
            <div className="float-card" style={{ top: 70, left: -10 }}><Icon name="shield" size={22} /><div><b>{c.float1}</b>{c.float1b}</div></div>
            <div className="float-card" style={{ bottom: 70, right: -10 }}><Icon name="doc" size={22} /><div><b>{c.float2}</b>{c.float2b}</div></div>
          </div>
        </div>
      </section>

      <section className="l-section alt">
        <div className="l-container">
          <div className="l-head">
            <div className="l-kicker">{c.p_kicker}</div>
            <h2 className="l-h2">{c.p_title}</h2>
          </div>
          <div className="l-problem">
            {[['search', c.p1t, c.p1], ['warn', c.p2t, c.p2], ['users', c.p3t, c.p3]].map(([ic, h, p]) => (
              <div key={h} className="l-stat"><Icon name={ic} size={26} /><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="how">
        <div className="l-container">
          <div className="l-head">
            <div className="l-kicker">{c.h_kicker}</div>
            <h2 className="l-h2">{c.h_title}</h2>
          </div>
          <div className="l-steps">
            {[[c.s1t, c.s1], [c.s2t, c.s2], [c.s3t, c.s3], [c.s4t, c.s4]].map(([h, p], i) => (
              <div key={h} className="l-step"><div className="l-step-num">{i + 1}</div><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section alt" id="features">
        <div className="l-container">
          <div className="l-head">
            <div className="l-kicker">{c.f_kicker}</div>
            <h2 className="l-h2">{c.f_title}</h2>
          </div>
          <div className="l-features">
            {[['shield', c.f1t, c.f1], ['trend', c.f2t, c.f2], ['coins', c.f3t, c.f3], ['sparkle', c.f4t, c.f4], ['doc', c.f5t, c.f5], ['eye', c.f6t, c.f6]].map(([ic, h, p]) => (
              <div key={h} className="l-feature"><div className="l-ficon"><Icon name={ic} size={24} /></div><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section" id="trust">
        <div className="l-container l-split">
          <div>
            <div className="l-head">
              <div className="l-kicker">{c.t_kicker}</div>
              <h2 className="l-h2">{c.t_title}</h2>
              <p className="l-sub">{c.t_sub}</p>
            </div>
            <ul className="l-checks">
              {[c.t1, c.t2, c.t3].map((x) => <li key={x}><Icon name="check" size={20} /> {x}</li>)}
            </ul>
          </div>
          <div className="score-demo">
            <div className="score-demo-head">
              <TrustRing score={95} level="green" size={72} stroke={7} />
              <div><div className="headline">{c.t_demo}</div><div className="footnote">Wadajir</div></div>
            </div>
            <div className="score-line"><span><Icon name="check" size={18} /> {c.t_l1}</span><b>20/20</b></div>
            <div className="score-line"><span><Icon name="check" size={18} /> {c.t_l2}</span><b>15/15</b></div>
            <div className="score-line"><span><Icon name="check" size={18} /> {c.t_l3}</span><b>20/20</b></div>
            <div className="score-line locked"><span><Icon name="shield" size={18} /> {c.t_l4}</span><b>10/15</b></div>
          </div>
        </div>
      </section>

      <section className="l-section" style={{ paddingTop: 0 }}>
        <div className="l-container">
          <div className="l-cta-band">
            <h2 className="l-h2">{c.c_title}</h2>
            <p>{c.c_sub}</p>
            <button className="btn btn-white btn-lg btn-auto" onClick={openApp}>{c.c_btn} <Icon name="chevron" size={18} /></button>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <Logo size={28} />
          <span>{c.footer}</span>
        </div>
      </footer>
    </div>
  )
}
