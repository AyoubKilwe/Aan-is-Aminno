import { fmt } from './trustScore.js'

// Mudaraba: the group provides capital (Rabb-ul-Mal), the owner provides work (Mudarib).
// Profit is shared by an agreed ratio; capital loss falls on the investor unless the manager was negligent.
export function contractText({ lang, group, a }) {
  const ownerShare = 100 - a.share
  const date = new Date(a.date).toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  if (lang === 'so') {
    return `HESHIIS MUDAARABA
Taariikh: ${date}

1. DHINACYADA
Maalgeliyaha (Rabbul-Maal): ${group.name}, oo ka kooban ${group.members} xubnood.
Maamulaha (Mudaarib): ${a.owner}, milkiilaha ${a.businessName}, ${a.area}.

2. RAASAMAALKA
Kooxdu waxay gelinaysaa ${fmt(a.amount)} ganacsiga ${a.businessName}.

3. QAYBINTA FAA'IIDADA
Kooxda ${a.share}% · Maamulaha ${ownerShare}%.
Faa'iidada waxaa la qaybinayaa bil kasta, kadib marka kharashaadka ganacsiga la jaro. Ma jiro ribo ama faa'iido go'an.

4. KHASAARAHA
Khasaaraha raasamaalka waxaa qaada kooxda; maamuluhu wuxuu waayaa dadaalkiisa. Haddii maamuluhu dayaco ama khiyaano sameeyo, isagaa mas'uul ka ah.

5. WARBIXIN IYO HUBIN
Maamuluhu wuxuu bil kasta soo gudbinayaa iibka, kharashka iyo faa'iidada, wuxuuna hayaa buug lacageed oo kooxdu arki karto wakhti kasta.

6. MUDDADA
${a.duration} bilood. Dhammaadka, raasamaalka ka hadhay waa loo celinayaa kooxda, ama waa la cusboonaysiinayaa haddii labada dhinac ku heshiiyaan.

7. KA BIXITAAN
Dhinac kastaa wuu ka bixi karaa isagoo bixiya ogeysiis 30 maalmood ah.

Saxiixa wakiilka kooxda: ____________________
Saxiixa maamulaha:       ____________________
Markhaati:               ____________________`
  }
  return `MUDARABA AGREEMENT
Date: ${date}

1. PARTIES
Investor (Rabb-ul-Mal): ${group.name}, a savings group of ${group.members} members.
Manager (Mudarib): ${a.owner}, owner of ${a.businessName}, ${a.area}.

2. CAPITAL
The group invests ${fmt(a.amount)} in ${a.businessName}.

3. PROFIT SHARING
Group ${a.share}% · Manager ${ownerShare}%.
Profit is shared monthly after business expenses. No interest (riba) and no fixed or guaranteed return.

4. LOSSES
Capital losses are borne by the group; the manager loses the value of their work. If the manager is negligent or dishonest, the manager is liable.

5. REPORTING AND INSPECTION
Each month the manager reports sales, costs and profit, and keeps a record book the group may inspect at any time.

6. DURATION
${a.duration} months. At the end, the remaining capital returns to the group, or the agreement is renewed if both sides agree.

7. EXIT
Either side may end the agreement with 30 days' written notice.

Group representative: ____________________
Manager:              ____________________
Witness:              ____________________`
}
