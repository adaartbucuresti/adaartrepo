import { BedDouble, BookOpen, Briefcase, DoorClosed, Layers, Square } from 'lucide-react'
import { Link } from 'react-router-dom'

const items = [
  { label: 'Dulapuri', icon: DoorClosed },
  { label: 'Paturi', icon: BedDouble },
  { label: 'Birouri', icon: Briefcase },
  { label: 'Biblioteci', icon: BookOpen },
  { label: 'Comode', icon: Layers },
  { label: 'Noptiere', icon: Square },
]

export default function CategoryGrid() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="font-heading text-3xl font-semibold text-text-dark">
              Categorii rapide
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Alege tipul de mobilă și mergi direct la produse.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const Icon = c.icon
            return (
              <Link
                key={c.label}
                to={`/produse?category=${encodeURIComponent(c.label)}`}
                className="group flex items-center gap-5 rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-brand-primary/30 hover:shadow-softLg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand-dark transition-all duration-500 group-hover:bg-brand-primary group-hover:text-white group-hover:rotate-12">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text-dark transition-colors group-hover:text-brand-primary">{c.label}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100">Vezi Produse</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

