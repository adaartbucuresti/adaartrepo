export default function MarqueeBanner() {
  const text =
    'Mobilă la comandă · Materiale premium · Garanție 2 ani · Livrare în București · Design personalizat · '

  return (
    <section className="border-y border-border bg-white py-3">
      <div className="overflow-hidden">
        <div
          className="flex w-max whitespace-nowrap"
          style={{ animation: 'marquee 45s linear infinite' }}
        >
          <div className="shrink-0 pr-10 text-sm font-medium tracking-wide text-brand-dark">
            {text.repeat(8)}
          </div>
          <div
            className="shrink-0 pr-10 text-sm font-medium tracking-wide text-brand-dark"
            aria-hidden="true"
          >
            {text.repeat(8)}
          </div>
        </div>
      </div>
    </section>
  )
}

