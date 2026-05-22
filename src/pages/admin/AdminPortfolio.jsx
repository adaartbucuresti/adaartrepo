import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const DRAFT_KEY = 'admin_portfolio_draft_v1'
let portfolioDraftMemory = null

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

const STORAGE_BUCKET = 'portfolio-images'

const imageFileToJpegBlob = async (file) => {
  const maxW = 2400
  const maxH = 2400
  const quality = 0.9

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = objectUrl
    await new Promise((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Nu am putut citi imaginea.'))
    })

    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    if (!w || !h) throw new Error('Imagine invalidă.')

    const scale = Math.min(1, maxW / w, maxH / h)
    const outW = Math.max(1, Math.round(w * scale))
    const outH = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Nu am putut procesa imaginea.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
    ctx.drawImage(img, 0, 0, outW, outH)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) reject(new Error('Nu am putut procesa imaginea.'))
          else resolve(b)
        },
        'image/jpeg',
        quality,
      )
    })
    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const uploadImageToStorage = async (file) => {
  if (!supabase?.storage?.from) throw new Error('Supabase Storage nu este configurat.')
  const blob = await imageFileToJpegBlob(file)
  const id =
    typeof crypto !== 'undefined' && crypto?.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const filePath = `portfolio/${id}.jpg`
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, blob, {
    contentType: 'image/jpeg',
    upsert: false,
  })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  const publicUrl = String(data?.publicUrl || '').trim()
  if (!publicUrl) throw new Error('Nu am putut obține URL public pentru imagine.')
  return publicUrl
}

const emptyForm = {
  id: null,
  title: '',
  category: '',
  sort_order: 0,
  active: true,
}

