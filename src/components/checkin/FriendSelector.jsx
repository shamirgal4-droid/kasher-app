import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function FriendSelector({ studentId, studentClass, selected, onToggle, wantsConnection, onToggleConnection }) {
  const [classmates, setClassmates] = useState([])

  useEffect(() => {
    supabase.from('students')
      .select('*')
      .eq('class', studentClass)
      .neq('id', studentId)
      .order('name')
      .then(({ data }) => setClassmates(data || []))
  }, [studentClass, studentId])

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
        עם מי היית רוצה להתחבר?
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        אפשר לבחור כמה שרוצים, או לא לבחור בכלל 🙂
      </p>

      {/* Toggle - wants connection */}
      <button
        onClick={() => onToggleConnection(!wantsConnection)}
        className={`w-full flex items-center gap-4 p-4 rounded-3xl border-2 mb-4 transition-all
                    ${wantsConnection
                      ? 'border-kasher-purple bg-purple-50'
                      : 'border-gray-200 bg-white'
                    }`}
      >
        <span className="text-3xl">{wantsConnection ? '🌟' : '💫'}</span>
        <div className="text-right">
          <div className="font-semibold text-gray-800">אני רוצה להתחבר עם חברים</div>
          <div className="text-sm text-gray-500">לחיצה כדי לסמן</div>
        </div>
        <div className={`mr-auto w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${wantsConnection ? 'bg-kasher-purple border-kasher-purple' : 'border-gray-300'}`}>
          {wantsConnection && <span className="text-white text-xs">✓</span>}
        </div>
      </button>

      {/* Classmates */}
      {classmates.length > 0 && (
        <>
          <p className="text-sm text-gray-400 mb-3 px-1">בחר/י עם מי:</p>
          <div className="grid grid-cols-2 gap-2">
            {classmates.map(student => {
              const isSelected = selected.includes(student.id)
              return (
                <button
                  key={student.id}
                  onClick={() => onToggle(student.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-right transition-all duration-150
                              ${isSelected
                                ? 'border-kasher-green bg-emerald-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                                  ${isSelected ? 'bg-kasher-green border-kasher-green' : 'border-gray-300'}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="font-medium text-gray-800 text-sm">{student.name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {classmates.length === 0 && (
        <div className="text-center text-gray-400 py-4 text-sm">
          אין תלמידים נוספים בכיתה
        </div>
      )}
    </div>
  )
}
