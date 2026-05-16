import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutGrid, Menu, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

const noteText =
  'Toate produsele sunt realizate la comandă. Nu există stoc. Configurezi, trimiți cererea, și un specialist te contactează cu oferta personalizată.'

const navLinks = [
  { label: 'Acasă', to: '/' },
  { label: 'Produse', to: '/produse' },
  { label: 'Configurator', to: '/configurator' },
  { label: 'Despre', to: '/despre' },
  { label: 'Contact', to: '/contact' },
]

export default function Navbar() {
  const MotionDiv = motion.div
  const MotionButton = motion.button
  const { pathname } = useLocation()
  const { user, profile, isAdmin, loading, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileOpenPath, setMobileOpenPath] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const accountRef = useRef(null)

  const isDrawerOpen = mobileOpen && mobileOpenPath === pathname

  useEffect(() => {
    if (!accountOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setAccountOpen(false)
    }

    const onPointerDown = (e) => {
      const el = accountRef.current
      if (!el) return
      if (el.contains(e.target)) return
      setAccountOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [accountOpen])

  useEffect(() => {
    let raf = 0

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        const next = window.scrollY > 24
        setCompact((prev) => (prev === next ? prev : next))
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
        <div
          className={[
            'mx-auto flex max-w-6xl items-center justify-between px-4 transition-[height] duration-200 ease-out',
            compact ? 'h-16' : 'h-20',
          ].join(' ')}
        >
          <Link
            to="/"
            className={['flex items-center shrink-0', compact ? 'h-16' : 'h-20'].join(' ')}
            aria-label="ADA ART"
          >
            <img
              src="/logo.svg"
              alt="ADA ART"
              className={[
                'block object-contain object-left',
                compact ? 'h-7 w-[125px]' : 'h-8 w-[145px]',
              ].join(' ')}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => {
                  const isConfigurator = l.to === '/configurator'
                  const active =
                    isConfigurator && pathname.startsWith('/configurator')
                      ? true
                      : isActive
                  return [
                    'relative text-sm font-medium text-text-dark transition-colors hover:text-brand-mid',
                    'after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-brand-mid after:transition-transform after:duration-200',
                    'hover:after:scale-x-100',
                    active ? 'after:scale-x-100' : '',
                    isConfigurator ? 'group' : '',
                    isConfigurator && active
                      ? 'text-brand-dark'
                      : isConfigurator
                        ? 'text-text-dark'
                        : '',
                  ].join(' ')
                }}
              >
                {l.to === '/configurator' ? (
                  <span className="relative inline-flex items-center">
                    <span className="relative z-10">{l.label}</span>
                    <motion.span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20"
                      style={{
                        backgroundImage:
                          'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(198,139,89,0.95) 45%, rgba(0,0,0,0) 72%)',
                        backgroundSize: '220% 100%',
                        backgroundPosition: '-120% 50%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'transparent',
                        filter: 'drop-shadow(0 0 10px rgba(198,139,89,0.35))',
                      }}
                      animate={{ backgroundPosition: ['-120% 50%', '220% 50%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                    >
                      {l.label}
                    </motion.span>
                  </span>
                ) : (
                  l.label
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/configurator"
              className={[
                'hidden items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-medium text-white transition-colors hover:bg-brand-mid lg:inline-flex',
                compact ? 'h-10' : 'h-11',
              ].join(' ')}
            >
              Configurează
            </Link>

            {loading ? (
              <div className="hidden min-w-[150px] lg:block" aria-hidden="true" />
            ) : user ? (
              <div className="relative hidden lg:block" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  className={[
                    'group inline-flex min-w-[150px] items-center justify-center gap-2 px-2 text-sm font-medium text-text-dark transition-colors hover:text-brand-mid',
                    compact ? 'h-10' : 'h-11',
                  ].join(' ')}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  <User className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand-mid" />
                  <span className="transition-colors">Contul meu</span>
                  <motion.span
                    className="inline-flex"
                    animate={{ rotate: accountOpen ? 180 : 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    aria-hidden="true"
                  >
                    <ChevronDown className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand-mid" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {accountOpen ? (
                    <MotionDiv
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-white shadow-softLg"
                      role="menu"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <div className="text-sm font-semibold text-text-dark">{profile?.full_name || 'Profilul meu'}</div>
                        <div className="mt-0.5 truncate text-xs text-text-muted">{user.email}</div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/cont"
                          className="flex w-full items-center rounded-xl bg-cream px-3 py-2 text-sm font-medium text-text-dark hover:bg-warm"
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                        >
                          Profilul meu
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            setAccountOpen(false)
                            await signOut()
                          }}
                          className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          role="menuitem"
                        >
                          Deconectare
                        </button>
                      </div>
                    </MotionDiv>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={[
                  'hidden items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-medium text-text-dark transition hover:bg-cream lg:inline-flex',
                  compact ? 'h-10' : 'h-11',
                ].join(' ')}
              >
                <User className="h-4 w-4 text-text-muted" />
                Autentificare
              </Link>
            )}

            {user && isAdmin ? (
              <Link
                to="/admin"
                className={[
                  'hidden items-center justify-center rounded-full border border-border bg-white text-text-dark hover:bg-cream lg:inline-flex',
                  compact ? 'h-10 w-10' : 'h-11 w-11',
                ].join(' ')}
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <LayoutGrid className="h-5 w-5 text-text-muted" />
              </Link>
            ) : null}

            <button
              type="button"
              className={[
                'inline-flex items-center justify-center rounded-full border border-border bg-white/70 text-text-dark backdrop-blur transition hover:bg-white lg:hidden',
                compact ? 'h-10 w-10' : 'h-11 w-11',
              ].join(' ')}
              aria-label="Deschide meniul"
              onClick={() => {
                setMobileOpenPath(pathname)
                setMobileOpen(true)
              }}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-brand-light">
          <div className="mx-auto max-w-6xl px-4 py-2 text-xs text-brand-dark">
            <span className="font-medium">🛠</span> <span className="italic">{noteText}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen ? (
          <MotionDiv
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MotionButton
              type="button"
              aria-label="Închide meniul"
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <MotionDiv
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-soft"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.25 } }}
              exit={{ x: 40, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="flex h-20 items-center justify-between px-4">
                <img
                  src="/logo.svg"
                  alt="ADA ART"
                  className="block h-7 w-[125px] object-contain object-left"
                />
                <button
                  type="button"
                  aria-label="Închide meniul"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-4 pb-6">
                <div className="mb-4 rounded-xl bg-brand-light px-4 py-3 text-xs text-brand-dark">
                  <span className="font-medium">🛠</span> <span className="italic">{noteText}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {navLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className={({ isActive }) => {
                        const isConfigurator = l.to === '/configurator'
                        const active =
                          isConfigurator && pathname.startsWith('/configurator')
                            ? true
                            : isActive
                        return [
                          'rounded-xl px-4 py-3 text-sm font-medium transition',
                          active
                            ? 'bg-brand-light text-brand-dark ring-1 ring-brand-primary/30'
                            : 'text-text-dark hover:bg-warm',
                        ].join(' ')
                      }}
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>

                <Link
                  to="/configurator"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-brand-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-mid"
                >
                  Configurează
                </Link>

                {!loading ? (
                  <div className="mt-3 grid gap-2">
                    {user ? (
                      <>
                        <Link
                          to="/cont"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-text-dark transition hover:bg-cream"
                        >
                          <User className="h-4 w-4 text-text-muted" />
                          Profilul meu
                        </Link>
                        <button
                          type="button"
                          onClick={signOut}
                          className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Deconectare
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-text-dark transition hover:bg-cream"
                      >
                        <User className="h-4 w-4 text-text-muted" />
                        Autentificare
                      </Link>
                    )}
                    {user && isAdmin ? (
                      <Link
                        to="/admin"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-text-dark transition hover:bg-cream"
                      >
                        <LayoutGrid className="h-4 w-4 text-text-muted" />
                        Admin Dashboard
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

