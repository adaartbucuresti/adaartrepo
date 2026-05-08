import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabase.js'

export default function AuthPage() {
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading, signIn, signUp, resetPassword } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isLogin = activeTab === 'login'

  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate('/admin', { replace: true })
  }, [authLoading, isAdmin, navigate, user])

  const canSubmit = useMemo(() => {
    if (loading) return false
    if (!email.trim() || !password) return false
    if (isLogin) return true
    if (!fullName.trim()) return false
    if (password !== confirmPassword) return false
    if (!agreed) return false
    return true
  }, [agreed, confirmPassword, email, fullName, isLogin, loading, password])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email.trim(), password)
        if (signInError) throw signInError
        const { data: sessionData } = await supabase.auth.getSession()
        const userId = sessionData?.session?.user?.id
        if (userId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()
          if (profileData?.role === 'admin') navigate('/admin', { replace: true })
          else navigate('/', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
        return
      }

      if (password !== confirmPassword) {
        setError('Parolele nu se potrivesc.')
        return
      }

      if (!agreed) {
        setError('Trebuie să accepți termenii pentru a crea cont.')
        return
      }

      const { error: signUpError } = await signUp(email.trim(), password, fullName.trim())
      if (signUpError) throw signUpError
      setSuccess('Verifică-ți emailul pentru confirmare!')
      setActiveTab('login')
    } catch (err) {
      setError(err?.message || 'A apărut o eroare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async () => {
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Introdu emailul pentru resetare.')
      return
    }
    setLoading(true)
    try {
      const { error: resetError } = await resetPassword(email.trim())
      if (resetError) throw resetError
      setSuccess('Ți-am trimis un email pentru resetarea parolei.')
    } catch (err) {
      setError(err?.message || 'Nu am putut trimite emailul de resetare.')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(29,158,117,0.12),transparent_55%),radial-gradient(900px_circle_at_95%_20%,rgba(10,31,67,0.10),transparent_55%),linear-gradient(to_bottom,#F6F2EE,#FFFFFF)]">
      <button
        type="button"
        onClick={goBack}
        className="fixed left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-border bg-white/85 px-4 py-2 text-sm font-semibold text-text-dark shadow-soft backdrop-blur transition hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Înapoi
      </button>

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-white shadow-softLg">
          <div className="border-b border-border bg-cream px-6 py-5">
            <div className="font-heading text-2xl font-semibold text-text-dark">
              {isLogin ? 'Intră în cont' : 'Creează cont'}
            </div>
            <div className="mt-1 text-sm text-text-muted">
              {isLogin ? 'Autentifică-te pentru o experiență mai rapidă.' : 'Confirmarea se face pe email.'}
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 rounded-2xl border border-border bg-cream p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setError('')
                  setSuccess('')
                }}
                className={[
                  'rounded-2xl px-3 py-2.5 text-sm font-semibold transition',
                  isLogin ? 'bg-white text-brand-dark shadow-soft' : 'text-text-muted hover:text-text-dark',
                ].join(' ')}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register')
                  setError('')
                  setSuccess('')
                }}
                className={[
                  'rounded-2xl px-3 py-2.5 text-sm font-semibold transition',
                  !isLogin
                    ? 'bg-white text-brand-dark shadow-soft'
                    : 'text-text-muted hover:text-text-dark',
                ].join(' ')}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="mt-6 grid gap-4">
              {!isLogin ? (
                <div>
                  <label className="text-xs font-medium text-text-muted">Nume complet</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                    <User className="h-4 w-4 text-text-muted" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-sm outline-none"
                      placeholder="Nume Prenume"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="text-xs font-medium text-text-muted">Email</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="email@exemplu.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-muted">Parolă</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                  <Lock className="h-4 w-4 text-text-muted" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="text-text-muted hover:text-text-dark"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ascunde parola' : 'Afișează parola'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin ? (
                <div>
                  <label className="text-xs font-medium text-text-muted">Confirmă parola</label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
                    <Lock className="h-4 w-4 text-text-muted" />
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full text-sm outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword ? (
                    <div className="mt-2 text-xs text-red-600">Parolele nu se potrivesc.</div>
                  ) : null}
                </div>
              ) : null}

              {!isLogin ? (
                <label className="flex items-start gap-2 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-brand-primary"
                  />
                  Sunt de acord cu termenii
                </label>
              ) : null}

              {error ? <div className="text-xs text-red-600">{error}</div> : null}
              {success ? <div className="text-xs text-brand-dark">{success}</div> : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  'mt-1 inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white transition',
                  canSubmit ? 'bg-brand-primary hover:bg-brand-mid' : 'bg-brand-primary/50',
                ].join(' ')}
              >
                {loading ? 'Se procesează…' : isLogin ? 'Intră în cont' : 'Creează cont'}
              </button>

              {isLogin ? (
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="text-left text-xs font-semibold text-text-muted underline underline-offset-4 hover:text-text-dark"
                >
                  Am uitat parola
                </button>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

