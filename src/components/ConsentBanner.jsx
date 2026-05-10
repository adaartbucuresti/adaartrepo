import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookieConsent'
const ACCEPTED = 'accepted'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY)
      if (v !== ACCEPTED) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-border bg-white shadow-softLg">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="text-sm text-text-muted">
            Folosim cookie-uri tehnice necesare funcționării site-ului. Prin continuarea navigării ești de acord.{' '}
            <Link to="/politica-cookies" className="font-semibold text-brand-mid underline underline-offset-4 hover:text-brand-dark">
              Politica Cookie-uri
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-mid"
            onClick={() => {
              try {
                window.localStorage.setItem(STORAGE_KEY, ACCEPTED)
              } catch {
              }
              setVisible(false)
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

