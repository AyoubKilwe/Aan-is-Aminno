import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { PageHead, Sheet, Segmented } from '../components/UI.jsx'
import { parseVideoLink, ytThumb, ytEmbed } from '../lib/videos.js'

const MAX_MB = 200
const text = (v, lang) => (typeof v === 'object' && v ? v[lang] || v.en : v || '')

export function Player({ lesson, autoPlay }) {
  if (lesson.kind === 'youtube') {
    return (
      <div className="player">
        <iframe src={ytEmbed(lesson.src)} title={text(lesson.title, 'en')} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    )
  }
  return (
    <div className="player">
      <video src={lesson.src} poster={lesson.poster} controls autoPlay={autoPlay} playsInline preload="metadata" />
    </div>
  )
}

function Thumb({ lesson }) {
  const poster = lesson.kind === 'youtube' ? ytThumb(lesson.src) : lesson.poster
  return (
    <div className="lesson-thumb">
      {poster ? <img src={poster} alt="" loading="lazy" /> : <div className="lesson-thumb-blank"><Icon name="play" size={40} /></div>}
      <span className="lesson-play"><Icon name="play" size={26} /></span>
    </div>
  )
}

// Lessons come from the server, so a video one member adds is seen by everyone.
export default function Learn({ t, lang, lessons, onAddLink, onUpload, onDelete }) {
  const [playing, setPlaying] = useState(null)
  const [adding, setAdding] = useState(false)

  const remove = async (l) => {
    if (!window.confirm(t('learn_delete_confirm'))) return
    try { await onDelete(l.id); setPlaying(null) } catch { window.alert(t('save_error')) }
  }

  return (
    <main className="screen">
      <PageHead title={t('learn_title')} sub={t('learn_sub')}>
        <button className="btn btn-primary btn-auto" onClick={() => setAdding(true)}><Icon name="plus" size={20} /> {t('learn_add')}</button>
      </PageHead>

      <div className="lesson-grid">
        {lessons.map((l) => (
          <button key={l.id} className="lesson-card" onClick={() => setPlaying(l)}>
            <Thumb lesson={l} />
            <div className="lesson-info">
              <b>{text(l.title, lang)}</b>
              {text(l.desc, lang) && <span>{text(l.desc, lang)}</span>}
              <em>{l.seed ? t('learn_ours') : t('learn_added')}</em>
            </div>
          </button>
        ))}
      </div>

      {playing && (
        <Sheet title={text(playing.title, lang)} onCancel={() => setPlaying(null)} cancelLabel={t('done')}
          action={!playing.seed && <button className="nav-btn" onClick={() => remove(playing)} aria-label={t('learn_delete')}><Icon name="trash" size={20} /></button>}>
          <div style={{ marginTop: 16 }}><Player lesson={playing} autoPlay /></div>
          <h2 className="title2" style={{ margin: '16px 0 4px' }}>{text(playing.title, lang)}</h2>
          {text(playing.desc, lang) && <p className="secondary" style={{ margin: 0 }}>{text(playing.desc, lang)}</p>}
        </Sheet>
      )}

      {adding && <AddLesson t={t} onCancel={() => setAdding(false)} onAddLink={onAddLink} onUpload={onUpload} onDone={() => setAdding(false)} />}
    </main>
  )
}

function AddLesson({ t, onCancel, onAddLink, onUpload, onDone }) {
  const [mode, setMode] = useState('link')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const parsed = mode === 'link' && link.trim() ? parseVideoLink(link) : null
  const ready = title.trim() && (mode === 'link' ? Boolean(parsed) : Boolean(file))

  const pickFile = (f) => {
    setError('')
    if (!f) return
    if (!f.type.startsWith('video/')) return setError(t('learn_err_type'))
    if (f.size > MAX_MB * 1024 * 1024) return setError(t('learn_err_size', { n: MAX_MB }))
    setFile(f)
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
  }

  const save = async () => {
    if (!ready || saving) return
    setSaving(true); setError('')
    try {
      if (mode === 'link') {
        await onAddLink({ kind: parsed.kind, src: parsed.src, title: title.trim(), desc: desc.trim() })
      } else {
        const form = new FormData()
        form.append('title', title.trim())
        form.append('desc', desc.trim())
        form.append('video', file)
        await onUpload(form)
      }
      onDone()
    } catch {
      setError(t('learn_err_save'))
      setSaving(false)
    }
  }

  return (
    <Sheet title={t('learn_add')} onCancel={onCancel} cancelLabel={t('cancel')}
      action={<button className="nav-btn strong" disabled={!ready || saving} onClick={save}>{t('save')}</button>}>
      <Segmented wide label={t('learn_add')} value={mode} onChange={(m) => { setMode(m); setError('') }}
        options={[{ value: 'link', label: t('learn_mode_link') }, { value: 'file', label: t('learn_mode_file') }]} />

      <div className="group">
        {mode === 'link' ? (
          <div className="field">
            <label htmlFor="v-link">{t('learn_link')}</label>
            <input id="v-link" type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
            {link.trim() && !parsed ? <span className="error-text">{t('learn_err_link')}</span> : <span className="hint">{t('learn_link_hint')}</span>}
          </div>
        ) : (
          <div className="field">
            <span className="label">{t('learn_file')}</span>
            <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
            <button type="button" className="dropzone" onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]) }}>
              <Icon name="upload" size={28} />
              <b>{file ? file.name : t('learn_pick')}</b>
              <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : t('learn_file_hint', { n: MAX_MB })}</span>
            </button>
          </div>
        )}
        <div className="field">
          <label htmlFor="v-title">{t('learn_v_title')}</label>
          <input id="v-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="v-desc">{t('learn_v_desc')}</label>
          <textarea id="v-desc" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>

      {mode === 'link' && parsed && <div style={{ marginTop: 16 }}><Player lesson={{ ...parsed, title }} /></div>}
      {error && <p className="error-text" role="alert" style={{ margin: '12px 4px' }}>{error}</p>}

      <div className="stack">
        <button className="btn btn-primary" disabled={!ready || saving} onClick={save}>{saving ? '…' : t('save')}</button>
      </div>
    </Sheet>
  )
}
