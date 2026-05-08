import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabase.js'

const statusLabel = {
  nou: 'În așteptare',
  in_lucru: 'În lucru',
  finalizat: 'Acceptată',
  anulat: 'Anulată',
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

export default function MyAccountPage() {
  const MotionDiv = motion.div
  const { user, profile, loading, signOut } = useAuth()
  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState('')

  const email = String(user?.email || '').trim()

  useEffect(() => {
    if (!user || !email) return
    let alive = true

    const load = async () => {
      setRequestsLoading(true)
      setRequestsError('')
      const { data, error } = await supabase
        .from('configurator_requests')
        .select('*')
        .eq('client_email', email)
        .order('created_at', { ascending: false })

      if (!alive) return
      if (error) {
        setRequestsError(error.message)
        setRequests([])
      } else {
        setRequests(data || [])
      }
      setRequestsLoading(false)
    }

    Promise.resolve().then(load)
    return () => {
      alive = false
    }
  }, [email, user])

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Cont'
  const createdAt = user?.created_at ? formatDate(user.created_at) : ''

  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'nou').length
    const inProgress = requests.filter((r) => r.status === 'in_lucru').length
    const done = requests.filter((r) => r.status === 'finalizat').length
    const cancelled = requests.filter((r) => r.status === 'anulat').length
    return { total, pending, inProgress, done, cancelled }
  }, [requests])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link className="hover:text-brand-mid" to="/">
            Acasă
          </Link>
          <span>/</span>
          <span className="text-text-dark">Contul meu</span>
        </div>

        <MotionDiv
          className="mt-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">Contul meu</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Aici găsești detaliile contului și starea cererilor trimise prin configurator.
          </p>
        </MotionDiv>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft lg:col-span-1">
            <div className="text-sm font-semibold text-text-dark">Informații cont</div>
            <div className="mt-4 grid gap-2 text-sm text-text-dark">
              <div>
                <span className="text-xs font-semibold text-text-muted">Nume</span>
                <div className="mt-1 font-semibold">{displayName}</div>
              </div>
              <div className="mt-2">
                <span className="text-xs font-semibold text-text-muted">Email</span>
                <div className="mt-1 font-semibold">{email}</div>
              </div>
              {createdAt ? (
                <div className="mt-2">
                  <span className="text-xs font-semibold text-text-muted">Creat</span>
                  <div className="mt-1">{createdAt}</div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={signOut}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-text-dark transition hover:bg-cream"
            >
              Ieși din cont
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-dark">Cererile mele</div>
                  <div className="mt-1 text-xs text-text-muted">
                    Total: {stats.total} • În așteptare: {stats.pending} • În lucru: {stats.inProgress} • Acceptate: {stats.done} • Anulate: {stats.cancelled}
                  </div>
                </div>
                <Link
                  to="/configurator"
                  className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
                >
                  Trimite cerere nouă
                </Link>
              </div>

              {requestsLoading ? (
                <div className="mt-6 text-sm text-text-muted">Se încarcă…</div>
              ) : requestsError ? (
                <div className="mt-6 text-sm text-red-600">{requestsError}</div>
              ) : requests.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-border bg-cream p-6 text-sm text-text-muted">
                  Nu ai încă cereri. Poți trimite una din configurator.
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {requests.map((r) => {
                    const status = r.status || 'nou'
                    const label = statusLabel[status] || status
                    const badge = statusBadgeClass[status] || 'bg-cream text-text-muted ring-1 ring-border'

                    const dims =
                      r.width_cm && r.height_cm && r.depth_cm
                        ? `${r.width_cm}×${r.height_cm}×${r.depth_cm} cm`
                        : ''

                    const price =
                      r.final_price != null
                        ? `${r.final_price} RON`
                        : r.estimated_price != null
                          ? `~${r.estimated_price} RON`
                          : ''

                    return (
                      <div key={r.id} className="rounded-2xl border border-border bg-white p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate font-heading text-lg font-semibold text-text-dark">
                                {r.product_type || 'Cerere configurator'}
                              </div>
                              <span className={['inline-flex rounded-full px-3 py-1 text-xs font-semibold', badge].join(' ')}>
                                {label}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-text-muted">
                              {formatDate(r.created_at)}
                              {dims ? ` • ${dims}` : ''}
                              {price ? ` • ${price}` : ''}
                            </div>
                            {r.admin_notes ? (
                              <div className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm text-text-dark">
                                {r.admin_notes}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

