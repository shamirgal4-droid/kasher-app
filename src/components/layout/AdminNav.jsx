import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { analyzeStudent } from '../../lib/alerts'

const ALL_STAFF = ['admin', 'teacher', 'therapist', 'counselor', 'principal']

const NAV_ITEMS = [
  { to: '/',          label: 'בית',      icon: '🏠', roles: ALL_STAFF },
  { to: '/dashboard', label: 'דשבורד',   icon: '📊', roles: ALL_STAFF },
  { to: '/alerts',    label: 'התרעות',   icon: '🚨', roles: ALL_STAFF, badge: true },
  { to: '/students',  label: 'תלמידים',  icon: '👥', roles: ['admin', 'teacher', 'principal'] },
  { to: '/questions', label: 'שאלות',    icon: '❓', roles: ['admin', 'teacher'] },
  { to: '/matching',  label: 'חיבורים',  icon: '🔗', roles: ALL_STAFF },
  { to: '/partners',  label: 'שותפים',   icon: '👤', roles: ['admin'] },
]

export default function AdminNav() {
  const { role, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [redCount, setRedCount] = useState(0)

  useEffect(() => {
    if (!role) return
    loadAlertCount()
  }, [role])

  async function loadAlertCount() {
    const cutoff = new Date(Date.now() - 14 * 86400000).toISOString()
    const [{ data: students }, { data: cis }] = await Promise.all([
      supabase.from('students').select('id,name,class'),
      supabase.from('check_ins').select('*').gte('created_at', cutoff).order('created_at', { ascending: false }),
    ])
    if (!students) return
    const ciMap = {}
    ;(cis || []).forEach(ci => {
      if (!ciMap[ci.student_id]) ciMap[ci.student_id] = []
      ciMap[ci.student_id].push(ci)
    })
    const reds = students.filter(s => analyzeStudent(s, ciMap[s.id] || [])?.level === 'red').length
    setRedCount(reds)
  }

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold text-kasher-purple flex items-center gap-2 shrink-0">
          🔗 קשר
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap
                 ${isActive ? 'bg-kasher-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <span>{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
              {/* תג ספירת התרעות אדומות */}
              {item.badge && redCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {redCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User + logout */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-gray-500 hidden md:block">{profile?.full_name}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            יציאה
          </button>
        </div>
      </div>
    </nav>
  )
}
