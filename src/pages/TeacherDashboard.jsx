import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import StudentStatusCard from '../components/dashboard/StudentStatusCard'
import { MOOD_EMOJIS, MOOD_LABELS, SOCIAL_PATTERNS } from '../lib/constants'
import Spinner from '../components/ui/Spinner'

export default function TeacherDashboard() {
  const [students, setStudents] = useState([])
  const [checkIns, setCheckIns] = useState({})
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [classFilter, setClassFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [studRes, ciRes, notesRes] = await Promise.all([
      supabase.from('students').select('*').order('class').order('name'),
      supabase.from('latest_check_ins').select('*'),
      supabase.from('student_notes').select('student_id'),
    ])

    setStudents(studRes.data || [])

    const ciMap = {}
    ;(ciRes.data || []).forEach(ci => { ciMap[ci.student_id] = ci })
    setCheckIns(ciMap)

    const noteSet = new Set((notesRes.data || []).map(n => n.student_id))
    const notesObj = {}
    noteSet.forEach(id => { notesObj[id] = true })
    setNotes(notesObj)

    setLoading(false)
  }

  async function openStudent(student) {
    setSelectedStudent(student)
    setNoteText('')
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
  }

  async function saveNote() {
    if (!noteText.trim()) return
    setSavingNote(true)
    await supabase.from('student_notes').insert({
      student_id: selectedStudent.id,
      note_text: noteText.trim(),
    })
    setNotes(n => ({ ...n, [selectedStudent.id]: true }))
    setNoteText('')
    setSavingNote(false)
  }

  const classes = ['all', ...new Set(students.map(s => s.class))]
  const filtered = classFilter === 'all' ? students : students.filter(s => s.class === classFilter)

  // Stats
  const total = filtered.length
  const checkedIn = filtered.filter(s => checkIns[s.id]).length
  const struggling = filtered.filter(s => checkIns[s.id]?.mood <= 2).length

  if (loading) return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-kasher-blue">{total}</div>
            <div className="text-xs text-gray-500">תלמידים</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-kasher-green">{checkedIn}</div>
            <div className="text-xs text-gray-500">עשו צ'ק-אין</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-400">{struggling}</div>
            <div className="text-xs text-gray-500">זקוקים לתשומת לב</div>
          </div>
        </div>

        {/* Class filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors
                          ${classFilter === cls
                            ? 'bg-kasher-purple text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
            >
              {cls === 'all' ? 'כל הכיתות' : `כיתה ${cls}`}
            </button>
          ))}
        </div>

        {/* Students grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map(student => (
            <StudentStatusCard
              key={student.id}
              student={student}
              checkIn={checkIns[student.id]}
              hasNote={notes[student.id]}
              onClick={() => openStudent(student)}
            />
          ))}
        </div>
      </div>

      {/* Student detail modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Latest check-in */}
              {checkIns[selectedStudent.id] && (
                <div className="bg-kasher-light rounded-2xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">צ'ק-אין אחרון</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{MOOD_EMOJIS[checkIns[selectedStudent.id].mood]}</span>
                    <span className="font-medium">{MOOD_LABELS[checkIns[selectedStudent.id].mood]}</span>
                  </div>
                  {checkIns[selectedStudent.id].social_pattern && (
                    <div className="mt-1 text-sm text-gray-600">
                      {SOCIAL_PATTERNS[checkIns[selectedStudent.id].social_pattern]?.label}
                    </div>
                  )}
                </div>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">היסטוריה (10 אחרונים)</p>
                  <div className="flex gap-1 flex-wrap">
                    {history.map(ci => (
                      <span
                        key={ci.id}
                        className="text-xl"
                        title={`${MOOD_LABELS[ci.mood]} - ${new Date(ci.created_at).toLocaleDateString('he-IL')}`}
                      >
                        {MOOD_EMOJIS[ci.mood]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add note */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">הוסף הערה</p>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="input-field resize-none mb-2"
                  rows={3}
                  placeholder="הערה לתלמיד/ה..."
                />
                <button
                  onClick={saveNote}
                  disabled={savingNote || !noteText.trim()}
                  className="btn-primary w-full"
                >
                  {savingNote ? 'שומר...' : 'שמור הערה'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
