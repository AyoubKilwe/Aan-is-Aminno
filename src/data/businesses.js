// Demo listings: sample local businesses for the hackathon demo, not real businesses.
const b = (o) => ({ halal: true, verified: { visited: false, records: false, guarantor: false }, ...o })

export const SEED_BUSINESSES = [
  b({ id: 'b1', name: 'Nasra Tailoring', owner: 'Nasra Maxamed', area: 'Wadajir', category: 'tailoring',
    years: '3+', monthlyProfit: 450, amountNeeded: 1500, hasRecords: true, hasGuarantor: true,
    competition: 'low', perishable: false, verified: { visited: true, records: true, guarantor: false },
    pitch: { en: 'Two more sewing machines to take school-uniform orders.', so: 'Laba mashiin tolid oo kale si loo qaato dalabaadka dharka dugsiga.' } }),
  b({ id: 'b2', name: 'Xaliimo Restaurant', owner: 'Xaliimo Cali', area: 'Hodan', category: 'food',
    years: '3+', monthlyProfit: 900, amountNeeded: 3000, hasRecords: true, hasGuarantor: true,
    competition: 'high', perishable: true, verified: { visited: true, records: false, guarantor: false },
    pitch: { en: 'A second cooking station and seating for the lunch rush.', so: 'Meel karin oo labaad iyo kuraas loogu talagalay saacadaha qadada.' } }),
  b({ id: 'b3', name: 'Ubax Cosmetics', owner: 'Ubax Cumar', area: 'Wadajir', category: 'retail',
    years: '1-3', monthlyProfit: 550, amountNeeded: 2000, hasRecords: true, hasGuarantor: true,
    competition: 'low', perishable: false,
    pitch: { en: 'Stock for Eid season, bought in bulk at a lower price.', so: 'Alaab ciidda ah oo jumlo lagu iibsado qiimo jaban.' } }),
  b({ id: 'b4', name: 'Iftiin Phone Repair', owner: 'Cabdi Yuusuf', area: 'Hodan', category: 'services',
    years: '3+', monthlyProfit: 700, amountNeeded: 2500, hasRecords: true, hasGuarantor: false,
    competition: 'low', perishable: false,
    pitch: { en: 'Spare-parts stock and a second technician.', so: 'Qalab badal ah iyo farsamoyaqaan labaad.' } }),
  b({ id: 'b5', name: 'Barwaaqo Milk Shop', owner: 'Sahra Xasan', area: 'Yaqshiid', category: 'food',
    years: '1-3', monthlyProfit: 300, amountNeeded: 2000, hasRecords: false, hasGuarantor: true,
    competition: 'low', perishable: true,
    pitch: { en: 'A freezer so less milk goes to waste.', so: 'Qaboojiye si caanaha luma u yaraadaan.' } }),
  b({ id: 'b6', name: 'Hooyo Vegetables', owner: 'Faadumo Axmed', area: 'Hawl Wadaag', category: 'retail',
    years: '<1', monthlyProfit: 150, amountNeeded: 2500, hasRecords: false, hasGuarantor: true,
    competition: 'high', perishable: true,
    pitch: { en: 'A market stall and a cart.', so: 'Miis suuq iyo gaari-gacan.' } }),
]

export const DEFAULT_GROUP = { name: 'Hooyo Faadumo Group', savings: 5000, members: 10 }

export const RESERVE_RATIO = 0.2 // keep 20% of savings untouched for emergencies
