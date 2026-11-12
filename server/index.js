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

// The demo has one savings group. Create it on first use.
async function currentGroup() {
  return (await Group.findOne().sort({ createdAt: 1 })) || Group.create({ name: 'Hooyo Faadumo Group', savings: 5000, members: 10 })
}
async function investedBy(groupId) {
  const [r] = await Agreement.aggregate([{ $match: { group: groupId } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  return r?.total || 0
}

app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1, ai: Boolean(GEMINI_KEY) }))

// ── Group ──
app.get('/api/group', wrap(async (_req, res) => res.json(await currentGroup())))
app.put('/api/group', wrap(async (req, res) => {
  const g = await currentGroup()
  const { name, savings, members } = req.body || {}
  Object.assign(g, { name, savings, members })
  await g.save()
  res.json(g)
}))

// ── Businesses ──
app.get('/api/businesses', wrap(async (_req, res) => res.json(await Business.find().sort({ createdAt: 1 }))))
app.post('/api/businesses', wrap(async (req, res) => {
  const b = req.body || {}
  const pitch = typeof b.pitch === 'string' ? { en: b.pitch, so: b.pitch } : b.pitch
  const doc = await Business.create({
    name: b.name, owner: b.owner, area: b.area, category: b.category, years: b.years,
    monthlyProfit: b.monthlyProfit, amountNeeded: b.amountNeeded, hasRecords: b.hasRecords,
    hasGuarantor: b.hasGuarantor, competition: b.competition, perishable: b.perishable, halal: b.halal, pitch,
  })
  res.status(201).json(doc)
}))
app.patch('/api/businesses/:id/verify', wrap(async (req, res) => {
  const { key, value } = req.body || {}
  if (!isId(req.params.id) || !['visited', 'records', 'guarantor'].includes(key)) return res.status(400).json({ error: 'Bad request' })
  const doc = await Business.findByIdAndUpdate(req.params.id, { $set: { [`verified.${key}`]: Boolean(value) } }, { new: true })
  return doc ? res.json(doc) : notFound(res)
}))

// ── Agreements ──
app.get('/api/agreements', wrap(async (_req, res) => {
  const g = await currentGroup()
  res.json(await Agreement.find({ group: g._id }).sort({ createdAt: -1 }))
}))
app.post('/api/agreements', wrap(async (req, res) => {
  const { businessId, amount, share, duration } = req.body || {}
  if (!isId(businessId)) return res.status(400).json({ error: 'Bad business' })
  const [g, biz] = await Promise.all([currentGroup(), Business.findById(businessId)])
  if (!biz) return notFound(res)
  // The server checks the money too: never more than the savings minus the 20% reserve and what's already invested.
  const available = Math.round(g.savings * (1 - RESERVE_RATIO)) - (await investedBy(g._id))
  const amt = Math.round(Number(amount))
  if (!(amt > 0) || amt > available) return res.status(400).json({ error: 'Amount is more than the money available', available })
  const doc = await Agreement.create({
    group: g._id, business: biz._id, businessName: biz.name, owner: biz.owner, area: biz.area,
    amount: amt, share: Number(share), duration: Number(duration),
  })
  res.status(201).json(doc)
}))
app.post('/api/agreements/:id/payments', wrap(async (req, res) => {
  const amt = Math.round(Number(req.body?.amount))
  if (!isId(req.params.id) || !(amt > 0)) return res.status(400).json({ error: 'Bad request' })
  const doc = await Agreement.findByIdAndUpdate(req.params.id, { $push: { payments: { amount: amt, date: new Date() } } }, { new: true })
  return doc ? res.json(doc) : notFound(res)
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

app.get('/api/lessons', wrap(async (_req, res) => res.json(await Lesson.find().sort({ seed: -1, createdAt: -1 }))))
app.post('/api/lessons', wrap(async (req, res) => {
  const { title, desc, kind, src } = req.body || {}
  if (!['youtube', 'url'].includes(kind) || !src || !String(title || '').trim()) return res.status(400).json({ error: 'Bad request' })
  res.status(201).json(await Lesson.create({ title: String(title).trim(), desc: String(desc || '').trim(), kind, src }))
}))
app.post('/api/lessons/upload', upload.single('video'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Not a video' })
  const title = String(req.body?.title || '').trim() || req.file.originalname
  res.status(201).json(await Lesson.create({ title, desc: String(req.body?.desc || '').trim(), kind: 'file', src: `/uploads/${req.file.filename}` }))
}))
app.delete('/api/lessons/:id', wrap(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Bad request' })
  const doc = await Lesson.findById(req.params.id)
  if (!doc) return notFound(res)
  if (doc.seed) return res.status(403).json({ error: 'Built-in lessons cannot be deleted' })
  if (doc.kind === 'file' && doc.src.startsWith('/uploads/')) fs.rm(path.join(UPLOADS, path.basename(doc.src)), { force: true }, () => {})
  await doc.deleteOne()
  res.json({ ok: true })
}))
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }))

// ── AI advisor: the Gemini key stays on the server ──
app.post('/api/ai', wrap(async (req, res) => {
  const { question, lang = 'so', history = [] } = req.body || {}
  if (!String(question || '').trim()) return res.status(400).json({ error: 'Empty question' })
  if (!GEMINI_KEY) return res.status(503).json({ error: 'AI is not configured' })

  const g = await currentGroup()
  const [businesses, agreements] = await Promise.all([Business.find().lean(), Agreement.find({ group: g._id }).lean()])
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
app.use((err, _req, res, _next) => {
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) return res.status(400).json({ error: err.message })
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

mongoose.connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT} (MongoDB: ${MONGODB_URI.replace(/\/\/[^@/]*@/, '//***@')})`)))
  .catch((e) => { console.error('Could not connect to MongoDB:', e.message); process.exit(1) })
