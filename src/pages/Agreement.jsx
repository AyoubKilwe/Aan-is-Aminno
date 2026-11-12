import { useEffect, useState } from 'react'
import { scoreBusiness, paybackMonths } from '../lib/trustScore.js'
import ScoreBadge from '../components/ScoreBadge.jsx'

function agreementText({ lang, group, b, amount, share, duration }) {
  const ownerShare = 100 - share
  const date = new Date().toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-GB')
  if (lang === 'so') {
    return `HESHIIS MUDAARABA
Taariikh: ${date}

1. DHINACYADA
• Maalgeliyaha (Rabbul-Maal): ${group.name} (${group.members} xubnood)
• Maamulaha (Mudaarib): ${b.owner}, milkiilaha ${b.name}, ${b.area}

2. RAASAMAALKA
Kooxdu waxay gelinaysaa $${amount.toLocaleString()} ganacsiga ${b.name}.

3. QAYBINTA FAA'IIDADA
• Kooxda: ${share}%
• Maamulaha: ${ownerShare}%
Faa'iidada waxaa la qaybinayaa bil kasta, kadib marka kharashaadka la jaro. Ma jiro ribo ama faa'iido go'an.

4. KHASAARAHA
Haddii khasaare dhaco, raasamaalka waxaa qaadaya kooxda, maamuluhuna wuxuu waayayaa shaqadiisa. Haddii maamuluhu dayaco ama khiyaano sameeyo, isagaa mas'uul ka ah.

5. WARBIXIN
Maamuluhu wuxuu bil kasta kooxda u soo gudbinayaa warbixin iib, kharash iyo faa'iido, wuxuuna hayaa buug lacageed oo kooxdu arki karto.

6. MUDDADA
Heshiisku waa ${duration} bilood. Dhammaadka, raasamaalka inta ka hartay waa loo celinayaa kooxda ama waa la cusboonaysiinayaa haddii labada dhinac ku heshiiyaan.

7. KALA TAGID
Dhinac kastaa wuu ka bixi karaa isagoo bixiya ogeysiis 30 maalmood ah.

Saxiixa kooxda: ________________
Saxiixa maamulaha: ________________
Markhaati: ________________

— Waxaa lagu diyaariyay Aan Is Aamino`
  }
  return `MUDARABA AGREEMENT
Date: ${date}

1. PARTIES
• Investor (Rabb-ul-Mal): ${group.name} (${group.members} members)
• Manager (Mudarib): ${b.owner}, owner of ${b.name}, ${b.area}

2. CAPITAL
The group invests $${amount.toLocaleString()} in ${b.name}.

3. PROFIT SHARING
• Group: ${share}%
• Manager: ${ownerShare}%
Profit is shared monthly after business expenses. No interest (riba) and no fixed guaranteed return.

4. LOSSES
Capital losses are borne by the group; the manager loses the value of their work. If the manager is negligent or dishonest, the manager is liable.

5. REPORTING
The manager sends the group a monthly report of sales, costs and profit, and keeps a record book the group can inspect.

6. DURATION
This agreement lasts ${duration} months. At the end, the remaining capital is returned to the group, or renewed if both sides agree.

7. EXIT
Either side may end the agreement with 30 days' notice.

Group signature: ________________
Manager signature: ________________
Witness: ________________

— Prepared with Aan Is Aamino`
}

export default function Agreement({ t, lang, group, businesses, selectedId, setSelectedId }) {
  const b = businesses.find((x) => x.id === selectedId)
  const [amount, setAmount] = useState(b?.amountNeeded ?? 0)
  const [share, setShare] = useState(40)
  const [duration, setDuration] = useState(24)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (b) setAmount(b.amountNeeded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const s = b ? scoreBusiness(b) : null
  const amt = Math.max(0, Number(amount) || 0)
  const monthly = b ? Math.round(b.monthlyProfit * (share / 100) * (amt / b.amountNeeded || 0)) : 0
  const back = b ? paybackMonths(amt, b.monthlyProfit * (amt / b.amountNeeded || 0), share / 100) : 0
  const text = b ? agreementText({ lang, group, b, amount: amt, share, duration }) : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className="page">
      <h1>📄 {t('agr_title')}</h1>
      <p className="muted">{t('agr_sub')}</p>

      <div className="card form">
        <label>{t('agr_business')}
          <select value={selectedId || ''} onChange={(e) => setSelectedId(e.target.value || null)}>
            <option value="">— {t('agr_choose')} —</option>
            {businesses.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.area})</option>)}
          </select>
        </label>

        {b && (
          <>
            <div className="row between">
              <span className="muted">{t('trust')}</span>
              <ScoreBadge score={s.score} level={s.level} />
            </div>
            <label>{t('agr_amount')}
              <input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
            <label>{t('agr_split')}: <b>{t('agr_group')} {share}%</b> · {t('agr_ownerShare')} {100 - share}%
              <input type="range" min="10" max="90" step="5" value={share} onChange={(e) => setShare(Number(e.target.value))} />
            </label>
            <label>{t('agr_duration')}
              <input type="number" inputMode="numeric" min="1" value={duration} onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))} />
            </label>
            <dl className="stats">
              <div><dt>{t('agr_monthly')}</dt><dd>${monthly.toLocaleString()}</dd></div>
              <div><dt>{t('agr_back')}</dt><dd>{Number.isFinite(back) ? back : '—'} {t('opps_months')}</dd></div>
            </dl>
          </>
        )}
      </div>

      {b && (
        <>
          <h2>{t('agr_preview')}</h2>
          <pre className="card contract">{text}</pre>
          <div className="row wrap">
            <a className="btn whatsapp" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
              📲 {t('agr_whatsapp')}
            </a>
            <button className="btn ghost" onClick={copy}>{copied ? `✅ ${t('agr_copied')}` : `📋 ${t('agr_copy')}`}</button>
            <button className="btn ghost" onClick={() => window.print()}>🖨️ {t('agr_print')}</button>
          </div>
        </>
      )}
    </div>
  )
}
