// Trust score: 0–100 from the owner's answers.
// Every point has a reason the women can read, so the score is never a black box.

export const DEFAULT_GROUP_SHARE = 0.4 // group's share of profit in a Mudaraba deal

export function paybackMonths(amountNeeded, monthlyProfit, groupShare = DEFAULT_GROUP_SHARE, drop = 0) {
  const monthlyToGroup = monthlyProfit * (1 - drop) * groupShare
  if (monthlyToGroup <= 0) return Infinity
  return Math.ceil(amountNeeded / monthlyToGroup)
}

export function scoreBusiness(b) {
  const reasons = [] // { points, key } — key is an i18n string id
  const add = (points, key) => reasons.push({ points, key })

  // Track record
  if (b.years === '3+') add(20, 'r_years3')
  else if (b.years === '1-3') add(10, 'r_years1')
  else add(0, 'r_yearsNew')

  // Money records — biggest trust signal
  if (b.hasRecords) add(20, 'r_records')
  else add(0, 'r_noRecords')

  // Someone vouches for the owner
  if (b.hasGuarantor) add(15, 'r_guarantor')
  else add(0, 'r_noGuarantor')

  // Competition nearby
  if (b.competition === 'low') add(10, 'r_lowComp')
  else add(0, 'r_highComp')

  // Goods that spoil
  if (!b.perishable) add(10, 'r_notPerishable')
  else add(0, 'r_perishable')

  // How fast the group gets its money back
  const months = paybackMonths(b.amountNeeded, b.monthlyProfit)
  if (months <= 12) add(25, 'r_paybackFast')
  else if (months <= 24) add(15, 'r_paybackMid')
  else if (months <= 36) add(5, 'r_paybackSlow')
  else add(0, 'r_paybackTooSlow')

  const score = reasons.reduce((s, r) => s + r.points, 0)
  const level = score >= 70 ? 'green' : score >= 45 ? 'yellow' : 'red'
  const warnings = reasons.filter((r) => r.points === 0).map((r) => r.key)
  return { score, level, reasons, warnings, months }
}
