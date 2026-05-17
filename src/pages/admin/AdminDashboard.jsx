import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardList, Home, LayoutGrid, LogOut, MessageSquare, Package, PanelsTopLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'
import { supabase } from '../../lib/supabase.js'

const navItems = [
  { to: '/admin/cereri', label: 'Cereri configurator', icon: ClipboardList },
  { to: '/admin/produse', label: 'Produse', icon: Package },
  { to: '/admin/carousel', label: 'Carousel', icon: PanelsTopLeft },
  { to: '/admin/testimoniale', label: 'Testimoniale', icon: MessageSquare },
]

const titleByPath = (pathname) => {
  if (pathname.includes('/admin/produse')) return 'Produse'
  if (pathname.includes('/admin/carousel')) return 'Carousel'
  if (pathname.includes('/admin/testimoniale')) return 'Testimoniale'
  return 'Cereri configurator'
}

export default function AdminDashboard() {
  const MotionDiv = motion.div
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const [newCount, setNewCount] = useState(0)
  const [lastNewRequest, setLastNewRequest] = useState(null)
  const [metrics, setMetrics] = useState({ online: 0, visitors: 0, accounts: 0 })
  const [metricsError, setMetricsError] = useState('')

  useEffect(() => {
    let alive = true
    supabase
      .from('configurator_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'nou')
      .then(({ count }) => {
        if (!alive) return
        setNewCount(count || 0)
      })
    return () => {
      alive = false
    }
  }, [pathname])

  useEffect(() => {
    if (typeof supabase.channel !== 'function') return
    let alive = true
    const channel = supabase
      .channel('admin_configurator_requests_inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'configurator_requests' },
        (payload) => {
          if (!alive) return
          const row = payload?.new || null
          setLastNewRequest(row)
          setNewCount((c) => c + 1)
          try {
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              window.Notification?.permission === 'granted' &&
              row
            ) {
              const title = 'Cerere nouă configurator'
              const body = [row.client_name, row.product_type].filter(Boolean).join(' · ')
              new window.Notification(title, { body })
            }
          } catch {
          }
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
    if (!lastNewRequest) return
    const id = window.setTimeout(() => setLastNewRequest(null), 6500)
    return () => window.clearTimeout(id)
  }, [lastNewRequest])

  useEffect(() => {
    let alive = true
    let intervalId = 0
    const load = async () => {
      try {
        setMetricsError('')
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData?.session?.access_token
        const { data, error } = await supabase.functions.invoke('site-metrics', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          body: { action: 'stats' },
        })
        if (!alive) return
        if (error) throw error
        if (!data?.ok) throw new Error(data?.error || 'Nu am putut încărca statisticile.')
        setMetrics({
          online: Number(data?.online_now || 0),
          visitors: Number(data?.visitors_total || 0),
          accounts: Number(data?.accounts_total || 0),
        })
      } catch (err) {
        if (!alive) return
        setMetricsError(err?.message || 'Nu am putut încărca statisticile.')
      }
    }
    Promise.resolve().then(load)
    intervalId = window.setInterval(load, 15_000)
    return () => {
      alive = false
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [])

  const today = useMemo(() => {
    return new Date().toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  const title = titleByPath(pathname)

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(2,6,23,0.08),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(15,23,42,0.08),transparent_55%),linear-gradient(to_bottom,#FAF9F6,#FFFFFF)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-shrink-0 bg-[linear-gradient(180deg,#0B1220_0%,#020617_100%)] text-white lg:flex lg:flex-col">
          <div className="relative px-6 py-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(255,255,255,0.10),transparent_55%)]" />
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold tracking-wide text-white/90">Admin</div>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                Dashboard
              </span>
            </div>
          </div>

          <nav className="mt-1 flex flex-1 flex-col gap-1 px-3">
            {navItems.map((it) => {
              const Icon = it.icon
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/admin/cereri'}
                >
                  {({ isActive }) => (
                    <div
                      className={[
                        'relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                        'hover:bg-white/10 active:bg-white/15',
                        isActive ? 'text-white' : 'text-white/85',
                      ].join(' ')}
                    >
                      {isActive ? (
                        <MotionDiv
                          layoutId="adminNavActive"
                          className="absolute inset-0 rounded-2xl bg-white/10"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-white/90" />
                      </span>
                      <span className="relative">{it.label}</span>
                      {isActive ? (
                        <span className="relative ml-auto h-2 w-2 rounded-full bg-brand-light" />
                      ) : null}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <Home className="h-4 w-4" />
              Revino pe homepage
            </Link>

            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                <LayoutGrid className="h-5 w-5 text-white/90" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{profile?.full_name || 'Admin'}</div>
                <div className="truncate text-xs text-white/70">{profile?.email || ''}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Ieși
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {lastNewRequest ? (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pointer-events-none fixed right-6 top-6 z-50 hidden max-w-[420px] rounded-2xl border border-border bg-white/90 px-4 py-3 shadow-softLg backdrop-blur lg:block"
            >
              <div className="text-xs font-semibold text-text-dark">Cerere nouă primită</div>
              <div className="mt-1 text-xs text-text-muted">
                {[lastNewRequest.client_name, lastNewRequest.product_type].filter(Boolean).join(' · ')}
              </div>
              <div className="mt-2 text-[10px] font-semibold text-text-muted">
                Deschide pagina „Cereri configurator” pentru detalii.
              </div>
            </MotionDiv>
          ) : null}

          <header className="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.02))]">
                  <LayoutGrid className="h-5 w-5 text-brand-dark" />
                </div>
                <div>
                  <div className="font-heading text-xl font-semibold text-text-dark">{title}</div>
                  <div className="text-xs text-text-muted">{today}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="hidden items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark transition hover:bg-cream sm:inline-flex"
                >
                  <Home className="h-4 w-4 text-text-muted" />
                  Revino pe homepage
                </Link>

                <div className="hidden items-center gap-2 md:flex">
                  <div className="rounded-2xl border border-border bg-white px-4 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Online acum</div>
                    <div className="mt-0.5 text-sm font-semibold text-text-dark">{metrics.online}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Vizitatori total</div>
                    <div className="mt-0.5 text-sm font-semibold text-text-dark">{metrics.visitors}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">Conturi create</div>
                    <div className="mt-0.5 text-sm font-semibold text-text-dark">{metrics.accounts}</div>
                  </div>
                </div>

                <div className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-dark">
                  Cereri noi:{' '}
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-brand-light px-2 py-0.5 text-brand-dark">
                    {newCount}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {metricsError ? (
              <div className="mb-4 rounded-2xl border border-border bg-white px-4 py-3 text-xs text-red-600">
                {metricsError}
              </div>
            ) : null}
            <AnimatePresence mode="wait">
              <MotionDiv
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </MotionDiv>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

