import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#18181B', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#27272A', borderRadius: '12px', padding: '40px',
        width: '100%', maxWidth: '380px', border: '1px solid #3F3F46'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#F5B11C', letterSpacing: '-0.5px' }}>
            1624 Cards
          </div>
          <div style={{ color: '#71717A', fontSize: '13px', marginTop: '4px' }}>Admin Panel</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#A1A1AA', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '10px 12px', background: '#18181B',
                border: '1px solid #3F3F46', borderRadius: '8px', color: '#F4F4F5',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="admin@1624cards.ch"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#A1A1AA', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '10px 12px', background: '#18181B',
                border: '1px solid #3F3F46', borderRadius: '8px', color: '#F4F4F5',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ color: '#F87171', fontSize: '13px', textAlign: 'center' }}>{error}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: '#0B42A7',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '4px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
