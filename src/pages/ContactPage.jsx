import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, Phone, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const confirmationText = 'Cererea ta a fost înregistrată! Te contactăm în 24 de ore.'

export default function ContactPage() {
  const MotionDiv = motion.div
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [formError, setFormError] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!agreed) {
      setFormError('Confirmă acordul GDPR pentru a trimite mesajul.')
      return
    }
    setSuccessOpen(true)
  }
  const canSubmit = agreed

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h1 className="font-heading text-4xl font-semibold text-text-dark md:text-5xl">
            Contact
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Spune-ne ce îți dorești. Răspundem rapid și te ghidăm către cea mai bună soluție.
          </p>
        </MotionDiv>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <MotionDiv
            className="rounded-2xl border border-border bg-white p-6 shadow-soft"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="text-sm font-semibold text-text-dark">Trimite un mesaj</div>
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-medium text-text-muted">Nume</label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                    placeholder="Numele tău"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-text-muted">Email</label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      placeholder="email@exemplu.ro"
                      inputMode="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-muted">Telefon</label>
                  <div className="relative mt-2">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                      placeholder="+40 7xx xxx xxx"
                      inputMode="tel"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-muted">Mesaj</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none ring-brand-primary/30 focus:ring-2"
                />
              </div>

              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="gdpr"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-border text-brand-primary accent-[#2d4a3e]"
                  />
                  <div className="min-w-0">
                    <label htmlFor="gdpr" className="text-sm font-semibold text-text-dark">
                      Sunt de acord cu prelucrarea datelor personale conform{' '}
                      <Link to="/politica-confidentialitate" className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark">
                        Politicii de Confidențialitate
                      </Link>{' '}
                      <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1 text-xs text-text-muted">
                      Folosim aceste date doar pentru a răspunde cererii tale.
                    </div>
                    {!agreed && formError ? <div className="mt-2 text-xs font-semibold text-red-600">Obligatoriu</div> : null}
                  </div>
                </div>
              </div>

              {formError && agreed ? <div className="text-sm font-semibold text-red-600">{formError}</div> : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  'group mt-1 inline-flex w-full items-center justify-between rounded-full px-7 py-3 text-sm font-semibold text-white transition-all duration-300',
                  'bg-brand-primary shadow-soft hover:-translate-y-0.5 hover:bg-brand-mid hover:shadow-softLg active:translate-y-0 active:scale-[0.99]',
                  'focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
                  canSubmit ? '' : 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-soft',
                ].join(' ')}
              >
                <span className="flex-1 text-center">Trimite</span>
                <span className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-all duration-300 group-hover:bg-white/20 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>
          </MotionDiv>

          <MotionDiv
            className="rounded-2xl border border-border bg-white p-6 shadow-soft"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            <div className="text-sm font-semibold text-text-dark">Informații</div>
            <div className="mt-5 space-y-4 text-sm text-text-muted">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-brand-mid" />
                <div>
                  <div className="font-medium text-text-dark">Adresă</div>
                  <div>Str. Vasile Stolnicul, Nr.3 Zona Baicului sector 2, Bucuresti</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-brand-mid" />
                <div>
                  <div className="font-medium text-text-dark">Telefon</div>
                  <div>+40 712 345 678</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-brand-mid" />
                <div>
                  <div className="font-medium text-text-dark">Email</div>
                  <div>mobdesign.ro@outlook.com</div>
                </div>
              </div>
              <div className="rounded-2xl bg-cream p-4 text-xs">
                Program: L–V 09:00–18:00
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-warm">
              <iframe
                title="Harta"
                className="h-64 w-full"
                src="https://www.google.com/maps?q=ada%20art%20bucuresti&output=embed"
                loading="lazy"
              />
            </div>
          </MotionDiv>
        </div>
      </div>

      <AnimatePresence>
        {successOpen ? (
          <MotionDiv
            className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setSuccessOpen(false)}
              aria-label="Închide"
            />
            <MotionDiv
              className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-softLg"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border"
                aria-label="Închide"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="rounded-2xl border border-brand-primary/20 bg-brand-light p-5">
                <div className="text-sm font-semibold text-brand-dark">
                  {confirmationText}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-brand-primary px-6 py-3 text-sm font-medium text-brand-primary transition hover:bg-brand-light"
                >
                  Închide
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

