// Lessons: two built-in videos plus any the group adds (YouTube link, video link, or an uploaded file).
// Uploaded files are kept in the browser's IndexedDB so they survive a refresh on that device.

export const SEED_LESSONS = [
  {
    id: 'l1', seed: true, kind: 'file', src: '/videos/buugga-lacagta.mp4', poster: '/videos/buugga-lacagta.jpg',
    title: { en: 'The money record book', so: 'Buugga lacagta' },
    desc: { en: 'Write down sales and costs every day, and work out your profit.', so: 'Qor iibka iyo kharashka maalin kasta, oo xisaabi faa’iidada.' },
    mins: 1,
  },
  {
    id: 'l2', seed: true, kind: 'file', src: '/videos/mudaaraba.mp4', poster: '/videos/mudaaraba.jpg',
    title: { en: 'What is Mudaraba?', so: 'Waa maxay Mudaaraba?' },
    desc: { en: 'How a halal profit-sharing investment works, with an example.', so: 'Sida maalgelinta xalaasha ah ee faa’iidada la qaybsado u shaqayso, iyo tusaale.' },
    mins: 1,
  },
]

export function youtubeId(url) {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null
    if (host.endsWith('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v')
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{6,})/)
      if (m) return m[2]
    }
  } catch { /* not a URL */ }
  return null
}

export function parseVideoLink(url) {
  const id = youtubeId(url)
  if (id && /^[\w-]{6,20}$/.test(id)) return { kind: 'youtube', src: id }
  try {
    const u = new URL(url.trim())
    if (/^https?:$/.test(u.protocol) && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(u.pathname + u.search)) return { kind: 'url', src: u.href }
  } catch { /* ignore */ }
  return null
}

export const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
export const ytEmbed = (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`

// ── IndexedDB for uploaded files ──
const DB = 'aia_videos', STORE = 'files'
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function tx(mode, fn) {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction(STORE, mode)
    const r = fn(t.objectStore(STORE))
    t.oncomplete = () => resolve(r?.result)
    t.onerror = () => reject(t.error)
  })
}
export const saveFile = (id, blob) => tx('readwrite', (s) => s.put(blob, id))
export const loadFile = (id) => tx('readonly', (s) => s.get(id))
export const deleteFile = (id) => tx('readwrite', (s) => s.delete(id))
