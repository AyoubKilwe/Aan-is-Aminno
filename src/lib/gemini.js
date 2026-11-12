import { scoreBusiness } from './trustScore.js'

const KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

export const hasKey = () => Boolean(KEY && KEY !== 'PASTE_KEY_HERE')

function buildContext(group, businesses, lang, agreements = [], invested = 0) {
  const available = Math.max(0, Math.round(group.savings * 0.8 - invested))
  const list = businesses
    .map((b) => {
      const s = scoreBusiness(b)
      const v = b.verified || {}
      return `- ${b.name} (${b.area}, ${b.category}), owner ${b.owner}, purpose "${typeof b.pitch === 'object' ? b.pitch.en : b.pitch || ''}": needs $${b.amountNeeded}, profit $${b.monthlyProfit}/month, running ${b.years} years, record book: ${b.hasRecords ? 'yes' : 'no'}, guarantor: ${b.hasGuarantor ? 'yes' : 'no'}, competition: ${b.competition}, perishable goods: ${b.perishable ? 'yes' : 'no'}, verified in person by a group: ${['visited', 'records', 'guarantor'].filter((k) => v[k]).join(', ') || 'nothing yet'}, trust score ${s.score}/100, money back to group in ~${s.months} months at a 40% profit share.`
    })
    .join('\n')

  return `You are the advisor inside "Aan Is Aamino", an app for a Somali women's savings group (hagbad) that wants to invest together.
Group: "${group.name}", ${group.members} members, total savings $${group.savings}. They keep 20% as a safety reserve; $${invested} is already invested${agreements.length ? ` (${agreements.map((a) => `${a.businessName} $${a.amount}`).join(', ')})` : ''}; $${available} is available to invest now.
Businesses currently seeking investment in their area:
${list}

Rules:
- Reply in ${lang === 'so' ? 'Somali' : 'English'}, in simple words a non-expert understands. Keep it short: at most 8 short lines or bullets.
- Only halal advice: profit-sharing (Mudaraba / Musharaka), never interest (riba).
- Always name the main risk and one practical way to reduce it (e.g. keep a record book, start small, split the money across two businesses, keep some savings aside).
- Owner numbers are self-reported: remind them to verify in person (visit, see the record book, speak to the guarantor) before investing.
- Never promise profit. Use the numbers above; if you estimate, say it is an estimate.
- When suggesting a new business, prefer ones the women can run or supervise themselves and that fit their savings.`
}

export async function askAdvisor({ group, businesses, agreements = [], invested = 0, lang, history, question }) {
  if (!hasKey()) return { text: fallbackAnswer(question, group, businesses, lang), offline: true }

  const contents = [
    ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: question }] },
  ]

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: buildContext(group, businesses, lang, agreements, invested) }] },
    contents,
    // thinkingBudget 0: spend all tokens on the answer, and answer faster
    generationConfig: { temperature: 0.6, maxOutputTokens: 1200, thinkingConfig: { thinkingBudget: 0 } },
  })

  // Free-tier models are sometimes busy (503) or rate-limited (429):
  // retry once, then try a lighter model, then fall back to prepared answers.
  const attempts = [MODEL, MODEL, 'gemini-2.5-flash-lite']
  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${attempts[i]}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
        body,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
      if (!text) throw new Error('empty')
      return { text, offline: false }
    } catch (e) {
      console.warn(`Gemini attempt ${i + 1} (${attempts[i]}) failed:`, e.message)
      if (i < attempts.length - 1) await new Promise((r) => setTimeout(r, 1200))
    }
  }
  return { text: fallbackAnswer(question, group, businesses, lang), offline: true, error: true }
}

