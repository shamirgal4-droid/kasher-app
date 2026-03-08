import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import { MOOD_COLORS, SOCIAL_PATTERNS } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

function buildGraph(students, checkIns) {
  const studentMap = {}
  students.forEach(s => { studentMap[s.id] = s })

  // Build connections from last 7 days
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()
  const recentCIs = checkIns.filter(ci => ci.created_at >= cutoff)

  // Who wants to connect with whom
  const wants = {}
  recentCIs.forEach(ci => {
    if (!ci.preferred_connections) return
    if (!wants[ci.student_id]) wants[ci.student_id] = new Set()
    ci.preferred_connections.forEach(id => wants[ci.student_id].add(id))
  })

  // Mutual connections
  const mutuals = []
  const seen = new Set()
  Object.entries(wants).forEach(([aId, bIds]) => {
    bIds.forEach(bId => {
      const key = [aId, bId].sort().join('-')
      if (!seen.has(key) && wants[bId]?.has(aId)) {
        mutuals.push({ a: aId, b: bId })
        seen.add(key)
      }
    })
  })

  return { studentMap, wants, mutuals }
}

function CircleGraph({ students, checkIns, lastCI }) {
  const svgRef = useRef(null)
  const W = 500, H = 400, R = 160, CX = 250, CY = 210

  const { mutuals, wants } = buildGraph(students, checkIns)

  // Position students in a circle
  const positions = {}
  students.forEach((s, i) => {
    const angle = (2 * Math.PI * i) / students.length - Math.PI / 2
    positions[s.id] = {
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
    }
  })

  const getMoodColor = (studentId) => {
    const ci = lastCI[studentId]
    return ci?.mood ? MOOD_COLORS[ci.mood] : '#d1d5db'
  }

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg mx-auto">
      {/* Mutual connections */}
      {mutuals.map(({ a, b }) => {
        const pa = positions[a], pb = positions[b]
        if (!pa || !pb) return null
        return (
          <line key={`${a}-${b}`}
            x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke="#8B7EC8" strokeWidth="2.5" opacity="0.5"
            strokeDasharray="none"
          />
        )
      })}

      {/* One-sided wants */}
      {Object.entries(wants).map(([aId, bIds]) =>
        Array.from(bIds).map(bId => {
          const isMutual = mutuals.some(m =>
            (m.a === aId && m.b === bId) || (m.a === bId && m.b === aId)
          )
          if (isMutual) return null
          const pa = positions[aId], pb = positions[bId]
          if (!pa || !pb) return null
          return (
            <line key={`${aId}-${bId}-one`}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="#d1d5db" strokeWidth="1.5" opacity="0.4"
              strokeDasharray="4 3"
            />
          )
        })
      )}

      {/* Student nodes */}
      {students.map(s => {
        const p = positions[s.id]
        if (!p) return null
        const color = getMoodColor(s.id)
        return (
          <g key={s.id}>
            <circle cx={p.x} cy={p.y} r="18" fill={color} stroke="white" strokeWidth="3" />
            <text
              x={p.x} y={p.y + 32}
              textAnchor="middle"
              fontSize="10"
              fill="#4b5563"
              fontFamily="Rubik"
            >
              {s.name.split(' ')[0]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function StudentMatching() {
  const [students, setStudents] = useState([])
  const [checkIns, setCheckIns] = useState([])
  const [lastCI, setLastCI] = useState({})
  const [loading, setLoading] = useState(true)
  const [classFilter, setClassFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()
      const [studRes, ciRes, lastRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('check_ins').select('*').gte('created_at', cutoff),
        supabase.from('latest_check_ins').select('*'),
      ])
      setStudents(studRes.data || [])
      setCheckIns(ciRes.data || [])
      const lastMap = {}
      ;(lastRes.data || []).forEach(ci => { lastMap[ci.student_id] = ci })
      setLastCI(lastMap)
      setLoading(false)
    }
    load()
  }, [])

  const classes = ['all', ...new Set(students.map(s => s.class))]
  const filtered = classFilter === 'all' ? students : students.filter(s => s.class === classFilter)

  // Emotional groups
  const groups = {
    thriving: filtered.filter(s => lastCI[s.id]?.mood >= 4),
    neutral:  filtered.filter(s => lastCI[s.id]?.mood === 3),
    struggling: filtered.filter(s => lastCI[s.id]?.mood <= 2),
    noData:   filtered.filter(s => !lastCI[s.id]),
  }

  const { mutuals } = buildGraph(filtered, checkIns)

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">חיבורים חברתיים</h1>
        <p className="text-gray-500 text-sm mb-6">מבוסס על צ'ק-אינים מ-7 הימים האחרונים</p>

        {/* Class filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {classes.map(cls => (
            <button key={cls} onClick={() => setClassFilter(cls)}
              className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap transition-colors
                          ${classFilter === cls ? 'bg-kasher-purple text-white' : 'bg-white text-gray-600'}`}>
              {cls === 'all' ? 'כל הכיתות' : `כיתה ${cls}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            {/* Graph */}
            {filtered.length > 0 && (
              <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-700">גרף חיבורים</h2>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span><span className="inline-block w-4 h-0.5 bg-kasher-purple align-middle ml-1"></span> חיבור הדדי</span>
                    <span><span className="inline-block w-4 border-t-2 border-dashed border-gray-300 align-middle ml-1"></span> חד-צדדי</span>
                  </div>
                </div>
                <CircleGraph students={filtered} checkIns={checkIns} lastCI={lastCI} />
                <p className="text-center text-xs text-gray-400 mt-2">
                  {mutuals.length} חיבורים הדדיים
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="card mb-6">
              <h2 className="font-semibold text-gray-700 mb-3">מקרא צבעים</h2>
              <div className="flex flex-wrap gap-3">
                {[5,4,3,2,1].map(m => (
                  <div key={m} className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: MOOD_COLORS[m] }} />
                    <span className="text-xs text-gray-600">מצב {m}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                  <span className="text-xs text-gray-600">ללא נתונים</span>
                </div>
              </div>
            </div>

            {/* Emotional groups */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'thriving',   label: 'מצב רוח טוב',   emoji: '🌟', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { key: 'neutral',    label: 'מצב ממוצע',     emoji: '😐', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
                { key: 'struggling', label: 'זקוקים לתשומת לב', emoji: '💙', bg: 'bg-red-50',   border: 'border-red-200' },
                { key: 'noData',     label: 'ללא צ\'ק-אין',   emoji: '❓', bg: 'bg-gray-50',   border: 'border-gray-200' },
              ].map(g => (
                <div key={g.key} className={`${g.bg} border ${g.border} rounded-2xl p-4`}>
                  <div className="font-semibold text-sm text-gray-700 mb-2">
                    {g.emoji} {g.label} ({groups[g.key].length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {groups[g.key].map(s => (
                      <span key={s.id} className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-600">
                        {s.name}
                      </span>
                    ))}
                    {groups[g.key].length === 0 && <span className="text-xs text-gray-400">אין</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
