import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

function TikTokIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M16 3c.6 2.7 2.5 4.7 5 5v3c-1.9 0-3.6-.6-5-1.7V15c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V3h3z"
        fill="currentColor"
      />
    </svg>
  )
}

function FacebookIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-heading text-2xl font-semibold tracking-[0.22em] text-brand-dark">
            ADA ART
          </div>
          <p className="mt-3 text-sm text-text-muted">
            Mobilă la comandă, gândită pentru spațiul tău. Design personalizat, materiale premium,
            execuție impecabilă.
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-text-dark">Navigare</div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link className="text-text-muted hover:text-brand-mid" to="/">
              Acasă
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/mobila-la-comanda-bucuresti/">
              Mobilă la comandă București
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/produse">
              Produse
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/configurator">
              Configurator
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/despre">
              Despre
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/contact">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-text-dark">Contact</div>
          <div className="mt-4 flex flex-col gap-3 text-sm text-text-muted">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-brand-mid" />
              <span>mobdesign.ro@outlook.com</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-brand-mid" />
              <span>+40 712 345 678</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-mid" />
              <span>Str. Vasile Stolnicul, Nr.3 Zona Baicului sector 2, Bucuresti</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-text-dark">Social</div>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.tiktok.com/@adaartbucuresti"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition hover:bg-brand-light hover:text-brand-dark"
              aria-label="TikTok"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/MobDesign"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition hover:bg-brand-light hover:text-brand-dark"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-6 text-sm font-semibold text-text-dark">Legal</div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link className="text-text-muted hover:text-brand-mid" to="/politica-confidentialitate">
              Politica de Confidențialitate
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/termeni-conditii">
              Termeni și Condiții
            </Link>
            <Link className="text-text-muted hover:text-brand-mid" to="/politica-cookies">
              Politica Cookie-uri
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-text-muted md:flex-row">
          <span>© 2026 Ada Art Mob SRL. Toate drepturile rezervate.</span>
          <span>Mobilă la comandă în București</span>
        </div>
      </div>
    </footer>
  )
}

