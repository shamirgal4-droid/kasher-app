import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/layout/AdminNav'
import Spinner from '../components/ui/Spinner'

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', class: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('students').select('*').order('class').order('name')
    setStudents(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm({ name: '', class: '' })
    setModalOpen(true)
  }

  function openEdit(student) {
    setEditing(student)
    setForm({ name: student.name, class: student.class })
    setModalOpen(true)
  }

  async function save() {
    if (!form.name.trim() || !form.class.trim()) return
    setSaving(true)
    if (editing) {
      await supabase.from('students').update({ name: form.name, class: form.class }).eq('id', editing.id)
    } else {
      await supabase.from('students').insert({ name: form.name, class: form.class })
    }
    setModalOpen(false)
    setSaving(false)
    load()
  }

  async function deleteStudent(id) {
    await supabase.from('students').delete().eq('id', id)
    setDeleteConfirm(null)
    load()
  }

  const byClass = students.reduce((acc, s) => {
    if (!acc[s.class]) acc[s.class] = []
    acc[s.class].push(s)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-kasher-light">
      <AdminNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">ניהול תלמידים</h1>
          <button onClick={openAdd} className="btn-primary">+ הוסף תלמיד</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-4">
            {Object.entries(byClass).map(([cls, classStudents]) => (
              <div key={cls}>
                <div className="text-sm font-semibold text-gray-400 mb-2">כיתה {cls} ({classStudents.length})</div>
                <div className="space-y-2">
                  {classStudents.map(student => (
                    <div key={student.id} className="card flex items-center justify-between py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{student.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(student)}
                          className="text-sm text-kasher-blue hover:underline px-2"
                        >
                          עריכה
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(student)}
                          className="text-sm text-red-400 hover:underline px-2"
                        >
                          מחיקה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {students.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <div className="text-5xl mb-3">👥</div>
                <p>אין תלמידים עדיין</p>
                <button onClick={openAdd} className="btn-primary mt-4">הוסף תלמיד ראשון</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editing ? 'עריכת תלמיד' : 'הוספת תלמיד'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder="שם מלא"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כיתה</label>
                <input
                  type="text"
                  value={form.class}
                  onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                  className="input-field"
                  placeholder="למשל: א1, ב3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">ביטול</button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim() || !form.class.trim()}
                className="btn-primary flex-1"
              >
                {saving ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">למחוק את {deleteConfirm.name}?</h3>
            <p className="text-gray-500 text-sm mb-6">כל הצ'ק-אינים וההערות של התלמיד יימחקו</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1">ביטול</button>
              <button
                onClick={() => deleteStudent(deleteConfirm.id)}
                className="flex-1 bg-red-500 text-white font-semibold px-4 py-3 rounded-2xl hover:bg-red-600"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
