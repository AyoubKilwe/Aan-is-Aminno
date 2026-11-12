// Browsers have no Somali locale, so Somali month names are written out here.
const SO_MONTHS = ['Janaayo', 'Febraayo', 'Maarso', 'Abriil', 'Maajo', 'Juun', 'Luuliyo', 'Ogost', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar']

export function formatDate(iso, lang, short = false) {
  const d = new Date(iso)
  if (lang === 'so') {
    const m = SO_MONTHS[d.getMonth()]
    return `${d.getDate()} ${short ? m.slice(0, 3) : m} ${d.getFullYear()}`
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: short ? 'short' : 'long', year: 'numeric' })
}
