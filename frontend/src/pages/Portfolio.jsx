
import { useState } from 'react'

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export default function Portfolio({ portfolio, onRecharge, busy }) {
  const [amount, setAmount] = useState('')

  const balance = Number(portfolio.balance) || 0
  const totalValue = Number(portfolio.totalPortfolioValue) || 0
  const assetsValue = totalValue - balance
  const assets = portfolio.assets ?? []

  async function handleRecharge(event) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) return

    const completed = await onRecharge(amount)

    if (completed) {
      setAmount('')
    }
  }

  const stats = [
    {
      label: 'Saldo disponible',
      value: euro.format(balance),
      description: 'Dinero virtual disponible',
    },
    {
      label: 'Valor de los activos',
      value: euro.format(assetsValue),
      description: 'Valor actual de tus criptomonedas',
    },
    {
      label: 'Valor total de cartera',
      value: euro.format(totalValue),
      description: 'Saldo disponible más activos',
    },
    {
      label: 'Posiciones abiertas',
      value: assets.length,
      description: 'Criptomonedas en tu cartera',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => (
          <article
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-sm font-medium text-muted">
              {stat.label}
            </p>

            <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-muted">
              {stat.description}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Recargar saldo virtual
          </h2>
          <p className="mt-1 text-sm text-muted">
            Añade fondos virtuales para realizar nuevas operaciones.
          </p>
        </div>

        <form
          onSubmit={handleRecharge}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="recharge-amount"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Importe de la recarga (EUR)
            </label>

            <input
              id="recharge-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              placeholder="Ej. 1000"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <button
            type="submit"
            disabled={busy || !amount || Number(amount) <= 0}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Procesando...' : 'Recargar saldo'}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted">
          El saldo utilizado en CryptoSim es completamente virtual.
          No se realizan pagos reales.
        </p>
      </section>
    </div>
  )
}
