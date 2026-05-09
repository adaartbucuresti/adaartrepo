import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase.js'

const tabs = [
  { key: 'toate', label: 'Toate' },
  { key: 'nou', label: 'Noi' },
  { key: 'in_lucru', label: 'În lucru' },
  { key: 'finalizat', label: 'Finalizate' },
  { key: 'anulat', label: 'Anulate' },
]

const statusLabel = {
  nou: 'Nou',
  in_lucru: 'În lucru',
  finalizat: 'Finalizat',
  anulat: 'Anulat',
}

const statusBadgeClass = {
  nou: 'bg-brand-light text-brand-dark ring-1 ring-brand-primary/30',
  in_lucru: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
  finalizat: 'bg-blue-100 text-blue-900 ring-1 ring-blue-200',
  anulat: 'bg-red-100 text-red-900 ring-1 ring-red-200',
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function AdminRequests() {
  const MotionDiv = motion.div
  const MotionButton = motion.button
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('toate')
  const [q, setQ] = useState('')
  const [lastNewRequest, setLastNewRequest] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalCount, setTotalCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const [stats, setStats] = useState({ total: 0, nou: 0, inLucru: 0, finalizat: 0 })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveOk, setSaveOk] = useState('')

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const searchTimerRef = useRef(null)
  const pageRef = useRef(1)

  const loadStats = async () => {
    const qs = [
      supabase.from('configurator_requests').select('id', { count: 'exact', head: true }),
      supabase.from('configurator_requests').select('id', { count: 'exact', head: true }).eq('status', 'nou'),
      supabase.from('configurator_requests').select('id', { count: 'exact', head: true }).eq('status', 'in_lucru'),
      supabase.from('configurator_requests').select('id', { count: 'exact', head: true }).eq('status', 'finalizat'),
    ]
    const [all, nou, inLucru, finalizat] = await Promise.all(qs)
    setStats({
      total: all.count || 0,
      nou: nou.count || 0,
      inLucru: inLucru.count || 0,
      finalizat: finalizat.count || 0,
    })
  }

  const load = async (pageArg = page, overrides = {}) => {
    setLoading(true)
    setError('')
    const from = (pageArg - 1) * pageSize
    const to = from + pageSize - 1

    const active = overrides.activeTab ?? activeTab
    const queryValue = overrides.q ?? q

    let query = supabase
      .from('configurator_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (active && active !== 'toate') query = query.eq('status', active)

    const queryText = String(queryValue || '').trim()
    if (queryText) {
      const safe = queryText.replaceAll(',', ' ')
      query = query.or(
        [
          `client_name.ilike.%${safe}%`,
          `client_email.ilike.%${safe}%`,
          `client_phone.ilike.%${safe}%`,
          `product_type.ilike.%${safe}%`,
          `material.ilike.%${safe}%`,
          `color.ilike.%${safe}%`,
        ].join(','),
      )
    }

    const { data, count, error: fetchError } = await query.range(from, to)
    if (fetchError) {
      setError(fetchError.message)
      setRows([])
      setTotalCount(0)
    } else {
      setRows(data || [])
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      load(1)
      loadStats()
    })
  }, [])

  useEffect(() => {
    if (typeof supabase.channel !== 'function') return
    let alive = true
    const channel = supabase
      .channel('admin_requests_inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'configurator_requests' },
        (payload) => {
          if (!alive) return
          const row = payload?.new || null
          setLastNewRequest(row)
          setPage(1)
          Promise.resolve().then(() => {
            load(1)
            loadStats()
          })
        },
      )
      .subscribe()
    return () => {
      alive = false
      try {
        supabase.removeChannel(channel)
      } catch {
      }
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => load(page))
  }, [page])

  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
    }
  }, [])

  const goToPage = (nextPage) => {
    const safe = Math.min(totalPages, Math.max(1, nextPage))
    setPage(safe)
  }

  const onChangeTab = (key) => {
    setActiveTab(key)
    if (pageRef.current === 1) {
      Promise.resolve().then(() => load(1, { activeTab: key, q }))
    } else {
      setPage(1)
    }
  }

  const onChangeQuery = (value) => {
    setQ(value)
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current)
    searchTimerRef.current = window.setTimeout(() => {
      if (pageRef.current === 1) {
        Promise.resolve().then(() => load(1, { activeTab, q: value }))
      } else {
        setPage(1)
      }
    }, 250)
  }

  const openDelete = (row) => {
    setDeleteError('')
    setDeleteTarget(row)
    setDeleteOpen(true)
  }

  const doDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase
      .from('configurator_requests')
      .delete()
      .eq('id', deleteTarget.id)
    if (delError) {
      setDeleteError(delError.message)
      setDeleting(false)
      return
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
    setDeleting(false)
    setPage(1)
    await load(1)
    await loadStats()
  }

  const doDeleteAll = async () => {
    setDeleting(true)
    setDeleteError('')
    const { error: delError } = await supabase
      .from('configurator_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (delError) {
      setDeleteError(delError.message)
      setDeleting(false)
      return
    }
    setDeleteAllOpen(false)
    setDeleting(false)
    setPage(1)
    await load(1)
    await loadStats()
  }

  useEffect(() => {
    if (!lastNewRequest) return
    const id = window.setTimeout(() => setLastNewRequest(null), 6500)
    return () => window.clearTimeout(id)
  }, [lastNewRequest])

  const openDrawer = (row) => {
    setSaveError('')
    setSaveOk('')
    setSelected({
      ...row,
      final_price: row.final_price ?? '',
      admin_notes: row.admin_notes ?? '',
    })
    setDrawerOpen(true)
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setSaveError('')
    setSaveOk('')
    const payload = {
      status: selected.status,
      final_price: selected.final_price === '' ? null : Number(selected.final_price),
      admin_notes: selected.admin_notes || null,
    }
    const { error: updateError } = await supabase
      .from('configurator_requests')
      .update(payload)
      .eq('id', selected.id)
    if (updateError) {
      setSaveError(updateError.message)
    } else {
      setSaveOk('Salvat.')
      await load(page)
      await loadStats()
    }
    setSaving(false)
  }

  const pageButtons = useMemo(() => {
    const maxButtons = 7
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const buttons = new Set([1, totalPages])
    for (let p = page - 2; p <= page + 2; p += 1) {
      if (p > 1 && p < totalPages) buttons.add(p)
    }
    return Array.from(buttons).sort((a, b) => a - b)
  }, [page, totalPages])

  return (
    <div>
      {lastNewRequest ? (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-soft"
        >
          <div className="text-xs font-semibold text-text-dark">Cerere nouă primită</div>
          <div className="mt-1 text-xs text-text-muted">
            {[lastNewRequest.client_name, lastNewRequest.product_type].filter(Boolean).join(' · ')}
          </div>
        </MotionDiv>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-xs text-text-muted">Total cereri</div>
          <div className="mt-2 text-2xl font-semibold text-text-dark">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            Cereri noi
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-primary" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-dark">{stats.nou}</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-xs text-text-muted">În lucru</div>
          <div className="mt-2 text-2xl font-semibold text-text-dark">{stats.inLucru}</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="text-xs text-text-muted">Finalizate</div>
          <div className="mt-2 text-2xl font-semibold text-text-dark">{stats.finalizat}</div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const active = t.key === activeTab
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onChangeTab(t.key)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  active ? 'bg-brand-light text-brand-dark' : 'bg-white text-text-muted hover:text-text-dark',
                  'border border-border',
                ].join(' ')}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            value={q}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="Caută client/produs/email…"
            className="w-full min-w-[200px] text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-text-muted">
          Total rezultate: <span className="font-semibold text-text-dark">{totalCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDeleteError('')
              setDeleteAllOpen(true)
            }}
            disabled={loading || totalCount === 0}
            className={[
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition',
              loading || totalCount === 0
                ? 'border-border bg-cream text-text-muted'
                : 'border-red-200 bg-white text-red-700 hover:bg-red-50',
            ].join(' ')}
          >
            <Trash2 className="h-4 w-4" />
            Șterge toate
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-cream text-xs font-semibold text-text-muted">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Produs</th>
                <th className="px-4 py-3">Dimensiuni</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Culoare</th>
                <th className="px-4 py-3">Preț estimativ</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-text-muted">
                    Se încarcă…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-text-muted">
                    Nu există cereri.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-warm/40">
                    <td className="px-4 py-3 text-xs text-text-muted">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-dark">{r.client_name}</div>
                      <div className="text-xs text-text-muted">{r.client_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-text-dark">{r.product_type}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {r.width_cm}×{r.height_cm}×{r.depth_cm} cm
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{r.material}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{r.color}</td>
                    <td className="px-4 py-3 font-semibold text-text-dark">{r.estimated_price} RON</td>
                    <td className="px-4 py-3">
                      <span className={['inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusBadgeClass[r.status] || 'bg-cream text-text-dark'].join(' ')}>
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDrawer(r)}
                          className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark transition hover:bg-cream"
                        >
                          Detalii
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(r)}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Șterge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-text-muted">
          Pagina <span className="font-semibold text-text-dark">{page}</span> din{' '}
          <span className="font-semibold text-text-dark">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1 || loading}
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition hover:bg-cream',
              page <= 1 || loading ? 'opacity-50' : '',
            ].join(' ')}
            aria-label="Pagina anterioară"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageButtons.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              disabled={loading}
              className={[
                'h-9 min-w-9 rounded-full border px-3 text-xs font-semibold transition',
                p === page ? 'border-brand-primary bg-brand-light text-brand-dark' : 'border-border bg-white text-text-dark hover:bg-cream',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || loading}
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition hover:bg-cream',
              page >= totalPages || loading ? 'opacity-50' : '',
            ].join(' ')}
            aria-label="Pagina următoare"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && selected ? (
          <MotionDiv
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-label="Închide"
            />
            <MotionDiv
              className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-softLg"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.25 } }}
              exit={{ x: 40, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div>
                  <div className="text-xs text-text-muted">Cerere</div>
                  <div className="font-heading text-xl font-semibold text-text-dark">{selected.client_name}</div>
                  <div className="mt-1 text-xs text-text-muted">{formatDate(selected.created_at)}</div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-border bg-cream p-4">
                    <div className="text-xs font-semibold text-text-muted">Detalii client</div>
                    <div className="mt-2 text-sm text-text-dark">
                      <div>
                        <span className="font-semibold">Email:</span> {selected.client_email}
                      </div>
                      <div className="mt-1">
                        <span className="font-semibold">Telefon:</span> {selected.client_phone}
                      </div>
                      {selected.client_notes ? (
                        <div className="mt-2 text-xs text-text-muted">{selected.client_notes}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="text-xs font-semibold text-text-muted">Configurație</div>
                    <div className="mt-3 grid gap-2 text-sm text-text-dark">
                      <div>
                        <span className="font-semibold">Produs:</span> {selected.product_type}
                      </div>
                      <div>
                        <span className="font-semibold">Dimensiuni:</span> {selected.width_cm}×{selected.height_cm}×{selected.depth_cm} cm
                      </div>
                      <div>
                        <span className="font-semibold">Material:</span> {selected.material}
                      </div>
                      <div>
                        <span className="font-semibold">Culoare:</span> {selected.color}
                      </div>
                      <div className="text-xs text-text-muted">
                        <span className="font-semibold">Extra:</span>{' '}
                        {Array.isArray(selected.extras) && selected.extras.length ? selected.extras.join(', ') : '—'}
                      </div>
                      <div className="mt-2 rounded-xl bg-brand-light px-3 py-2 text-sm font-semibold text-brand-dark">
                        Preț estimativ: {selected.estimated_price} RON
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Preț final confirmat (RON)</label>
                        <input
                          value={selected.final_price}
                          onChange={(e) => setSelected((p) => ({ ...p, final_price: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Note admin</label>
                        <textarea
                          value={selected.admin_notes}
                          onChange={(e) => setSelected((p) => ({ ...p, admin_notes: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Status</label>
                        <select
                          value={selected.status}
                          onChange={(e) => setSelected((p) => ({ ...p, status: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                        >
                          <option value="nou">Nou</option>
                          <option value="in_lucru">În lucru</option>
                          <option value="finalizat">Finalizat</option>
                          <option value="anulat">Anulat</option>
                        </select>
                      </div>

                      {saveError ? <div className="text-xs text-red-600">{saveError}</div> : null}
                      {saveOk ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-dark">
                          <Check className="h-4 w-4" />
                          {saveOk}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className={[
                          'inline-flex w-full items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white transition',
                          saving ? 'bg-brand-primary/60' : 'bg-brand-primary hover:bg-brand-mid',
                        ].join(' ')}
                      >
                        {saving ? 'Se salvează…' : 'Salvează modificările'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionButton
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                if (deleting) return
                setDeleteOpen(false)
                setDeleteTarget(null)
              }}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">Șterge cererea</div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                  onClick={() => {
                    if (deleting) return
                    setDeleteOpen(false)
                    setDeleteTarget(null)
                  }}
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-6">
                <div className="text-sm text-text-dark">
                  Sigur vrei să ștergi această cerere? Acțiunea este permanentă.
                </div>
                {deleteTarget ? (
                  <div className="mt-3 rounded-xl bg-cream px-4 py-3 text-xs text-text-muted">
                    <div className="font-semibold text-text-dark">{deleteTarget.client_name}</div>
                    <div className="mt-1">{deleteTarget.product_type}</div>
                  </div>
                ) : null}
                {deleteError ? <div className="mt-3 text-xs text-red-600">{deleteError}</div> : null}
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream"
                    onClick={() => {
                      if (deleting) return
                      setDeleteOpen(false)
                      setDeleteTarget(null)
                    }}
                  >
                    Anulează
                  </button>
                  <button
                    type="button"
                    onClick={doDelete}
                    disabled={deleting}
                    className={[
                      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition',
                      deleting ? 'bg-red-600/60' : 'bg-red-600 hover:bg-red-700',
                    ].join(' ')}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Se șterge…' : 'Șterge'}
                  </button>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteAllOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionButton
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                if (deleting) return
                setDeleteAllOpen(false)
              }}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="font-heading text-xl font-semibold text-text-dark">Șterge toate cererile</div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                  onClick={() => {
                    if (deleting) return
                    setDeleteAllOpen(false)
                  }}
                  aria-label="Închide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-6">
                <div className="text-sm text-text-dark">
                  Sigur vrei să ștergi toate cererile? Acțiunea este permanentă.
                </div>
                {deleteError ? <div className="mt-3 text-xs text-red-600">{deleteError}</div> : null}
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark hover:bg-cream"
                    onClick={() => {
                      if (deleting) return
                      setDeleteAllOpen(false)
                    }}
                  >
                    Anulează
                  </button>
                  <button
                    type="button"
                    onClick={doDeleteAll}
                    disabled={deleting}
                    className={[
                      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition',
                      deleting ? 'bg-red-600/60' : 'bg-red-600 hover:bg-red-700',
                    ].join(' ')}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? 'Se șterg…' : 'Șterge tot'}
                  </button>
                </div>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

