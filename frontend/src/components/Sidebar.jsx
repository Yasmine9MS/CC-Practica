
import { LayoutDashboard, Wallet, LogOut } from 'lucide-react'

const items = [
  {
    id: 'trading',
    label: 'Operar',
    icon: LayoutDashboard,
  },
  {
    id: 'portfolio',
    label: 'Mi cartera',
    icon: Wallet,
  },
]

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
          C
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          CryptoSim
        </span>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Plataforma
        </p>

        <nav className="space-y-1" aria-label="Navegación principal">
          {items.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-background hover:text-foreground'
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-5">
        <div className="mb-5 rounded-lg bg-background p-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Modo demo
          </span>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            Simulación con saldo virtual en EUR. No se realizan pagos reales.
          </p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-danger"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
