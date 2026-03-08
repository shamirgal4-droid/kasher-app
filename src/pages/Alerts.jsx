import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import { analyzeStudent, ALERT_CONFIG } from '../lib/alerts'
import { MOOD_EMOJIS, MOOD_LABELS, SOCIAL_PATTERNS } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

const TREND_ICON = { declining: '📉', improving: '📈', stable: '➡️' }
const TREND_LABEL = { declining: 'ירידה', improving: 'עלייה', stable: 'יציב' }

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [classFilter, setClassFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    // שליפת כל התלמידים
    const { data: students } = await supabase
      .from('students').select('*').order('name')

    if (!students?.length) { setLoading(false); return }

    // שליפת היסטוריית צ'ק-אינים לכל תלמיד (7 ימים אחרונים, מסודר חדש לישן)
    const cutoff = new Date(Date.now() - 14 * 86400000).toISOString()
    const { data: allCIs } = await supabase
      .from('check_ins')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })

    const ciByStudent = {}
    ;(allCIs || []).forEach(ci => {
      if (!ciByStudent[ci.student_id]) ciByStudent[ci.student_id] = []
      ciByStudent[ci.student_id].push(ci)
    })

    // ניתוח כל תלמיד
    const results = students
      .map(s => analyzeStudent(s, ciByStudent[s.id] || []))
      .filter(Boolean)
      .sort((a, b) => {
        const order = { red: 0, orange: 1, yellow: 2 }
        return order[a.level] - order[b.level]
      })

    setAlerts(results)
    setLoading(false)
  }

  const classes = ['all', ...new Set(alerts.map(a => a.student.class))]

  const filtered = alerts.filter(a => {
    if (classFilter !== 'all' && a.student.class !== classFilter) return false
    if (levelFilter !== 'all' && a.level !== levelFilter) return false
    return true
  })

  const redCount    = alerts.filter(a => a.level === 'red').length
  const orangeCount = alerts.filter(a => a.level === 'orange').length
  const yellowCount = alerts.filter(a => a.level === 'yellow').length

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* כותרת */}
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">🚨</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">התרעות ומעקב</h1>
            <p className="text-gray-500 text-sm">מבוסס על צ'ק-אינים מ-14 הימים האחרונים</p>
          </div>
        </div>

        {/* סיכום מהיר */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { level: 'red',    count: redCount,    label: 'חשש ממשי' },
            { level: 'orange', count: orangeCount, label: 'מעקב' },
            { level: 'yellow', count: yellowCount, label: 'שים לב' },
          ].map(({ level, count, label }) => {
            const cfg = ALERT_CONFIG[level]
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(levelFilter === level ? 'all' : level)}
                className={`card text-center transition-all duration-150 border-2
                            ${levelFilter === level ? `${cfg.border} ${cfg.bg}` : 'border-transparent hover:border-gray-200'}`}
              >
                <div className={`text-2xl font-bold ${cfg.text}`}>{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                <div className="text-lg mt-1">{cfg.icon}</div>
              </button>
            )
          })}
        </div>

        {/* פילטר כיתה */}
        {classes.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {classes.map(cls => (
              <button key={cls} onClick={() => setClassFilter(cls)}
                className={`px-3 py-1.5 rounded-xl text-sm whitespace-nowrap transition-colors
                            ${classFilter === cls ? 'bg-kasher-purple text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {cls === 'all' ? 'כל הכיתות' : `כיתה ${cls}`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-gray-700">אין התרעות פעילות</p>
            <p className="text-gray-400 text-sm mt-1">כל התלמידים במצב תקין</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(alert => {
              const cfg = ALERT_CONFIG[alert.level]
              const isOpen = expanded === alert.student.id

              return (
                <div key={alert.student.id}
                  className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-200`}>

                  {/* שורה ראשית */}
                  <button
                    className="w-full flex items-center gap-3 p-4 text-right"
                    onClick={() => setExpanded(isOpen ? null : alert.student.id)}
                  >
                    {/* אייקון רמה */}
                    <span className="text-2xl shrink-0">{cfg.icon}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800">{alert.student.name}</span>
                        <span className="text-xs text-gray-400">כיתה {alert.student.class}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${cfg.badgeBg}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {/* הסיבה הראשונה */}
                      <div className={`text-sm mt-0.5 ${cfg.text}`}>
                        {alert.flags[0].reason}
                      </div>
                    </div>

                    {/* חץ */}
                    <span className="text-gray-400 shrink-0">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {/* פרטים מורחבים */}
                  {isOpen && (
                    <div className="border-t border-current/10 px-4 pb-4 pt-3 space-y-4 animate-fade-in">

                      {/* כל הדגלים */}
                      {alert.flags.length > 1 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">כל הממצאים:</p>
                          <ul className="space-y-1">
                            {alert.flags.map((f, i) => (
                              <li key={i} className={`text-sm flex items-start gap-2 ${cfg.text}`}>
                                <span className="mt-0.5">•</span>
                                <span>{f.reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* מצב רוח אחרון */}
                      {alert.latest && (
                        <div className="flex items-center gap-3 bg-white/60 rounded-2xl px-3 py-2">
                          <span className="text-3xl">{MOOD_EMOJIS[alert.latest.mood]}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              {MOOD_LABELS[alert.latest.mood]}
                            </div>
                            {alert.latest.social_pattern && (
                              <div className="text-xs text-gray-500">
                                {SOCIAL_PATTERNS[alert.latest.social_pattern]?.label}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              {new Date(alert.latest.created_at).toLocaleDateString('he-IL', {
                                weekday: 'long', day: 'numeric', month: 'long'
                              })}
                            </div>
                          </div>
                          <div className="mr-auto text-sm">
                            {TREND_ICON[alert.moodTrend]} {TREND_LABEL[alert.moodTrend]}
                          </div>
                        </div>
                      )}

                      {/* המלצת פעולה */}
                      <div className="bg-white/70 rounded-2xl px-3 py-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">המלצת פעולה:</p>
                        <p className="text-sm text-gray-700">
                          {alert.level === 'red' && '⚡ יש לפנות לתלמיד/ה ישירות בהקדם. מומלץ להעביר לטיפול המטפל/ת או היועץ/ת.'}
                          {alert.level === 'orange' && '👀 מומלץ לנהל שיחה קצרה עם התלמיד/ה ולעקוב ביומיים הקרובים.'}
                          {alert.level === 'yellow' && '📋 שמור/י עין. אם הדפוס נמשך מחר — הגבר/י מעקב.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
