import { MOOD_LABELS } from '../../lib/constants'
import AnimatedFace from './AnimatedFace'

const MOOD_BG = {
  1: 'border-blue-300   bg-blue-50',
  2: 'border-indigo-300 bg-indigo-50',
  3: 'border-yellow-300 bg-yellow-50',
  4: 'border-green-300  bg-green-50',
  5: 'border-pink-300   bg-pink-50',
}

const MOOD_TEXT = {
  1: 'text-blue-600',
  2: 'text-indigo-600',
  3: 'text-yellow-700',
  4: 'text-green-700',
  5: 'text-pink-600',
}

export default function MoodPicker({ value, onChange, characterName }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
        {characterName ? `${characterName}, ` : ''}איך את/ה מרגיש/ה היום?
      </h2>
      <p className="text-center text-gray-500 mb-8">בחר/י את הפרצוף שהכי מתאים לך</p>

      {/* פרצופים בשורה */}
      <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
        {[1, 2, 3, 4, 5].map(mood => (
          <button
            key={mood}
            onClick={() => onChange(mood)}
            className={`flex flex-col items-center gap-2 px-3 py-4 rounded-3xl border-2 transition-all duration-200
                        ${value === mood
                          ? `${MOOD_BG[mood]} shadow-lg scale-110`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:scale-105 hover:shadow-sm'
                        }`}
          >
            <AnimatedFace mood={mood} size={72} selected={value === mood} />
            <span className={`text-xs font-semibold whitespace-nowrap ${value === mood ? MOOD_TEXT[mood] : 'text-gray-500'}`}>
              {MOOD_LABELS[mood]}
            </span>
          </button>
        ))}
      </div>

      {/* הודעה בהתאם לבחירה */}
      {value && (
        <div className="mt-8 animate-fade-in text-center">
          <div className="inline-block bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100">
            {value === 1 && <p className="text-blue-600 font-medium">💙 אני שומע/ת אותך, זה בסדר להרגיש ככה</p>}
            {value === 2 && <p className="text-indigo-600 font-medium">🌙 כל יום הוא יום חדש, אתה/את לא לבד</p>}
            {value === 3 && <p className="text-yellow-700 font-medium">🌤️ יום בינוני, וגם זה בסדר גמור</p>}
            {value === 4 && <p className="text-green-700 font-medium">🌿 שמח/ה לשמוע! מה גרם לך להרגיש כך?</p>}
            {value === 5 && <p className="text-pink-600 font-medium">🌟 וואו! הפרצוף שלך זורח היום!</p>}
          </div>
        </div>
      )}
    </div>
  )
}
