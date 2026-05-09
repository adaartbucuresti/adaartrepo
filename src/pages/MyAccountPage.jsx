import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'

const statusLabel = {
  nou: 'În așteptare',
  in_lucru: 'În lucru',
  finalizat: 'Acceptat',
  anulat: 'Anulat',
}

const statusBadgeClass = {
  nou: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
  in_lucru: 'bg-blue-100 text-blue-900 ring-1 ring-blue-200',
  finalizat: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
  anulat: 'bg-red-100 text-red-900 ring-1 ring-red-200',
}

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ro-RO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatShortDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ro-RO', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const getInitials = (value) => {
  const text = String(value || '').trim()
  if (!text) return 'MD'
  const parts = text.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  const initials = `${first}${last}`.toUpperCase()
  return initials || 'MD'
}

const normalizeString = (value) => {
  const text = String(value ?? '').trim()
  return text
}

const passwordStrength = (password) => {
  const v = String(password || '')
  const length = v.length
  const hasLower = /[a-z]/.test(v)
  const hasUpper = /[A-Z]/.test(v)
  const hasNumber = /\d/.test(v)
  const hasSymbol = /[^A-Za-z0-9]/.test(v)
  const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length

  let score = 0
  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (variety >= 2) score += 1
  if (variety >= 3) score += 1

  if (score <= 1) return { label: 'Slab', color: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700' }
  if (score === 2) return { label: 'Mediu', color: 'bg-amber-500', ring: 'ring-amber-200', text: 'text-amber-800' }
  return { label: 'Puternic', color: 'bg-emerald-600', ring: 'ring-emerald-200', text: 'text-emerald-800' }
}

export default function MyAccountPage() {
  const MotionDiv = motion.div
  const { user, profile, loading, signOut } = useAuth()

  const sections = useMemo(
    () => [
      { key: 'overview', label: 'Contul meu', shortLabel: 'Cont', icon: LayoutDashboard },
      { key: 'personal', label: 'Informații personale', shortLabel: 'Profil', icon: User },
      { key: 'security', label: 'Securitate', shortLabel: 'Securit.', icon: Shield },
      { key: 'requests', label: 'Cererile mele', shortLabel: 'Cereri', icon: ClipboardList },
      { key: 'notifications', label: 'Notificări', shortLabel: 'Notific.', icon: Bell },
      { key: 'logout', label: 'Ieși din cont', shortLabel: 'Ieși', icon: LogOut },
    ],
    [],
  )

  const [activeKey, setActiveKey] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileBottomVisible, setMobileBottomVisible] = useState(true)

  const [toasts, setToasts] = useState([])
  const toastTimers = useRef(new Map())

  const pushToast = (toast) => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
    const item = {
      id,
      type: toast?.type || 'success',
      title: toast?.title || '',
      message: toast?.message || '',
    }
    setToasts((prev) => [item, ...prev].slice(0, 3))
    const t = window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
      toastTimers.current.delete(id)
    }, 3500)
    toastTimers.current.set(id, t)
  }

  const removeToast = (id) => {
    const t = toastTimers.current.get(id)
    if (t) window.clearTimeout(t)
    toastTimers.current.delete(id)
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }

  useEffect(() => {
    return () => {
      for (const t of toastTimers.current.values()) window.clearTimeout(t)
      toastTimers.current.clear()
    }
  }, [])

  const [requests, setRequests] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsError, setRequestsError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

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

  const [localProfile, setLocalProfile] = useState(null)

  useEffect(() => {
    setLocalProfile(profile || null)
  }, [profile])

  const displayName = localProfile?.full_name || user?.user_metadata?.full_name || 'Cont'
  const createdAt = user?.created_at ? formatDate(user.created_at) : ''

  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'nou').length
    const inProgress = requests.filter((r) => r.status === 'in_lucru').length
    const done = requests.filter((r) => r.status === 'finalizat').length
    const cancelled = requests.filter((r) => r.status === 'anulat').length
    return { total, pending, inProgress, done, cancelled }
  }, [requests])

  const activeSection = useMemo(() => sections.find((s) => s.key === activeKey) || sections[0], [activeKey, sections])

  const onNavigate = (key) => {
    if (key === 'logout') {
      Promise.resolve()
        .then(async () => {
          await signOut()
          pushToast({ type: 'success', title: 'Ai ieșit din cont.', message: 'Te poți autentifica oricând din nou.' })
        })
        .catch((err) => {
          pushToast({ type: 'error', title: 'Nu am putut ieși din cont.', message: err?.message || 'Încearcă din nou.' })
        })
      return
    }
    setActiveKey(key)
    setMobileNavOpen(false)
  }

  const inputClass =
    'w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-dark outline-none transition duration-200 placeholder:text-text-muted/60 focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/20'

  const secondaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-dark transition duration-200 hover:bg-[#f5f3ef]'

  const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#2d4a3e] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#243b32] focus:outline-none focus:ring-2 focus:ring-[#2d4a3e]/30'

  const revealProps = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.35, ease: 'easeOut' },
  }

  const [avatarUrl, setAvatarUrl] = useState('')
  const avatarInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) URL.revokeObjectURL(avatarUrl)
    }
  }, [avatarUrl])

  const openAvatarPicker = () => {
    if (avatarInputRef.current) avatarInputRef.current.click()
  }

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      pushToast({ type: 'error', title: 'Fișier invalid.', message: 'Alege o imagine (PNG/JPG/WEBP).' })
      return
    }
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
    pushToast({ type: 'success', title: 'Fotografie selectată.', message: 'Apasă „Salvează modificările” pentru a confirma.' })
  }

  const fullNameParts = useMemo(() => {
    const fallback = normalizeString(displayName)
    const raw = normalizeString(localProfile?.full_name || fallback)
    const parts = raw.split(/\s+/).filter(Boolean)
    const first = parts[0] || ''
    const last = parts.length > 1 ? parts.slice(1).join(' ') : ''
    return { first, last }
  }, [displayName, localProfile?.full_name])

  const [editingFields, setEditingFields] = useState(() => new Set())
  const [personalSaving, setPersonalSaving] = useState(false)
  const [personalDraft, setPersonalDraft] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    address: '',
  })

  useEffect(() => {
    setPersonalDraft({
      firstName: normalizeString(localProfile?.first_name || fullNameParts.first),
      lastName: normalizeString(localProfile?.last_name || fullNameParts.last),
      phone: normalizeString(localProfile?.phone || localProfile?.phone_number || ''),
      birthDate: normalizeString(localProfile?.birth_date || localProfile?.birthday || ''),
      address: normalizeString(localProfile?.address || localProfile?.shipping_address || ''),
    })
    setEditingFields(new Set())
  }, [fullNameParts.first, fullNameParts.last, localProfile])

  const toggleField = (field) => {
    setEditingFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const updatePersonalField = (field, value) => {
    setPersonalDraft((prev) => ({ ...prev, [field]: value }))
  }

  const savePersonal = async () => {
    if (!user) return
    setPersonalSaving(true)
    try {
      if (!isSupabaseConfigured) throw new Error('Supabase nu este configurat.')
      const firstName = normalizeString(personalDraft.firstName)
      const lastName = normalizeString(personalDraft.lastName)
      const payload = {
        full_name: [firstName, lastName].filter(Boolean).join(' ').trim() || null,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: normalizeString(personalDraft.phone) || null,
        birth_date: normalizeString(personalDraft.birthDate) || null,
        address: normalizeString(personalDraft.address) || null,
      }
      const { data, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select('*').single()
      if (error) throw error
      setLocalProfile(data || localProfile)
      setEditingFields(new Set())
      pushToast({ type: 'success', title: 'Modificări salvate.', message: 'Profilul tău a fost actualizat.' })
    } catch (err) {
      pushToast({ type: 'error', title: 'Nu am putut salva.', message: err?.message || 'Încearcă din nou.' })
    } finally {
      setPersonalSaving(false)
    }
  }

  const [securitySaving, setSecuritySaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const strength = useMemo(() => passwordStrength(newPassword), [newPassword])
  const canUpdatePassword = useMemo(() => {
    return Boolean(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8)
  }, [confirmPassword, currentPassword, newPassword])

  const updatePassword = async (e) => {
    e?.preventDefault?.()
    if (!user) return
    if (newPassword !== confirmPassword) {
      pushToast({ type: 'error', title: 'Parolele nu se potrivesc.', message: 'Confirmă parola nouă încă o dată.' })
      return
    }
    if (newPassword.length < 8) {
      pushToast({ type: 'error', title: 'Parolă prea scurtă.', message: 'Folosește minimum 8 caractere.' })
      return
    }
    setSecuritySaving(true)
    try {
      if (!isSupabaseConfigured) throw new Error('Supabase nu este configurat.')
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
      if (signInError) throw new Error('Parola curentă nu este corectă.')
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      pushToast({ type: 'success', title: 'Parola a fost actualizată.', message: 'Te rugăm să o păstrezi în siguranță.' })
    } catch (err) {
      pushToast({ type: 'error', title: 'Nu am putut schimba parola.', message: err?.message || 'Încearcă din nou.' })
    } finally {
      setSecuritySaving(false)
    }
  }

  const [notificationDraft, setNotificationDraft] = useState({
    email: { enabled: true, cereri: true, promotii: false, sistem: true },
    sms: { enabled: false, cereri: true, promotii: false, sistem: true },
    browser: { enabled: true, cereri: true, promotii: true, sistem: true },
  })
  const [notificationSaving, setNotificationSaving] = useState(false)

  useEffect(() => {
    const prefs = localProfile?.notification_prefs || localProfile?.notifications || null
    if (!prefs || typeof prefs !== 'object') return
    const safe = (channelKey) => {
      const v = prefs?.[channelKey]
      if (!v || typeof v !== 'object') return null
      return {
        enabled: Boolean(v.enabled),
        cereri: Boolean(v.cereri),
        promotii: Boolean(v.promotii),
        sistem: Boolean(v.sistem),
      }
    }
    setNotificationDraft((prev) => ({
      email: safe('email') || prev.email,
      sms: safe('sms') || prev.sms,
      browser: safe('browser') || prev.browser,
    }))
  }, [localProfile?.notification_prefs, localProfile?.notifications])

  const setNotif = (channel, key, value) => {
    setNotificationDraft((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: value,
      },
    }))
  }

  const saveNotifications = async () => {
    if (!user) return
    setNotificationSaving(true)
    try {
      if (!isSupabaseConfigured) throw new Error('Supabase nu este configurat.')
      const payload = { notification_prefs: notificationDraft }
      const { data, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select('*').single()
      if (error) throw error
      setLocalProfile(data || localProfile)
      pushToast({ type: 'success', title: 'Preferințe salvate.', message: 'Notificările au fost actualizate.' })
    } catch (err) {
      pushToast({ type: 'error', title: 'Nu am putut salva.', message: err?.message || 'Încearcă din nou.' })
    } finally {
      setNotificationSaving(false)
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      setMobileBottomVisible(y < 30 || activeKey !== 'requests')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeKey])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="bg-[#f5f3ef]">
      <AnimatePresence>
        {toasts.length ? (
          <div className="pointer-events-none fixed right-4 top-24 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const isError = t.type === 'error'
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={[
                      'pointer-events-auto overflow-hidden rounded-2xl border bg-white shadow-soft backdrop-blur',
                      isError ? 'border-red-200' : 'border-emerald-200',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3 px-4 py-3">
                      <div
                        className={[
                          'mt-1 h-2.5 w-2.5 rounded-full',
                          isError ? 'bg-red-500' : 'bg-emerald-600',
                        ].join(' ')}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-text-dark">{t.title}</div>
                        {t.message ? <div className="mt-1 text-xs text-text-muted">{t.message}</div> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeToast(t.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-text-muted transition duration-200 hover:bg-[#f5f3ef] hover:text-text-dark"
                        aria-label="Închide notificarea"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 lg:pb-10 lg:pt-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Link className="inline-flex items-center gap-2 hover:text-brand-mid" to="/">
              <Home className="h-4 w-4" />
              Acasă
            </Link>
            <span>/</span>
            <span className="hover:text-brand-mid">Contul meu</span>
            <span>/</span>
            <span className="text-text-dark">{activeSection.key === 'overview' ? 'Prezentare' : activeSection.label}</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-dark transition duration-200 hover:bg-[#f5f3ef] lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-4 w-4 text-text-muted" />
            Meniu
          </button>
        </div>

        <MotionDiv
          className="mt-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">Contul meu</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Gestionează profilul, securitatea și preferințele de notificări. Urmărește și cererile trimise către echipa noastră.
          </p>
        </MotionDiv>

        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl border border-border bg-[#f5f3ef]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-heading text-lg font-semibold text-[#2d4a3e]">
                        {getInitials(displayName)}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={openAvatarPicker}
                    className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-muted shadow-soft transition duration-200 hover:bg-[#f5f3ef] hover:text-text-dark"
                    aria-label="Încarcă o fotografie"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-heading text-lg font-semibold text-text-dark">{displayName}</div>
                  <div className="truncate text-xs text-text-muted">{email}</div>
                </div>
              </div>

              <input ref={avatarInputRef} type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />

              <nav className="mt-5 grid gap-1">
                {sections.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === activeKey
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onNavigate(item.key)}
                      className={[
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition duration-200',
                        isActive ? 'bg-[#f5f3ef] text-text-dark' : 'text-text-muted hover:bg-[#f5f3ef] hover:text-text-dark',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition duration-200',
                          isActive ? 'border-[#2d4a3e]/20 bg-white text-[#2d4a3e]' : 'border-border bg-white text-text-muted',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeKey === 'overview' ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="grid gap-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-text-muted">Profil</div>
                          <div className="mt-2 truncate font-heading text-2xl font-semibold text-text-dark">{displayName}</div>
                          <div className="mt-2 text-sm text-text-muted">{email}</div>
                          {createdAt ? <div className="mt-1 text-xs text-text-muted">Creat: {createdAt}</div> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigate('personal')}
                          className={secondaryButtonClass}
                        >
                          <Pencil className="h-4 w-4 text-text-muted" />
                          Editează
                        </button>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">Telefon</div>
                          <div className="mt-1 text-sm font-semibold text-text-dark">{personalDraft.phone || '—'}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">Adresă</div>
                          <div className="mt-1 break-words text-sm font-semibold leading-snug text-text-dark">{personalDraft.address || '—'}</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-text-muted">Cererile mele</div>
                          <div className="mt-2 font-heading text-2xl font-semibold text-text-dark">{stats.total}</div>
                          <div className="mt-2 text-sm text-text-muted">Total cereri trimise</div>
                        </div>
                        <Link to="/configurator" className={primaryButtonClass}>
                          Trimite cerere nouă
                        </Link>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">În așteptare</div>
                          <div className="mt-1 text-sm font-semibold text-text-dark">{stats.pending}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">În lucru</div>
                          <div className="mt-1 text-sm font-semibold text-text-dark">{stats.inProgress}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">Acceptate</div>
                          <div className="mt-1 text-sm font-semibold text-text-dark">{stats.done}</div>
                        </div>
                        <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                          <div className="text-xs font-semibold text-text-muted">Anulate</div>
                          <div className="mt-1 text-sm font-semibold text-text-dark">{stats.cancelled}</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button type="button" onClick={() => onNavigate('requests')} className={secondaryButtonClass}>
                          Vezi lista completă
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-text-dark">Acces rapid</div>
                        <div className="mt-1 text-xs text-text-muted">
                          Actualizează parola, setează notificările și gestionează profilul într-un singur loc.
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button type="button" onClick={() => onNavigate('security')} className={secondaryButtonClass}>
                          <Shield className="h-4 w-4 text-text-muted" />
                          Securitate
                        </button>
                        <button type="button" onClick={() => onNavigate('notifications')} className={secondaryButtonClass}>
                          <Bell className="h-4 w-4 text-text-muted" />
                          Notificări
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}

              {activeKey === 'personal' ? (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text-dark">Informații personale</div>
                      <div className="mt-1 text-xs text-text-muted">Editează doar câmpurile de care ai nevoie, apoi salvează modificările.</div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={savePersonal} disabled={personalSaving} className={primaryButtonClass}>
                        {personalSaving ? 'Se salvează…' : 'Salvează modificările'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Nume</label>
                          <button type="button" onClick={() => toggleField('firstName')} className={secondaryButtonClass}>
                            <Pencil className="h-4 w-4 text-text-muted" />
                            {editingFields.has('firstName') ? 'Gata' : 'Editează'}
                          </button>
                        </div>
                        <input
                          className={[inputClass, editingFields.has('firstName') ? '' : 'bg-[#f5f3ef]'].join(' ')}
                          value={personalDraft.firstName}
                          onChange={(e) => updatePersonalField('firstName', e.target.value)}
                          readOnly={!editingFields.has('firstName')}
                          placeholder="Nume"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Prenume</label>
                          <button type="button" onClick={() => toggleField('lastName')} className={secondaryButtonClass}>
                            <Pencil className="h-4 w-4 text-text-muted" />
                            {editingFields.has('lastName') ? 'Gata' : 'Editează'}
                          </button>
                        </div>
                        <input
                          className={[inputClass, editingFields.has('lastName') ? '' : 'bg-[#f5f3ef]'].join(' ')}
                          value={personalDraft.lastName}
                          onChange={(e) => updatePersonalField('lastName', e.target.value)}
                          readOnly={!editingFields.has('lastName')}
                          placeholder="Prenume"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Email</label>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                            Verificat
                          </span>
                        </div>
                        <input className={[inputClass, 'bg-[#f5f3ef]'].join(' ')} value={email} readOnly />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Număr de telefon</label>
                          <button type="button" onClick={() => toggleField('phone')} className={secondaryButtonClass}>
                            <Pencil className="h-4 w-4 text-text-muted" />
                            {editingFields.has('phone') ? 'Gata' : 'Editează'}
                          </button>
                        </div>
                        <input
                          className={[inputClass, editingFields.has('phone') ? '' : 'bg-[#f5f3ef]'].join(' ')}
                          value={personalDraft.phone}
                          onChange={(e) => updatePersonalField('phone', e.target.value)}
                          readOnly={!editingFields.has('phone')}
                          placeholder="07xx xxx xxx"
                          inputMode="tel"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Dată naștere</label>
                          <button type="button" onClick={() => toggleField('birthDate')} className={secondaryButtonClass}>
                            <Pencil className="h-4 w-4 text-text-muted" />
                            {editingFields.has('birthDate') ? 'Gata' : 'Editează'}
                          </button>
                        </div>
                        <input
                          type="date"
                          className={[inputClass, editingFields.has('birthDate') ? '' : 'bg-[#f5f3ef]'].join(' ')}
                          value={personalDraft.birthDate}
                          onChange={(e) => updatePersonalField('birthDate', e.target.value)}
                          readOnly={!editingFields.has('birthDate')}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-semibold text-text-muted">Adresă</label>
                          <button type="button" onClick={() => toggleField('address')} className={secondaryButtonClass}>
                            <Pencil className="h-4 w-4 text-text-muted" />
                            {editingFields.has('address') ? 'Gata' : 'Editează'}
                          </button>
                        </div>
                        <input
                          className={[inputClass, editingFields.has('address') ? '' : 'bg-[#f5f3ef]'].join(' ')}
                          value={personalDraft.address}
                          onChange={(e) => updatePersonalField('address', e.target.value)}
                          readOnly={!editingFields.has('address')}
                          placeholder="Stradă, număr, oraș"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-[#f5f3ef] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-text-dark">Avatar</div>
                          <div className="mt-1 text-xs text-text-muted">Alege o fotografie pentru cont (previzualizare locală).</div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button type="button" onClick={openAvatarPicker} className={secondaryButtonClass}>
                            <Upload className="h-4 w-4 text-text-muted" />
                            Încarcă
                          </button>
                          {avatarUrl ? (
                            <button
                              type="button"
                              onClick={() => setAvatarUrl('')}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-50"
                            >
                              Elimină
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {activeKey === 'security' ? (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="grid gap-6"
                >
                  <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                    <div className="text-sm font-semibold text-text-dark">Securitate</div>
                    <div className="mt-1 text-xs text-text-muted">Recomandăm o parolă puternică și unică pentru contul tău.</div>
                  </motion.div>

                  <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-text-dark">Schimbă parola</div>
                        <div className="mt-1 text-xs text-text-muted">Confirmă parola curentă, apoi setează una nouă.</div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 sm:mt-0">
                        <span className={['inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1', strength.text, strength.ring].join(' ')}>
                          {strength.label}
                        </span>
                      </div>
                    </div>

                    <form className="mt-6 grid gap-5" onSubmit={updatePassword}>
                      <div>
                        <label className="text-xs font-semibold text-text-muted">Parolă curentă</label>
                        <input
                          type="password"
                          autoComplete="current-password"
                          className={inputClass}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Introdu parola curentă"
                        />
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-text-muted">Parolă nouă</label>
                          <input
                            type="password"
                            autoComplete="new-password"
                            className={inputClass}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minim 8 caractere"
                          />
                          <div className="mt-3 rounded-2xl border border-border bg-[#f5f3ef] p-3">
                            <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
                              <span>Putere</span>
                              <span className={['font-semibold', strength.text].join(' ')}>{strength.label}</span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
                              <div
                                className={['h-full', strength.color].join(' ')}
                                style={{
                                  width: strength.label === 'Slab' ? '33%' : strength.label === 'Mediu' ? '66%' : '100%',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-text-muted">Confirmare parolă nouă</label>
                          <input
                            type="password"
                            autoComplete="new-password"
                            className={inputClass}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repetă parola nouă"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-text-muted">
                          Folosește o combinație de litere mari/mici, cifre și simboluri pentru o parolă mai sigură.
                        </div>
                        <button type="submit" disabled={!canUpdatePassword || securitySaving} className={primaryButtonClass}>
                          {securitySaving ? 'Se actualizează…' : 'Actualizează parola'}
                        </button>
                      </div>
                    </form>
                  </motion.div>

                  <motion.div {...revealProps} className="rounded-2xl border border-border bg-white p-6 shadow-soft">
                    <div className="text-sm font-semibold text-text-dark">Sesiuni active</div>
                    <div className="mt-1 text-xs text-text-muted">
                      Pentru siguranță, poți ieși oricând din cont de pe acest dispozitiv folosind opțiunea „Ieși din cont”.
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}

              {activeKey === 'requests' ? (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text-dark">Cererile mele</div>
                      <div className="mt-1 text-xs text-text-muted">
                        Total: {stats.total} • În așteptare: {stats.pending} • În lucru: {stats.inProgress} • Acceptate: {stats.done} • Anulate: {stats.cancelled}
                      </div>
                    </div>
                    <Link to="/configurator" className={primaryButtonClass}>
                      Trimite cerere nouă
                    </Link>
                  </div>

                  {requestsLoading ? (
                    <div className="mt-6 text-sm text-text-muted">Se încarcă…</div>
                  ) : requestsError ? (
                    <div className="mt-6 text-sm text-red-600">{requestsError}</div>
                  ) : requests.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-border bg-[#f5f3ef] p-8 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white">
                        <ClipboardList className="h-6 w-6 text-text-muted" />
                      </div>
                      <div className="mt-4 font-heading text-xl font-semibold text-text-dark">Încă nu ai cereri</div>
                      <div className="mt-2 text-sm text-text-muted">
                        Poți trimite o cerere nouă din configurator, iar noi revenim cu detalii și ofertă.
                      </div>
                      <div className="mt-5">
                        <Link to="/configurator" className={primaryButtonClass}>
                          Trimite cerere nouă
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-hidden rounded-2xl border border-border">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-[#f5f3ef] text-xs font-semibold text-text-muted">
                            <tr>
                              <th className="px-4 py-3">ID cerere</th>
                              <th className="px-4 py-3">Dată</th>
                              <th className="px-4 py-3">Tip</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Acțiuni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {requests.map((r) => {
                              const status = r.status || 'nou'
                              const label = statusLabel[status] || status
                              const badge = statusBadgeClass[status] || 'bg-[#f5f3ef] text-text-muted ring-1 ring-border'
                              const id = String(r.id || '')
                              const shortId = id ? `${id.slice(0, 8)}…` : '—'
                              return (
                                <tr key={id || `${r.created_at}-${r.product_type}`} className="hover:bg-[#f5f3ef]/60">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-text-dark">{shortId}</span>
                                      {id ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator?.clipboard?.writeText?.(id)
                                            pushToast({ type: 'success', title: 'ID copiat.', message: 'Îl poți lipi oriunde ai nevoie.' })
                                          }}
                                          className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-text-muted transition duration-200 hover:bg-white hover:text-text-dark"
                                        >
                                          Copiază
                                        </button>
                                      ) : null}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-text-muted">{formatShortDate(r.created_at)}</td>
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-text-dark">{r.product_type || 'Cerere configurator'}</div>
                                    <div className="mt-0.5 text-xs text-text-muted">{r.product_name || ''}</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={['inline-flex rounded-full px-3 py-1 text-xs font-semibold', badge].join(' ')}>{label}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button type="button" onClick={() => setSelectedRequest(r)} className={secondaryButtonClass}>
                                      Detalii
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}

              {activeKey === 'notifications' ? (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="rounded-2xl border border-border bg-white p-6 shadow-soft"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text-dark">Notificări</div>
                      <div className="mt-1 text-xs text-text-muted">
                        Alege ce tipuri de mesaje vrei să primești, pe fiecare canal.
                      </div>
                    </div>
                    <button type="button" onClick={saveNotifications} disabled={notificationSaving} className={primaryButtonClass}>
                      {notificationSaving ? 'Se salvează…' : 'Salvează preferințele'}
                    </button>
                  </div>

                  <div className="mt-6 grid gap-6">
                    {[
                      { key: 'email', label: 'Email' },
                      { key: 'sms', label: 'SMS' },
                      { key: 'browser', label: 'Notificări browser' },
                    ].map((c) => {
                      const channel = notificationDraft[c.key]
                      return (
                        <div key={c.key} className="rounded-2xl border border-border bg-[#f5f3ef] p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-semibold text-text-dark">{c.label}</div>
                              <div className="mt-1 text-xs text-text-muted">Controlează mesajele pe acest canal.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNotif(c.key, 'enabled', !channel.enabled)}
                              className={[
                                'relative inline-flex h-8 w-14 items-center rounded-full border transition duration-200',
                                channel.enabled ? 'border-[#2d4a3e]/30 bg-[#2d4a3e]/10' : 'border-border bg-white',
                              ].join(' ')}
                              aria-pressed={channel.enabled}
                            >
                              <span
                                className={[
                                  'inline-block h-6 w-6 transform rounded-full bg-white shadow-soft transition duration-200',
                                  channel.enabled ? 'translate-x-7 ring-2 ring-[#2d4a3e]/20' : 'translate-x-1 ring-1 ring-border',
                                ].join(' ')}
                              />
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {[
                              { key: 'cereri', label: 'Cererile mele' },
                              { key: 'promotii', label: 'Promoții' },
                              { key: 'sistem', label: 'Sistem' },
                            ].map((s) => (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => setNotif(c.key, s.key, !channel[s.key])}
                                disabled={!channel.enabled}
                                className={[
                                  'flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left text-sm font-semibold transition duration-200',
                                  channel.enabled ? 'border-border hover:bg-[#f5f3ef]' : 'cursor-not-allowed border-border/60 opacity-60',
                                ].join(' ')}
                              >
                                <span className="text-text-dark">{s.label}</span>
                                <span
                                  className={[
                                    'inline-flex h-6 w-10 items-center rounded-full border transition duration-200',
                                    channel[s.key] ? 'border-[#2d4a3e]/30 bg-[#2d4a3e]/10' : 'border-border bg-[#f5f3ef]',
                                  ].join(' ')}
                                >
                                  <span
                                    className={[
                                      'inline-block h-5 w-5 transform rounded-full bg-white shadow-soft transition duration-200',
                                      channel[s.key] ? 'translate-x-4 ring-2 ring-[#2d4a3e]/20' : 'translate-x-0.5 ring-1 ring-border',
                                    ].join(' ')}
                                  />
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Închide meniul"
            />
            <motion.div
              initial={{ x: 16, opacity: 0, scale: 0.98 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-3 top-20 w-[min(420px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-white shadow-softLg"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-heading text-lg font-semibold text-text-dark">{displayName}</div>
                  <div className="truncate text-xs text-text-muted">{email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-muted transition duration-200 hover:bg-[#f5f3ef] hover:text-text-dark"
                  aria-label="Închide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-1 p-3">
                {sections.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === activeKey
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onNavigate(item.key)}
                      className={[
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition duration-200',
                        isActive ? 'bg-[#f5f3ef] text-text-dark' : 'text-text-muted hover:bg-[#f5f3ef] hover:text-text-dark',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition duration-200',
                          isActive ? 'border-[#2d4a3e]/20 bg-white text-[#2d4a3e]' : 'border-border bg-white text-text-muted',
                        ].join(' ')}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRequest ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={() => setSelectedRequest(null)}
              aria-label="Închide detaliile"
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-1/2 top-24 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-softLg"
            >
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div className="min-w-0">
                  <div className="truncate font-heading text-xl font-semibold text-text-dark">
                    {selectedRequest.product_type || 'Cerere configurator'}
                  </div>
                  <div className="mt-1 text-xs text-text-muted">{formatDate(selectedRequest.created_at)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-muted transition duration-200 hover:bg-[#f5f3ef] hover:text-text-dark"
                  aria-label="Închide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                    <div className="text-xs font-semibold text-text-muted">ID cerere</div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold text-text-dark">{selectedRequest.id}</div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator?.clipboard?.writeText?.(String(selectedRequest.id || ''))
                          pushToast({ type: 'success', title: 'ID copiat.', message: '' })
                        }}
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-text-muted transition duration-200 hover:bg-white hover:text-text-dark"
                      >
                        Copiază
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                    <div className="text-xs font-semibold text-text-muted">Status</div>
                    <div className="mt-2">
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                          statusBadgeClass[selectedRequest.status || 'nou'] || 'bg-[#f5f3ef] text-text-muted ring-1 ring-border',
                        ].join(' ')}
                      >
                        {statusLabel[selectedRequest.status || 'nou'] || selectedRequest.status || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                    <div className="text-xs font-semibold text-text-muted">Dimensiuni</div>
                    <div className="mt-1 text-sm font-semibold text-text-dark">
                      {selectedRequest.width_cm && selectedRequest.height_cm && selectedRequest.depth_cm
                        ? `${selectedRequest.width_cm}×${selectedRequest.height_cm}×${selectedRequest.depth_cm} cm`
                        : '—'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                    <div className="text-xs font-semibold text-text-muted">Material</div>
                    <div className="mt-1 text-sm font-semibold text-text-dark">{selectedRequest.material || '—'}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-4">
                    <div className="text-xs font-semibold text-text-muted">Culoare</div>
                    <div className="mt-1 text-sm font-semibold text-text-dark">{selectedRequest.color || '—'}</div>
                  </div>
                </div>

                {selectedRequest.admin_notes ? (
                  <div className="rounded-2xl border border-border bg-[#f5f3ef] p-5">
                    <div className="text-xs font-semibold text-text-muted">Mesaj din partea echipei</div>
                    <div className="mt-2 text-sm text-text-dark">{selectedRequest.admin_notes}</div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-text-muted">
                    Pentru o cerere nouă, folosește configuratorul. Pentru întrebări, scrie-ne pe pagina de contact.
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link to="/configurator" className={secondaryButtonClass}>
                      Trimite cerere nouă
                    </Link>
                    <button type="button" onClick={() => setSelectedRequest(null)} className={primaryButtonClass}>
                      Închide
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileBottomVisible ? (
          <motion.nav
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border bg-white/90 p-2 shadow-soft backdrop-blur lg:hidden"
          >
            <div className="grid grid-cols-6 gap-1">
              {sections.map((item) => {
                const Icon = item.icon
                const isActive = item.key === activeKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={[
                      'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-semibold transition duration-200',
                      isActive ? 'bg-[#f5f3ef] text-text-dark' : 'text-text-muted hover:bg-[#f5f3ef] hover:text-text-dark',
                    ].join(' ')}
                  >
                    <Icon className={['h-4 w-4', isActive ? 'text-[#2d4a3e]' : 'text-text-muted'].join(' ')} />
                    <span className="max-w-[10ch] truncate">{item.shortLabel}</span>
                  </button>
                )
              })}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
