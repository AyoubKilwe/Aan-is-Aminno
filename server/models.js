import mongoose from 'mongoose'

// Every document is sent to the app with a plain `id` instead of `_id`/`__v`.
const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => { ret.id = String(ret._id); delete ret._id; return ret },
}
const opts = { timestamps: true, toJSON }

const Bilingual = { en: { type: String, default: '' }, so: { type: String, default: '' } }

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  savings: { type: Number, required: true, min: 0, max: 10_000_000 },
  members: { type: Number, required: true, min: 1, max: 1000 },
}, opts)

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  owner: { type: String, required: true, trim: true, maxlength: 80 },
  area: { type: String, required: true, trim: true, maxlength: 60 },
  category: { type: String, enum: ['food', 'retail', 'tailoring', 'services'], required: true },
  years: { type: String, enum: ['<1', '1-3', '3+'], required: true },
  monthlyProfit: { type: Number, required: true, min: 1, max: 1_000_000 },
  amountNeeded: { type: Number, required: true, min: 1, max: 10_000_000 },
  hasRecords: { type: Boolean, required: true },
  hasGuarantor: { type: Boolean, required: true },
  competition: { type: String, enum: ['low', 'high'], required: true },
  perishable: { type: Boolean, required: true },
  halal: { type: Boolean, required: true, validate: (v) => v === true },
  pitch: Bilingual,
  verified: {
    visited: { type: Boolean, default: false },
    records: { type: Boolean, default: false },
    guarantor: { type: Boolean, default: false },
  },
}, opts)

const agreementSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  businessName: String,
  owner: String,
  area: String,
  amount: { type: Number, required: true, min: 1 },
  share: { type: Number, required: true, min: 10, max: 90 },
  duration: { type: Number, required: true, min: 1, max: 120 },
  date: { type: Date, default: Date.now },
  payments: [{ amount: { type: Number, min: 1 }, date: { type: Date, default: Date.now }, _id: false }],
}, opts)

const lessonSchema = new mongoose.Schema({
  title: { type: mongoose.Schema.Types.Mixed, required: true }, // string, or { en, so } for built-in lessons
  desc: { type: mongoose.Schema.Types.Mixed, default: '' },
  kind: { type: String, enum: ['file', 'youtube', 'url'], required: true },
  src: { type: String, required: true },
  poster: String,
  seed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, opts)

export const Group = mongoose.model('Group', groupSchema)
export const Business = mongoose.model('Business', businessSchema)
export const Agreement = mongoose.model('Agreement', agreementSchema)
export const Lesson = mongoose.model('Lesson', lessonSchema)
