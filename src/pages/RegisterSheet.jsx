import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { TrustRing } from '../components/Rings.jsx'
import { Sheet } from '../components/UI.jsx'
import { scoreBusiness } from '../lib/trustScore.js'

const EMPTY = {
  name: '', owner: '', area: '', category: '', pitch: '',
  years: '', monthlyProfit: '', amountNeeded: '',
  hasRecords: null, hasGuarantor: null, competition: '', perishable: null, halal: false,
}

function Choice({ options, value, onChange, label }) {
  return (
    <div className="choices" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button type="button" role="radio" aria-checked={value === o.value} key={String(o.value)}
          className={`choice ${value === o.value ? 'on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function RegisterSheet({ t, onCancel, onAdd, onView }) {
  const [f, setF] = useState(EMPTY)
  const [step, setStep] = useState(0)
  const [showError, setShowError] = useState(false)
  const [result, setResult] = useState(null)
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }))
  const yesNo = [{ value: true, label: t('yes') }, { value: false, label: t('no') }]

  const steps = [
    {
      ok: () => f.name.trim() && f.owner.trim() && f.area.trim() && f.category,
      body: (
        <div className="group">
          <div className="field"><label htmlFor="r-name">{t('reg_name')}</label><input id="r-name" value={f.name} onChange={(e) => set('name')(e.target.value)} autoComplete="organization" /></div>
          <div className="field"><label htmlFor="r-owner">{t('reg_owner')}</label><input id="r-owner" value={f.owner} onChange={(e) => set('owner')(e.target.value)} autoComplete="name" /></div>
          <div className="field"><label htmlFor="r-area">{t('reg_area')}</label><input id="r-area" value={f.area} onChange={(e) => set('area')(e.target.value)} /></div>
          <div className="field">
            <span className="label">{t('reg_category')}</span>
            <Choice label={t('reg_category')} value={f.category} onChange={set('category')}
              options={['food', 'retail', 'tailoring', 'services'].map((c) => ({ value: c, label: t(`cat_${c}`) }))} />
          </div>
        </div>
      ),
    },
    {
      ok: () => f.years && Number(f.monthlyProfit) > 0 && Number(f.amountNeeded) > 0,
      body: (
        <div className="group">
          <div className="field">
            <span className="label">{t('reg_years')}</span>
            <Choice label={t('reg_years')} value={f.years} onChange={set('years')} options={[
              { value: '<1', label: t('y_new') }, { value: '1-3', label: t('y_mid') }, { value: '3+', label: t('y_old') },
            ]} />
          </div>
          <div className="field">
            <label htmlFor="r-profit">{t('reg_profit')}</label>
            <input id="r-profit" type="number" inputMode="numeric" min="0" value={f.monthlyProfit} onChange={(e) => set('monthlyProfit')(e.target.value)} />
            <span className="hint">{t('reg_profit_hint')}</span>
          </div>
          <div className="field">
            <label htmlFor="r-amount">{t('reg_amount')}</label>
            <input id="r-amount" type="number" inputMode="numeric" min="0" value={f.amountNeeded} onChange={(e) => set('amountNeeded')(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="r-pitch">{t('reg_pitch')}</label>
            <textarea id="r-pitch" value={f.pitch} placeholder={t('reg_pitch_ph')} onChange={(e) => set('pitch')(e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      ok: () => f.hasRecords !== null && f.hasGuarantor !== null && f.competition && f.perishable !== null && f.halal,
      body: (
        <div className="group">
          <div className="field"><span className="label">{t('reg_records')}</span><Choice label={t('reg_records')} value={f.hasRecords} onChange={set('hasRecords')} options={yesNo} /></div>
          <div className="field"><span className="label">{t('reg_guarantor')}</span><Choice label={t('reg_guarantor')} value={f.hasGuarantor} onChange={set('hasGuarantor')} options={yesNo} /></div>
          <div className="field"><span className="label">{t('reg_competition')}</span><Choice label={t('reg_competition')} value={f.competition} onChange={set('competition')} options={[
            { value: 'low', label: t('comp_low') }, { value: 'high', label: t('comp_high') },
          ]} /></div>
          <div className="field"><span className="label">{t('reg_perishable')}</span><Choice label={t('reg_perishable')} value={f.perishable} onChange={set('perishable')} options={yesNo} /></div>
          <label className="toggle-row">
            <input type="checkbox" checked={f.halal} onChange={(e) => set('halal')(e.target.checked)} style={{ width: 22, height: 22, accentColor: 'var(--accent)', flex: 'none' }} />
            <span className="subhead">{t('reg_halal')}</span>
          </label>
        </div>
      ),
    },
  ]

  const next = () => {
    if (!steps[step].ok()) return setShowError(true)
    setShowError(false)
    if (step < steps.length - 1) return setStep(step + 1)
    const biz = {
      ...f,
      id: `u${Date.now()}`,
      name: f.name.trim(), owner: f.owner.trim(), area: f.area.trim(), pitch: f.pitch.trim(),
      monthlyProfit: Math.round(Number(f.monthlyProfit)),
      amountNeeded: Math.round(Number(f.amountNeeded)),
      verified: { visited: false, records: false, guarantor: false },
    }
    onAdd(biz)
    setResult({ biz, s: scoreBusiness(biz) })
  }

  if (result) {
    const { biz, s } = result
    return (
      <Sheet title={t('reg_done_title')} onCancel={onCancel} cancelLabel={t('done')}>
        <div className="result">
          <TrustRing score={s.score} level={s.level} size={120} stroke={10} label={t('trust_of', { n: s.score })} />
          <h2 className="title2">{biz.name}</h2>
          <p className="secondary">{t('reg_done', { name: biz.name })}</p>
        </div>
        <div className="group">
          {s.reasons.map((r) => (
            <div key={r.key} className={`row plain reason ${r.points ? 'ok' : 'no'}`}>
              <Icon name={r.points ? 'check' : 'warn'} size={20} />
              <span className="row-body subhead">{t(r.key)}</span>
              <span className="pts">{r.points}/{r.max}</span>
            </div>
          ))}
        </div>
        <p className="group-foot">{t('reg_done_tip')}</p>
        <div className="stack">
          <button className="btn btn-primary" onClick={() => onView(biz.id)}>{t('reg_view')}</button>
        </div>
      </Sheet>
    )
  }

  const last = step === steps.length - 1
  return (
    <Sheet title={t('reg_title')} onCancel={onCancel} cancelLabel={t('cancel')}>
      <p className="subhead secondary" style={{ margin: '12px 4px 4px' }}>{t('reg_intro')}</p>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
        <div style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>
      <p className="footnote" style={{ margin: '0 4px 12px' }}>{t('reg_step', { a: step + 1, b: steps.length })}</p>

      {steps[step].body}
      {showError && <p className="error-text" role="alert" style={{ margin: '10px 4px' }}>{t('reg_required')}</p>}

      <div className={step > 0 ? 'btn-row' : 'stack'}>
        {step > 0 && <button className="btn btn-tinted" onClick={() => { setShowError(false); setStep(step - 1) }}>{t('back')}</button>}
        <button className="btn btn-primary" onClick={next}>{last ? t('reg_submit') : t('reg_next')}</button>
      </div>
    </Sheet>
  )
}
