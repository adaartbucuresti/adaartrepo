export default function ConfiguratorSummary({ summary, estimatedPrice }) {
  const entries = [
    { label: 'Produs', value: summary.productType },
    { label: 'Produs selectat', value: summary.productName },
    { label: 'Dimensiuni', value: summary.dimensionsLabel },
    { label: 'Material', value: summary.materialLabel },
    { label: 'Culoare/Finisaj', value: summary.colorLabel },
    { label: 'Opțiuni extra', value: summary.extrasLabel },
    { label: 'Nume', value: summary.fullName },
    { label: 'Telefon', value: summary.phone },
    { label: 'Email', value: summary.email },
  ].filter((e) => e.value)

  return (
    <aside className="sticky top-20 hidden h-fit lg:block">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="text-sm font-semibold text-text-dark">Configurația ta</div>

        <div className="mt-4 space-y-3">
          {entries.map((e) => (
            <div key={e.label} className="flex items-start justify-between gap-4">
              <div className="text-xs text-text-muted">{e.label}</div>
              <div className="text-right text-xs font-medium text-text-dark">
                {e.value}
              </div>
            </div>
          ))}
        </div>

        <div className="my-5 h-px bg-[rgba(0,0,0,0.06)]" />

        <div className="flex items-end justify-between gap-4">
          <div className="text-xs text-text-muted">Preț estimativ</div>
          <div className="text-2xl font-semibold text-brand-mid">
            {estimatedPrice.toLocaleString('ro-RO')} RON
          </div>
        </div>

        <div className="mt-3 text-xs italic text-text-muted">
          * Prețul final este confirmat după consultarea cu un specialist
        </div>
      </div>
    </aside>
  )
}

