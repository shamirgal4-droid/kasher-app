import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminNav from '../components/layout/AdminNav'
import { supabase } from '../lib/supabaseClient'
import { analyzeStudent } from '../lib/alerts'

const ALL_STAFF = ['admin', 'teacher', 'therapist', 'counselor', 'principal']

const STAFF_TILES = [
  {
    to: '/dashboard',
    icon: '📊',
    label: 'דשבורד תלמידים',
    desc: 'מצב כל התלמידים במקום אחד',
    color: 'from-blue-400 to-kasher-blue',
    roles: ALL_STAFF,
  },
  {
    to: '/alerts',
    icon: '🚨',
    label: 'התרעות ומעקב',
    desc: 'תלמידים הדורשים תשומת לב',
    color: 'from-red-400 to-orange-500',
    roles: ALL_STAFF,
    alertTile: true,
  },
  {
    to: '/students',
    icon: '👥',
    label: 'ניהול תלמידים',
    desc: 'הוספה, עריכה ומחיקה',
    color: 'from-emerald-400 to-kasher-green',
    roles: ['admin', 'teacher', 'principal'],
  },
  {
    to: '/questions',
    icon: '❓',
    label: 'שאלות הצ\'ק-אין',
    desc: 'יצירה וניהול שאלות',
    color: 'from-purple-400 to-kasher-purple',
    roles: ['admin', 'teacher'],
  },
  {
    to: '/matching',
    icon: '🔗',
    label: 'חיבורים חברתיים',
    desc: 'גרף קשרים וקבוצות רגשיות',
    color: 'from-pink-400 to-rose-500',
    roles: ALL_STAFF,
  },
  {
    to: '/partners',
    icon: '👤',
    label: 'ניהול שותפים',
    desc: 'הזמנת מורים ומטפלים',
    color: 'from-orange-400 to-kasher-warm',
    roles: ['admin'],
  },
]

export default function Home() {
  const { role, profile } = useAuth()
  const navigate = useNavigate()
  const [alertCounts, setAlertCounts] = useState({ red: 0, orange: 0 })

  useEffect(() => {
    if (!role) return
    loadAlerts()
  }, [role])

  async function loadAlerts() {
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
    let red = 0, orange = 0
    students.forEach(s => {
      const a = analyzeStudent(s, ciMap[s.id] || [])
      if (a?.level === 'red') red++
      else if (a?.level === 'orange') orange++
    })
    setAlertCounts({ red, orange })
  }

  const tiles = STAFF_TILES.filter(t => t.roles.includes(role))

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ברכה */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            שלום{profile?.full_name ? `, ${profile.full_name}` : ''}! 👋
          </h1>
          <p className="text-gray-500 mt-1">מה תרצה לעשות היום?</p>
        </div>

        {/* באנר התרעה אדומה אם יש */}
        {alertCounts.red > 0 && (
          <button
            onClick={() => navigate('/alerts')}
            className="w-full bg-red-50 border-2 border-red-300 rounded-3xl p-4 mb-4
                       flex items-center gap-3 hover:bg-red-100 transition-colors animate-fade-in"
          >
            <span className="text-3xl">🔴</span>
            <div className="text-right flex-1">
              <div className="font-bold text-red-700">
                {alertCounts.red} תלמיד{alertCounts.red > 1 ? 'ים' : ''} — חשש ממשי
              </div>
              <div className="text-red-500 text-sm">לחיצה לצפייה בפרטים וטיפול</div>
            </div>
            <span className="text-red-400">←</span>
          </button>
        )}

        {/* כניסה לתלמיד */}
        <button
          onClick={() => navigate('/checkin')}
          className="w-full bg-gradient-to-l from-kasher-purple to-kasher-blue text-white rounded-3xl p-6 mb-6
                     flex items-center gap-4 shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
        >
          <div className="text-5xl">✨</div>
          <div className="text-right">
            <div className="text-xl font-bold">כניסה לתלמיד</div>
            <div className="text-blue-100 text-sm mt-0.5">לחיצה לתחילת הצ'ק-אין</div>
          </div>
        </button>

        {/* כרטיסי צוות */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tiles.map(tile => (
            <button
              key={tile.to}
              onClick={() => navigate(tile.to)}
              className={`bg-gradient-to-bl ${tile.color} text-white rounded-3xl p-5
                         flex items-center gap-4 shadow-sm hover:shadow-md hover:scale-[1.02]
                         transition-all duration-200 text-right relative`}
            >
              <div className="text-4xl">{tile.icon}</div>
              <div>
                <div className="font-bold text-lg leading-tight">{tile.label}</div>
                <div className="text-white/80 text-sm mt-0.5">{tile.desc}</div>
              </div>
              {/* תג מספר התרעות על כרטיס ההתרעות */}
              {tile.alertTile && (alertCounts.red + alertCounts.orange) > 0 && (
                <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold">
                  {alertCounts.red + alertCounts.orange} פעילות
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