// Prepared answers so the demo still works with no internet or no key.
function fallbackAnswer(question, group, businesses, lang) {
  const q = question.toLowerCase()
  const ranked = businesses
    .map((b) => ({ b, s: scoreBusiness(b) }))
    .sort((x, y) => y.s.score - x.s.score)
  const best = ranked[0]
  const so = lang === 'so'

  const named = businesses.find((b) => q.includes(b.name.toLowerCase()))
  if (named) {
    const s = scoreBusiness(named)
    const warn = s.warnings.length
    return so
      ? `**${named.name}** — dhibcaha kalsoonida: ${s.score}/100.\n\n• Wuxuu u baahan yahay $${named.amountNeeded}, faa'iidadiisuna waa $${named.monthlyProfit} bishii.\n• Haddii kooxdu qaadato 40% faa'iidada, lacagtu waxay soo noqonaysaa ~${s.months} bilood.\n• ${warn ? `Waxaa jira ${warn} digniin — eeg "Sababta dhibcahan".` : 'Digniin weyn ma leh.'}\n\n**Talo:** ka hor lacagta, booqo ganacsiga, eeg buugga lacagta, oo ku bilow qayb yar oo lacagta ka mid ah.`
      : `**${named.name}** — trust score: ${s.score}/100.\n\n• Needs $${named.amountNeeded}, profit about $${named.monthlyProfit}/month.\n• At a 40% profit share, your money comes back in ~${s.months} months.\n• ${warn ? `It has ${warn} warning(s) — check "Why this score".` : 'No major warnings.'}\n\n**Tip:** visit the shop, look at the record book, and start with part of your savings, not all of it.`
  }

  if (q.includes('safe') || q.includes('ammaan') || q.includes('which') || q.includes('kee')) {
    const top = ranked.slice(0, 2)
    return so
      ? `Labada ugu dhibcaha badan:\n\n${top.map(({ b, s }) => `• **${b.name}** — ${s.score}/100, lacagtu waxay soo noqonaysaa ~${s.months} bilood`).join('\n')}\n\n**Talo:** lacagta u kala qaybi labadan ganacsi halkii aad hal meel geli lahayd — haddii mid xumaado, kan kale ayaa idin badbaadinaya. Kayd yar oo lacag ah dhinac iska dhiga.`
      : `The two highest-scoring businesses:\n\n${top.map(({ b, s }) => `• **${b.name}** — ${s.score}/100, money back in ~${s.months} months`).join('\n')}\n\n**Tip:** split your money between these two instead of one — if one struggles, the other protects you. Keep a small reserve aside.`
  }

  if (q.includes('bakery') || q.includes('rooti') || q.includes('idea') || q.includes('fikrad')) {
    return so
      ? `**Foorno rooti oo yar** — fikrad wanaagsan, maxaa yeelay rootigu waa wax maalin kasta la iibsado.\n\n• Khatarta ugu weyn: rootigu wuu xumaadaa, sicirka burkuna wuu isbeddelaa.\n• Yaree khatarta: maalin kasta inta la iibin karo oo kaliya dub, oo dukaamada xaafadda la heshiiya.\n• Bilow yar: qayb ka mid ah $${group.savings} oo keliya geli, inta kalena kayd ka dhiga.\n• Haweenka kooxda qaar ayaa maamuli kara — taasi waxay yaraynaysaa kharashka shaqaalaha.\n\n*Tani waa qiyaas — ka hor bilowga, weydii dukaamada xaafadda inta rooti ee ay maalintii iibsadaan.*`
      : `**A small bakery** — a good idea, because bread is bought every day.\n\n• Main risk: bread spoils fast and flour prices change.\n• Reduce it: bake only what sells daily, and agree supply deals with nearby shops.\n• Start small: use part of your $${group.savings}, keep the rest as a reserve.\n• Members can run it themselves, which keeps staff costs low.\n\n*This is an estimate — before starting, ask local shops how much bread they sell per day.*`
  }

  return so
    ? `Iyadoo kooxdiinnu haysato $${group.savings} iyo ${group.members} xubnood, waa kuwan 3 fikradood:\n\n• **Dukaan tolid** — haweenka tolidda yaqaan ayaa maamuli kara, alaabtuna ma xumaato.\n• **Iib alaab qurxin** — raasamaal yar, faa'iido joogto ah.\n• **Maalgelin ganacsi liiska ku jira** — ${best ? `**${best.b.name}** ayaa ugu dhibcaha badan (${best.s.score}/100).` : ''}\n\n**Talo:** lacagta oo dhan hal meel ha gelinina. Bilow yar, buug lacageed hayso, warbixin bille ahna dalbo.`
    : `With $${group.savings} and ${group.members} members, here are 3 options:\n\n• **Tailoring shop** — members with sewing skills can run it, and goods don't spoil.\n• **Cosmetics retail** — low start-up cost, steady sales.\n• **Invest in a listed business** — ${best ? `**${best.b.name}** has the highest trust score (${best.s.score}/100).` : ''}\n\n**Tip:** don't put all your savings in one place. Start small, keep a record book, and ask for a monthly report.`
}
