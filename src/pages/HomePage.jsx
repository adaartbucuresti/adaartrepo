import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryGrid from '../components/CategoryGrid.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import MarqueeBanner from '../components/MarqueeBanner.jsx'
import Testimonials from '../components/Testimonials.jsx'
import { products } from '../data/products.js'
import { buildBaseStructuredData, upsertJsonLdScript } from '../lib/structuredData.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HomePage() {
  const MotionDiv = motion.div
  const [items, setItems] = useState(() => (isSupabaseConfigured ? [] : products))
  const [loadingProducts, setLoadingProducts] = useState(isSupabaseConfigured)
  const [productsError, setProductsError] = useState('')

  useEffect(() => {
    const title = 'Mobila la comanda Bucuresti Sector 2 | Ada Art Design'
    const description =
      'Mobilier la comanda in Bucuresti, Sector 2. Bucatarii, dressing-uri si mobila personalizata. Configurator online. Solicita oferta!'
    const previousTitle = document.title
    document.title = title

    let meta = document.head.querySelector('meta[name="description"]')
    const hadMeta = !!meta
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const previousDescription = meta.getAttribute('content')
    meta.setAttribute('content', description)
    const { graph, websiteId, organizationId, storeId } = buildBaseStructuredData()
    const cleanupJsonLd = upsertJsonLdScript('home-base-schema', {
      '@context': 'https://schema.org',
      '@graph': [
        ...graph,
        {
          '@type': 'WebPage',
          '@id': 'https://adaart.ro/#webpage',
          url: 'https://adaart.ro/',
          name: title,
          description,
          isPartOf: { '@id': websiteId },
          about: { '@id': storeId },
          publisher: { '@id': organizationId },
          inLanguage: 'ro-RO',
        },
      ],
    })

    return () => {
      document.title = previousTitle
      cleanupJsonLd()
      if (!meta) return
      if (!hadMeta) {
        meta.remove()
        return
      }
      if (previousDescription === null) meta.removeAttribute('content')
      else meta.setAttribute('content', previousDescription)
    }
  }, [])

  const categoryCards = useMemo(() => {
    const map = new Map()
    for (const p of items || []) {
      const category = String(p?.category || '').trim()
      if (!category) continue
      const image = String(p?.image || '').trim()
      const current = map.get(category) || { category, image: '', count: 0 }
      current.count += 1
      if (!current.image && image) current.image = image
      map.set(category, current)
    }
    return Array.from(map.values())
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 3)
  }, [items])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    setLoadingProducts(true)
    setProductsError('')
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          setProductsError(error.message || 'Nu am putut încărca produsele.')
          setItems([])
          setLoadingProducts(false)
          return
        }
        const mapped = (data || []).map((p) => {
          const images = Array.isArray(p.images) ? p.images : []
          return {
            id: p.id,
            name: p.name,
            category: p.category,
            priceLabel: p.price_label || `de la ${p.price} RON`,
            description: p.description || '',
            badge: p.badge || '',
            image: images[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200',
            images,
          }
        })
        setItems(mapped)
        setLoadingProducts(false)
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div>
      <HeroCarousel />
      <MarqueeBanner />
      <CategoryGrid />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <MotionDiv
            className="flex items-end justify-between gap-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div>
              <h2 className="font-heading text-3xl font-semibold text-text-dark">
                Categorii produse
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Alege categoria și vezi toate produsele disponibile.
              </p>
            </div>

            <Link
              to="/produse"
              className="hidden items-center gap-2 text-sm font-semibold text-brand-mid hover:text-brand-dark md:inline-flex"
            >
              Vezi toate <ArrowRight className="h-4 w-4" />
            </Link>
          </MotionDiv>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingProducts ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
                >
                  <div className="h-56 w-full animate-pulse bg-cream" />
                  <div className="space-y-3 p-6">
                    <div className="h-3 w-20 animate-pulse rounded bg-cream" />
                    <div className="h-5 w-40 animate-pulse rounded bg-cream" />
                    <div className="h-3 w-28 animate-pulse rounded bg-cream" />
                    <div className="mt-4 h-11 w-full animate-pulse rounded-full bg-cream" />
                  </div>
                </div>
              ))
            ) : productsError ? (
              <div className="rounded-2xl border border-border bg-white p-6 text-sm text-red-600 shadow-soft md:col-span-2 lg:col-span-3">
                {productsError}
              </div>
            ) : categoryCards.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-6 text-sm text-text-muted shadow-soft md:col-span-2 lg:col-span-3">
                Momentan nu sunt produse disponibile.
              </div>
            ) : (
              categoryCards.map((c) => (
                <div
                  key={c.category}
                  className="group overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-softLg"
                >
                  <Link to={`/produse?category=${encodeURIComponent(c.category)}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.category}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.26),rgba(2,6,23,0)_55%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </Link>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold uppercase tracking-widest text-text-dark">
                        {c.category}
                      </div>
                      <div className="inline-flex min-w-8 items-center justify-center rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark ring-1 ring-brand-primary/20">
                        {(c.count || 0) === 1 ? '1 produs' : `${c.count || 0} produse`}
                      </div>
                    </div>
                    <Link
                      to={`/produse?category=${encodeURIComponent(c.category)}`}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-dark py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-primary hover:shadow-lg active:scale-[0.98]"
                    >
                      Vezi produse
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-10 md:hidden">
            <Link
              to="/produse"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-light"
            >
              Vezi toate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="bg-brand-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div className="font-heading text-3xl font-semibold text-white md:text-4xl">
            Gata să îți creezi mobila visată?
          </div>
          <Link
            to="/configurator"
            className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-dark transition hover:bg-brand-light"
          >
            Deschide configuratorul
          </Link>
        </div>
      </section>

      <Testimonials />
    </div>
  )
}

