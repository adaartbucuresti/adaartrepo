import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { categories, products } from '../data/products.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const noteText =
  'Toate produsele sunt realizate la comandă. Nu există stoc. Configurezi, trimiți cererea, și un specialist te contactează cu oferta personalizată.'

export default function ProductsPage() {
  const MotionDiv = motion.div
  const [params, setParams] = useSearchParams()
  const selected = params.get('category') || 'Toate'
  const [items, setItems] = useState(() => (isSupabaseConfigured ? [] : products))
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [loadError, setLoadError] = useState('')

  const filtered = useMemo(() => {
    if (!selected || selected === 'Toate') return items
    return items.filter((p) => p.category === selected)
  }, [items, selected])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    setLoading(true)
    setLoadError('')

    Promise.resolve()
      .then(async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (!alive) return
        if (error) {
          setLoadError(error.message)
          setItems([])
          setLoading(false)
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
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const setCategory = (c) => {
    if (!c || c === 'Toate') {
      params.delete('category')
      setParams(params, { replace: true })
      return
    }
    setParams({ category: c }, { replace: true })
  }

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Link className="hover:text-brand-mid" to="/">
              Acasă
            </Link>
            <span>/</span>
            <span className="text-text-dark">Produse</span>
          </div>
        </div>

        <MotionDiv
          className="mt-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Produse
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Inspiră-te din modele. Fiecare piesă se realizează la comandă, prin configurator.
          </p>
        </MotionDiv>

        <div className="mt-6 rounded-xl border-l-4 border-brand-primary bg-brand-light px-4 py-3 text-sm text-brand-dark">
          <span className="font-medium">🛠</span> <span className="italic">{noteText}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === selected || (selected === 'Toate' && c === 'Toate')
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-text-dark ring-1 ring-border hover:bg-brand-light',
                ].join(' ')}
              >
                {c}
              </button>
            )
          })}
        </div>

        <MotionDiv
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
              >
                <div className="aspect-[4/3] bg-warm animate-pulse" />
                <div className="p-6">
                  <div className="h-3 w-24 rounded bg-warm animate-pulse" />
                  <div className="mt-4 h-5 w-48 rounded bg-warm animate-pulse" />
                  <div className="mt-3 h-4 w-32 rounded bg-warm animate-pulse" />
                  <div className="mt-6 h-10 w-full rounded-xl bg-warm animate-pulse" />
                </div>
              </div>
            ))
          ) : loadError ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-white p-6 text-sm text-red-600">
              {loadError}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-border bg-white p-6 text-sm text-text-muted">
              Nu există produse pentru filtrul selectat.
            </div>
          ) : (
            filtered.map((p) => (
              <MotionDiv key={p.id} variants={fadeUp}>
                <ProductCard product={p} />
              </MotionDiv>
            ))
          )}
        </MotionDiv>
      </div>
    </div>
  )
}

