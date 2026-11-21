import { useState } from 'react'

export default function RechargePanel({ balance, onRecharge, busy }) {
  const [amount, setAmount] = useState('')

  if (Number(balance) >= 100) return null

  async function submit(event) {
    event.preventDefault()
    const success = await onRecharge(amount)
    if (success) setAmount('')
  }

  const remaining = Math.max(0, 10000 - Number(balance || 0))

  return (
    <section className="panel recharge-panel">
      <div className="section-heading">
        <div>
          <h2>Recargar saldo virtual</h2>
          <p>Tu saldo es inferior a 100 €. Puedes solicitar una recarga.</p>
        </div>
        <span className="notice-pill">Saldo bajo</span>
      </div>
      <form className="recharge-form" onSubmit={submit}>
        <div>
          <label htmlFor="recharge-amount">Importe en EUR</label>
          <input
            id="recharge-amount"
            type="number"
            min="0.01"
            max={remaining}
            step="0.01"
            value={amount}
            onChange={event => setAmount(event.target.value)}
            placeholder="Ej. 1000"
            required
          />
          <small className="form-hint">Puedes añadir hasta {remaining.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} para alcanzar el límite de 10.000 €.</small>
        </div>
        <button className="button button-primary" disabled={busy || !amount || Number(amount) <= 0 || Number(amount) > remaining}>
          {busy ? 'Procesando…' : 'Recargar'}
        </button>
      </form>
    </section>
  )
}
