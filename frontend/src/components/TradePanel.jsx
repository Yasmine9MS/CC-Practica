
import { useMemo, useState } from 'react'
import { ArrowDownUp, ShoppingCart, TrendingDown } from 'lucide-react'

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export default function TradePanel({ market, assets, onTrade, busy }) {
  const [side, setSide] = useState('BUY')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')

  const selected = market.find(item => item.symbol === symbol)

  const owned = useMemo(
    () => assets.find(asset => asset.symbol === symbol),
    [assets, symbol],
  )

  const amount =
    selected && Number(quantity) > 0
      ? selected.price * Number(quantity)
      : 0

  const validQuantity =
    quantity !== '' &&
    Number.isFinite(Number(quantity)) &&
    Number(quantity) > 0

  const canTrade =
    !busy &&
    selected &&
    validQuantity &&
    (side === 'BUY' ||
      (owned && Number(quantity) <= Number(owned.quantity)))

  async function submit(event) {
    event.preventDefault()

    if (!canTrade) return

    const completed = await onTrade({
      side,
      symbol,
      quantity,
    })

    if (completed) {
      setQuantity('')
    }
  }

  function changeSide(nextSide) {
    setSide(nextSide)
    setQuantity('')
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      {/* Cabecera */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ArrowDownUp size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-foreground">
              Realizar operación
            </h2>
            <p className="text-xs text-muted">
              Compra o vende criptomonedas
            </p>
          </div>
        </div>
      </div>

      {/* Selector de operación */}
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-[#151B20] p-1">
        <button
          type="button"
          onClick={() => changeSide('BUY')}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            side === 'BUY'
              ? 'bg-[#26363A] text-primary shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ShoppingCart size={16} />
          Comprar
        </button>

        <button
          type="button"
          onClick={() => changeSide('SELL')}
          className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            side === 'SELL'
              ? 'bg-[#26363A] text-danger shadow-sm'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <TrendingDown size={16} />
          Vender
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Criptomoneda */}
        <div>
          <label
            htmlFor="trade-symbol"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Criptomoneda
          </label>

          <select
            id="trade-symbol"
            value={symbol}
            onChange={event => {
              setSymbol(event.target.value)
              setQuantity('')
            }}
            required
            className="w-full rounded-lg border border-border bg-[#151B20] px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Selecciona una criptomoneda</option>

            {market.map(coin => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Precio actual */}
        {selected && (
          <div className="flex items-center justify-between rounded-lg bg-[#26363A] px-3 py-3">
            <span className="text-sm text-muted">Precio actual</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {euro.format(Number(selected.price) || 0)}
            </span>
          </div>
        )}

        {/* Cantidad */}
        <div>
          <label
            htmlFor="trade-quantity"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Cantidad
          </label>

          <input
            id="trade-quantity"
            type="number"
            min="0.00000001"
            step="any"
            value={quantity}
            onChange={event => setQuantity(event.target.value)}
            placeholder="Ej. 0.01"
            required
            className="w-full rounded-lg border border-border bg-[#151B20] px-3 py-2.5 font-mono text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />

          {side === 'SELL' && owned && (
            <p className="mt-2 text-xs text-muted">
              Disponible: {owned.quantity} {symbol}
            </p>
          )}

          {side === 'SELL' && symbol && !owned && (
            <p className="mt-2 text-xs text-danger">
              No tienes unidades de esta criptomoneda.
            </p>
          )}

          {side === 'SELL' &&
            owned &&
            validQuantity &&
            Number(quantity) > Number(owned.quantity) && (
              <p className="mt-2 text-xs text-danger">
                La cantidad supera tus unidades disponibles.
              </p>
            )}
        </div>

        {/* Importe estimado */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              Importe estimado
            </span>

            <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {euro.format(amount)}
            </span>
          </div>
        </div>

        {/* Confirmación */}
        <button
          type="submit"
          disabled={!canTrade}
          className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            side === 'BUY'
              ? 'bg-primary text-[#10201F] hover:bg-primary-hover'
              : 'bg-danger text-white hover:bg-danger/90'
          }`}
        >
          {busy
            ? 'Procesando...'
            : side === 'BUY'
              ? 'Confirmar compra'
              : 'Confirmar venta'}
        </button>

        <p className="text-xs leading-relaxed text-muted">
          Las operaciones son simuladas. El Trading Service valida el precio,
          el saldo y la cantidad disponible antes de ejecutarlas.
        </p>
      </form>
    </section>
  )
}
