import { useState, type FormEvent } from 'react'
import { shortAddress } from '../format'
export function AccountSelector({
  address,
  disabled,
  onChange,
}: {
  address: string | null
  disabled: boolean
  onChange: (address: string | null) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false),
    [value, setValue] = useState(address ?? ''),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const input = value.trim()
    if (input && !/^0x[\da-fA-F]{40}$/.test(input)) {
      setError('Use a full 0x address with 40 hexadecimal characters.')
      return
    }
    setError('')
    setSaving(true)
    try {
      if (await onChange(input ? input.toLowerCase() : null)) setEditing(false)
    } finally {
      setSaving(false)
    }
  }
  return (
    <section className="account-selector" aria-label="Observed account">
      <div>
        <span className="status-dot" />
        <span>{shortAddress(address)}</span>
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => {
            setValue(address ?? '')
            setEditing((v) => !v)
          }}
        >
          {editing ? 'Close' : address ? 'Change account' : 'Select account'}
        </button>
      </div>
      {editing && (
        <form onSubmit={submit}>
          <label htmlFor="observed-address">
            Public user or specific subaccount address
          </label>
          <div className="address-input">
            <input
              id="observed-address"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0x…"
              disabled={disabled || saving}
            />
            <button className="primary-action" disabled={disabled || saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          <p>
            Observed address does not prove ownership. Changing it preserves
            history with each message’s original address.
          </p>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
      <p className="scope-note">Hyperliquid · Default perpetuals · Read-only</p>
    </section>
  )
}
