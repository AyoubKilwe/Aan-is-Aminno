// Fills MongoDB with the demo data: one savings group, 8 local businesses and 2 lessons.
// Run: npm run seed   (it replaces existing demo data)
import 'dotenv/config'
import mongoose from 'mongoose'
import { Group, Business, Agreement, Lesson } from './models.js'

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

const lessons = [
  { seed: true, kind: 'file', src: '/videos/buugga-lacagta.mp4', poster: '/videos/buugga-lacagta.jpg',
    title: p('The money record book', 'Buugga lacagta'),
    desc: p('Write down sales and costs every day, and work out your profit.', 'Qor iibka iyo kharashka maalin kasta, oo xisaabi faa’iidada.') },
  { seed: true, kind: 'file', src: '/videos/mudaaraba.mp4', poster: '/videos/mudaaraba.jpg',
    title: p('What is Mudaraba?', 'Waa maxay Mudaaraba?'),
    desc: p('How a halal profit-sharing investment works, with an example.', 'Sida maalgelinta xalaasha ah ee faa’iidada la qaybsado u shaqayso, iyo tusaale.') },
]

await mongoose.connect(MONGODB_URI)
await Promise.all([Group.deleteMany({}), Business.deleteMany({}), Agreement.deleteMany({}), Lesson.deleteMany({ seed: true })])
await Group.create({ name: 'Hooyo Faadumo Group', savings: 5000, members: 10 })
await Business.insertMany(businesses)
await Lesson.insertMany(lessons)
console.log(`Seeded: 1 group, ${businesses.length} businesses, ${lessons.length} lessons → ${MONGODB_URI}`)
await mongoose.disconnect()
