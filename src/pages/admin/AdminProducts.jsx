import { AnimatePresence, motion } from 'framer-motion'
import { ImageUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const categories = ['Dulapuri', 'Paturi', 'Birouri', 'Biblioteci', 'Comode', 'Noptiere']
const DRAFT_KEY = 'admin_products_draft_v1'
let productsDraftMemory = null

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
  name: '',
  category: categories[0],
  price: '',
  price_label: '',
  description: '',
  badge: '',
  images: [''],
  active: true,
  configurable: true,
  sort_order: 0,
}

export default function AdminProducts() {
  const MotionDiv = motion.div
  const initialDraft = productsDraftMemory || readDraftFromStorage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(!!initialDraft?.modalOpen)
  const [form, setForm] = useState(() => {
    const f = initialDraft?.form
    if (!f) return { ...emptyForm }
    return { ...emptyForm, ...f, images: Array.isArray(f.images) ? f.images : emptyForm.images }
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const imageFilesRef = useRef(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    const { data, error: fetchError } = await supabase
      .from('products')
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
    productsDraftMemory = nextDraft
    try {
      if (!modalOpen) {
        sessionStorage.removeItem(DRAFT_KEY)
        return
      }
      const safeForm = {
        ...form,
        images: Array.isArray(form.images)
          ? form.images.filter((x) => typeof x === 'string' && x.length <= 5000)
          : form.images,
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ modalOpen: true, form: safeForm }))
    } catch (e) {
      void e
    }
  }, [form, modalOpen])

  const clearDraft = () => {
    productsDraftMemory = null
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

  const openEdit = (p) => {
    setFormError('')
    setForm({
      id: p.id,
      name: p.name || '',
      category: p.category || categories[0],
      price: p.price ?? '',
      price_label: p.price_label || '',
      description: p.description || '',
      badge: p.badge || '',
      images: Array.isArray(p.images) && p.images.length ? p.images : [''],
      active: p.active !== false,
      configurable: p.configurable !== false,
      sort_order: p.sort_order ?? 0,
    })
    setModalOpen(true)
  }

  const save = async () => {
    setFormError('')
    if (!form.name.trim()) {
      setFormError('Numele produsului este obligatoriu.')
      return
    }
    const priceNumber = Number(form.price)
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setFormError('Prețul trebuie să fie un număr mai mare ca 0.')
      return
    }

    const images = (form.images || []).map((x) => x.trim()).filter(Boolean)
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Math.round(priceNumber),
      price_label: form.price_label?.trim() || null,
      description: form.description?.trim() || null,
      badge: form.badge?.trim() || null,
      images,
      active: !!form.active,
      configurable: !!form.configurable,
      sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0,
    }

    setSaving(true)
    if (form.id) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', form.id)
      if (updateError) setFormError(updateError.message)
      else {
        setModalOpen(false)
        clearDraft()
        await load()
      }
    } else {
      const { error: insertError } = await supabase.from('products').insert(payload)
      if (insertError) setFormError(insertError.message)
      else {
        setModalOpen(false)
        clearDraft()
        await load()
      }
    }
    setSaving(false)
  }

  const openDelete = (p) => {
    setDeleteError('')
    setDeleteTarget(p)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase.from('products').delete().eq('id', deleteTarget.id)
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

  const primaryImage = useMemo(() => {
    const url = (form.images || []).find((x) => x && x.trim())
    return url ? url.trim() : ''
  }, [form.images])

  const onPickImages = () => {
    imageFilesRef.current?.click()
  }

  const onImagesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setFormError('')
    setUploadingImages(true)

    const uploadedUrls = []
    for (const file of files) {
      if (!file.type || !file.type.startsWith('image/')) {
        setFormError('Unul dintre fișiere nu este o imagine.')
        break
      }
      if (file.size > 6 * 1024 * 1024) {
        setFormError('Una dintre imagini este prea mare (max 6MB).')
        break
      }
      try {
        const dataUrl = await imageFileToDataUrl(file)
        uploadedUrls.push(dataUrl)
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Nu am putut procesa imaginea.')
        break
      }
    }

    if (uploadedUrls.length) {
      setForm((p) => {
        const existing = Array.isArray(p.images) ? p.images.map((x) => x || '') : ['']
        const cleanedExisting = existing.filter((x) => x && x.trim())
        return { ...p, images: [...cleanedExisting, ...uploadedUrls] }
      })
    }

    if (imageFilesRef.current) imageFilesRef.current.value = ''
    setUploadingImages(false)
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-heading text-2xl font-semibold text-text-dark">Produse</div>
          <div className="mt-1 text-sm text-text-muted">Gestionează produsele publice.</div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
        >
          <Plus className="h-4 w-4" />
          Adaugă produs nou
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-cream text-xs font-semibold text-text-muted">
              <tr>
                <th className="px-4 py-3">Produs</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Preț</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">
                    Se încarcă…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">
                    Nu există produse.
                  </td>
                </tr>
              ) : (
                items.map((p) => {
                  const img = Array.isArray(p.images) ? p.images[0] : null
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-warm/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 overflow-hidden rounded-xl border border-border bg-cream">
                            {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-text-dark">{p.name}</div>
                            <div className="truncate text-xs text-text-muted">{p.badge || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted">{p.category}</td>
                      <td className="px-4 py-3 font-semibold text-text-dark">{p.price} RON</td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            p.active ? 'bg-brand-light text-brand-dark ring-1 ring-brand-primary/30' : 'bg-cream text-text-muted ring-1 ring-border',
                          ].join(' ')}
                        >
                          {p.active ? 'Activ' : 'Inactiv'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(p)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark transition hover:bg-cream"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(p)}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative flex w-full max-w-5xl max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">
                  {form.id ? 'Editează produs' : 'Adaugă produs'}
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                  onClick={closeModal}
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-6 px-6 py-6 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <div className="grid gap-4">
                    <div>
                      <label className="text-xs font-semibold text-text-muted">Nume produs</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Categorie</label>
                        <select
                          value={form.category}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Preț de la (RON)</label>
                        <input
                          value={form.price}
                          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Price label</label>
                        <input
                          value={form.price_label}
                          onChange={(e) => setForm((p) => ({ ...p, price_label: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          placeholder="ex: de la 2.800 RON"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Badge (opțional)</label>
                        <input
                          value={form.badge}
                          onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          placeholder="Bestseller / Nou / Popular"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-muted">Descriere</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-text-muted">URL imagini</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onPickImages}
                            disabled={uploadingImages}
                            className={[
                              'inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark transition hover:bg-cream',
                              uploadingImages ? 'opacity-60' : '',
                            ].join(' ')}
                          >
                            <ImageUp className="h-4 w-4 text-text-muted" />
                            {uploadingImages ? 'Se încarcă…' : 'Adaugă poze de pe desktop'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, images: [...(p.images || []), ''] }))}
                            className="text-xs font-semibold text-brand-dark underline underline-offset-4"
                          >
                            Adaugă URL imagine
                          </button>
                        </div>
                      </div>
                      <input
                        ref={imageFilesRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onImagesChange}
                      />
                      <div className="mt-2 grid gap-2">
                        {(form.images || []).map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={url}
                              onChange={(e) =>
                                setForm((p) => {
                                  const next = [...(p.images || [])]
                                  next[idx] = e.target.value
                                  return { ...p, images: next }
                                })
                              }
                              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                              placeholder="https://..."
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm((p) => {
                                  const next = [...(p.images || [])]
                                  next.splice(idx, 1)
                                  return { ...p, images: next.length ? next : [''] }
                                })
                              }
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted hover:bg-cream"
                              aria-label="Șterge URL"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="flex items-center gap-2 text-sm text-text-dark">
                        <input
                          type="checkbox"
                          checked={form.active}
                          onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                          className="h-4 w-4 rounded border-border text-brand-primary"
                        />
                        Activ
                      </label>
                      <label className="flex items-center gap-2 text-sm text-text-dark">
                        <input
                          type="checkbox"
                          checked={form.configurable}
                          onChange={(e) => setForm((p) => ({ ...p, configurable: e.target.checked }))}
                          className="h-4 w-4 rounded border-border text-brand-primary"
                        />
                        Configurabil
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

                  <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-border bg-cream p-4">
                      <div className="text-xs font-semibold text-text-muted">Preview</div>
                      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white">
                        <div className="aspect-[4/3] bg-cream">
                          {primaryImage ? (
                            <img src={primaryImage} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <div className="text-xs text-text-muted">{form.category}</div>
                          <div className="mt-1 font-heading text-lg font-semibold text-text-dark">
                            {form.name || 'Nume produs'}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-brand-dark">
                            {form.price_label || (form.price ? `de la ${form.price} RON` : 'de la — RON')}
                          </div>
                          {form.badge ? (
                            <div className="mt-3 inline-flex rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                              {form.badge}
                            </div>
                          ) : null}
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
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setDeleteOpen(false)}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="font-heading text-xl font-semibold text-text-dark">Confirmă ștergerea</div>
              <div className="mt-2 text-sm text-text-muted">
                Sigur vrei să ștergi produsul <span className="font-semibold text-text-dark">{deleteTarget.name}</span>?
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

