import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('אימייל או סיסמה שגויים. נסי שוב.')
      setSubmitting(false)
    } else {
      navigate('/')
    }
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'teacher' } },
    })
    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSuccess('החשבון נוצר! כעת תוכלי להתחבר.')
      setMode('login')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-kasher-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🔗</div>
          <h1 className="text-3xl font-bold text-kasher-purple">קשר</h1>
          <p className="text-gray-500 mt-1">מערכת רווחת תלמידים</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-white shadow-sm mb-4 overflow-hidden">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-kasher-purple text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            כניסה
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-kasher-purple text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            הרשמה
          </button>
        </div>

        {/* Form */}
        <div className="card">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="name@school.edu" required dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" placeholder="••••••••" required dir="ltr" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <Spinner size="sm" /> : 'כניסה'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="input-field" placeholder="ישראלה ישראלי" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" placeholder="name@school.edu" required dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field" placeholder="לפחות 6 תווים" required dir="ltr" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <Spinner size="sm" /> : 'צרי חשבון'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
