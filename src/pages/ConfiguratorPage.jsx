import { AnimatePresence, motion } from 'framer-motion'
import {
  BedDouble,
  BookOpen,
  Briefcase,
  DoorClosed,
  Check,
  Layers,
  Square,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ConfiguratorSummary from '../components/ConfiguratorSummary.jsx'
import { products } from '../data/products.js'
import { supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const productTypeOptions = [
  { key: 'Dulap', icon: DoorClosed },
  { key: 'Pat', icon: BedDouble },
  { key: 'Birou', icon: Briefcase },
  { key: 'Bibliotecă', icon: BookOpen },
  { key: 'Comodă', icon: Layers },
  { key: 'Noptieră', icon: Square },
]

const categoryToType = {
  Dulapuri: 'Dulap',
  Paturi: 'Pat',
  Birouri: 'Birou',
  Biblioteci: 'Bibliotecă',
  Comode: 'Comodă',
  Noptiere: 'Noptieră',
}

const dimensionRanges = {
  Dulap: { w: [120, 320], h: [180, 280], d: [45, 80] },
  Pat: { w: [140, 220], h: [90, 140], d: [190, 240] },
  Birou: { w: [90, 200], h: [70, 90], d: [50, 90] },
  'Bibliotecă': { w: [80, 260], h: [160, 280], d: [25, 45] },
  'Comodă': { w: [80, 200], h: [70, 120], d: [35, 60] },
  'Noptieră': { w: [35, 70], h: [40, 75], d: [30, 55] },
}

const materialOptions = [
  { key: 'PAL melaminat', extra: 0, swatch: '#c8b59a' },
  { key: 'MDF vopsit', extra: 400, swatch: '#e7e7e2' },
  { key: 'Lemn masiv stejar', extra: 1200, swatch: '#c7a16b' },
  { key: 'Lemn masiv nuc', extra: 1800, swatch: '#6a4b36' },
]

const colorOptions = [
  { key: 'Alb mat', extra: 0, swatch: '#f3f3f1' },
  { key: 'Antracit', extra: 0, swatch: '#303235' },
  { key: 'Stejar natural', extra: 150, swatch: '#b9935a' },
  { key: 'Verde închis', extra: 200, swatch: '#085041' },
  { key: 'Gri cald', extra: 0, swatch: '#a9a39b' },
  { key: 'Personalizat', extra: 300, swatch: '#1d9e75' },
]

const extrasOptions = [
  { key: 'Iluminat interior LED', extra: 350 },
  { key: 'Oglindă pe ușă', extra: 280 },
  { key: 'Sistem push-open fără mânere', extra: 420 },
  { key: 'Montaj și transport inclus', extra: 600 },
]

const steps = [
  { id: 1, title: 'Tip produs' },
  { id: 2, title: 'Dimensiuni' },
  { id: 3, title: 'Material' },
  { id: 4, title: 'Culoare / Finisaj' },
  { id: 5, title: 'Opțiuni extra' },
  { id: 6, title: 'Date contact' },
]

const confirmationText = 'Cererea ta a fost înregistrată! Te contactăm în 24 de ore.'

function clampNumber(value, min, max) {
  const n = Number.isFinite(value) ? value : 0
  return Math.min(max, Math.max(min, n))
}

function mid(min, max) {
  return Math.round((min + max) / 2)
}

export default function ConfiguratorPage() {
  const MotionDiv = motion.div
  const [params] = useSearchParams()
  const preselectedName = params.get('produs') || ''

  const preselectedProduct = useMemo(() => {
    if (!preselectedName) return null
    return products.find((p) => p.name.toLowerCase() === preselectedName.toLowerCase()) || null
  }, [preselectedName])

  const [step, setStep] = useState(1)
  const mappedType = preselectedProduct ? categoryToType[preselectedProduct.category] : null
  const initialType = mappedType || 'Dulap'
  const initialName = preselectedProduct?.name || preselectedName
  const initialRange = dimensionRanges[initialType]

  const [productType, setProductType] = useState(initialType)
  const [productName, setProductName] = useState(initialName)

  const range = dimensionRanges[productType]
  const [widthCm, setWidthCm] = useState(mid(initialRange.w[0], initialRange.w[1]))
  const [heightCm, setHeightCm] = useState(mid(initialRange.h[0], initialRange.h[1]))
  const [depthCm, setDepthCm] = useState(mid(initialRange.d[0], initialRange.d[1]))

  const [material, setMaterial] = useState(materialOptions[0].key)
  const [color, setColor] = useState(colorOptions[0].key)
  const [extras, setExtras] = useState([])

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)

  const [successOpen, setSuccessOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const materialExtra = useMemo(() => materialOptions.find((m) => m.key === material)?.extra || 0, [material])
  const colorExtra = useMemo(() => colorOptions.find((c) => c.key === color)?.extra || 0, [color])
  const extrasTotal = useMemo(() => extras.reduce((sum, k) => sum + (extrasOptions.find((e) => e.key === k)?.extra || 0), 0), [extras])

  const base = useMemo(() => {
    const w = Number(widthCm) || 0
    const h = Number(heightCm) || 0
    const d = Number(depthCm) || 0
    const raw = ((w * h * d) / 1000) * 1.6
    return Math.max(0, raw)
  }, [widthCm, heightCm, depthCm])

  const estimatedPrice = useMemo(() => {
    const total = base + materialExtra + colorExtra + extrasTotal
    return Math.round(total / 10) * 10
  }, [base, materialExtra, colorExtra, extrasTotal])

  const summary = useMemo(() => {
    const dims = `${widthCm}×${heightCm}×${depthCm} cm`
    const extrasLabel = extras.length ? extras.join(', ') : '—'
    return {
      productType,
      productName: productName || undefined,
      dimensionsLabel: dims,
      materialLabel: materialExtra ? `${material} (+${materialExtra} RON)` : material,
      colorLabel: colorExtra ? `${color} (+${colorExtra} RON)` : color,
      extrasLabel,
      fullName: fullName || undefined,
      phone: phone || undefined,
      email: email || undefined,
    }
  }, [
    productType,
    productName,
    widthCm,
    heightCm,
    depthCm,
    material,
    materialExtra,
    color,
    colorExtra,
    extras,
    fullName,
    phone,
    email,
  ])

  const progress = useMemo(() => Math.round(((step - 1) / (steps.length - 1)) * 100), [step])

  const selectProductType = (nextType) => {
    const nextRange = dimensionRanges[nextType]
    setProductType(nextType)
    setWidthCm((v) => clampNumber(v, nextRange.w[0], nextRange.w[1]))
    setHeightCm((v) => clampNumber(v, nextRange.h[0], nextRange.h[1]))
    setDepthCm((v) => clampNumber(v, nextRange.d[0], nextRange.d[1]))
  }

  const toggleExtra = (k) => {
    setExtras((prev) => {
      if (prev.includes(k)) return prev.filter((x) => x !== k)
      return [...prev, k]
    })
  }

  const goNext = () => setStep((s) => Math.min(steps.length, s + 1))
  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!consent) return
    if (!fullName.trim()) return
    if (!phone.trim()) return
    if (!email.trim()) return

    setSubmitLoading(true)
    const { error } = await supabase.from('configurator_requests').insert({
      client_name: fullName.trim(),
      client_email: email.trim(),
      client_phone: phone.trim(),
      client_notes: notes.trim() || null,
      product_type: productType,
      width_cm: widthCm,
      height_cm: heightCm,
      depth_cm: depthCm,
      material,
      color,
      extras,
      estimated_price: estimatedPrice,
      status: 'nou',
    })

    if (error) {
      setSubmitError(error.message)
      setSubmitLoading(false)
      return
    }

    setSubmitLoading(false)
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
                    <div className="text-sm font-semibold text-text-dark">Tip produs</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {productTypeOptions.map((o) => {
                        const Icon = o.icon
                        const active = o.key === productType
                        return (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => selectProductType(o.key)}
                            className={[
                              'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                              active
                                ? 'border-brand-primary bg-brand-light'
                                : 'border-border bg-white hover:bg-warm',
                            ].join(' ')}
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-dark ring-1 ring-border">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-sm font-semibold text-text-dark">
                              {o.key}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-5">
                      <label className="text-xs font-medium text-text-muted">
                        Nume produs (opțional)
                      </label>
                      <input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ex: Dulap Aura"
                        className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none ring-brand-primary/30 focus:ring-2"
                      />
                    </div>
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
                          set: setWidthCm,
                          r: range.w,
                        },
                        {
                          label: 'Înălțime (cm)',
                          value: heightCm,
                          set: setHeightCm,
                          r: range.h,
                        },
                        {
                          label: 'Adâncime (cm)',
                          value: depthCm,
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
                              {f.value}
                            </div>
                          </div>
                          <input
                            type="number"
                            value={f.value}
                            min={f.r[0]}
                            max={f.r[1]}
                            onChange={(e) =>
                              f.set(clampNumber(Number(e.target.value), f.r[0], f.r[1]))
                            }
                            className="mt-3 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          />
                          <input
                            type="range"
                            value={f.value}
                            min={f.r[0]}
                            max={f.r[1]}
                            onChange={(e) => f.set(Number(e.target.value))}
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
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setMaterial(m.key)}
                            className={[
                              'rounded-2xl border p-5 text-left transition',
                              active ? 'border-brand-primary bg-brand-light' : 'border-border bg-white hover:bg-warm',
                            ].join(' ')}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-10 w-10 rounded-2xl ring-1 ring-border"
                                  style={{ background: m.swatch }}
                                />
                                <div className="text-sm font-semibold text-text-dark">
                                  {m.key}
                                </div>
                              </div>
                              <div className="text-sm font-semibold text-brand-mid">
                                {m.extra ? `+${m.extra} RON` : 'Standard'}
                              </div>
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
                      {colorOptions.map((c) => {
                        const active = c.key === color
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => setColor(c.key)}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 text-left transition hover:bg-warm"
                          >
                            <span
                              className={[
                                'h-12 w-12 rounded-full ring-1 ring-border',
                                active ? 'ring-2 ring-brand-primary' : '',
                              ].join(' ')}
                              style={{ background: c.swatch }}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-text-dark">{c.key}</div>
                              <div className="text-xs text-text-muted">
                                {c.extra ? `+${c.extra} RON` : 'Standard'}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div>
                    <div className="text-sm font-semibold text-text-dark">Opțiuni extra</div>
                    <div className="mt-4 space-y-3">
                      {extrasOptions.map((o) => {
                        const active = extras.includes(o.key)
                        return (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => toggleExtra(o.key)}
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
                              <div className="text-sm font-medium text-text-dark">{o.key}</div>
                            </div>
                            <div className="text-sm font-semibold text-brand-mid">+{o.extra} RON</div>
                          </button>
                        )
                      })}
                    </div>
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
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted">Email</label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        />
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
                      disabled={!consent || submitLoading}
                    >
                      {submitLoading ? 'Se trimite…' : 'Trimite cererea de ofertă'}
                    </button>
                    {submitError ? (
                      <div className="mt-3 text-xs text-red-600">{submitError}</div>
                    ) : null}
                  </div>
                ) : null}
              </div>

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
                  disabled={step === steps.length}
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
                    {estimatedPrice.toLocaleString('ro-RO')} RON
                  </span>
                </div>
                <div className="mt-3 text-xs italic text-text-muted">
                  * Prețul final este confirmat după consultarea cu un specialist
                </div>
              </div>
            </div>
          </form>

          <ConfiguratorSummary summary={summary} estimatedPrice={estimatedPrice} />
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

