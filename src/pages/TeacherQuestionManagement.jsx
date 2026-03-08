import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import Spinner from '../components/ui/Spinner'

const QUESTION_TYPES = [
  { id: 'scale',  label: 'סולם 1-5',  emoji: '⭐' },
  { id: 'emoji',  label: 'אמוג\'יים', emoji: '😊' },
  { id: 'text',   label: 'טקסט חופשי', emoji: '✏️' },
]

export default function TeacherQuestionManagement() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSetId, setActiveSetId] = useState(null)
  const [expandedSet, setExpandedSet] = useState(null)
  const [questions, setQuestions] = useState({})
  const [newSetName, setNewSetName] = useState('')
  const [creatingSet, setCreatingSet] = useState(false)
  const [newQ, setNewQ] = useState({ text: '', type: 'scale' })
  const [addingQ, setAddingQ] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [setsRes, activeRes] = await Promise.all([
      supabase.from('question_sets').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('value').eq('key', 'active_question_set_id').single(),
    ])
    setSets(setsRes.data || [])
    setActiveSetId(activeRes.data?.value || null)
    setLoading(false)
  }

  async function loadQuestions(setId) {
    if (questions[setId]) return
    const { data } = await supabase.from('questions').select('*').eq('question_set_id', setId).order('sort_order')
    setQuestions(q => ({ ...q, [setId]: data || [] }))
  }

  function toggleExpand(setId) {
    if (expandedSet === setId) {
      setExpandedSet(null)
    } else {
      setExpandedSet(setId)
      loadQuestions(setId)
    }
  }

  async function createSet() {
    if (!newSetName.trim()) return
    setCreatingSet(true)
    await supabase.from('question_sets').insert({ name: newSetName.trim() })
    setNewSetName('')
    setCreatingSet(false)
    load()
  }

  async function addQuestion(setId) {
    if (!newQ.text.trim()) return
    setAddingQ(true)
    const existingCount = (questions[setId] || []).length
    await supabase.from('questions').insert({
      question_set_id: setId,
      text: newQ.text.trim(),
      type: newQ.type,
      sort_order: existingCount,
    })
    setQuestions(q => ({ ...q, [setId]: null }))
    await loadQuestions(setId)
    setNewQ({ text: '', type: 'scale' })
    setAddingQ(false)
  }

  async function deleteQuestion(setId, qId) {
    await supabase.from('questions').delete().eq('id', qId)
    setQuestions(q => ({ ...q, [setId]: null }))
    loadQuestions(setId)
  }

  async function deleteSet(setId) {
    await supabase.from('question_sets').delete().eq('id', setId)
    load()
  }

  async function activateSet(setId) {
    await supabase.from('settings').upsert({ key: 'active_question_set_id', value: setId })
    setActiveSetId(setId)
  }

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">ניהול שאלות צ'ק-אין</h1>

        {/* Create new set */}
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">סט שאלות חדש</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSetName}
              onChange={e => setNewSetName(e.target.value)}
              className="input-field flex-1"
              placeholder="שם הסט..."
              onKeyDown={e => e.key === 'Enter' && createSet()}
            />
            <button
              onClick={createSet}
              disabled={creatingSet || !newSetName.trim()}
              className="btn-primary whitespace-nowrap"
            >
              {creatingSet ? '...' : 'צור'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-3">
            {sets.map(set => (
              <div key={set.id} className="card">
                {/* Set header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleExpand(set.id)} className="font-semibold text-gray-800 hover:text-kasher-purple">
                      {expandedSet === set.id ? '▼' : '▶'} {set.name}
                    </button>
                    {activeSetId === set.id && (
                      <span className="text-xs bg-kasher-green text-white px-2 py-0.5 rounded-full">פעיל</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {activeSetId !== set.id && (
                      <button
                        onClick={() => activateSet(set.id)}
                        className="text-xs text-kasher-green font-medium hover:underline"
                      >
                        הפעל
                      </button>
                    )}
                    <button
                      onClick={() => deleteSet(set.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      מחק
                    </button>
                  </div>
                </div>

                {/* Expanded questions */}
                {expandedSet === set.id && (
                  <div className="mt-4 space-y-2">
                    {(questions[set.id] || []).map((q, idx) => (
                      <div key={q.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-gray-400 text-sm">{idx + 1}.</span>
                        <span className="flex-1 text-sm text-gray-700">{q.text}</span>
                        <span className="text-xs text-gray-400">{QUESTION_TYPES.find(t => t.id === q.type)?.emoji}</span>
                        <button
                          onClick={() => deleteQuestion(set.id, q.id)}
                          className="text-red-300 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add question */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2 mt-2">
                      <input
                        type="text"
                        value={newQ.text}
                        onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="טקסט השאלה..."
                      />
                      <div className="flex gap-2">
                        {QUESTION_TYPES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setNewQ(q => ({ ...q, type: t.id }))}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors
                                        ${newQ.type === t.id
                                          ? 'border-kasher-purple bg-purple-50 text-kasher-purple'
                                          : 'border-gray-200 text-gray-600'
                                        }`}
                          >
                            {t.emoji} {t.label}
                          </button>
                        ))}
                        <button
                          onClick={() => addQuestion(set.id)}
                          disabled={addingQ || !newQ.text.trim()}
                          className="btn-primary text-xs px-3 py-1.5 mr-auto"
                        >
                          {addingQ ? '...' : '+ הוסף'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {sets.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <div className="text-5xl mb-3">❓</div>
                <p>אין סטי שאלות עדיין</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
