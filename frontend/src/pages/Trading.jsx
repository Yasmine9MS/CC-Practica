
import { useEffect, useState } from 'react'
import { Search, RefreshCw, TrendingUp, Wallet, Coins } from 'lucide-react'
import TradePanel from '../components/TradePanel'

const ITEMS_PER_PAGE = 10

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

function formatDate(value) {
  if (!value) return 'No disponible'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-ES')
}

function StatCard({ label, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <Icon size={19} className="text-primary" />
      </div>

      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  )
}

export default function Trading({
  market,
  portfolio,
  onTrade,
  busy,
  onRefresh,
}) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const assets = portfolio.assets ?? []
  const balance = Number(portfolio.balance) || 0
  const totalValue = Number(portfolio.totalPortfolioValue) || 0
  const assetsValue = totalValue - balance

  const filteredMarket = market.filter(coin =>
    (coin.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (coin.symbol ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMarket.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE

  const paginatedMarket = filteredMarket.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="space-y-8">

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Resumen de cartera
          </h2>
          <p className="mt-1 text-sm text-muted">
            Estado actual de tu saldo y tus activos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Saldo disponible"
            value={euro.format(balance)}
            description="Dinero virtual disponible"
            icon={Wallet}
          />

          <StatCard
            label="Valor de los activos"
            value={euro.format(assetsValue)}
            description="Valor actual de tus criptomonedas"
            icon={Coins}
          />

          <StatCard
            label="Valor total"
            value={euro.format(totalValue)}
            description="Saldo disponible + activos"
            icon={TrendingUp}
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Mercado
          </h2>
          <p className="mt-1 text-sm text-muted">
            Consulta las cotizaciones y realiza operaciones simuladas.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

          <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  Criptomonedas
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Precios actualizados automáticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-[#26363A]"
              >
                <RefreshCw size={15} />
                Actualizar
              </button>
            </div>

            <div className="border-b border-border p-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  type="text"
                  placeholder="Buscar criptomoneda..."
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-border bg-[#151B20] py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {market.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-medium text-foreground">
                  No hay datos de mercado disponibles
                </p>
                <p className="mt-2 text-sm text-muted">
                  Inténtalo de nuevo más tarde.
                </p>
              </div>
            ) : filteredMarket.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-medium text-foreground">
                  No se encontraron criptomonedas
                </p>
                <p className="mt-2 text-sm text-muted">
                  No hay resultados para "{search}".
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#26363A] text-xs font-medium text-muted">
                      <tr>
                        <th className="px-5 py-3">Activo</th>
                        <th className="px-5 py-3">Símbolo</th>
                        <th className="px-5 py-3">Precio</th>
                        <th className="px-5 py-3">Actualización</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {paginatedMarket.map(coin => (
                        <tr
                          key={coin.symbol}
                          className="transition hover:bg-[#26363A]/70"
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                            {coin.name}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-md bg-[#26363A] px-2 py-1 text-xs font-semibold text-primary">
                              {coin.symbol}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-mono font-medium tabular-nums text-foreground">
                            {euro.format(Number(coin.price) || 0)}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">
                            {formatDate(coin.lastUpdated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-border px-5 py-4">
                  <span className="text-xs text-muted">
                    Página {currentPage} de {totalPages}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(page => page - 1)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-[#26363A] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(page => page + 1)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-[#26363A] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <TradePanel
            market={market}
            assets={assets}
            onTrade={onTrade}
            busy={busy}
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Mis activos
          </h2>
          <p className="mt-1 text-sm text-muted">
            Consulta tus posiciones y su rendimiento actual.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {assets.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-medium text-foreground">
                Tu cartera está vacía
              </p>
              <p className="mt-2 text-sm text-muted">
                Cuando realices una compra, tus activos aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#26363A] text-xs font-medium text-muted">
                  <tr>
                    <th className="px-5 py-3">Activo</th>
                    <th className="px-5 py-3">Cantidad</th>
                    <th className="px-5 py-3">Precio medio</th>
                    <th className="px-5 py-3">Precio actual</th>
                    <th className="px-5 py-3">Valor actual</th>
                    <th className="px-5 py-3">Ganancia / Pérdida</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {assets.map(asset => {
                    const profitLoss = Number(asset.profitLoss) || 0
                    const percentage = Number(asset.profitLossPercentage) || 0
                    const positive = profitLoss >= 0

                    return (
                      <tr
                        key={asset.symbol}
                        className="transition hover:bg-[#26363A]/70"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-foreground">
                          {asset.symbol}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-mono text-muted">
                          {asset.quantity}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-mono text-muted">
                          {euro.format(Number(asset.averageBuyPrice) || 0)}
                        </td>

                        <td className="wwhitespace-nowrap px-5 py-4 font-mono text-muted">
                          {euro.format(Number(asset.currentPrice) || 0)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-mono font-medium text-foreground">
                          {euro.format(Number(asset.currentValue) || 0)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`font-mono font-semibold ${positive ? 'text-success' : 'text-danger'}`}>
                            {euro.format(profitLoss)}
                          </span>

                          <span className={`ml-2 font-mono text-xs ${positive ? 'text-success' : 'text-danger'}`}>
                            ({percentage.toFixed(2)} %)
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
