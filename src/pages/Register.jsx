import { useState } from 'react'
import { scoreBusiness } from '../lib/trustScore.js'
import ScoreBadge from '../components/ScoreBadge.jsx'

const EMPTY = {
  name: '', owner: '', area: '', category: '',
  years: '', monthlyProfit: '', amountNeeded: '',
  hasRecords: null, hasGuarantor: null, competition: '', perishable: null, halal: false,
}

function Choice({ options, value, onChange }) {
  return (
    <div className="choices">
      {options.map((o) => (
        <button
          type="button"
          key={String(o.value)}
          className={`choice ${value === o.value ? 'on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Register({ t, onAdd, go }) {
  const [f, setF] = useState(EMPTY)
  const [step, setStep] = useState(0)
  const [error, setError] = useState(false)
  const [result, setResult] = useState(null)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  const yesNo = [{ value: true, label: t('yes') }, { value: false, label: t('no') }]

  const steps = [
    {
      ok: () => f.name.trim() && f.owner.trim() && f.area.trim() && f.category,
      body: (
        <>
          <label>{t('reg_name')}<input value={f.name} onChange={(e) => set('name')(e.target.value)} /></label>
          <label>{t('reg_owner')}<input value={f.owner} onChange={(e) => set('owner')(e.target.value)} /></label>
          <label>{t('reg_area')}<input value={f.area} onChange={(e) => set('area')(e.target.value)} /></label>
          <p className="q">{t('reg_category')}</p>
          <Choice
            value={f.category}
            onChange={set('category')}
            options={['food', 'retail', 'tailoring', 'services'].map((c) => ({ value: c, label: t(`cat_${c}`) }))}
          />
        </>
      ),
    },
    {
      ok: () => f.years,
      body: (
        <>
          <p className="q">{t('reg_years')}</p>
          <Choice value={f.years} onChange={set('years')} options={[
            { value: '<1', label: t('y_new') }, { value: '1-3', label: t('y_mid') }, { value: '3+', label: t('y_old') },
          ]} />
        </>
      ),
    },
    {
      ok: () => Number(f.monthlyProfit) > 0 && Number(f.amountNeeded) > 0,
      body: (
        <>
          <label>{t('reg_profit')}<input type="number" inputMode="numeric" value={f.monthlyProfit} onChange={(e) => set('monthlyProfit')(e.target.value)} /></label>
          <label>{t('reg_amount')}<input type="number" inputMode="numeric" value={f.amountNeeded} onChange={(e) => set('amountNeeded')(e.target.value)} /></label>
        </>
      ),
    },
    {
      ok: () => f.hasRecords !== null && f.hasGuarantor !== null,
      body: (
        <>
          <p className="q">{t('reg_records')}</p>
          <Choice value={f.hasRecords} onChange={set('hasRecords')} options={yesNo} />
          <p className="q">{t('reg_guarantor')}</p>
          <Choice value={f.hasGuarantor} onChange={set('hasGuarantor')} options={yesNo} />
        </>
      ),
    },
    {
      ok: () => f.competition && f.perishable !== null && f.halal,
      body: (
        <>
          <p className="q">{t('reg_competition')}</p>
          <Choice value={f.competition} onChange={set('competition')} options={[
            { value: 'low', label: t('comp_low') }, { value: 'high', label: t('comp_high') },
          ]} />
          <p className="q">{t('reg_perishable')}</p>
          <Choice value={f.perishable} onChange={set('perishable')} options={yesNo} />
          <label className="toggle">
            <input type="checkbox" checked={f.halal} onChange={(e) => set('halal')(e.target.checked)} />
            <span>☪️ {t('reg_halal')}</span>
          </label>
        </>
      ),
    },
  ]

  const next = () => {
    if (!steps[step].ok()) return setError(true)
    setError(false)
    if (step < steps.length - 1) return setStep(step + 1)
    const biz = {
      ...f,
      id: `u${Date.now()}`,
      name: f.name.trim(), owner: f.owner.trim(), area: f.area.trim(),
      monthlyProfit: Number(f.monthlyProfit),
      amountNeeded: Number(f.amountNeeded),
    }
    onAdd(biz)
    setResult({ biz, s: scoreBusiness(biz) })
  }

  if (result) {
    const { biz, s } = result
    return (
      <div className="page">
        <div className="card center">
          <p className="muted">{t('reg_done')}</p>
          <ScoreBadge score={s.score} level={s.level} big />
          <h2>{biz.name}</h2>
          <p>{t('reg_listed')}</p>
        </div>
        <div className="card why">
          <ul>
            {s.reasons.map((r) => (
              <li key={r.key} className={r.points ? 'good' : 'bad'}>
                <span>{r.points ? '✅' : '⚠️'} {t(r.key)}</span>
                <b>{r.points ? `+${r.points}` : '0'}</b>
              </li>
            ))}
          </ul>
        </div>
        <div className="row">
          <button className="btn ghost" onClick={() => { setF(EMPTY); setStep(0); setResult(null) }}>{t('reg_another')}</button>
          <button className="btn primary" onClick={() => go('opps')}>{t('reg_seeList')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{t('reg_title')}</h1>
      <p className="muted">{t('reg_sub')}</p>
      <div className="progress" aria-label={`${t('reg_step')} ${step + 1} ${t('reg_of')} ${steps.length}`}>
        <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="muted small">{t('reg_step')} {step + 1} {t('reg_of')} {steps.length}</p>

      <div className="card form">{steps[step].body}</div>
      {error && <p className="error">{t('reg_required')}</p>}

      <div className="row">
        {step > 0 && <button className="btn ghost" onClick={() => { setError(false); setStep(step - 1) }}>{t('reg_back')}</button>}
        <button className="btn primary" onClick={next}>
          {step === steps.length - 1 ? `⭐ ${t('reg_submit')}` : t('reg_next')}
        </button>
      </div>
    </div>
  )
}
