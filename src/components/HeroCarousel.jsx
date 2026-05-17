import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroSlides } from '../data/products.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const wordStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const wordUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HeroCarousel() {
  const MotionDiv = motion.div
  const MotionH1 = motion.h1
  const MotionSpan = motion.span
  const MotionP = motion.p
  const [slides, setSlides] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [hovering, setHovering] = useState(false)

  const slidesToUse = isSupabaseConfigured ? slides : heroSlides

  const active = slidesToUse[index] || slidesToUse[0]

  const go = (dir) => {
    setIndex((prev) => {
      const next = prev + dir
      if (next < 0) return slidesToUse.length - 1
      if (next >= slidesToUse.length) return 0
      return next
    })
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    setLoading(true)
    Promise.resolve().then(async () => {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (!alive) return

      if (error) {
        setSlides([])
        setIndex(0)
        setLoading(false)
        return
      }

      const mapped = (data || []).map((s) => ({
        id: s.id,
        title: s.title || '',
        subtitle: s.subtitle || '',
        cta: s.cta_text || 'Configurează acum',
        ctaLink: s.cta_link || '/configurator',
        image: s.image_url,
        accent: s.accent_badge || '',
      }))
      setSlides(mapped.filter((x) => x.image))
      setIndex(0)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (slidesToUse.length <= 1) return
    if (hovering) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slidesToUse.length)
    }, 7000)
    return () => window.clearInterval(id)
  }, [slidesToUse.length, hovering])

  const titleLines = useMemo(() => (active?.title ? active.title.split('\n') : []), [active?.title])

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-cream"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {loading ? (
        <>
          <div className="absolute inset-0 bg-warm" />
          <div className="relative mx-auto flex h-full max-w-6xl items-center px-4">
            <div className="w-full max-w-xl">
              <div className="h-8 w-40 rounded-full bg-white/20" />
              <div className="mt-6 space-y-4">
                <div className="h-12 w-full rounded bg-white/15" />
                <div className="h-12 w-5/6 rounded bg-white/15" />
              </div>
              <div className="mt-6 h-5 w-4/5 rounded bg-white/10" />
              <div className="mt-10 flex items-center gap-3">
                <div className="h-11 w-40 rounded-full bg-white/20" />
                <div className="h-11 w-36 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </>
      ) : !active ? null : (
        <>
          <AnimatePresence mode="wait">
            <MotionDiv
              key={active.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
              <div className="absolute inset-0">
                <img
                  src={active.image}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              </div>

              <div className="relative mx-auto flex h-full max-w-6xl items-center px-4">
                <div className="max-w-xl">
                  <div className="mb-5 inline-flex rounded-full bg-brand-primary/90 px-4 py-2 text-xs font-semibold tracking-wide text-white">
                    {active.accent}
                  </div>

                  <MotionH1
                    className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl"
                    variants={wordStagger}
                    initial="hidden"
                    animate="visible"
                  >
                    {titleLines.map((line, lineIdx) => (
                      <span key={lineIdx} className="block">
                        {line.split(' ').map((w, i) => (
                          <MotionSpan
                            key={`${lineIdx}-${i}`}
                            className="inline-block"
                            variants={wordUp}
                          >
                            {w}
                            <span className="inline-block w-2" />
                          </MotionSpan>
                        ))}
                      </span>
                    ))}
                  </MotionH1>

                  <MotionP
                    className="mt-5 max-w-lg text-base leading-relaxed text-white md:text-lg"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, delay: 0.1 },
                    }}
                  >
                    {active.subtitle}
                  </MotionP>

                  <MotionDiv
                    className="mt-8 flex items-center gap-3"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, delay: 0.15 },
                    }}
                  >
                    <Link
                      to={active.ctaLink}
                      className="inline-flex items-center justify-center rounded-full bg-brand-mid px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-primary"
                    >
                      {active.cta}
                    </Link>
                    <Link
                      to="/produse"
                      className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
                    >
                      Descoperă
                    </Link>
                  </MotionDiv>
                </div>
              </div>
            </MotionDiv>
          </AnimatePresence>

          <button
            type="button"
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/15"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Slide următor"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/15"
            onClick={() => go(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slidesToUse.map((s, i) => {
              const activeDot = i === index
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Mergi la slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={[
                    'h-2.5 rounded-full transition-all',
                    activeDot ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70',
                  ].join(' ')}
                />
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

