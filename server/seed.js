// Fills MongoDB with the demo data: one savings group, 8 local businesses and 2 lessons.
// Run: npm run seed   (it replaces existing demo data)
import 'dotenv/config'
import mongoose from 'mongoose'
import { Group, Business, Agreement, Lesson } from './models.js'
import { SEED_LESSONS } from '../src/lib/videos.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aan-is-aamino'

const p = (en, so) => ({ en, so })
const v = (visited = false, records = false, guarantor = false) => ({ visited, records, guarantor })

const businesses = [
  { name: 'Nasra Tailoring', owner: 'Nasra Maxamed', area: 'Wadajir', category: 'tailoring', years: '3+', monthlyProfit: 450, amountNeeded: 1500,
    hasRecords: true, hasGuarantor: true, competition: 'low', perishable: false, verified: v(true, true, false),
    pitch: p('Two more sewing machines to take school-uniform orders.', 'Laba mashiin tolid oo kale si loo qaato dalabaadka dharka dugsiga.') },
  { name: 'Xaliimo Restaurant', owner: 'Xaliimo Cali', area: 'Hodan', category: 'food', years: '3+', monthlyProfit: 900, amountNeeded: 3000,
    hasRecords: true, hasGuarantor: true, competition: 'high', perishable: true, verified: v(true, false, false),
    pitch: p('A second cooking station and seating for the lunch rush.', 'Meel karin oo labaad iyo kuraas loogu talagalay saacadaha qadada.') },
  { name: 'Ubax Cosmetics', owner: 'Ubax Cumar', area: 'Wadajir', category: 'retail', years: '1-3', monthlyProfit: 550, amountNeeded: 2000,
    hasRecords: true, hasGuarantor: true, competition: 'low', perishable: false, verified: v(),
    pitch: p('Stock for Eid season, bought in bulk at a lower price.', 'Alaab ciidda ah oo jumlo lagu iibsado qiimo jaban.') },
  { name: 'Iftiin Phone Repair', owner: 'Cabdi Yuusuf', area: 'Hodan', category: 'services', years: '3+', monthlyProfit: 700, amountNeeded: 2500,
    hasRecords: true, hasGuarantor: false, competition: 'low', perishable: false, verified: v(),
    pitch: p('Spare-parts stock and a second technician.', 'Qalab badal ah iyo farsamoyaqaan labaad.') },
  { name: 'Hiran Henna & Beauty', owner: 'Hibaaq Aadan', area: 'Shibis', category: 'services', years: '3+', monthlyProfit: 380, amountNeeded: 1200,
    hasRecords: true, hasGuarantor: true, competition: 'high', perishable: false, verified: v(true, true, true),
    pitch: p('A second chair and products for wedding season.', 'Kursi labaad iyo alaab loogu talagalay xilliga arooska.') },
  { name: 'Barwaaqo Milk Shop', owner: 'Sahra Xasan', area: 'Yaqshiid', category: 'food', years: '1-3', monthlyProfit: 300, amountNeeded: 2000,
    hasRecords: false, hasGuarantor: true, competition: 'low', perishable: true, verified: v(),
    pitch: p('A freezer so less milk goes to waste.', 'Qaboojiye si caanaha luma u yaraadaan.') },
  { name: 'Dahabo Grain Store', owner: 'Dahabo Warsame', area: 'Karaan', category: 'retail', years: '1-3', monthlyProfit: 420, amountNeeded: 2800,
    hasRecords: true, hasGuarantor: false, competition: 'high', perishable: false, verified: v(true, false, false),
    pitch: p('Buy rice, flour and sugar in bulk before prices rise.', 'Bariis, bur iyo sonkor jumlo lagu iibsado ka hor inta qiimuhu kicin.') },
  { name: 'Hooyo Vegetables', owner: 'Faadumo Axmed', area: 'Hawl Wadaag', category: 'retail', years: '<1', monthlyProfit: 150, amountNeeded: 2500,
    hasRecords: false, hasGuarantor: true, competition: 'high', perishable: true, verified: v(),
    pitch: p('A market stall and a cart.', 'Miis suuq iyo gaari-gacan.') },
].map((b) => ({ halal: true, ...b }))

// Built-in lessons come from the app's list, in the same order.
const lessons = SEED_LESSONS.map(({ id, ...l }, order) => ({ ...l, order }))

// The first group is the one the demo app uses; the others show owners that more groups are investing.
const groups = [
  { name: 'Hooyo Faadumo Group', savings: 5000, members: 10 },
  { name: 'Ubax Women’s Hagbad', savings: 8000, members: 15 },
  { name: 'Nabadoon Savings Circle', savings: 3500, members: 8 },
]

await mongoose.connect(MONGODB_URI)
// Replace only the demo data, so businesses and groups people added themselves are kept.
const demoGroups = await Group.find({ name: { $in: groups.map((g) => g.name) } })
const demoBiz = await Business.find({ name: { $in: businesses.map((b) => b.name) } })
await Promise.all([
  Agreement.deleteMany({ $or: [{ group: { $in: demoGroups.map((g) => g._id) } }, { business: { $in: demoBiz.map((b) => b._id) } }] }),
  Group.deleteMany({ _id: { $in: demoGroups.map((g) => g._id) } }),
  Business.deleteMany({ _id: { $in: demoBiz.map((b) => b._id) } }),
  Lesson.deleteMany({ seed: true }),
])
const createdGroups = []
for (const g of groups) createdGroups.push(await Group.create(g)) // one by one so the first group is created first
const createdBiz = await Business.insertMany(businesses)
await Lesson.insertMany(lessons)

// One example deal from another group, so funding progress shows up in the app.
const hiran = createdBiz.find((b) => b.name === 'Hiran Henna & Beauty')
await Agreement.create({
  group: createdGroups[1]._id, business: hiran._id, businessName: hiran.name, owner: hiran.owner, area: hiran.area,
  amount: 600, share: 40, duration: 12, payments: [{ amount: 150 }],
})
console.log(`Seeded: ${groups.length} groups, ${businesses.length} businesses, 1 agreement, ${lessons.length} lessons → ${MONGODB_URI.replace(/\/\/[^@/]*@/, '//***@')}`)
await mongoose.disconnect()

// If the API is running, tell it to re-read the data (it keeps a copy in memory).
try {
  await fetch(`http://localhost:${Number(process.env.API_PORT) || 4000}/api/reload`, { method: 'POST', signal: AbortSignal.timeout(15000) })
  console.log('Running API reloaded the new data.')
} catch { /* API not running — it will load the data when it starts */ }
