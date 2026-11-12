import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { Group, Business, Agreement, Lesson } from './models.js'
import { buildContext } from '../src/lib/advisorPrompt.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.API_PORT) || 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aan-is-aamino'
const GEMINI_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const RESERVE_RATIO = 0.2
const UPLOADS = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOADS, { recursive: true })

const app = express()
app.use(express.json({ limit: '100kb' }))

// Small helpers
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
const isId = (id) => mongoose.isValidObjectId(id)
const notFound = (res) => res.status(404).json({ error: 'Not found' })

// ── In-memory copy of the data ──
// Atlas is far away (each query ~350 ms, sometimes seconds), so reads come from this copy and are instant.
// Every change is written to MongoDB first, then the copy is updated. The data is small, so this is cheap.
const db = { groups: [], businesses: [], agreements: [], lessons: [] }
const plain = (doc) => doc.toJSON()
const byCreated = (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
const sameId = (a, b) => String(a) === String(b)

async function reload() {
  const [groups, businesses, agreements, lessons] = await Promise.all([
    Group.find().sort({ createdAt: 1 }), Business.find().sort({ createdAt: 1 }),
    Agreement.find().sort({ createdAt: -1 }), Lesson.find().sort({ seed: -1, order: 1, createdAt: -1 }),
  ])
  if (groups.length === 0) groups.push(await Group.create({ name: 'Hooyo Faadumo Group', savings: 5000, members: 10 }))
  Object.assign(db, { groups: groups.map(plain), businesses: businesses.map(plain), agreements: agreements.map(plain), lessons: lessons.map(plain) })
}
const replaceIn = (list, doc) => { const i = list.findIndex((x) => x.id === doc.id); if (i >= 0) list[i] = doc; return doc }

// The demo app uses the first (oldest) group.
const currentGroup = () => db.groups[0]
const investedBy = (groupId) => db.agreements.filter((a) => sameId(a.group, groupId)).reduce((s, a) => s + a.amount, 0)
const raisedFor = (bizId) => db.agreements.filter((a) => sameId(a.business, bizId)).reduce((s, a) => s + a.amount, 0)
const withRaised = (b) => ({ ...b, raised: raisedFor(b.id) })

app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1, ai: Boolean(GEMINI_KEY) }))
// Re-read everything from MongoDB (the seed script calls this after it changes the data).
app.post('/api/reload', wrap(async (_req, res) => { await reload(); res.json({ ok: true }) }))

// ── Group ──
app.get('/api/group', (_req, res) => res.json(currentGroup()))
app.put('/api/group', wrap(async (req, res) => {
  const { name, savings, members } = req.body || {}
  const doc = await Group.findByIdAndUpdate(currentGroup().id, { name, savings, members }, { new: true, runValidators: true })
  res.json(replaceIn(db.groups, plain(doc)))
}))

// All savings groups with the money each can still invest (owners see this list).
app.get('/api/groups', (_req, res) => {
  res.json([...db.groups].sort(byCreated).map((g) => {
    const mine = db.agreements.filter((a) => sameId(a.group, g.id))
    const invested = mine.reduce((s, a) => s + a.amount, 0)
    return { ...g, invested, deals: mine.length, available: Math.max(0, Math.round(g.savings * (1 - RESERVE_RATIO)) - invested) }
  }))
})

// ── Businesses ── (each one carries how much money groups have already put in)
app.get('/api/businesses', (_req, res) => res.json(db.businesses.map(withRaised)))
app.post('/api/businesses', wrap(async (req, res) => {
  const b = req.body || {}
  const pitch = typeof b.pitch === 'string' ? { en: b.pitch, so: b.pitch } : b.pitch
  const doc = plain(await Business.create({
    name: b.name, owner: b.owner, area: b.area, category: b.category, years: b.years,
    monthlyProfit: b.monthlyProfit, amountNeeded: b.amountNeeded, hasRecords: b.hasRecords,
    hasGuarantor: b.hasGuarantor, competition: b.competition, perishable: b.perishable, halal: b.halal, pitch,
  }))
  db.businesses.push(doc)
  res.status(201).json(withRaised(doc))
}))
app.patch('/api/businesses/:id/verify', wrap(async (req, res) => {
  const { key, value } = req.body || {}
  if (!isId(req.params.id) || !['visited', 'records', 'guarantor'].includes(key)) return res.status(400).json({ error: 'Bad request' })
  const doc = await Business.findByIdAndUpdate(req.params.id, { $set: { [`verified.${key}`]: Boolean(value) } }, { new: true })
  if (!doc) return notFound(res)
  return res.json(withRaised(replaceIn(db.businesses, plain(doc))))
}))

