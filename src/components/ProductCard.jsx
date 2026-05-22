import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const badge = product.badge
  const whatsappPhone = '40722648175'
  const whatsappText = `Salut! Vreau o ofertă pentru: ${product?.name || ''}`
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappText)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-softLg"
    >
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

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:bg-emerald-500 hover:shadow-lg active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="h-4 w-4"
            fill="currentColor"
          >
            <path d="M19.11 17.51c-.26-.13-1.55-.76-1.79-.85-.24-.09-.41-.13-.59.13-.18.26-.68.85-.84 1.03-.15.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.69-1.3-1.54-1.46-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.17-.26.26-.44.09-.18.04-.33-.02-.46-.06-.13-.59-1.42-.81-1.95-.21-.5-.42-.43-.59-.43h-.5c-.17 0-.46.07-.7.33-.24.26-.92.9-.92 2.2s.94 2.55 1.07 2.73c.13.18 1.84 2.81 4.46 3.94.62.27 1.1.43 1.47.55.62.2 1.19.17 1.63.1.5-.08 1.55-.63 1.77-1.25.22-.61.22-1.14.15-1.25-.06-.11-.24-.18-.5-.31z" />
            <path d="M26.67 5.33A14.53 14.53 0 0 0 16 1.33C8.09 1.33 1.67 7.76 1.67 15.67c0 2.52.66 4.98 1.91 7.14L1.33 30.67l8.06-2.12a14.3 14.3 0 0 0 6.61 1.6h.01c7.91 0 14.33-6.43 14.33-14.33 0-3.83-1.49-7.43-4.17-10.09zm-10.66 22.1h-.01c-2.08 0-4.12-.56-5.9-1.63l-.42-.25-4.78 1.26 1.27-4.66-.27-.48a12 12 0 0 1-1.64-6c0-6.63 5.4-12.03 12.04-12.03 3.21 0 6.22 1.25 8.48 3.51a11.92 11.92 0 0 1 3.52 8.49c0 6.63-5.4 12.03-12.29 12.03z" />
          </svg>
          Cere ofertă pe WhatsApp
        </a>

        <div className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-text-muted">SAU</div>

        <Link
          to={`/configurator?produsId=${encodeURIComponent(product.id)}&produs=${encodeURIComponent(product.name)}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-dark py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-primary hover:shadow-lg active:scale-[0.98]"
        >
          Configurează
        </Link>
      </div>
    </motion.div>
  )
}

