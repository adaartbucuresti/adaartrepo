import { Camera, Mail, MapPin, Phone, Pin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

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
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition hover:bg-brand-light hover:text-brand-dark"
              aria-label="Instagram"
            >
              <Camera className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition hover:bg-brand-light hover:text-brand-dark"
              aria-label="Facebook"
            >
              <Users className="h-5 w-5" />
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-muted transition hover:bg-brand-light hover:text-brand-dark"
              aria-label="Pinterest"
            >
              <Pin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-text-muted md:flex-row">
          <span>© 2026 ADA ART. Toate drepturile rezervate.</span>
          <span>Mobilă la comandă în România</span>
        </div>
      </div>
    </footer>
  )
}

