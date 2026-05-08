import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryGrid from '../components/CategoryGrid.jsx'
import HeroCarousel from '../components/HeroCarousel.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import MarqueeBanner from '../components/MarqueeBanner.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Testimonials from '../components/Testimonials.jsx'
import { products } from '../data/products.js'
import { supabase } from '../lib/supabase.js'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function HomePage() {
  const MotionDiv = motion.div
  const [items, setItems] = useState(products)
  const featured = items.slice(0, 3)

  useEffect(() => {
    let alive = true
    supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!alive) return
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
        if (mapped.length) setItems(mapped)
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
                Produse recomandate
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Inspirație din proiecte populare, configurabile.
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
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
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

