import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, ImageUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const imageFileToDataUrl = async (file) => {
  const maxW = 1800
  const maxH = 1800
  const quality = 0.86

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
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

const emptyForm = {
  id: null,
  title: '',
  subtitle: '',
  cta_text: 'Configurează acum',
  cta_link: '/configurator',
  image_url: '',
  accent_badge: '',
  active: true,
  sort_order: 0,
}

export default function AdminCarousel() {
  const MotionDiv = motion.div
  const fileRef = useRef(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [localFileName, setLocalFileName] = useState('')
  const [localPreviewUrl, setLocalPreviewUrl] = useState('')
  const [processingImage, setProcessingImage] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('carousel_slides')
      .select('*')
      .order('sort_order', { ascending: true })
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

  const openNew = () => {
    setFormError('')
    setLocalPreviewUrl('')
    setLocalFileName('')
    setForm({ ...emptyForm, sort_order: items.length ? Math.max(...items.map((x) => x.sort_order || 0)) + 1 : 0 })
    setModalOpen(true)
  }

  const openEdit = (s) => {
    setFormError('')
    setLocalPreviewUrl('')
    setLocalFileName('')
    setForm({
      id: s.id,
      title: s.title || '',
      subtitle: s.subtitle || '',
      cta_text: s.cta_text || 'Configurează acum',
      cta_link: s.cta_link || '/configurator',
      image_url: s.image_url || '',
      accent_badge: s.accent_badge || '',
      active: s.active !== false,
      sort_order: s.sort_order ?? 0,
    })
    setModalOpen(true)
  }

  const onPickFile = () => {
    fileRef.current?.click()
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) {
      setFormError('Fișierul selectat nu este o imagine.')
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      setFormError('Imaginea este prea mare (max 6MB).')
      return
    }

    setFormError('')
    setProcessingImage(true)
    try {
      const dataUrl = await imageFileToDataUrl(file)
      setForm((p) => ({ ...p, image_url: dataUrl }))
      setLocalPreviewUrl(dataUrl)
      setLocalFileName(file.name)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nu am putut procesa imaginea.')
    } finally {
      setProcessingImage(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const clearFile = () => {
    setLocalPreviewUrl('')
    setLocalFileName('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const save = async () => {
    setFormError('')
    if (!form.title.trim()) {
      setFormError('Titlul este obligatoriu.')
      return
    }
    if (!form.image_url.trim()) {
      setFormError('Adaugă o imagine (URL sau fișier).')
      return
    }

    const imageUrl = form.image_url.trim()

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle?.trim() || null,
      cta_text: form.cta_text?.trim() || 'Configurează acum',
      cta_link: form.cta_link?.trim() || '/configurator',
      image_url: imageUrl,
      accent_badge: form.accent_badge?.trim() || null,
      active: !!form.active,
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    }

    setSaving(true)
    if (form.id) {
      const { error: updateError } = await supabase.from('carousel_slides').update(payload).eq('id', form.id)
      if (updateError) setFormError(updateError.message)
      else {
        setModalOpen(false)
        clearFile()
        await load()
      }
    } else {
      const { error: insertError } = await supabase.from('carousel_slides').insert(payload)
      if (insertError) setFormError(insertError.message)
      else {
        setModalOpen(false)
        clearFile()
        await load()
      }
    }
    setSaving(false)
  }

  const openDelete = (s) => {
    setDeleteError('')
    setDeleteTarget(s)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase.from('carousel_slides').delete().eq('id', deleteTarget.id)
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

  const move = async (id, dir) => {
    const idx = items.findIndex((x) => x.id === id)
    if (idx < 0) return
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= items.length) return
    const a = items[idx]
    const b = items[swapIdx]
    const aOrder = a.sort_order ?? 0
    const bOrder = b.sort_order ?? 0
    const { error: err1 } = await supabase.from('carousel_slides').update({ sort_order: bOrder }).eq('id', a.id)
    if (err1) return
    const { error: err2 } = await supabase.from('carousel_slides').update({ sort_order: aOrder }).eq('id', b.id)
    if (err2) return
    await load()
  }

  const previewTitleLines = useMemo(() => (form.title ? form.title.split('\n') : []), [form.title])
  const previewImage = localPreviewUrl || form.image_url

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-heading text-2xl font-semibold text-text-dark">Carousel</div>
          <div className="mt-1 text-sm text-text-muted">Gestionează slide-urile din homepage.</div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
        >
          <Plus className="h-4 w-4" />
          Adaugă slide
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-muted shadow-soft">
            Se încarcă…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-red-600 shadow-soft">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-text-muted shadow-soft">
            Nu există slide-uri.
          </div>
        ) : (
          items.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
              <div className="grid gap-4 p-4 md:grid-cols-3 md:items-center">
                <div className="md:col-span-1">
                  <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream">
                    <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            s.active ? 'bg-brand-light text-brand-dark ring-1 ring-brand-primary/30' : 'bg-cream text-text-muted ring-1 ring-border',
                          ].join(' ')}
                        >
                          {s.active ? 'Activ' : 'Inactiv'}
                        </span>
                        <span className="text-xs text-text-muted">Sort: {s.sort_order ?? 0}</span>
                      </div>
                      <div className="mt-2 truncate font-heading text-xl font-semibold text-text-dark">
                        {s.title}
                      </div>
                      <div className="mt-1 line-clamp-2 text-sm text-text-muted">{s.subtitle}</div>
                      {s.accent_badge ? (
                        <div className="mt-3 inline-flex rounded-full bg-brand-primary/90 px-3 py-1 text-xs font-semibold text-white">
                          {s.accent_badge}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => move(s.id, -1)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark hover:bg-cream"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                        Sus
                      </button>
                      <button
                        type="button"
                        onClick={() => move(s.id, 1)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark hover:bg-cream"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                        Jos
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark hover:bg-cream"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(s)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
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
            <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} aria-label="Închide" />
            <MotionDiv
              className="relative flex w-full max-w-5xl max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">
                  {form.id ? 'Editează slide' : 'Adaugă slide'}
                </div>
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border" onClick={() => setModalOpen(false)} aria-label="Închide">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-6 px-6 py-6 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <div className="grid gap-4">
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Titlu</label>
                      <textarea
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        rows={2}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        placeholder={'Linia 1\nLinia 2'}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Subtitlu</label>
                      <textarea
                        value={form.subtitle}
                        onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Text buton CTA</label>
                        <input
                          value={form.cta_text}
                          onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Link CTA</label>
                        <input
                          value={form.cta_link}
                          onChange={(e) => setForm((p) => ({ ...p, cta_link: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-muted">URL imagine</label>
                      <input
                        value={form.image_url}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, image_url: e.target.value }))
                          if (localPreviewUrl || localFileName) clearFile()
                        }}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        placeholder="https://..."
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onFileChange}
                        />
                        <button
                          type="button"
                          onClick={onPickFile}
                          disabled={processingImage}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark transition hover:bg-cream"
                        >
                          <ImageUp className="h-4 w-4 text-text-muted" />
                          {processingImage ? 'Se procesează…' : 'Adaugă poză de pe desktop'}
                        </button>
                        {localFileName ? (
                          <>
                            <span className="text-xs text-text-muted">{localFileName}</span>
                            <button
                              type="button"
                              onClick={clearFile}
                              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-cream"
                            >
                              Elimină
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-text-muted">Text badge accent (opțional)</label>
                        <input
                          value={form.accent_badge}
                          onChange={(e) => setForm((p) => ({ ...p, accent_badge: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
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
                    <label className="flex items-center gap-2 text-sm text-text-dark">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                        className="h-4 w-4 rounded border-border text-brand-primary"
                      />
                      Activ
                    </label>
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

                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-cream p-4">
                      <div className="text-xs font-semibold text-text-muted">Preview</div>
                      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
                        <div className="aspect-[4/3] bg-cream">
                          {previewImage ? <img src={previewImage} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="p-4">
                          {form.accent_badge ? (
                            <div className="inline-flex rounded-full bg-brand-primary/90 px-3 py-1 text-xs font-semibold text-white">
                              {form.accent_badge}
                            </div>
                          ) : null}
                          <div className="mt-3 font-heading text-xl font-semibold text-text-dark">
                            {previewTitleLines.length ? previewTitleLines.join(' / ') : 'Titlu'}
                          </div>
                          <div className="mt-2 text-sm text-text-muted">{form.subtitle || 'Subtitlu'}</div>
                          <div className="mt-4 inline-flex rounded-full bg-brand-primary px-5 py-2 text-xs font-semibold text-white">
                            {form.cta_text || 'CTA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                Sigur vrei să ștergi slide-ul <span className="font-semibold text-text-dark">{deleteTarget.title}</span>?
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

