
import TradePanel from '../components/TradePanel'
import { useEffect, useState } from 'react'

const euro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const ITEMS_PER_PAGE = 10

function formatDate(value) {
  if (!value) return 'No disponible'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('es-ES')
}

export default function Market({
  market,
  assets,
  onTrade,
  busy,
}) {

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)


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
    <div className="page-section">
      <section className="panel market-panel">
        <div className="section-heading">
          <div>
            <h2>Mercado de criptomonedas</h2>
            <p>
              Precios actuales actualizados automáticamente.
            </p>
          </div>
        </div>


        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar criptomoneda por nombre o símbolo..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>


        {market.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◈</span>
            <strong>No hay datos de mercado disponibles</strong>
            <p>
              No se han recibido cotizaciones. Inténtalo
              de nuevo más tarde.
            </p>
          </div>

        
        ) : filteredMarket.length === 0 ? (
          <div className="empty-state">
            <strong>No se encontraron criptomonedas</strong>
            <p>
              No hay resultados para "{search}".
            </p>
          </div>

        ) : (
          <>
            
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Criptomoneda</th>
                    <th>Símbolo</th>
                    <th>Precio actual</th>
                    <th>Última actualización</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedMarket.map(coin => (
                    <tr key={coin.symbol}>
                      <td>
                        <strong>{coin.name}</strong>
                      </td>

                      <td>
                        <span className="symbol-label">
                          {coin.symbol}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {euro.format(Number(coin.price) || 0)}
                        </strong>
                      </td>

                      <td className="date-cell">
                        {formatDate(coin.lastUpdated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            <div className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>

      <TradePanel
        market={market}
        assets={assets}
        onTrade={onTrade}
        busy={busy}
      />
    </div>
  )
}