// ── Agreements ──
app.get('/api/agreements', (_req, res) => res.json(db.agreements.filter((a) => sameId(a.group, currentGroup().id))))
app.post('/api/agreements', wrap(async (req, res) => {
  const { businessId, amount, share, duration } = req.body || {}
  const g = currentGroup()
  const biz = db.businesses.find((b) => b.id === businessId)
  if (!biz) return notFound(res)
  // The server checks the money too: never more than the savings minus the 20% reserve and what's already invested.
  const available = Math.round(g.savings * (1 - RESERVE_RATIO)) - investedBy(g.id)
  const amt = Math.round(Number(amount))
  if (!(amt > 0) || amt > available) return res.status(400).json({ error: 'Amount is more than the money available', available })
  const doc = plain(await Agreement.create({
    group: g.id, business: biz.id, businessName: biz.name, owner: biz.owner, area: biz.area,
    amount: amt, share: Number(share), duration: Number(duration),
  }))
  db.agreements.unshift(doc)
  res.status(201).json(doc)
}))
app.post('/api/agreements/:id/payments', wrap(async (req, res) => {
  const amt = Math.round(Number(req.body?.amount))
  if (!isId(req.params.id) || !(amt > 0)) return res.status(400).json({ error: 'Bad request' })
  const doc = await Agreement.findByIdAndUpdate(req.params.id, { $push: { payments: { amount: amt, date: new Date() } } }, { new: true })
  return doc ? res.json(replaceIn(db.agreements, plain(doc))) : notFound(res)
}))

// ── Lessons (videos) ──
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.mp4'}`),
  }),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('video/')),
})

app.get('/api/lessons', (_req, res) => res.json(db.lessons))
app.post('/api/lessons', wrap(async (req, res) => {
  const { title, desc, kind, src } = req.body || {}
  if (!['youtube', 'url'].includes(kind) || !src || !String(title || '').trim()) return res.status(400).json({ error: 'Bad request' })
  const doc = plain(await Lesson.create({ title: String(title).trim(), desc: String(desc || '').trim(), kind, src }))
  db.lessons.push(doc)
  res.status(201).json(doc)
}))
app.post('/api/lessons/upload', upload.single('video'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Not a video' })
  const title = String(req.body?.title || '').trim() || req.file.originalname
  const doc = plain(await Lesson.create({ title, desc: String(req.body?.desc || '').trim(), kind: 'file', src: `/uploads/${req.file.filename}` }))
  db.lessons.push(doc)
  res.status(201).json(doc)
}))
app.delete('/api/lessons/:id', wrap(async (req, res) => {
  const doc = db.lessons.find((l) => l.id === req.params.id)
  if (!doc) return notFound(res)
  if (doc.seed) return res.status(403).json({ error: 'Built-in lessons cannot be deleted' })
  await Lesson.deleteOne({ _id: doc.id })
  if (doc.kind === 'file' && doc.src.startsWith('/uploads/')) fs.rm(path.join(UPLOADS, path.basename(doc.src)), { force: true }, () => {})
  db.lessons = db.lessons.filter((l) => l.id !== doc.id)
  res.json({ ok: true })
}))
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }))

// ── AI advisor: the Gemini key stays on the server ──
app.post('/api/ai', wrap(async (req, res) => {
  const { question, lang = 'so', history = [] } = req.body || {}
  if (!String(question || '').trim()) return res.status(400).json({ error: 'Empty question' })
  if (!GEMINI_KEY) return res.status(503).json({ error: 'AI is not configured' })

  const g = currentGroup()
  const businesses = db.businesses
  const agreements = db.agreements.filter((a) => sameId(a.group, g.id))
  const invested = agreements.reduce((s, a) => s + a.amount, 0)
  const contents = [
    ...history.slice(-10).map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: String(m.text).slice(0, 4000) }] })),
    { role: 'user', parts: [{ text: String(question).slice(0, 2000) }] },
  ]
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: buildContext(g, businesses, lang, agreements, invested) }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 1200, thinkingConfig: { thinkingBudget: 0 } },
  })

  // Free-tier models are sometimes busy (503) or rate-limited (429): retry, then a lighter model.
  const models = [GEMINI_MODEL, GEMINI_MODEL, 'gemini-2.5-flash-lite']
  for (let i = 0; i < models.length; i++) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${models[i]}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY }, body,
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
      if (text) return res.json({ text, model: models[i] })
      throw new Error('empty')
    } catch (e) {
      console.warn(`Gemini attempt ${i + 1} (${models[i]}) failed: ${e.message}`)
      if (i < models.length - 1) await new Promise((r) => setTimeout(r, 1200))
    }
  }
  res.status(502).json({ error: 'AI is busy, try again' })
}))

// Serve the built app in production (npm run build && npm start).
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// Validation errors → 400 with a readable message; everything else → 500.
app.use((err, req, res, _next) => {
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError || err instanceof multer.MulterError) {
    console.warn(`400 ${req.method} ${req.path}: ${err.message}`)
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

mongoose.connect(MONGODB_URI)
  .then(reload)
  .then(() => setInterval(() => reload().catch((e) => console.warn('Reload failed:', e.message)), 5 * 60 * 1000))
  .then(() => app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT} (MongoDB: ${MONGODB_URI.replace(/\/\/[^@/]*@/, '//***@')})`)))
  .catch((e) => { console.error('Could not connect to MongoDB:', e.message); process.exit(1) })
