import { AnimatePresence, motion } from 'framer-motion'
import {
  Bath,
  BedDouble,
  BookOpen,
  Briefcase,
  DoorClosed,
  Home,
  Check,
  Layers,
  Paperclip,
  Plus,
  Square,
  Tv,
  Utensils,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ConfiguratorSummary from '../components/ConfiguratorSummary.jsx'
import { products } from '../data/products.js'
import { getColorOption, getColorsForMaterial, isColorValidForMaterial } from '../lib/colors.js'
import { EXTRAS_OPTIONS, getExtraById, getExtrasTotal } from '../lib/extras.js'
import { 
  DEFAULT_MATERIAL_KEY, 
  MATERIAL_PRICING, 
  calcEstimatedPriceRon, 
  calcLinearMeters, 
  getMaterialPricing,
  isLeadGenCategory,
  getLeadGenData
} from '../lib/pricing.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const DRAFT_STORAGE_KEY = 'configuratorDraft_v1'
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const productTypeOptions = [
  { key: 'Bucătărie la comandă', icon: Utensils },
  { key: 'Dressing / Dulap', icon: DoorClosed },
  { key: 'Mobilă TV / Perete TV', icon: Tv },
  { key: 'Dormitor (pat, noptiere, comode)', icon: BedDouble },
  { key: 'Hol (pantofar, cuier, oglindă, dulap)', icon: Home },
  { key: 'Baie (mască chiuvetă, dulapuri)', icon: Bath },
  { key: 'Birou / Home office', icon: Briefcase },
  { key: 'Bibliotecă / Rafturi', icon: BookOpen },
  { key: 'Alt produs', icon: Plus },
]

const LOCAL_CATEGORIES_KEY = 'product_categories_local_v1'

const readLocalCategories = () => {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out = []
    const seen = new Set()
    for (const v of parsed) {
      const name = String(v || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(name)
    }
    return out
  } catch (e) {
    void e
    return []
  }
}

const categoryToTypeOverrides = {
  Dulapuri: 'Dressing / Dulap',
  Paturi: 'Dormitor (pat, noptiere, comode)',
  Birouri: 'Birou / Home office',
  Biblioteci: 'Bibliotecă / Rafturi',
  Comode: 'Dormitor (pat, noptiere, comode)',
  Noptiere: 'Dormitor (pat, noptiere, comode)',
  Bucatarii: 'Bucătărie la comandă',
  Bucătării: 'Bucătărie la comandă',
  'Mobilier Baie': 'Baie (mască chiuvetă, dulapuri)',
  Baie: 'Baie (mască chiuvetă, dulapuri)',
  'Panouri TV': 'Mobilă TV / Perete TV',
  'Panouri TV / Comode TV': 'Mobilă TV / Perete TV',
  'Comode TV': 'Mobilă TV / Perete TV',
}

const dimensionRanges = {
  'Bucătărie la comandă': { w: [100, 800], h: [80, 300], d: [30, 100] },
  'Dressing / Dulap': { w: [50, 500], h: [100, 300], d: [30, 100] },
  'Mobilă TV / Perete TV': { w: [60, 500], h: [30, 300], d: [20, 80] },
  'Dormitor (pat, noptiere, comode)': { w: [30, 300], h: [30, 250], d: [25, 250] },
  'Hol (pantofar, cuier, oglindă, dulap)': { w: [30, 400], h: [40, 300], d: [15, 100] },
  'Baie (mască chiuvetă, dulapuri)': { w: [30, 300], h: [30, 300], d: [15, 100] },
  'Birou / Home office': { w: [50, 400], h: [50, 150], d: [30, 120] },
  'Bibliotecă / Rafturi': { w: [30, 500], h: [40, 350], d: [15, 80] },
  'Alt produs': { w: [20, 800], h: [20, 400], d: [10, 200] },
}

const materialOptions = MATERIAL_PRICING

const steps = [
  { id: 1, title: 'Tip produs' },
  { id: 2, title: 'Dimensiuni' },
  { id: 3, title: 'Material' },
  { id: 4, title: 'Culoare / Finisaj' },
  { id: 5, title: 'Opțiuni extra' },
  { id: 6, title: 'Date contact' },
]

const confirmationText = 'Cererea ta a fost înregistrată! Te contactăm în 24 de ore.'

const formatBytes = (value) => {
  const bytes = Number(value || 0)
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const n = bytes / 1024 ** i
  const digits = i === 0 ? 0 : n < 10 ? 1 : 0
  return `${n.toFixed(digits)} ${units[i]}`
}

function clampNumber(value, min, max) {
  const n = Number.isFinite(value) ? value : 0
  return Math.min(max, Math.max(min, n))
}

function normalizeDimensionDraft(value, min, max) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return ''
  return String(clampNumber(parsed, min, max))
}

function getValidDimension(value, min, max) {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return null
  if (parsed < min || parsed > max) return null
  return parsed
}

function mid(min, max) {
  return Math.round((min + max) / 2)
}

