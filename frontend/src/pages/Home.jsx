
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Trading from './Trading'
import Portfolio from './Portfolio'
import { apiRequest, clearSession } from '../services/api'

const pageInfo = {
  trading: {
    title: 'Operar',
    description: 'Consulta el mercado y gestiona tus operaciones.',
  },
  portfolio: {
    title: 'Mi cartera',
    description: 'Consulta tu saldo y gestiona tus fondos virtuales.',
  },
}

export default function Home() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('trading')
  const [portfolio, setPortfolio] = useState(null)
  const [market, setMarket] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const logout = useCallback(() => {
    clearSession()
    navigate('/login', { replace: true })
  }, [navigate])

  const loadData = useCallback(async () => {
    setError('')

    try {
      const [portfolioData, marketData] = await Promise.all([
        apiRequest('/api/portfolio'),
        apiRequest('/api/market/cryptocurrencies'),
      ])

      setPortfolio(portfolioData)
      setMarket(marketData?.cryptocurrencies ?? [])
    } catch (err) {
      if (/401|sesión no es válida/i.test(err.message)) {
        logout()
        return
      }

      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [logout])

  const loadMarket = useCallback(async () => {
    try {
      const marketData = await apiRequest('/api/market/cryptocurrencies')
      setMarket(marketData?.cryptocurrencies ?? [])
    } catch (err) {
      console.error('Error updating market:', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    const interval = setInterval(loadMarket, 60000)
    return () => clearInterval(interval)
  }, [loadMarket])

  async function executeTrade({ side, symbol, quantity }) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const result = await apiRequest(`/api/trades/${side.toLowerCase()}`, {
        method: 'POST',
        body: JSON.stringify({
          symbol,
          quantity: Number(quantity),
        }),
      })

      const action = side === 'BUY' ? 'Compra' : 'Venta'

      setNotice(
        `${action} completada: ${result.quantity} ${result.symbol} por ${formatEUR(result.total)}.`,
      )

      await loadData()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  async function recharge(amount) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const result = await apiRequest('/api/balance/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) }),
      })

      setNotice(
        `Recarga completada. Nuevo saldo: ${formatEUR(result.newBalance)}.`,
      )

      await loadData()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const currentPage = pageInfo[activeTab]

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
            C
          </div>
          <p className="mt-4 text-sm text-muted">Cargando CryptoSim...</p>
        </div>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab)
            setError('')
            setNotice('')
          }}
          onLogout={logout}
        />
      </div>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                CryptoSim
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {currentPage.title}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {currentPage.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted">
                EUR · VIRTUAL
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-danger md:hidden"
              >
                Salir
              </button>
            </div>
          </header>

          {error && (
            <div
              className="mb-6 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              className="mb-6 rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
              role="status"
            >
              {notice}
            </div>
          )}

          {!portfolio ? (
            <section className="rounded-xl border border-border bg-surface p-8">
              <h2 className="font-semibold text-foreground">
                No se ha podido cargar la información
              </h2>
              <p className="mt-2 text-sm text-muted">
                Comprueba la conexión con los servicios e inténtalo de nuevo.
              </p>
              <button
                type="button"
                className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                onClick={loadData}
              >
                Reintentar
              </button>
            </section>
          ) : (
            <>
              {activeTab === 'trading' && (
                <Trading
                  market={market}
                  portfolio={portfolio}
                  onTrade={executeTrade}
                  busy={busy}
                  onRefresh={loadData}
                />
              )}

              {activeTab === 'portfolio' && (
                <Portfolio
                  portfolio={portfolio}
                  onRecharge={recharge}
                  busy={busy}
                />
              )}
            </>
          )}

          <footer className="mt-12 border-t border-border pt-5 text-xs text-muted">
            CryptoSim · Simulador educativo de compraventa de criptomonedas · No utiliza dinero real.
          </footer>
        </div>
      </main>
    </div>
  )
}

function formatEUR(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0)
}
