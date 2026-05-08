import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const DRAFT_KEY = 'admin_testimonials_draft_v1'
let testimonialsDraftMemory = null

const readDraftFromStorage = () => {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch (e) {
    void e
    return null
  }
}

const emptyForm = {
  id: null,
  client_name: '',
  client_city: '',
  rating: 5,
  text: '',
  active: true,
  sort_order: 0,
}

export default function AdminTestimonials() {
  const MotionDiv = motion.div
  const initialDraft = testimonialsDraftMemory || readDraftFromStorage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(!!initialDraft?.modalOpen)
  const [form, setForm] = useState(() => {
    const f = initialDraft?.form
    if (!f) return { ...emptyForm }
    return { ...emptyForm, ...f }
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      setItems([])
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => load())
  }, [])

  useEffect(() => {
    const nextDraft = modalOpen ? { modalOpen: true, form } : { modalOpen: false }
    testimonialsDraftMemory = nextDraft
    try {
      if (!modalOpen) {
        sessionStorage.removeItem(DRAFT_KEY)
        return
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ modalOpen: true, form }))
    } catch (e) {
      void e
    }
  }, [form, modalOpen])

  const clearDraft = () => {
    testimonialsDraftMemory = null
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      void e
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    clearDraft()
  }

  const openNew = () => {
    setFormError('')
    setForm({ ...emptyForm })
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setFormError('')
    setForm({
      id: t.id,
      client_name: t.client_name || '',
      client_city: t.client_city || '',
      rating: t.rating ?? 5,
      text: t.text || '',
      active: t.active !== false,
      sort_order: t.sort_order ?? 0,
    })
    setModalOpen(true)
  }

  const save = async () => {
    setFormError('')
    if (!form.client_name.trim()) {
      setFormError('Numele clientului este obligatoriu.')
      return
    }
    if (!form.text.trim()) {
      setFormError('Textul testimonialului este obligatoriu.')
      return
    }
    const rating = Number(form.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setFormError('Rating invalid.')
      return
    }

    const payload = {
      client_name: form.client_name.trim(),
      client_city: form.client_city?.trim() || null,
      rating,
      text: form.text.trim(),
      active: !!form.active,
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    }

    setSaving(true)
    if (form.id) {
      const { error: updateError } = await supabase.from('testimonials').update(payload).eq('id', form.id)
      if (updateError) setFormError(updateError.message)
      else {
        setModalOpen(false)
        clearDraft()
        await load()
      }
    } else {
      const { error: insertError } = await supabase.from('testimonials').insert(payload)
      if (insertError) setFormError(insertError.message)
      else {
        setModalOpen(false)
        clearDraft()
        await load()
      }
    }
    setSaving(false)
  }

  const openDelete = (t) => {
    setDeleteError('')
    setDeleteTarget(t)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase.from('testimonials').delete().eq('id', deleteTarget.id)
    if (delError) {
      setDeleteError(delError.message)
      setDeleting(false)
      return
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
    setDeleting(false)
    await load()
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-heading text-2xl font-semibold text-text-dark">Testimoniale</div>
          <div className="mt-1 text-sm text-text-muted">Gestionează recenziile afișate pe site.</div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
        >
          <Plus className="h-4 w-4" />
          Adaugă testimonial
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-muted shadow-soft md:col-span-2">
            Se încarcă…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-red-600 shadow-soft md:col-span-2">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-muted shadow-soft md:col-span-2">
            Nu există testimoniale.
          </div>
        ) : (
          items.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                        t.active ? 'bg-brand-light text-brand-dark ring-1 ring-brand-primary/30' : 'bg-cream text-text-muted ring-1 ring-border',
                      ].join(' ')}
                    >
                      {t.active ? 'Activ' : 'Inactiv'}
                    </span>
                    <span className="text-xs text-text-muted">Sort: {t.sort_order ?? 0}</span>
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-text-dark">“{t.text}”</div>
                  <div className="mt-5 text-sm font-semibold text-brand-dark">{t.client_name}</div>
                  <div className="mt-0.5 text-xs text-text-muted">{t.client_city}</div>
                  <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={[
                          'h-4 w-4',
                          i < (t.rating ?? 5) ? 'fill-amber-400 text-amber-400' : 'text-border',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark hover:bg-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDelete(t)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0 bg-black/40" onClick={closeModal} aria-label="Închide" />
            <MotionDiv
              className="relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">
                  {form.id ? 'Editează testimonial' : 'Adaugă testimonial'}
                </div>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border" onClick={closeModal} aria-label="Închide">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Nume client</label>
                      <input
                        value={form.client_name}
                        onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Oraș</label>
                      <input
                        value={form.client_city}
                        onChange={(e) => setForm((p) => ({ ...p, client_city: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-muted">Rating</label>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const value = i + 1
                        const active = value <= (form.rating || 0)
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, rating: value }))}
                            className="p-1"
                            aria-label={`Rating ${value}`}
                          >
                            <Star className={[ 'h-5 w-5', active ? 'fill-amber-400 text-amber-400' : 'text-border' ].join(' ')} />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-muted">Text testimonial</label>
                    <textarea
                      value={form.text}
                      onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
                      rows={5}
                      className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 md:items-center">
                    <label className="flex items-center gap-2 text-sm text-text-dark">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                        className="h-4 w-4 rounded border-border text-brand-primary"
                      />
                      Activ
                    </label>
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Sort order</label>
                      <input
                        value={form.sort_order}
                        onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  {formError ? <div className="text-xs text-red-600">{formError}</div> : null}
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className={[
                      'inline-flex w-full items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition',
                      saving ? 'bg-brand-primary/60' : 'bg-brand-primary hover:bg-brand-mid',
                    ].join(' ')}
                  >
                    {saving ? 'Se salvează…' : 'Salvează'}
                  </button>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen && deleteTarget ? (
          <MotionDiv
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setDeleteOpen(false)} aria-label="Închide" />
            <MotionDiv
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="font-heading text-xl font-semibold text-text-dark">Confirmă ștergerea</div>
              <div className="mt-2 text-sm text-text-muted">
                Sigur vrei să ștergi testimonialul pentru <span className="font-semibold text-text-dark">{deleteTarget.client_name}</span>?
              </div>
              {deleteError ? <div className="mt-3 text-xs text-red-600">{deleteError}</div> : null}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream"
                >
                  Anulează
                </button>
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={deleting}
                  className={[
                    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition',
                    deleting ? 'bg-red-600/60' : 'bg-red-600 hover:bg-red-700',
                  ].join(' ')}
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Se șterge…' : 'Șterge'}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

