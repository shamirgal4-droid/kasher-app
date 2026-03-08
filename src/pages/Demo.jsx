import { useState } from 'react'
import AnimatedFace from '../components/checkin/AnimatedFace'
import AbstractCharacter from '../components/character/AbstractCharacter'
import { MOOD_LABELS, CHARACTER_COLORS, CHARACTER_ACCESSORIES } from '../lib/constants'

export default function Demo() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [color, setColor] = useState('#FF8C69')
  const [accessory, setAccessory] = useState(null)

  const MOOD_BG = {
    1: 'border-blue-300 bg-blue-50',
    2: 'border-indigo-300 bg-indigo-50',
    3: 'border-yellow-300 bg-yellow-50',
    4: 'border-green-300 bg-green-50',
    5: 'border-pink-300 bg-pink-50',
  }
  const MOOD_TEXT = {
    1: 'text-blue-600',
    2: 'text-indigo-600',
    3: 'text-yellow-700',
    4: 'text-green-700',
    5: 'text-pink-600',
  }

  return (
    <div className="min-h-screen bg-kasher-light p-6" dir="rtl">
      <div className="max-w-xl mx-auto">

        {/* כותרת */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎨</div>
          <h1 className="text-2xl font-bold text-kasher-purple">תצוגה מקדימה — קשר</h1>
          <p className="text-gray-500 text-sm mt-1">ככה תראה האפליקציה לתלמידים</p>
        </div>

        {/* ---- פרצופים מונפשים ---- */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-1 text-lg">😊 בחר/י מצב רוח</h2>
          <p className="text-gray-400 text-sm mb-5">לחיצה על פרצוף לבחירה</p>

          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map(mood => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-3xl border-2 transition-all duration-200
                            ${selectedMood === mood
                              ? `${MOOD_BG[mood]} shadow-lg scale-110`
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-105'
                            }`}
              >
                <AnimatedFace mood={mood} size={72} selected={selectedMood === mood} />
                <span className={`text-xs font-semibold whitespace-nowrap
                                  ${selectedMood === mood ? MOOD_TEXT[mood] : 'text-gray-500'}`}>
                  {MOOD_LABELS[mood]}
                </span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="mt-5 text-center animate-fade-in">
              <div className="inline-block bg-kasher-light rounded-2xl px-5 py-3 border border-gray-100">
                {selectedMood === 1 && <p className="text-blue-600 font-medium">💙 אני שומע/ת אותך, זה בסדר להרגיש ככה</p>}
                {selectedMood === 2 && <p className="text-indigo-600 font-medium">🌙 כל יום הוא יום חדש, את/ה לא לבד</p>}
                {selectedMood === 3 && <p className="text-yellow-700 font-medium">🌤️ יום בינוני, וגם זה בסדר גמור</p>}
                {selectedMood === 4 && <p className="text-green-700 font-medium">🌿 שמח/ה לשמוע! מה גרם לך להרגיש כך?</p>}
                {selectedMood === 5 && <p className="text-pink-600 font-medium">🌟 וואו! הפרצוף שלך זורח היום!</p>}
              </div>
            </div>
          )}
        </div>

        {/* ---- דמות ---- */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 text-lg">🎭 הדמות שלי</h2>

          <div className="flex justify-center mb-5">
            <AbstractCharacter color={color} accessory={accessory} size={120} />
          </div>

          {/* בחירת צבע */}
          <p className="text-sm font-medium text-gray-600 mb-2">צבע</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {CHARACTER_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.hex)}
                className={`w-9 h-9 rounded-full transition-all duration-150
                            ${color === c.hex ? 'scale-125 ring-4 ring-kasher-purple ring-offset-2' : 'hover:scale-110'}`}
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
          </div>

          {/* בחירת אביזר */}
          <p className="text-sm font-medium text-gray-600 mb-2">אביזר</p>
          <div className="flex flex-wrap gap-2">
            {CHARACTER_ACCESSORIES.map(acc => (
              <button
                key={String(acc.id)}
                onClick={() => setAccessory(acc.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 transition-all
                            ${accessory === acc.id ? 'border-kasher-purple bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="text-xl">{acc.emoji}</span>
                <span className="text-xs text-gray-500">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---- כרטיסי דגל (דוגמה) ---- */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 text-lg">🚨 דוגמה — התרעות מערכת</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <span className="text-2xl">🔴</span>
              <div>
                <div className="font-semibold text-red-700 text-sm">חשש ממשי — דני כהן</div>
                <div className="text-xs text-red-500">3 ימים רצופים מצב רוח נמוך + מתרחק מחברים</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
              <span className="text-2xl">🟠</span>
              <div>
                <div className="font-semibold text-orange-700 text-sm">מעקב מומלץ — מיכל לוי</div>
                <div className="text-xs text-orange-500">ירידה עקבית במצב הרוח השבוע</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
              <span className="text-2xl">🟡</span>
              <div>
                <div className="font-semibold text-yellow-700 text-sm">שים/י לב — יוסי אברהם</div>
                <div className="text-xs text-yellow-600">ביום חמישי דיווח על קושי עם חברים</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          זוהי תצוגה מקדימה בלבד — הנתונים הם לדוגמה
        </p>
      </div>
    </div>
  )
}
