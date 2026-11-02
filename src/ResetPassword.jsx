import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
const [checking, setChecking] = useState(true)
const [recoveryReady, setRecoveryReady] = useState(false)
  useEffect(() => {
  let active = true

  async function checkRecoverySession() {
    const { data, error } = await supabase.auth.getSession()

    const isRecoveryLink =
      window.location.hash.includes('type=recovery')

    if (active) {
      setRecoveryReady(
        !error && !!data.session && isRecoveryLink
      )
      setChecking(false)
    }
  }

  checkRecoverySession()

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      setRecoveryReady(true)
      setChecking(false)
    }
  })

  return () => {
    active = false
    subscription.unsubscribe()
  }
}, [])
  async function updatePassword(e) {
    e.preventDefault()
    setMessage('')
    
if (!recoveryReady) {
  setMessage('Your password reset link is invalid or expired. Please request a new one.')
  return
}
    if (password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Password updated successfully. You can now sign in.')
    await supabase.auth.signOut()
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#090909',
      color: '#fff',
      display: 'grid',
      placeItems: 'center',
      padding: '24px'
    }}>
      <form onSubmit={updatePassword} style={{
        width: '100%',
        maxWidth: '420px',
        background: '#151515',
        border: '1px solid #b89548',
        borderRadius: '14px',
        padding: '28px'
      }}>
        <h1 style={{ color: '#d5b15d' }}>CARS4SALES</h1>
        <h2>Reset Administrator Password</h2>
        <p>Enter and confirm your new password below.</p>

        <label>New password</label>
        <input
          type="password"
          required
          minLength="8"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label>Confirm new password</label>
        <input
          type="password"
          required
          minLength="8"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && <p>{message}</p>}

        <p>
          <a href="/admin" style={{ color: '#d5b15d' }}>
            Return to Administrator Login
          </a>
        </p>
      </form>
    </main>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  margin: '8px 0 20px',
  background: '#222',
  color: '#fff',
  border: '1px solid #555',
  borderRadius: '6px'
}

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: '#c5a052',
  color: '#111',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
  }
