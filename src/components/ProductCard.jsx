import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const badge = product.badge

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-softLg">
      <Link to={`/produs/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-brand-dark/0 transition-colors duration-300 group-hover:bg-brand-dark/10" />

          {badge ? (
            <div className="absolute left-4 top-4 inline-flex rounded-full bg-brand-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {badge}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="p-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/80">{product.category}</div>
        <Link to={`/produs/${product.id}`} className="mt-1 block">
          <div className="font-heading text-xl font-bold leading-snug text-text-dark transition-colors hover:text-brand-primary">
            {product.name}
          </div>
        </Link>
        <div className="mt-2 text-sm font-bold text-brand-dark">{product.priceLabel}</div>

        <Link
          to={`/configurator?produs=${encodeURIComponent(product.name)}`}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-dark py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-primary hover:shadow-lg active:scale-[0.98]"
        >
          Personalizează
        </Link>
      </div>
    </div>
  )
}

