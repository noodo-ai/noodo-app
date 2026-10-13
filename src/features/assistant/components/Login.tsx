import { useState, type FormEvent } from 'react'
import { NoodoMark } from '../../../shared/components/NoodoMark'
export function Login({
  loading,
  error,
  onLogin,
}: {
  loading: boolean
  error: string
  onLogin: (username: string, password: string) => Promise<void>
}) {
  const [username, setUsername] = useState(''),
    [password, setPassword] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void onLogin(username, password).then(() => setPassword(''))
  }
  return (
    <main className="login-shell">
      <form className="login-form" onSubmit={submit}>
        <NoodoMark label="NOODO" />
        <h1>Understand your Hyperliquid account.</h1>
        <p>
          Read-only market, position and risk analysis. Sign in with your
          invited account.
        </p>
        <label>
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={100}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            maxLength={256}
          />
        </label>
        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}
        <button
          className="primary-action"
          disabled={loading || !username || !password}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="scope-note">
          No wallet connection, signature or private key required.
        </p>
      </form>
    </main>
  )
}
