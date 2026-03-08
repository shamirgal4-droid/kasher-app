import { useState } from 'react'
import AbstractCharacter from '../character/AbstractCharacter'

// הודעות עידוד לפי ציון נמוך — מגוונות כדי לא להרגיש שחוק
const ENCOURAGE_LOW = [
  'אני כאן איתך 🤗',
  'זה בסדר לא להרגיש טוב תמיד 💙',
  'אתה/את חזק/ה יותר ממה שאתה/את חושב/ת 💪',
  'כולנו עוברים ימים קשים. אתה/את לא לבד 🌙',
  'תודה שסיפרת לי. זה אומץ אמיתי 💛',
]

// הודעות עידוד לציון גבוה
const ENCOURAGE_HIGH = [
  'כיף לשמוע! המשך/י כך ✨',
  'אתה/את ממש מדהים/ה! 🌟',
  'האנרגיה שלך מדבקת 😄',
  'זה נהדר! שמח/ה בשבילך 🎉',
]

function getEncouragement(score, type) {
  if (type === 'text') return null
  const val = typeof score === 'number' ? score : null
  if (!val) return null
  if (val <= 2) return ENCOURAGE_LOW[Math.floor(Math.random() * ENCOURAGE_LOW.length)]
  if (val >= 4) return ENCOURAGE_HIGH[Math.floor(Math.random() * ENCOURAGE_HIGH.length)]
  return null
}

function QuestionCard({ q, idx, total, answer, onChange, characterColor, characterAccessory }) {
  const [encouragement, setEncouragement] = useState(null)
  const [charMood, setCharMood] = useState(null)
  const [showBubble, setShowBubble] = useState(false)

  function handleChange(val) {
    onChange(q.id, val)
    const numVal = typeof val === 'number' ? val : null
    setCharMood(numVal)

    const msg = getEncouragement(val, q.type)
    if (msg) {
      setEncouragement(msg)
      setShowBubble(true)
      // מסתיר אחרי 4 שניות
      setTimeout(() => setShowBubble(false), 4000)
    } else {
      setShowBubble(false)
    }
  }

  const isLow = typeof answer === 'number' && answer <= 2

  return (
    <div className={`card transition-all duration-300 ${isLow ? 'border-2 border-blue-200' : ''}`}>
      {/* מספר שאלה */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-400">שאלה {idx + 1} מתוך {total}</div>
        {/* פס התקדמות קטן */}
        <div className="w-24 h-1.5 bg-gray-100 rounded-full">
          <div
            className="h-1.5 bg-kasher-purple rounded-full transition-all duration-500"
            style={{ width: `${(idx / total) * 100}%` }}
          />
        </div>
      </div>

      {/* טקסט השאלה */}
      <p className="font-semibold text-gray-800 mb-4 text-lg leading-snug">{q.text}</p>

      {/* קלט לפי סוג */}
      {q.type === 'scale' && (
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => handleChange(n)}
              className={`w-12 h-12 rounded-full font-bold text-lg transition-all duration-150
                          ${answer === n
                            ? 'bg-kasher-purple text-white scale-110 shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                          }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {q.type === 'emoji' && (
        <div className="flex gap-3 justify-center flex-wrap">
          {['😢', '😕', '😐', '🙂', '😄'].map((emoji, i) => (
            <button
              key={emoji}
              onClick={() => handleChange(i + 1)}
              className={`text-4xl p-2 rounded-2xl transition-all duration-150
                          ${answer === i + 1
                            ? 'bg-purple-100 scale-125 shadow-sm'
                            : 'hover:scale-110'
                          }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {q.type === 'text' && (
        <textarea
          value={answer || ''}
          onChange={e => handleChange(e.target.value)}
          className="input-field resize-none"
          rows={3}
          placeholder="כתוב/י כאן בחופשיות..."
        />
      )}

      {/* הדמות עם בועת עידוד — מופיעה אחרי בחירה */}
      {showBubble && encouragement && (
        <div className="mt-4 flex items-end gap-3 animate-slide-up">
          <div className="shrink-0">
            <AbstractCharacter
              color={characterColor}
              accessory={characterAccessory}
              mood={charMood <= 2 ? 4 : 5}  // הדמות תמיד מעודדת
              size={56}
            />
          </div>
          {/* בועת דיבור */}
          <div className="relative bg-white border-2 border-kasher-purple/30 rounded-2xl rounded-br-none px-4 py-2 shadow-sm flex-1">
            <p className="text-sm font-medium text-kasher-purple">{encouragement}</p>
            {/* זנב הבועה */}
            <div className="absolute bottom-0 right-[-10px] w-0 h-0
                            border-t-[10px] border-t-transparent
                            border-l-[10px] border-l-kasher-purple/30
                            border-b-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeelingQuestions({ questions, answers, onChange, characterColor = '#FF8C69', characterAccessory = null }) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <div className="text-4xl mb-3">💬</div>
        <p>אין שאלות להצגה</p>
      </div>
    )
  }

  return (
    <div className="animate-slide-up space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">כמה שאלות קצרות</h2>
        <p className="text-gray-400 text-sm mt-1">אין תשובות נכונות או לא נכונות — רק מה שאתה/את מרגיש/ה</p>
      </div>

      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          q={q}
          idx={idx}
          total={questions.length}
          answer={answers[q.id]}
          onChange={onChange}
          characterColor={characterColor}
          characterAccessory={characterAccessory}
        />
      ))}
    </div>
  )
}