function isAllowedEmail(value) {
  const v = String(value || '').trim().toLowerCase()
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  if (!ok) return false
  const domain = v.split('@')[1] || ''
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function mapCategoryToConfiguratorType(category) {
  const raw = String(category || '').trim()
  if (!raw) return null
  const direct = categoryToTypeOverrides[raw]
  if (direct) return direct
  const key = normalizeKey(raw)
  if (key.includes('bucatar')) return 'Bucătărie la comandă'
  if (key.includes('baie')) return 'Baie (mască chiuvetă, dulapuri)'
  if (key.includes('tv') || key.includes('panou')) return 'Mobilă TV / Perete TV'
  if (key.includes('dressing') || key.includes('dulap')) return 'Dressing / Dulap'
  if (key.includes('pat') || key.includes('noptier') || key.includes('comod') || key.includes('dormitor'))
    return 'Dormitor (pat, noptiere, comode)'
  if (key.includes('hol') || key.includes('pantofar')) return 'Hol (pantofar, cuier, oglindă, dulap)'
  if (key.includes('birou')) return 'Birou / Home office'
  if (key.includes('bibliotec') || key.includes('raft')) return 'Bibliotecă / Rafturi'
  return 'Alt produs'
}

function iconForConfiguratorType(type) {
  const found = productTypeOptions.find((x) => x.key === type)
  return found?.icon || Square
}

export default function ConfiguratorPage() {
  const MotionDiv = motion.div
  const [params] = useSearchParams()
  const preselectedName = params.get('produs') || ''
  const preselectedId = params.get('produsId') || ''
  const [remotePreselected, setRemotePreselected] = useState(null)
  const [categories, setCategories] = useState(() => {
    const local = readLocalCategories()
    if (local.length) return local
    return [
      'Bucătării',
      'Dulapuri',
      'Noptiere',
      'Paturi (fără saltea)',
      'Panouri TV / Comode TV',
      'Birouri',
      'Mobilier Baie',
      'Biblioteci / Corpuri living',
    ]
  })

  const preselectedProduct = useMemo(() => {
    if (remotePreselected) return remotePreselected
    if (preselectedId) return products.find((p) => String(p.id) === String(preselectedId)) || null
    if (!preselectedName) return null
    const needle = normalizeKey(preselectedName)
    return products.find((p) => normalizeKey(p.name) === needle) || null
  }, [preselectedId, preselectedName, remotePreselected])

  useEffect(() => {
    let alive = true
    setRemotePreselected(null)
    if (!preselectedId || !isSupabaseConfigured) return () => { alive = false }
    const local = products.find((p) => String(p.id) === String(preselectedId)) || null
    if (local) return () => { alive = false }

    const mapProduct = (p) => {
      const imagesArr = Array.isArray(p.images) ? p.images : []
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        priceLabel: p.price_label || `de la ${p.price} RON`,
        description: p.description || '',
        badge: p.badge || '',
        image: imagesArr[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
        images: imagesArr,
      }
    }

    supabase
      .from('products')
      .select('*')
      .eq('id', preselectedId)
      .single()
      .then(({ data, error }) => {
        if (!alive) return
        if (!error && data) setRemotePreselected(mapProduct(data))
      })

    return () => {
      alive = false
    }
  }, [preselectedId])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    supabase
      .from('product_categories')
      .select('name')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          const local = readLocalCategories()
          if (local.length) setCategories(local)
          return
        }
        const list = (data || [])
          .map((r) => String(r?.name || '').trim())
          .filter(Boolean)
        if (list.length) setCategories(list)
      })
    return () => {
      alive = false
    }
  }, [])

  const [step, setStep] = useState(1)
  const mappedType = preselectedProduct ? mapCategoryToConfiguratorType(preselectedProduct.category) : null
  const initialType = mappedType && dimensionRanges[mappedType] ? mappedType : 'Dressing / Dulap'
  const initialCategory = preselectedProduct?.category || ''
  const initialName = preselectedProduct?.name || (preselectedName ? preselectedName : '')
  const initialRange = dimensionRanges[initialType]

  const [productType, setProductType] = useState(initialType)
  const [productCategory, setProductCategory] = useState(initialCategory)
  const [productName, setProductName] = useState(initialName)
  const [otherDescription, setOtherDescription] = useState('')

  const range = dimensionRanges[productType]
  const [widthCm, setWidthCm] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [depthCm, setDepthCm] = useState('')

  const [material, setMaterial] = useState(DEFAULT_MATERIAL_KEY)
  const [colorId, setColorId] = useState('')
  const [extrasSelected, setExtrasSelected] = useState([])
  const [extrasCustomEnabled, setExtrasCustomEnabled] = useState(false)
  const [extrasCustomText, setExtrasCustomText] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)
  const [files, setFiles] = useState([])
  const fileRef = useRef(null)
  const maxFiles = 10
  const maxTotalBytes = 30 * 1024 * 1024

  const [successOpen, setSuccessOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [stepError, setStepError] = useState('')

  useEffect(() => {
    if (productCategory) return
    const first = categories[0]
    if (!first) return
    const mapped = mapCategoryToConfiguratorType(first) || 'Dressing / Dulap'
    setProductCategory(first)
    setProductType(mapped)
  }, [categories, productCategory])

  const emailAllowed = useMemo(() => isAllowedEmail(email), [email])
  const totalFilesSize = useMemo(() => files.reduce((acc, f) => acc + (f?.size || 0), 0), [files])
  const filesSizeOk = totalFilesSize <= maxTotalBytes

  const openFilePicker = () => {
    fileRef.current?.click?.()
  }

  const onPickFiles = (e) => {
    const incoming = Array.from(e.target.files || [])
    if (!incoming.length) return

    const next = [...files]
    for (const f of incoming) {
      if (next.length >= maxFiles) break
      const exists = next.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)
      if (!exists) next.push(f)
    }

    const total = next.reduce((acc, f) => acc + (f?.size || 0), 0)
    if (total > maxTotalBytes) setSubmitError('Dimensiunea totală a fișierelor depășește 30MB.')

    setFiles(next)
    e.target.value = ''
  }

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const readDraft = () => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return null
      return parsed
    } catch {
      return null
    }
  }

  const saveTimerRef = useRef(0)
  const hydratedRef = useRef(false)
  const lastHydratedKeyRef = useRef('')
  const appliedPreselectKeyRef = useRef('')

  const contextKey = useMemo(() => {
    if (preselectedProduct?.id != null) return `id:${preselectedProduct.id}`
    if (preselectedId) return `id:${preselectedId}`
    if (preselectedName) return `name:${normalizeKey(preselectedName)}`
    return 'none'
  }, [preselectedId, preselectedName, preselectedProduct?.id])

  useEffect(() => {
    const draft = readDraft()
    if (lastHydratedKeyRef.current === contextKey) return
    lastHydratedKeyRef.current = contextKey
    hydratedRef.current = false

    const nextInitialCategory = preselectedProduct?.category || ''
    const mapped = preselectedProduct ? mapCategoryToConfiguratorType(preselectedProduct.category) : null
    const nextInitialType = mapped && dimensionRanges[mapped] ? mapped : 'Dressing / Dulap'
    const nextInitialRange = dimensionRanges[nextInitialType] || dimensionRanges['Dressing / Dulap']
    const nextInitialName = preselectedProduct?.name || (preselectedName ? preselectedName : '')

    setStep(1)
    setProductType(nextInitialType)
    setProductCategory(nextInitialCategory)
    setProductName(nextInitialName)
    setOtherDescription('')
    setWidthCm('')
    setHeightCm('')
    setDepthCm('')
    setMaterial(DEFAULT_MATERIAL_KEY)
    setColorId('')
    setExtrasSelected([])
    setExtrasCustomEnabled(false)
    setExtrasCustomText('')
    setNotes('')
    setConsent(false)

    if (!draft) {
      hydratedRef.current = true
      return
    }

    const draftKey = typeof draft.contextKey === 'string' ? draft.contextKey : ''
    const currentKey = contextKey
    const draftName = typeof draft.productName === 'string' ? normalizeKey(draft.productName) : ''
    const currentName = preselectedProduct?.name
      ? normalizeKey(preselectedProduct.name)
      : preselectedName
        ? normalizeKey(preselectedName)
        : ''
    const isMismatch =
      (draftKey && draftKey !== currentKey) ||
      (!draftKey && currentKey !== 'none' && draftName && currentName && draftName !== currentName)

    setFullName(typeof draft.fullName === 'string' ? draft.fullName : '')
    setPhone(typeof draft.phone === 'string' ? draft.phone : '')
    setEmail(typeof draft.email === 'string' ? draft.email : '')

    if (isMismatch) {
      hydratedRef.current = true
      return
    }

    setStep((s) => {
      const nextStep = clampNumber(Number(draft.step), 1, steps.length)
      return Number.isFinite(nextStep) ? nextStep : s
    })

    const nextCategory =
      typeof draft.productCategory === 'string'
        ? draft.productCategory
        : typeof draft.product_type === 'string'
          ? draft.product_type
          : nextInitialCategory

    setProductCategory(nextCategory)

    const mappedFromCategory = mapCategoryToConfiguratorType(nextCategory) || nextInitialType
    const nextType =
      typeof draft.productType === 'string' && dimensionRanges[draft.productType]
        ? draft.productType
        : mappedFromCategory && dimensionRanges[mappedFromCategory]
          ? mappedFromCategory
          : nextInitialType

    const nextRange = dimensionRanges[nextType] || nextInitialRange

    setProductType(nextType)
    setProductName(typeof draft.productName === 'string' ? draft.productName : nextInitialName)

    setWidthCm(normalizeDimensionDraft(draft.widthCm, nextRange.w[0], nextRange.w[1]))
    setHeightCm(normalizeDimensionDraft(draft.heightCm, nextRange.h[0], nextRange.h[1]))
    setDepthCm(normalizeDimensionDraft(draft.depthCm, nextRange.d[0], nextRange.d[1]))

    const draftMaterial =
      typeof draft.material === 'string' && materialOptions.some((m) => m.key === draft.material)
        ? draft.material
        : DEFAULT_MATERIAL_KEY
    setMaterial(draftMaterial)

    const maybeColorId =
      typeof draft.colorId === 'string'
        ? draft.colorId
        : typeof draft.color === 'string'
          ? draft.color
          : ''
    setColorId(isColorValidForMaterial(draftMaterial, maybeColorId) ? maybeColorId : '')

    const allowedExtraIds = new Set(EXTRAS_OPTIONS.map((x) => x.id))
    const rawExtras = Array.isArray(draft.extrasSelected)
      ? draft.extrasSelected
      : Array.isArray(draft.extras)
        ? draft.extras
        : []

    if (Array.isArray(rawExtras)) {
      const resolved = rawExtras
        .filter((x) => typeof x === 'string')
        .map((x) => {
          if (allowedExtraIds.has(x)) return x
          return EXTRAS_OPTIONS.find((o) => o.label === x)?.id || null
        })
        .filter(Boolean)
      setExtrasSelected(Array.from(new Set(resolved)))
    } else {
      setExtrasSelected([])
    }

    const draftCustomText = typeof draft.extrasCustomText === 'string' ? draft.extrasCustomText : ''
    setExtrasCustomText(draftCustomText)
    setExtrasCustomEnabled(Boolean(draft.extrasCustomEnabled) || Boolean(draftCustomText.trim()))

    setNotes(typeof draft.notes === 'string' ? draft.notes : '')
    setConsent(Boolean(draft.consent))
    setOtherDescription(typeof draft.otherDescription === 'string' ? draft.otherDescription : '')
    hydratedRef.current = true
  }, [contextKey, preselectedName, preselectedProduct])

  useEffect(() => {
    if (!preselectedProduct) return
    const key = `id:${preselectedProduct.id}`
    if (appliedPreselectKeyRef.current === key) return
    appliedPreselectKeyRef.current = key
    const mapped = mapCategoryToConfiguratorType(preselectedProduct.category) || 'Dressing / Dulap'
    if (!dimensionRanges[mapped]) return
    setProductName(preselectedProduct.name)
    setProductCategory(preselectedProduct.category || '')
    setProductType(mapped)
    setColorId('')
    setExtrasSelected([])
    setExtrasCustomEnabled(false)
    setExtrasCustomText('')
    const nextRange = dimensionRanges[mapped]
    setWidthCm((v) => normalizeDimensionDraft(v, nextRange.w[0], nextRange.w[1]))
    setHeightCm((v) => normalizeDimensionDraft(v, nextRange.h[0], nextRange.h[1]))
    setDepthCm((v) => normalizeDimensionDraft(v, nextRange.d[0], nextRange.d[1]))
  }, [preselectedProduct])

  useEffect(() => {
    if (!hydratedRef.current) return
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      try {
        const payload = {
          contextKey,
          step,
          productType,
          productCategory,
          productName,
          widthCm,
          heightCm,
          depthCm,
          materialId: material,
          material,
          colorId,
          colorLabel: selectedColor?.label || undefined,
          extrasSelected,
          extrasCustomEnabled,
          extrasCustomText,
          fullName,
          phone,
          email,
          notes,
          consent,
          otherDescription,
          savedAt: Date.now(),
        }
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
      } catch {
      }
    }, 200)

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = 0
    }
  }, [
    contextKey,
    step,
    productType,
    productCategory,
    productName,
    widthCm,
    heightCm,
    depthCm,
    material,
    colorId,
    extrasSelected,
    extrasCustomEnabled,
    extrasCustomText,
    fullName,
    phone,
    email,
    notes,
    consent,
    otherDescription,
  ])

  const selectedMaterial = useMemo(() => getMaterialPricing(material), [material])
  const selectedColor = useMemo(() => getColorOption(material, colorId), [material, colorId])
  const colorsForMaterial = useMemo(() => getColorsForMaterial(material), [material])
  const widthValue = useMemo(() => getValidDimension(widthCm, range.w[0], range.w[1]), [widthCm, range.w])
  const heightValue = useMemo(() => getValidDimension(heightCm, range.h[0], range.h[1]), [heightCm, range.h])
  const depthValue = useMemo(() => getValidDimension(depthCm, range.d[0], range.d[1]), [depthCm, range.d])
  const dimensionsReady = widthValue !== null && heightValue !== null && depthValue !== null
  const linearMeters = useMemo(() => calcLinearMeters(widthValue || 0), [widthValue])
  const extrasTotal = useMemo(() => getExtrasTotal(extrasSelected), [extrasSelected])
  const leadGenData = useMemo(() => getLeadGenData(productCategory), [productCategory])
  const isLeadGen = !!leadGenData

  const estimatedPrice = useMemo(() => {
    if (isLeadGen) return leadGenData.startingPrice
    return dimensionsReady ? calcEstimatedPriceRon(widthValue, selectedMaterial?.pricePerMl) : 0
  }, [isLeadGen, leadGenData, dimensionsReady, widthValue, selectedMaterial?.pricePerMl])

  useEffect(() => {
    if (!colorId) return
    if (isColorValidForMaterial(material, colorId)) return
    setColorId('')
  }, [material, colorId])

  const summary = useMemo(() => {
    const dims = dimensionsReady ? `${widthValue}×${heightValue}×${depthValue} cm` : 'Inca nu s-au introdus dimensiunile'
    const labels = extrasSelected
      .map((id) => getExtraById(id)?.label)
      .filter(Boolean)
    const extraText = labels.length ? labels.join(', ') : '—'
    const custom = extrasCustomText.trim()
    const extrasLabel = custom ? `${extraText} · Alte opțiuni: ${custom}` : extraText
    return {
      productType: productCategory || productType,
      productName: productName || undefined,
      dimensionsLabel: dims,
      materialLabel: selectedMaterial 
        ? (isLeadGen ? selectedMaterial.key : `${selectedMaterial.key} — ${selectedMaterial.pricePerMl} RON/ml`) 
        : material,
      colorId: colorId || undefined,
      colorLabel: selectedColor?.label || undefined,
      extrasLabel,
      fullName: fullName || undefined,
      phone: phone || undefined,
      email: email || undefined,
    }
  }, [
    productType,
    productCategory,
    productName,
    widthCm,
    heightCm,
    depthCm,
    widthValue,
    heightValue,
    depthValue,
    dimensionsReady,
    material,
    selectedMaterial,
    colorId,
    selectedColor,
    extrasSelected,
    extrasCustomText,
    fullName,
    phone,
    email,
  ])

  const progress = useMemo(() => Math.round(((step - 1) / (steps.length - 1)) * 100), [step])

  const categoryOptions = useMemo(() => {
    const out = []
    const seen = new Set()
    for (const c of categories) {
      const name = String(c || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(name)
    }
    out.push('Alt produs')
    return out
  }, [categories])

  const selectProductCategory = (nextCategory) => {
    const categoryLabel = String(nextCategory || '').trim()
    const effectiveCategory = categoryLabel || ''
    const mapped = effectiveCategory === 'Alt produs' ? 'Alt produs' : mapCategoryToConfiguratorType(effectiveCategory) || 'Alt produs'
    const nextRange = dimensionRanges[mapped] || dimensionRanges['Alt produs']
    setProductCategory(effectiveCategory)
    setProductType(mapped)
    if (effectiveCategory === 'Alt produs') {
      setProductName('')
      setOtherDescription('')
    }
    setWidthCm((v) => normalizeDimensionDraft(v, nextRange.w[0], nextRange.w[1]))
    setHeightCm((v) => normalizeDimensionDraft(v, nextRange.h[0], nextRange.h[1]))
    setDepthCm((v) => normalizeDimensionDraft(v, nextRange.d[0], nextRange.d[1]))
  }

  const toggleExtra = (id) => {
    setExtrasSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      return [...prev, id]
    })
  }

  const goNext = () => {
    if (step === 1 && productCategory === 'Alt produs') {
      if (!productName.trim()) {
        setStepError('Introdu titlul produsului.')
        return
      }
      if (!otherDescription.trim()) {
        setStepError('Descrie ce îți dorești.')
        return
      }
    }
    if (step === 4 && !colorId) {
      setStepError('Alege culoarea/finisajul pentru a continua.')
      return
    }
    if (step === 2 && !dimensionsReady) {
      setStepError('Introdu dimensiuni valide în intervalele permise pentru a continua.')
      return
    }
    setStepError('')
    setStep((s) => Math.min(steps.length, s + 1))
  }
  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (productCategory === 'Alt produs') {
      if (!productName.trim()) {
        setSubmitError('Introdu titlul produsului.')
        return
      }
      if (!otherDescription.trim()) {
        setSubmitError('Descrie ce îți dorești.')
        return
      }
    }
    if (!consent) {
      setSubmitError('Confirmă acordul GDPR pentru a trimite cererea.')
      return
    }
    if (!dimensionsReady) {
      setSubmitError('Introdu dimensiuni valide în intervalele permise.')
      return
    }
    if (!fullName.trim()) {
      setSubmitError('Introdu numele complet.')
      return
    }
    if (!phone.trim()) {
      setSubmitError('Introdu numărul de telefon.')
      return
    }
    if (!email.trim()) {
      setSubmitError('Introdu adresa de email.')
      return
    }
    if (!emailAllowed) {
      setSubmitError('Email-ul trebuie să fie de tip @gmail.com, @outlook.com etc.')
      return
    }
    if (totalFilesSize > maxTotalBytes) {
      setSubmitError('Dimensiunea totală a fișierelor depășește 30MB.')
      return
    }
    if (!colorId || !selectedColor) {
      setSubmitError('Alege culoarea/finisajul pentru a continua.')
      return
    }

    const typedEmail = email.trim()
    const typedEmailNormalized = typedEmail.toLowerCase()
    let accountEmailNormalized = ''
    if (isSupabaseConfigured) {
      const { data: userData } = await supabase.auth.getUser()
      const accountEmail = String(userData?.user?.email || '').trim()
      if (accountEmail) accountEmailNormalized = accountEmail.toLowerCase()
    }

    const notesParts = []
    if (productCategory === 'Alt produs') {
      notesParts.push(`Alt produs: ${productName.trim()}\n${otherDescription.trim()}`)
    }
    if (accountEmailNormalized && typedEmailNormalized && typedEmailNormalized !== accountEmailNormalized) {
      notesParts.push(`Email completat în configurator: ${typedEmail}`)
    }
    if (notes.trim()) notesParts.push(notes.trim())
    if (extrasCustomText.trim()) notesParts.push(`Alte opțiuni: ${extrasCustomText.trim()}`)
    const combinedNotes = notesParts.length ? notesParts.join('\n\n') : null

    const requestEmail = accountEmailNormalized || typedEmailNormalized

    setSubmitLoading(true)
    const { error } = await supabase.from('configurator_requests').insert({
      client_name: fullName.trim(),
      client_email: requestEmail,
      client_phone: phone.trim(),
      client_notes: combinedNotes,
      product_type: productCategory && productCategory !== 'Alt produs' ? productCategory : 'Alt produs',
      width_cm: widthValue,
      height_cm: heightValue,
      depth_cm: depthValue,
      material,
      color: selectedColor.label,
      extras: extrasSelected.map((id) => getExtraById(id)?.label).filter(Boolean),
      estimated_price: estimatedPrice,
      status: 'nou',
    })

    if (error) {
      setSubmitError(error.message)
      setSubmitLoading(false)
      return
    }

    setSubmitLoading(false)
    try {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
    }
    setSuccessOpen(true)
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link className="hover:text-brand-mid" to="/">
            Acasă
          </Link>
          <span>/</span>
          <span className="text-text-dark">Configurator</span>
        </div>

        <MotionDiv
          className="mt-5"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Configurator Mobilă
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Configurează dimensiunile și finisajele, apoi trimite cererea. Te contactăm în 24h.
          </p>
        </MotionDiv>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <form onSubmit={submit} className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-text-dark">
                  Pasul {step} / {steps.length} — {steps.find((s) => s.id === step)?.title}
                </div>
                <div className="text-xs text-text-muted">{progress}%</div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-warm">
                <div
                  className="h-full rounded-full bg-brand-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-8 space-y-10">
                {step === 1 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Categorii produse</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {categoryOptions.map((category) => {
                        const mapped = category === 'Alt produs' ? 'Alt produs' : mapCategoryToConfiguratorType(category) || 'Alt produs'
                        const Icon = iconForConfiguratorType(mapped)
                        const active = category === productCategory
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => selectProductCategory(category)}
                            className={[
                              'flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                              active
                                ? 'border-brand-primary bg-brand-light'
                                : 'border-border bg-white hover:bg-warm',
                            ].join(' ')}
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-dark ring-1 ring-border">
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-text-dark">{category}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {productCategory === 'Alt produs' ? (
                      <div className="mt-6 grid gap-4">
                        <div>
                          <label className="text-xs font-medium text-text-muted">Titlu produs</label>
                          <input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Ex: Masă extensibilă"
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none ring-brand-primary/30 focus:ring-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-text-muted">Descrie ce îți dorești</label>
                          <textarea
                            value={otherDescription}
                            onChange={(e) => setOtherDescription(e.target.value)}
                            rows={4}
                            placeholder="Dimensiuni, materiale, culori, schiță, orice detaliu util…"
                            className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none ring-brand-primary/30 focus:ring-2"
                          />
                        </div>
                        {stepError ? <div className="text-xs font-semibold text-red-600">{stepError}</div> : null}
                      </div>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {isLeadGen && (
                          <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                            <div className="text-lg font-bold text-text-dark">
                              {leadGenData.label} – Prețuri de la {leadGenData.startingPrice} RON
                            </div>
                          </div>
                        )}
                        {productName && !isLeadGen ? (
                          <div className="rounded-2xl border border-brand-primary/15 bg-brand-light p-5">
                            <div className="text-xs font-semibold text-brand-dark">Nume produs</div>
                            <div className="mt-2 text-sm font-semibold text-text-dark">{productName}</div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}

                {step === 2 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Dimensiuni</div>
                    <div className="mt-4 grid gap-5 md:grid-cols-3">
                      {[
                        {
                          label: 'Lățime (cm)',
                          value: widthCm,
                          displayValue: widthValue,
                          set: setWidthCm,
                          r: range.w,
                        },
                        {
                          label: 'Înălțime (cm)',
                          value: heightCm,
                          displayValue: heightValue,
                          set: setHeightCm,
                          r: range.h,
                        },
                        {
                          label: 'Adâncime (cm)',
                          value: depthCm,
                          displayValue: depthValue,
                          set: setDepthCm,
                          r: range.d,
                        },
                      ].map((f) => (
                        <div key={f.label} className="rounded-2xl border border-border bg-cream p-4">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-text-muted">
                              {f.label}
                            </label>
                            <div className="text-xs font-semibold text-brand-dark">
                              {f.displayValue ?? '—'}
                            </div>
                          </div>
                          <input
                            type="number"
                            value={f.value}
                            min={f.r[0]}
                            max={f.r[1]}
                            onChange={(e) => {
                              f.set(e.target.value)
                              setStepError('')
                            }}
                            onBlur={(e) => {
                              const raw = String(e.target.value || '').trim()
                              if (!raw) {
                                f.set('')
                                return
                              }
                              f.set(normalizeDimensionDraft(raw, f.r[0], f.r[1]))
                            }}
                            placeholder={`${f.r[0]} - ${f.r[1]}`}
                            className="mt-3 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          />
                          <input
                            type="range"
                            value={f.displayValue ?? f.r[0]}
                            min={f.r[0]}
                            max={f.r[1]}
                            onChange={(e) => {
                              f.set(e.target.value)
                              setStepError('')
                            }}
                            className="mt-3 w-full accent-[var(--green-primary)]"
                          />
                          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                            <span>{f.r[0]}</span>
                            <span>{f.r[1]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-text-muted">
                      Dimensiunile sunt orientative. Un specialist confirmă măsurătorile.
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Material</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {materialOptions.map((m) => {
                        const active = m.key === material
                        const price = dimensionsReady ? calcEstimatedPriceRon(widthValue, m.pricePerMl) : 0
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setMaterial(m.key)}
                            className={[
                              'relative overflow-hidden rounded-[24px] border-2 p-6 text-left transition-all duration-300 shadow-soft hover:shadow-softLg',
                              active 
                                ? 'border-brand-primary bg-brand-light ring-1 ring-brand-primary' 
                                : 'border-border bg-white hover:border-brand-primary/30',
                            ].join(' ')}
                            style={{ backgroundColor: m.bgColor }}
                          >
                            {/* Imagine textură */}
                            <div className="absolute top-4 right-4 h-12 w-12 overflow-hidden rounded-xl border border-white/50 shadow-sm">
                              <img src={m.textureUrl} alt="" className="h-full w-full object-cover" />
                            </div>

                            <div className="flex h-full flex-col justify-between gap-6">
                              <div className="pr-14">
                                <div className="text-base font-bold text-text-dark leading-tight">{m.key}</div>
                                <div className="mt-1 text-xs font-medium text-text-muted">{m.description}</div>
                              </div>

                              {!isLeadGen && (
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-baseline justify-between gap-2 border-t border-black/5 pt-4">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted/60">Preț</div>
                                    <div className="text-xl font-black text-brand-mid">
                                      {price.toLocaleString('ro-RO')} RON
                                    </div>
                                  </div>
                                  
                                  <div className="text-[10px] font-medium text-text-muted/70 italic">
                                    {m.pricePerMl.toLocaleString('ro-RO')} RON / ml · {linearMeters.toFixed(2)} ml
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Culoare / Finisaj</div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {colorsForMaterial.map((c) => {
                        const active = c.id === colorId
                        const isOther = c.id === 'other_color'
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setColorId(c.id)
                              setStepError('')
                            }}
                            className={[
                              'flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition hover:bg-warm',
                              active ? 'border-brand-primary bg-brand-light' : 'border-border',
                              isOther ? 'border-dashed' : '',
                            ].join(' ')}
                          >
                            {isOther ? (
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream ring-1 ring-border">
                                <Plus className="h-5 w-5 text-brand-mid" />
                              </span>
                            ) : (
                              <span
                                className={[
                                  'h-12 w-12 rounded-full ring-1 ring-border',
                                  active ? 'ring-2 ring-brand-primary' : '',
                                ].join(' ')}
                                style={{ background: c.hex }}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-text-dark">{c.label}</div>
                              {isOther ? <div className="text-xs text-text-muted">La cerere</div> : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {stepError && step === 4 ? <div className="mt-3 text-xs font-semibold text-red-600">{stepError}</div> : null}
                  </div>
                ) : null}

                {step === 5 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Opțiuni extra</div>
                    <div className="mt-4 space-y-3">
                      {EXTRAS_OPTIONS.map((o) => {
                        const active = extrasSelected.includes(o.id)
                        return (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => toggleExtra(o.id)}
                            className={[
                              'flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition',
                              active
                                ? 'border-brand-primary bg-brand-light'
                                : 'border-border bg-white hover:bg-warm',
                            ].join(' ')}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={[
                                  'inline-flex h-6 w-6 items-center justify-center rounded-md border transition',
                                  active
                                    ? 'border-brand-primary bg-brand-primary text-white'
                                    : 'border-border bg-white text-transparent',
                                ].join(' ')}
                              >
                                <Check className="h-4 w-4" />
                              </span>
                              <div className="text-sm font-medium text-text-dark">{o.label}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExtrasCustomEnabled((v) => !v)}
                      className="mt-5 inline-flex items-center justify-center rounded-full border border-brand-primary px-5 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-light"
                    >
                      {extrasCustomEnabled ? 'Ascunde' : 'Alte opțiuni (la cerere)'}
                    </button>

                    {extrasCustomEnabled ? (
                      <div className="mt-4">
                        <textarea
                          value={extrasCustomText}
                          onChange={(e) => setExtrasCustomText(e.target.value)}
                          rows={4}
                          placeholder="Scrie aici ce îți dorești (ex: dimensiuni compartimentare, tip mânere, sticlă, frezare, etc.)"
                          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {step === 6 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Date contact</div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-text-muted">
                          Nume complet
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted">
                          Număr de telefon
                        </label>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(String(e.target.value || '').replace(/\D+/g, ''))}
                          inputMode="numeric"
                          autoComplete="tel"
                          pattern="[0-9]*"
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          placeholder="07xx xxx xxx"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted">Email</label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          inputMode="email"
                          autoComplete="email"
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          placeholder="email@gmail.com"
                        />
                        {email.trim() && !emailAllowed ? (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            Folosește un email de tip @gmail.com, @outlook.com, @yahoo.com etc.
                          </div>
                        ) : null}
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-text-muted">
                          Mențiuni suplimentare (opțional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-border bg-cream p-5">
                      <div className="text-sm font-semibold text-text-dark">Fișiere atașate (opțional)</div>
                      <div className="mt-1 text-xs text-text-muted">
                        Încarcă schițe, imagini sau materiale video utile pentru estimarea proiectului. Poți adăuga până la 10 fișiere (maxim 30MB).
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-text-dark transition duration-200 hover:bg-brand-light"
                        >
                          <Paperclip className="h-4 w-4 text-text-muted" />
                          Alege fișiere
                        </button>
                        <div className={['text-xs', filesSizeOk ? 'text-text-muted' : 'font-semibold text-red-600'].join(' ')}>
                          {files.length}/{maxFiles} • {formatBytes(totalFilesSize)} / {formatBytes(maxTotalBytes)}
                        </div>
                      </div>

                      <input
                        ref={fileRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,application/pdf,application/zip,application/x-zip-compressed,application/x-rar-compressed"
                        onChange={onPickFiles}
                        className="hidden"
                      />

                      {files.length ? (
                        <div className="mt-4 grid gap-2">
                          {files.map((f, idx) => (
                            <div
                              key={`${f.name}-${f.size}-${f.lastModified}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3"
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-text-dark">{f.name}</div>
                                <div className="mt-0.5 text-xs text-text-muted">{formatBytes(f.size)}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted transition duration-200 hover:bg-brand-light hover:text-text-dark"
                                aria-label="Elimină fișier"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-cream p-4">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[var(--green-primary)]"
                      />
                      <span className="text-sm text-text-dark">
                        Sunt de acord cu prelucrarea datelor personale conform{' '}
                        <Link to="/politica-confidentialitate" className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark">
                          Politicii de Confidențialitate
                        </Link>
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-mid disabled:opacity-50"
                      disabled={!consent || submitLoading || !fullName.trim() || !phone.trim() || !emailAllowed || !filesSizeOk}
                    >
                      {submitLoading ? 'Se trimite…' : (isLeadGen ? 'Trimite configurarea pentru ofertă personalizată' : 'Trimite cererea de ofertă')}
                    </button>
                    {submitError ? (
                      <div className="mt-3 text-xs text-red-600">{submitError}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {isLeadGen && (
                <p className="mt-8 text-[10px] text-text-muted italic leading-relaxed">
                  *Prețurile afișate sunt orientative, au caracter informativ pentru configurații de bază (carcasă PAL standard) și nu includ electrocasnicele, saltelele sau accesoriile premium. Fiecare proiect se calculează individual în funcție de materialele și feroneria alese.*
                </p>
              )}

              <div className="mt-10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center rounded-full border border-brand-primary px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Înapoi
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={step === steps.length || (step === 4 && !colorId)}
                  className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-mid disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuă
                </button>
              </div>
            </div>

            <div className="mt-6 lg:hidden">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                <div className="text-sm font-semibold text-text-dark">Configurația ta</div>
                <div className="mt-3 text-xs text-text-muted">
                  Preț estimativ:{' '}
                  <span className="font-semibold text-brand-mid">
                    {isLeadGen ? 'De la ' : ''}{estimatedPrice.toLocaleString('ro-RO')} RON
                  </span>
                </div>
                <div className="mt-3 text-xs italic text-text-muted">
                  * Prețul final este confirmat după consultarea cu un specialist
                </div>
              </div>
            </div>
          </form>

        <ConfiguratorSummary summary={summary} estimatedPrice={estimatedPrice} isLeadGen={isLeadGen} />
      </div>
    </div>

    <AnimatePresence>
        {successOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSuccessOpen(false)}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                aria-label="Închide"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="rounded-2xl border border-brand-primary/20 bg-brand-light p-5">
                <div className="text-sm font-semibold text-brand-dark">
                  {confirmationText}
                </div>
                <div className="mt-3 text-xs text-brand-dark/80">
                  Vei primi o confirmare și detalii suplimentare după analiză.
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-brand-primary px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-light"
                >
                  Închide
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

