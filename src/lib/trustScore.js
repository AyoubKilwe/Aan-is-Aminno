// Trust score, 0–100.
// 85 points come from what the owner reports. The last 15 can only be earned when the
// group checks the business in person — so a high score can't be reached by self-reporting alone.

export const DEFAULT_GROUP_SHARE = 0.4 // group's share of profit in a Mudaraba deal

export const VERIFY_CHECKS = ['visited', 'records', 'guarantor']

export function paybackMonths(amount, monthlyProfit, groupShare = DEFAULT_GROUP_SHARE, drop = 0) {
  const toGroup = monthlyProfit * (1 - drop) * groupShare
  if (!(toGroup > 0)) return Infinity
  return Math.ceil(amount / toGroup)
}

export function scoreBusiness(b) {
  const reasons = [] // { points, max, key, verified? }
  const add = (points, max, key, extra = {}) => reasons.push({ points, max, key, ...extra })
  const v = b.verified || {}

  add(b.years === '3+' ? 20 : b.years === '1-3' ? 10 : 0, 20,
    b.years === '3+' ? 'r_years3' : b.years === '1-3' ? 'r_years1' : 'r_yearsNew')
  add(b.hasRecords ? 15 : 0, 15, b.hasRecords ? 'r_records' : 'r_noRecords')
  add(b.hasGuarantor ? 10 : 0, 10, b.hasGuarantor ? 'r_guarantor' : 'r_noGuarantor')
  add(b.competition === 'low' ? 10 : 0, 10, b.competition === 'low' ? 'r_lowComp' : 'r_highComp')
  add(!b.perishable ? 10 : 0, 10, !b.perishable ? 'r_notPerishable' : 'r_perishable')

  const months = paybackMonths(b.amountNeeded, b.monthlyProfit)
  add(months <= 12 ? 20 : months <= 24 ? 12 : months <= 36 ? 5 : 0, 20,
    months <= 12 ? 'r_paybackFast' : months <= 24 ? 'r_paybackMid' : months <= 36 ? 'r_paybackSlow' : 'r_paybackTooSlow')

  // Group verification (in person)
  const verifiedCount = VERIFY_CHECKS.filter((k) => v[k]).length
  add(verifiedCount * 5, 15, verifiedCount ? 'r_verified' : 'r_unverified', { verifiedCount })

  const score = reasons.reduce((s, r) => s + r.points, 0)
  const level = score >= 70 ? 'green' : score >= 45 ? 'yellow' : 'red'
  const warnings = reasons.filter((r) => r.points === 0)
  return { score, level, reasons, warnings, months, verifiedCount }
}

export const fmt = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US')
