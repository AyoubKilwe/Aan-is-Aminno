import { scoreBusiness } from './trustScore.js'

// The browser asks our Express server (/api/ai). The server holds the Gemini key,
// reads the latest data from MongoDB, and calls Gemini. If the server or Gemini
// can't be reached, a prepared answer is shown instead.
export const hasKey = () => true

export async function askAdvisor({ group, businesses, lang, history, question }) {
  const past = history.some((m) => m.role === 'user') ? history.slice(history.findIndex((m) => m.role === 'user')) : []
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, lang, history: past.slice(-10) }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.text) throw new Error('empty')
    return { text: data.text, offline: false }
  } catch (e) {
    console.warn('AI unavailable, using a prepared answer:', e.message)
    return { text: fallbackAnswer(question, group, businesses || [], lang), offline: true, error: true }
  }
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
