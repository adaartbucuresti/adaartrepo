import { Check } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { products } from '../data/products.js'
import { supabase } from '../lib/supabase.js'

const noteText =
  'Toate produsele sunt realizate la comandă. Nu există stoc. Configurezi, trimiți cererea, și un specialist te contactează cu oferta personalizată.'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(() => products.find((p) => String(p.id) === String(id)) || null)
  const [similarItems, setSimilarItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [activeIdx, setActiveIdx] = useState(0)

  const images = product?.images?.length ? product.images : product ? [product.image] : []
  const activeImg = images[activeIdx] || images[0]

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
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="aspect-[4/3]">
                <img src={activeImg} alt={product.name} className="h-full w-full object-cover" />
              </div>
            </div>

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
            <div className="mt-3 text-lg font-semibold text-brand-mid">{product.priceLabel}</div>
            <p className="mt-5 text-sm leading-relaxed text-text-muted">{product.description}</p>

            <div className="mt-8 space-y-3 rounded-2xl border border-border bg-white p-6">
              {['Personalizabil', 'Lemn premium', 'Garanție 5 ani', 'Livrare națională'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm text-text-dark">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                    <Check className="h-4 w-4" />
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <Link
              to={`/configurator?produs=${encodeURIComponent(product.name)}`}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
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
    </div>
  )
}