export default function AdminPortfolio() {
  const MotionDiv = motion.div
  const initialDraft = portfolioDraftMemory || readDraftFromStorage()
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
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const [files, setFiles] = useState([])

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (fetchError) {
      setError(fetchError.message)
      setItems([])
    } else {
      setItems(Array.isArray(data) ? data : [])
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => load())
  }, [])

  useEffect(() => {
    const nextDraft = modalOpen ? { modalOpen: true, form } : { modalOpen: false }
    portfolioDraftMemory = nextDraft
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
    portfolioDraftMemory = null
    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      void e
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setFiles([])
    clearDraft()
  }

  const openNew = () => {
    setFormError('')
    setFiles([])
    setForm({ ...emptyForm })
    setModalOpen(true)
  }

  const openEdit = (it) => {
    setFormError('')
    setFiles([])
    setForm({
      id: it.id,
      title: it.title || '',
      category: it.category || '',
      sort_order: it.sort_order ?? 0,
      active: it.active !== false,
    })
    setModalOpen(true)
  }

  const onPickFiles = (e) => {
    const incoming = Array.from(e.target.files || [])
    const MAX_BYTES = 15 * 1024 * 1024
    const ok = []
    for (const f of incoming) {
      if (!f) continue
      if (f.size > MAX_BYTES) {
        setFormError('O imagine poate avea maximum 15MB.')
        continue
      }
      ok.push(f)
    }
    setFiles(ok)
    try {
      e.target.value = ''
    } catch {
    }
  }

  const openFilePicker = () => {
    fileRef.current?.click?.()
  }

  const save = async () => {
    setFormError('')
    const payload = {
      title: form.title.trim() || null,
      category: form.category.trim() || null,
      active: !!form.active,
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    }

    if (!form.id && files.length === 0) {
      setFormError('Selectează cel puțin o poză.')
      return
    }

    setSaving(true)
    setUploading(true)
    try {
      if (form.id) {
        let nextUrl = null
        if (files.length) nextUrl = await uploadImageToStorage(files[0])
        const updatePayload = nextUrl ? { ...payload, image_url: nextUrl } : payload
        const { error: updateError } = await supabase.from('portfolio_items').update(updatePayload).eq('id', form.id)
        if (updateError) throw updateError
      } else {
        const uploadedUrls = []
        for (const f of files) {
          const url = await uploadImageToStorage(f)
          uploadedUrls.push(url)
        }
        const rows = uploadedUrls.map((url) => ({ ...payload, image_url: url }))
        const { error: insertError } = await supabase.from('portfolio_items').insert(rows)
        if (insertError) throw insertError
      }

      setModalOpen(false)
      setFiles([])
      clearDraft()
      await load()
    } catch (e) {
      setFormError(e?.message || 'Nu am putut salva.')
    }
    setUploading(false)
    setSaving(false)
  }

  const openDelete = (it) => {
    setDeleteError('')
    setDeleteTarget(it)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase.from('portfolio_items').delete().eq('id', deleteTarget.id)
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
          <div className="font-heading text-2xl font-semibold text-text-dark">Portofoliu</div>
          <div className="mt-1 text-sm text-text-muted">Adaugă imagini pentru pagina Portofoliu.</div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
        >
          <ImagePlus className="h-4 w-4" />
          Adaugă imagini
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
            Nu există imagini în portofoliu.
          </div>
        ) : (
          items.map((it) => {
            const title = String(it.title || '').trim()
            const category = String(it.category || '').trim()
            const imageUrl = String(it.image_url || '').trim()
            return (
              <div key={it.id} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-text-dark">{title || category || 'Imagine'}</div>
                    <div className="mt-1 text-xs text-text-muted">
                      {category ? <span className="font-semibold text-brand-dark">{category}</span> : null}
                      {category ? <span className="mx-2 text-border">•</span> : null}
                      <span className={it.active === false ? 'text-red-600' : 'text-emerald-600'}>
                        {it.active === false ? 'Inactiv' : 'Activ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(it)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark hover:bg-cream"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDelete(it)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {imageUrl ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-cream">
                    <img src={imageUrl} alt={title || category || ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <MotionDiv className="fixed inset-0 z-[70] flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-black/40" onClick={closeModal} aria-label="Închide" />
            <MotionDiv
              className="relative flex w-full max-w-4xl max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">
                  {form.id ? 'Editează imagine' : 'Adaugă imagini'}
                </div>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border" onClick={closeModal} aria-label="Închide">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Titlu (opțional)</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Categorie (opțional)</label>
                      <input
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
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

                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold text-text-muted">Poze</div>
                        <div className="mt-1 text-xs text-text-muted">
                          {form.id ? 'Poți încărca o poză nouă ca să o înlocuiești.' : 'Poți selecta mai multe poze odată.'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Alege poze
                      </button>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple={!form.id}
                      className="hidden"
                      onChange={onPickFiles}
                    />

                    {files.length ? (
                      <div className="mt-3 grid gap-2">
                        {files.map((f) => (
                          <div key={f.name + f.size} className="rounded-xl border border-border bg-cream px-4 py-3 text-xs text-text-muted">
                            <span className="font-semibold text-text-dark">{f.name}</span>
                            <span className="ml-2">{Math.round((f.size / 1024 / 1024) * 10) / 10} MB</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {formError ? <div className="text-xs text-red-600">{formError}</div> : null}
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving || uploading}
                    className={[
                      'inline-flex w-full items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition',
                      saving || uploading ? 'bg-brand-primary/60' : 'bg-brand-primary hover:bg-brand-mid',
                    ].join(' ')}
                  >
                    {saving || uploading ? 'Se salvează…' : 'Salvează'}
                  </button>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen && deleteTarget ? (
          <MotionDiv className="fixed inset-0 z-[70] flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setDeleteOpen(false)} aria-label="Închide" />
            <MotionDiv
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="font-heading text-xl font-semibold text-text-dark">Confirmă ștergerea</div>
              <div className="mt-2 text-sm text-text-muted">
                Sigur vrei să ștergi imaginea din portofoliu?
              </div>
              {deleteError ? <div className="mt-3 text-xs text-red-600">{deleteError}</div> : null}
              <div className="mt-5 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream">
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

