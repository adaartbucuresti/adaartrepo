import { AnimatePresence, motion } from 'framer-motion'
import { Check, ImageUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const FALLBACK_CATEGORIES = ['Dulapuri', 'Paturi', 'Birouri', 'Biblioteci', 'Comode', 'Noptiere']
const LOCAL_CATEGORIES_KEY = 'product_categories_local_v1'
const DRAFT_KEY = 'admin_products_draft_v1'
let productsDraftMemory = null

const normalizeCategoryName = (value) => String(value || '').trim()

const uniqueCategories = (list) => {
  const out = []
  const seen = new Set()
  for (const raw of list || []) {
    const name = normalizeCategoryName(raw)
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

const readLocalCategories = () => {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return uniqueCategories(parsed)
  } catch (e) {
    void e
    return []
  }
}

const writeLocalCategories = (list) => {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(uniqueCategories(list)))
  } catch (e) {
    void e
  }
}

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
  category: FALLBACK_CATEGORIES[0],
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

  const [categoryRows, setCategoryRows] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [categoriesAvailable, setCategoriesAvailable] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState('')
  const [localCategories, setLocalCategories] = useState(() => readLocalCategories())
  const [editingCategoryId, setEditingCategoryId] = useState('')
  const [editingLocalCategory, setEditingLocalCategory] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [savingCategoryId, setSavingCategoryId] = useState('')

  const setLocalCategoriesSafe = (next) => {
    const list = uniqueCategories(next)
    setLocalCategories(list)
    writeLocalCategories(list)
  }

  const categoryOptions = useMemo(() => {
    const fromDb = (categoryRows || [])
      .map((r) => String(r.name || '').trim())
      .filter(Boolean)
    if (categoriesAvailable && fromDb.length) return fromDb
    if (localCategories.length) return localCategories
    return FALLBACK_CATEGORIES
  }, [categoryRows, categoriesAvailable, localCategories])

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

  const loadCategories = async () => {
    setCategoriesLoading(true)
    setCategoriesError('')
    const { data, error: fetchError } = await supabase
      .from('product_categories')
      .select('id,name')
      .order('name', { ascending: true })
    if (fetchError) {
      setCategoriesAvailable(false)
      setCategoryRows([])
      setCategoriesError(fetchError.message)
      setCategoriesLoading(false)
      return
    }
    let rows = Array.isArray(data) ? data : []
    if (!rows.length) {
      const seedPayload = FALLBACK_CATEGORIES.map((name) => ({ name }))
      const { error: seedError } = await supabase.from('product_categories').insert(seedPayload)
      if (!seedError) {
        const { data: seeded, error: seededError } = await supabase
          .from('product_categories')
          .select('id,name')
          .order('name', { ascending: true })
        if (!seededError) rows = Array.isArray(seeded) ? seeded : rows
      }
    }
    setCategoriesAvailable(true)
    setCategoryRows(rows)
    setCategoriesLoading(false)
  }

  useEffect(() => {
    Promise.resolve()
      .then(() => load())
      .then(() => loadCategories())
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    if (form.category && String(form.category).trim()) return
    const first = categoryOptions[0] || ''
    if (!first) return
    setForm((p) => ({ ...p, category: first }))
  }, [categoryOptions, form.category, modalOpen])

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
    setForm({ ...emptyForm, category: categoryOptions[0] || emptyForm.category })
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setFormError('')
    setForm({
      id: p.id,
      name: p.name || '',
      category: p.category || categoryOptions[0],
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

  const addCategory = async () => {
    const name = normalizeCategoryName(newCategoryName)
    if (!name) return
    setCategoriesError('')
    const exists = categoryOptions.some((c) => c.toLowerCase() === name.toLowerCase())
    if (exists) {
      setCategoriesError('Categoria există deja.')
      return
    }
    if (!categoriesAvailable) {
      setLocalCategoriesSafe([...categoryOptions, name])
      setNewCategoryName('')
      return
    }
    setAddingCategory(true)
    const { error: insertError } = await supabase.from('product_categories').insert({ name })
    if (insertError) {
      setCategoriesError(insertError.message)
      setAddingCategory(false)
      return
    }
    setNewCategoryName('')
    setAddingCategory(false)
    await loadCategories()
  }

  const deleteCategory = async (row) => {
    if (!categoriesAvailable) return
    if (!row?.id) return
    const name = String(row?.name || '').trim()
    const ok = window.confirm(`Ștergi categoria „${name || '—'}”?`)
    if (!ok) return
    setCategoriesError('')
    setDeletingCategoryId(String(row.id))
    const { error: delError } = await supabase.from('product_categories').delete().eq('id', row.id)
    if (delError) {
      setCategoriesError(delError.message)
      setDeletingCategoryId('')
      return
    }
    setDeletingCategoryId('')
    await loadCategories()
  }

  const deleteLocalCategory = (name) => {
    const ok = window.confirm(`Ștergi categoria „${name || '—'}”?`)
    if (!ok) return
    setLocalCategoriesSafe(categoryOptions.filter((c) => c.toLowerCase() !== String(name || '').toLowerCase()))
  }

  const startEditCategory = (arg) => {
    setCategoriesError('')
    if (arg && typeof arg === 'object' && arg.id) {
      setEditingCategoryId(String(arg.id))
      setEditingLocalCategory('')
      setEditCategoryName(String(arg.name || '').trim())
      return
    }
    const name = String(arg || '').trim()
    setEditingLocalCategory(name)
    setEditingCategoryId('')
    setEditCategoryName(name)
  }

  const cancelEditCategory = () => {
    setEditingCategoryId('')
    setEditingLocalCategory('')
    setEditCategoryName('')
  }

  const saveEditCategory = async (oldName, row) => {
    const nextName = normalizeCategoryName(editCategoryName)
    const previous = String(oldName || '').trim()
    if (!nextName) return
    if (nextName.toLowerCase() === previous.toLowerCase()) {
      cancelEditCategory()
      return
    }
    const exists = categoryOptions.some((c) => {
      const s = String(c || '').trim()
      if (!s) return false
      if (s.toLowerCase() === previous.toLowerCase()) return false
      return s.toLowerCase() === nextName.toLowerCase()
    })
    if (exists) {
      setCategoriesError('Categoria există deja.')
      return
    }

    if (!categoriesAvailable || !row?.id) {
      const updated = categoryOptions.map((c) =>
        String(c || '').trim().toLowerCase() === previous.toLowerCase() ? nextName : c,
      )
      setLocalCategoriesSafe(updated)
      setNewCategoryName('')
      setForm((p) => (p.category === previous ? { ...p, category: nextName } : p))
      cancelEditCategory()
      return
    }

    setSavingCategoryId(String(row.id))
    setCategoriesError('')
    const { error: updateError } = await supabase.from('product_categories').update({ name: nextName }).eq('id', row.id)
    if (updateError) {
      setCategoriesError(updateError.message)
      setSavingCategoryId('')
      return
    }

    const { error: productsUpdateError } = await supabase
      .from('products')
      .update({ category: nextName })
      .eq('category', previous)
    if (productsUpdateError) {
      setCategoriesError(`Categoria a fost redenumită, dar nu am putut actualiza produsele: ${productsUpdateError.message}`)
      setSavingCategoryId('')
      cancelEditCategory()
      await loadCategories()
      return
    }

    setForm((p) => (p.category === previous ? { ...p, category: nextName } : p))
    setSavingCategoryId('')
    cancelEditCategory()
    await loadCategories()
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

      <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-text-dark">Categorii produse</div>
            <div className="mt-0.5 text-xs text-text-muted">
              Se folosesc la filtrul din pagina „Produse” și în câmpul „Categorie” la produs.
            </div>
          </div>
          <div className="text-xs font-semibold text-text-muted">
            {categoriesLoading ? 'Se încarcă…' : categoriesAvailable ? 'Din Supabase' : 'Local (browser)'}
          </div>
        </div>

        {categoriesError ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {categoriesAvailable
              ? `Nu pot salva/șterge în Supabase: ${categoriesError}`
              : `Nu pot încărca „product_categories” din Supabase: ${categoriesError}`}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {(categoriesAvailable && (categoryRows || []).length ? categoryRows : categoryOptions).map((c) => {
            const row = c && typeof c === 'object' ? c : null
            const name = row ? String(row.name || '').trim() : String(c || '').trim()
            const key = row?.id ? String(row.id) : name
            const isEditing = row?.id
              ? String(row.id) === String(editingCategoryId)
              : editingLocalCategory && editingLocalCategory.toLowerCase() === name.toLowerCase()
            const canEdit = !addingCategory
            const canDelete = categoriesAvailable ? !!row?.id : true
            const busy = (row?.id && savingCategoryId && String(row.id) === String(savingCategoryId)) || (row?.id && deletingCategoryId && String(row.id) === String(deletingCategoryId))
            return (
              <div
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-text-dark"
              >
                {isEditing ? (
                  <>
                    <input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="h-7 w-44 rounded-full border border-border bg-white px-3 text-xs font-semibold text-text-dark outline-none ring-brand-primary/30 focus:ring-2"
                      disabled={busy}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEditCategory(name, row)}
                      disabled={busy || !String(editCategoryName || '').trim()}
                      className={[
                        'inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-text-dark transition hover:bg-cream',
                        busy || !String(editCategoryName || '').trim() ? 'opacity-60' : '',
                      ].join(' ')}
                      aria-label="Salvează"
                      title="Salvează"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditCategory}
                      disabled={busy}
                      className={['inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-text-dark transition hover:bg-cream', busy ? 'opacity-60' : ''].join(' ')}
                      aria-label="Renunță"
                      title="Renunță"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => startEditCategory(row || name)}
                      disabled={!canEdit || busy}
                      className={[
                        'inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-text-dark transition hover:bg-cream',
                        !canEdit || busy ? 'opacity-60' : '',
                      ].join(' ')}
                      aria-label={`Editează ${name}`}
                      title="Editează"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => (categoriesAvailable ? deleteCategory(row) : deleteLocalCategory(name))}
                        disabled={busy}
                        className={[
                          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-white text-red-700 transition hover:bg-red-50',
                          busy ? 'opacity-60' : '',
                        ].join(' ')}
                        aria-label={`Șterge ${name}`}
                        title="Șterge"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
            placeholder="Adaugă o categorie nouă (ex: Bucătării)"
            disabled={addingCategory}
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={addingCategory || !String(newCategoryName || '').trim()}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid',
              addingCategory || !String(newCategoryName || '').trim() ? 'opacity-60' : '',
            ].join(' ')}
          >
            <Plus className="h-4 w-4" />
            Adaugă
          </button>
        </div>

        {!categoriesAvailable ? (
          <div className="mt-3 text-xs text-text-muted">
            Ca să le salvezi permanent în Supabase, creează tabela <span className="font-semibold">product_categories</span>.
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
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
                          {categoryOptions.map((c) => (
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

