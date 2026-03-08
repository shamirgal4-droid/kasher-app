import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Spinner from '../ui/Spinner'

export default function StudentSelector({ onSelect }) {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('students').select('*').order('class').order('name')
      .then(({ data }) => { setStudents(data || []); setLoading(false) })
  }, [])

  const filtered = students.filter(s =>
    s.name.includes(search) || s.class.includes(search)
  )

  const byClass = filtered.reduce((acc, s) => {
    if (!acc[s.class]) acc[s.class] = []
    acc[s.class].push(s)
    return acc
  }, {})

  if (loading) return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">מי את/ה?</h2>
      <p className="text-center text-gray-500 mb-6">בחר/י את השם שלך</p>

      <input
        type="text"
        placeholder="חיפוש לפי שם..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input-field mb-6"
        autoFocus
      />

      {Object.keys(byClass).length === 0 && (
        <div className="text-center text-gray-400 py-8">
          לא נמצאו תלמידים
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(byClass).map(([cls, students]) => (
          <div key={cls}>
            <div className="text-sm font-semibold text-gray-400 mb-2 px-1">כיתה {cls}</div>
            <div className="grid grid-cols-2 gap-2">
              {students.map(student => (
                <button
                  key={student.id}
                  onClick={() => onSelect(student)}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-4 text-right
                             hover:border-kasher-purple hover:bg-purple-50 hover:scale-[1.02]
                             active:scale-95 transition-all duration-150 font-medium text-gray-800"
                >
                  {student.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
