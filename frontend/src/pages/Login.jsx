import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRequest } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      localStorage.setItem('accessToken', result.accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para consultar tu mercado y tu cartera."
      footer={
        <>
          ¿Todavía no tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Regístrate
          </Link>
        </>
      }
    >
      {location.state?.message && (
        <p
          className="mb-5 rounded-lg border border-success/20 bg-success/5 px-4 py-3 text-sm text-success"
          role="status"
        >
          {location.state.message}
        </p>
      )}

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
            autoComplete="current-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
            placeholder="Tu contraseña"
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
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
          {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  )
}
