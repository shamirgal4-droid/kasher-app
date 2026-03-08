import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import { ROLES } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

export default function ManagePartners() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('teacher')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setProfiles(data || [])
    setLoading(false)
  }

  async function invite() {
    if (!email.trim()) return
    setInviting(true)
    setMessage(null)

    // Note: inviteUserByEmail requires service role key.
    // This should be done via a Supabase Edge Function in production.
    // For now, we insert into invitations table and show instructions.
    const { error } = await supabase.from('invitations').insert({
      email: email.trim().toLowerCase(),
      role,
    })

    if (error) {
      setMessage({ type: 'error', text: 'שגיאה בשליחת ההזמנה. ייתכן שהאימייל כבר קיים.' })
    } else {
      setMessage({ type: 'success', text: `הזמנה נשלחה ל-${email}` })
      setEmail('')
    }
    setInviting(false)
  }

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ניהול שותפים</h1>

        {/* Invite form */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">הזמן שותף חדש</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@school.edu"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תפקיד</label>
              <div className="flex gap-2">
                {Object.entries(ROLES).filter(([k]) => k !== 'admin').map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setRole(k)}
                    className={`flex-1 py-2.5 rounded-2xl border-2 text-sm font-medium transition-colors
                                ${role === k
                                  ? 'border-kasher-purple bg-purple-50 text-kasher-purple'
                                  : 'border-gray-200 text-gray-600'
                                }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`rounded-xl px-4 py-3 text-sm
                              ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <button
              onClick={invite}
              disabled={inviting || !email.trim()}
              className="btn-primary w-full"
            >
              {inviting ? 'שולח...' : 'שלח הזמנה'}
            </button>
          </div>
        </div>

        {/* Staff list */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">צוות קיים</h2>

          {loading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : (
            <div className="space-y-2">
              {profiles.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-medium text-gray-800">{p.full_name || '—'}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                                    ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                      p.role === 'therapist' ? 'bg-blue-100 text-blue-700' :
                                      'bg-green-100 text-green-700'}`}>
                    {ROLES[p.role] || p.role}
                  </span>
                </div>
              ))}
              {profiles.length === 0 && (
                <div className="text-center text-gray-400 py-4">אין חברי צוות</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
