import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-sm sm:p-9">
        <Link
          to="/login"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            C
          </span>

          <span className="text-xl font-bold tracking-tight text-foreground">
            CryptoSim
          </span>
        </Link>

        <header className="mb-7 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        </header>

        {children}

        <div className="mt-6 text-center text-sm text-muted">
          {footer}
        </div>

        <div className="mt-7 border-t border-border pt-5 text-center">
          <p className="text-xs text-muted">
            Simulador educativo · Dinero virtual · EUR
          </p>
        </div>
      </section>
    </main>
  )
}
