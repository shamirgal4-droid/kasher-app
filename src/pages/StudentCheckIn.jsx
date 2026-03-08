import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CHARACTER_COLORS, CHARACTER_ACCESSORIES } from '../lib/constants'

import StudentSelector from '../components/checkin/StudentSelector'
import MoodPicker from '../components/checkin/MoodPicker'
import SocialPatternPicker from '../components/checkin/SocialPatternPicker'
import FeelingQuestions from '../components/checkin/FeelingQuestions'
import FriendSelector from '../components/checkin/FriendSelector'
import CheckInSummary from '../components/checkin/CheckInSummary'
import AbstractCharacter from '../components/character/AbstractCharacter'

const TOTAL_STEPS = 7

const STEP_LABELS = [
  'בחירת שם',
  'הדמות שלי',
  'מצב רוח',
  'חברתי',
  'שאלות',
  'חברים',
  'שליחה',
]

const INITIAL_DATA = {
  studentId: null,
  studentName: '',
  studentClass: '',
  characterConfig: { color: '#FF8C69', accessory: null },
  mood: null,
  socialPattern: null,
  answers: {},
  preferredConnections: [],
  wantsConnection: false,
}

export default function StudentCheckIn() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(INITIAL_DATA)
  const [questions, setQuestions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [activeSetId, setActiveSetId] = useState(null)

  useEffect(() => {
    // Fetch active question set
    supabase.from('settings').select('value').eq('key', 'active_question_set_id').single()
      .then(({ data: s }) => {
        if (s?.value) {
          setActiveSetId(s.value)
          supabase.from('questions').select('*')
            .eq('question_set_id', s.value)
            .order('sort_order')
            .then(({ data: qs }) => setQuestions(qs || []))
        }
      })
  }, [])

  function update(field, value) {
    setData(d => ({ ...d, [field]: value }))
  }

  function canProceed() {
    if (step === 1) return !!data.studentId
    if (step === 2) return true // character is optional config
    if (step === 3) return !!data.mood
    if (step === 4) return !!data.socialPattern
    if (step === 5) return true // questions optional
    if (step === 6) return true // friends optional
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    const { error } = await supabase.from('check_ins').insert({
      student_id: data.studentId,
      mood: data.mood,
      social_pattern: data.socialPattern,
      preferred_connections: data.preferredConnections,
      answers: data.answers,
      wants_connection: data.wantsConnection,
      question_set_id: activeSetId,
    })
    setSubmitting(false)
    if (!error) {
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setStep(1)
        setData(INITIAL_DATA)
      }, 4000)
    }
  }

  const DONE_MESSAGES = {
    1: { title: 'תודה שסיפרת לנו 💙', msg: 'זה אומץ גדול לשתף. אנחנו כאן בשבילך.', bg: 'bg-blue-50' },
    2: { title: 'תודה! 🌙',            msg: 'גם ימים קשים עוברים. מחר יום חדש.',     bg: 'bg-indigo-50' },
    3: { title: 'תודה! ☁️',            msg: 'יום בינוני זה גם בסדר. אתה/את מעולה!', bg: 'bg-yellow-50' },
    4: { title: 'כיף לשמוע! 🌿',       msg: 'שמחים ביחד איתך. המשך/י כך!',          bg: 'bg-green-50' },
    5: { title: 'וואו, איזה יום! 🌟',   msg: 'האנרגיה שלך מדבקת! תמשיך/י לזרוח ✨',  bg: 'bg-pink-50' },
  }
  const doneMsg = DONE_MESSAGES[data.mood] || DONE_MESSAGES[3]

  if (done) {
    return (
      <div className={`min-h-screen ${doneMsg.bg} flex flex-col items-center justify-center p-6 text-center`}>
        <AbstractCharacter
          color={data.characterConfig.color}
          accessory={data.characterConfig.accessory}
          mood={data.mood || 4}
          size={150}
          animated
        />
        <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">{doneMsg.title}</h1>
        <p className="text-gray-600 text-lg max-w-xs">{doneMsg.msg}</p>
        <p className="text-gray-400 text-sm mt-6">חוזר לתחילה...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-kasher-light flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        {/* Small character - משקפת מצב רוח שנבחר */}
        <div className="shrink-0">
          <AbstractCharacter
            color={data.characterConfig.color}
            accessory={data.characterConfig.accessory}
            mood={data.mood}
            size={44}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-kasher-purple">🔗 קשר</span>
            {data.studentName && (
              <span className="text-sm text-gray-400">| {data.studentName}</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-kasher-purple h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-400 shrink-0">{step}/{TOTAL_STEPS}</div>
      </div>

      {/* Step label */}
      <div className="text-center py-2">
        <span className="text-xs text-gray-400 font-medium">{STEP_LABELS[step - 1]}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 max-w-md mx-auto w-full">
        {step === 1 && (
          <StudentSelector
            onSelect={student => {
              update('studentId', student.id)
              update('studentName', student.name)
              update('studentClass', student.class)
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              זו הדמות שלך!
            </h2>
            <p className="text-center text-gray-500 mb-6">בחר/י צבע ואביזר</p>

            <div className="flex justify-center mb-6">
              <AbstractCharacter
                color={data.characterConfig.color}
                accessory={data.characterConfig.accessory}
                size={130}
              />
            </div>

            {/* Color picker */}
            <div className="card mb-4">
              <p className="font-semibold text-gray-700 mb-3">צבע</p>
              <div className="flex flex-wrap gap-3">
                {CHARACTER_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => update('characterConfig', { ...data.characterConfig, color: c.hex })}
                    className={`w-10 h-10 rounded-full transition-all duration-150
                                ${data.characterConfig.color === c.hex
                                  ? 'scale-125 ring-4 ring-kasher-purple ring-offset-2'
                                  : 'hover:scale-110'
                                }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Accessory picker */}
            <div className="card">
              <p className="font-semibold text-gray-700 mb-3">אביזר</p>
              <div className="flex flex-wrap gap-2">
                {CHARACTER_ACCESSORIES.map(acc => (
                  <button
                    key={String(acc.id)}
                    onClick={() => update('characterConfig', { ...data.characterConfig, accessory: acc.id })}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 transition-all
                                ${data.characterConfig.accessory === acc.id
                                  ? 'border-kasher-purple bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                  >
                    <span className="text-2xl">{acc.emoji}</span>
                    <span className="text-xs text-gray-600">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <MoodPicker
            value={data.mood}
            onChange={v => update('mood', v)}
            characterName={data.studentName}
          />
        )}

        {step === 4 && (
          <SocialPatternPicker
            value={data.socialPattern}
            onChange={v => update('socialPattern', v)}
          />
        )}

        {step === 5 && (
          <FeelingQuestions
            questions={questions}
            answers={data.answers}
            onChange={(qId, val) => update('answers', { ...data.answers, [qId]: val })}
            characterColor={data.characterConfig.color}
            characterAccessory={data.characterConfig.accessory}
          />
        )}

        {step === 6 && (
          <FriendSelector
            studentId={data.studentId}
            studentClass={data.studentClass}
            selected={data.preferredConnections}
            onToggle={id => {
              const current = data.preferredConnections
              update('preferredConnections',
                current.includes(id) ? current.filter(x => x !== id) : [...current, id]
              )
            }}
            wantsConnection={data.wantsConnection}
            onToggleConnection={v => update('wantsConnection', v)}
          />
        )}

        {step === 7 && (
          <CheckInSummary
            data={data}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>

      {/* Footer buttons */}
      {step < 7 && (
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex gap-3 max-w-md mx-auto w-full">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost">
              ← חזרה
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="btn-primary flex-1"
          >
            {step === 6 ? 'לסיכום →' : 'המשך →'}
          </button>
        </div>
      )}
    </div>
  )
}
