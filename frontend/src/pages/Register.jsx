import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRequest } from '../services/api'

export default function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      navigate('/login', {
        replace: true,
        state: {
          message: `Cuenta creada correctamente. Se han asignado ${Number(user.balance).toLocaleString('es-ES')} ${user.currency} virtuales. Ya puedes iniciar sesión.`,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crear una cuenta"
      subtitle="Regístrate para empezar a practicar con una cartera virtual."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-foreground"
          >
            Nombre de usuario
          </label>

          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={event => setUsername(event.target.value)}
            minLength={3}
            maxLength={50}
            required
            placeholder="Tu nombre de usuario"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Contraseña
          </label>

          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            minLength={6}
            maxLength={100}
            required
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
          <p className="text-xs font-medium text-muted">
            Saldo virtual inicial
          </p>

          <p className="mt-1 text-xl font-semibold tracking-tight text-primary">
            10.000,00 €
          </p>

          <p className="mt-1.5 text-xs text-muted">
            Lo asigna automáticamente el Trading Service.
          </p>
        </div>

        {error && (
          <p
            className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  )
}
