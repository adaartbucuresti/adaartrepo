import { motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { lockBodyScroll } from '../lib/lockBodyScroll.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function PortfolioPage() {
  const MotionDiv = motion.div
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const viewerBoxRef = useRef(null)
  const viewerImgRef = useRef(null)
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 })
  const measureRef = useRef({ baseW: 0, baseH: 0, boxW: 0, boxH: 0 })

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError('')
      if (!isSupabaseConfigured) {
        setItems([])
        setLoading(false)
        return
      }
      const { data, error: fetchError } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (!alive) return
      if (fetchError) {
        setError(fetchError.message)
        setItems([])
      } else {
        setItems(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    }
    Promise.resolve().then(load)
    return () => {
      alive = false
    }
  }, [])

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
  }, [viewerOpen, viewerUrl])

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
  }, [viewerOpen, viewerUrl, zoom])

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

  const openViewer = (url) => {
    const next = String(url || '').trim()
    if (!next) return
    setViewerUrl(next)
    setViewerOpen(true)
  }

  return (
    <div className="bg-cream">
      <section className="bg-[radial-gradient(900px_circle_at_20%_0%,rgba(198,139,89,0.18),transparent_55%),radial-gradient(800px_circle_at_90%_10%,rgba(15,23,42,0.10),transparent_55%),linear-gradient(to_bottom,#F6F1EA,#FAF9F6)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark">
              <span className="h-2 w-2 rounded-full bg-brand-mid" />
              Portofoliu
            </div>
            <h1 className="mt-5 font-heading text-4xl font-semibold text-text-dark md:text-6xl">
              Ada Art - Portofoliul Nostru
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted md:text-base">
              Lucrări realizate la comandă. Alege stilul care ți se potrivește și cere o ofertă personalizată.
            </p>
          </MotionDiv>

          <div className="mt-10">
            {loading ? (
              <div className="rounded-3xl border border-border bg-white/80 p-10 text-center text-sm text-text-muted shadow-soft backdrop-blur">
                Se încarcă…
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-border bg-white/80 p-10 text-center text-sm text-red-600 shadow-soft backdrop-blur">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-border bg-white/80 p-10 text-center text-sm text-text-muted shadow-soft backdrop-blur">
                Nu există imagini în portofoliu încă.
              </div>
            ) : (
              <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
                {items.map((it) => {
                  const imageUrl = String(it.image_url || '').trim()
                  return (
                    <div key={it.id} className="mb-4 break-inside-avoid">
                      {imageUrl ? (
                        <button
                          type="button"
                          onClick={() => openViewer(imageUrl)}
                          className="group block w-full overflow-hidden rounded-3xl border border-border bg-white/85 shadow-soft backdrop-blur"
                          aria-label="Vezi poza"
                        >
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-full object-cover transition duration-500 group-hover:scale-[1.01]"
                            loading="lazy"
                          />
                        </button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

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
                  className={[
                    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10',
                    zoom <= 1 ? 'opacity-60' : 'hover:bg-white/15',
                  ].join(' ')}
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-20 text-center text-xs font-semibold">{Math.round(zoom * 100)}%</div>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className={[
                    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10',
                    zoom >= 4 ? 'opacity-60' : 'hover:bg-white/15',
                  ].join(' ')}
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
                  src={viewerUrl}
                  alt=""
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
