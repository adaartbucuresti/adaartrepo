import { Check, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { products } from '../data/products.js'
import { lockBodyScroll } from '../lib/lockBodyScroll.js'
import { supabase } from '../lib/supabase.js'

const noteText =
  'Toate produsele sunt realizate la comandă. Nu există stoc. Configurezi, trimiți cererea, și un specialist te contactează cu oferta personalizată.'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(() => products.find((p) => String(p.id) === String(id)) || null)
  const [similarItems, setSimilarItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeIdx, setActiveIdx] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerBoxRef = useRef(null)
  const viewerImgRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 })
  const measureRef = useRef({ baseW: 0, baseH: 0, boxW: 0, boxH: 0 })

  const images = product?.images?.length ? product.images : product ? [product.image] : []
  const activeImg = images[activeIdx] || images[0]
  const whatsappPhone = '40722648175'
  const phoneDisplay = '+40 0722 648 175'
  const phoneTel = 'tel:+40722648175'
  const whatsappText = `Salut!\nSunt interesat(ă) de produsul „${product?.name || ''}” și aș dori o ofertă personalizată.\nVă rog să mă contactați pentru a discuta dimensiunile și preferințele mele.\nMulțumesc!`
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`

  useEffect(() => {
    let alive = true
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

    Promise.resolve().then(() => {
      if (!alive) return
      setLoading(true)
      setActiveIdx(0)
    })

    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(async ({ data, error }) => {
        if (!alive) return
        if (!error && data) setProduct(mapProduct(data))

        const { data: all } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (!alive) return

        const list = (all || []).map(mapProduct)
        const current = (!error && data) ? mapProduct(data) : products.find((p) => String(p.id) === String(id)) || null
        if (current) setProduct(current)

        if (current) {
          const same = list.filter((p) => p.category === current.category && String(p.id) !== String(current.id))
          const rest = list.filter((p) => String(p.id) !== String(current.id) && p.category !== current.category)
          setSimilarItems([...same, ...rest].slice(0, 3))
        } else {
          setSimilarItems(list.slice(0, 3))
        }

        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (!viewerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setViewerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewerOpen])

  useEffect(() => {
    if (!viewerOpen) return
    const unlock = lockBodyScroll()
    return () => unlock()
  }, [viewerOpen])

  useEffect(() => {
    if (!viewerOpen) return
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [viewerOpen, activeIdx])

  const zoomIn = () => setZoom((z) => Math.min(4, Math.round((z + 0.5) * 10) / 10))
  const zoomOut = () => setZoom((z) => Math.max(1, Math.round((z - 0.5) * 10) / 10))

  const clampPan = (next, dims, z) => {
    if (!dims.baseW || !dims.baseH || !dims.boxW || !dims.boxH) return { x: 0, y: 0 }
    if (z <= 1) return { x: 0, y: 0 }
    const maxX = Math.max(0, (dims.baseW * z - dims.boxW) / 2)
    const maxY = Math.max(0, (dims.baseH * z - dims.boxH) / 2)
    const x = Math.max(-maxX, Math.min(maxX, next.x))
    const y = Math.max(-maxY, Math.min(maxY, next.y))
    return { x, y }
  }

  useEffect(() => {
    if (!viewerOpen) return
    if (zoom <= 1) {
      if (pan.x || pan.y) setPan({ x: 0, y: 0 })
      return
    }
    const dims = measureRef.current
    const next = clampPan(pan, dims, zoom)
    if (next.x !== pan.x || next.y !== pan.y) setPan(next)
  }, [zoom, viewerOpen])

  useEffect(() => {
    if (!viewerOpen) return
    if (zoom !== 1) return
    const id = window.requestAnimationFrame(() => {
      const box = viewerBoxRef.current
      const img = viewerImgRef.current
      if (!box || !img) return
      const boxRect = box.getBoundingClientRect()
      const imgRect = img.getBoundingClientRect()
      measureRef.current = {
        baseW: imgRect.width,
        baseH: imgRect.height,
        boxW: boxRect.width,
        boxH: boxRect.height,
      }
    })
    return () => window.cancelAnimationFrame(id)
  }, [viewerOpen, activeIdx, zoom])

  const onViewerPointerDown = (e) => {
    if (zoom <= 1) return
    if (!viewerBoxRef.current) return
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
    }
  }

  const onViewerPointerMove = (e) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    const nextRaw = { x: dragRef.current.panX + dx, y: dragRef.current.panY + dy }
    const dims = measureRef.current
    const next = clampPan(nextRaw, dims, zoom)
    setPan(next)
  }

  const onViewerPointerUp = (e) => {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
    }
  }

  const similar = useMemo(() => {
    if (similarItems.length) return similarItems
    if (!product) return []
    const same = products.filter((p) => p.category === product.category && p.id !== product.id)
    if (same.length >= 3) return same.slice(0, 3)
    const rest = products.filter((p) => p.id !== product.id && p.category !== product.category)
    return [...same, ...rest].slice(0, 3)
  }, [product, similarItems])

  if (!product) {
    return (
      <div className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="text-sm text-text-muted">{loading ? 'Se încarcă…' : 'Produs inexistent.'}</div>
          <Link
            to="/produse"
            className="mt-4 inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:bg-brand-mid"
          >
            Înapoi la produse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link className="hover:text-brand-mid" to="/">
            Acasă
          </Link>
          <span>/</span>
          <Link className="hover:text-brand-mid" to="/produse">
            Produse
          </Link>
          <span>/</span>
          <span className="text-text-dark">{product.name}</span>
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-brand-primary bg-brand-light px-4 py-3 text-sm text-brand-dark">
          <span className="font-medium">🛠</span> <span className="italic">{noteText}</span>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="group relative w-full overflow-hidden rounded-2xl border border-border bg-white text-left"
              aria-label="Deschide imaginea completă"
            >
              <div className="aspect-[4/3]">
                <img
                  src={activeImg}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </button>

            {images.length > 1 ? (
              <div className="mt-4 flex gap-3">
                {images.map((img, idx) => {
                  const active = idx === activeIdx
                  return (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveIdx(idx)}
                      className={[
                        'h-20 w-24 overflow-hidden rounded-xl border transition',
                        active ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-border',
                      ].join(' ')}
                      aria-label={`Imagine ${idx + 1}`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-sm font-medium text-text-muted">{product.category}</div>
            <h1 className="mt-2 font-heading text-4xl font-semibold text-text-dark md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-text-muted">{product.description}</p>

            <div className="mt-8 space-y-3 rounded-2xl border border-border bg-white p-6">
              {['Personalizabil', 'Lemn premium', 'Garanție 2 ani', 'Livrare în București și împrejurimi'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-text-dark">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <svg viewBox="0 0 32 32" aria-hidden="true" className="h-4 w-4" fill="currentColor">
                <path d="M19.11 17.51c-.26-.13-1.55-.76-1.79-.85-.24-.09-.41-.13-.59.13-.18.26-.68.85-.84 1.03-.15.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.54-1.46-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.17-.26.26-.44.09-.18.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.5-.42-.43-.59-.43h-.5c-.17 0-.46.07-.7.33-.24.26-.92.9-.92 2.2s.94 2.55 1.07 2.73c.13.18 1.84 2.81 4.46 3.94.62.27 1.1.43 1.47.55.62.2 1.19.17 1.63.1.5-.08 1.55-.63 1.77-1.25.22-.61.22-1.14.15-1.25-.06-.11-.24-.18-.5-.31z" />
                <path d="M26.67 5.33A14.53 14.53 0 0 0 16 1.33C8.09 1.33 1.67 7.76 1.67 15.67c0 2.52.66 4.98 1.91 7.14L1.33 30.67l8.06-2.12a14.3 14.3 0 0 0 6.61 1.6h.01c7.91 0 14.33-6.43 14.33-14.33 0-3.83-1.49-7.43-4.17-10.09zm-10.66 22.1h-.01c-2.08 0-4.12-.56-5.9-1.63l-.42-.25-4.78 1.26 1.27-4.66-.27-.48a12 12 0 0 1-1.64-6c0-6.63 5.4-12.03 12.04-12.03 3.21 0 6.22 1.25 8.48 3.51a11.92 11.92 0 0 1 3.52 8.49c0 6.63-5.4 12.03-12.29 12.03z" />
              </svg>
              Cere ofertă pe WhatsApp
            </a>

            <div className="mt-3 text-center text-xs text-text-muted">
              Telefon:{' '}
              <a href={phoneTel} className="font-semibold text-brand-mid hover:text-brand-dark">
                {phoneDisplay}
              </a>
            </div>

            <div className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-text-muted">SAU</div>

            <Link
              to={`/configurator?produsId=${encodeURIComponent(product.id)}&produs=${encodeURIComponent(product.name)}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
            >
              Configurează acest produs
            </Link>

            <div className="mt-3 text-sm italic text-text-muted">
              Nu există coș de cumpărături. Configurezi, trimiți cererea, te contactăm cu oferta finală.
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-text-dark">
                Produse similare
              </h2>
              <p className="mt-2 text-sm text-text-muted">Alte idei pe care le poți configura.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      {viewerOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-6">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Închide"
            onClick={() => setViewerOpen(false)}
          />
          <div className="relative w-full max-w-6xl">
            <div className="pointer-events-none absolute -top-12 left-0 right-0 flex items-center justify-center gap-3">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-white backdrop-blur">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className={['inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10', zoom <= 1 ? 'opacity-60' : 'hover:bg-white/15'].join(' ')}
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-20 text-center text-xs font-semibold">{Math.round(zoom * 100)}%</div>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className={['inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10', zoom >= 4 ? 'opacity-60' : 'hover:bg-white/15'].join(' ')}
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-semibold hover:bg-white/15"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setViewerOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/15"
                  aria-label="Închide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur">
              <div
                ref={viewerBoxRef}
                className="flex max-h-[82vh] items-center justify-center overflow-hidden"
                onPointerDown={onViewerPointerDown}
                onPointerMove={onViewerPointerMove}
                onPointerUp={onViewerPointerUp}
                onPointerCancel={onViewerPointerUp}
              >
                <img
                  ref={viewerImgRef}
                  src={activeImg}
                  alt={product.name}
                  style={{ transform: `translate(${Math.round(pan.x)}px, ${Math.round(pan.y)}px) scale(${zoom})` }}
                  className={[
                    'block max-h-[82vh] max-w-full select-none object-contain',
                    zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
                  ].join(' ')}
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

