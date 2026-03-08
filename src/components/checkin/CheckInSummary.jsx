import { MOOD_EMOJIS, MOOD_LABELS, SOCIAL_PATTERNS } from '../../lib/constants'
import AbstractCharacter from '../character/AbstractCharacter'

export default function CheckInSummary({ data, onSubmit, submitting }) {
  const { studentName, characterConfig, mood, socialPattern, preferredConnections } = data
  const pattern = SOCIAL_PATTERNS[socialPattern]

  return (
    <div className="animate-slide-up text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">סיכום הצ'ק-אין שלך</h2>

      {/* Character */}
      <div className="flex justify-center mb-4">
        <AbstractCharacter color={characterConfig.color} accessory={characterConfig.accessory} size={100} />
      </div>
      <div className="font-semibold text-lg text-gray-700 mb-6">{studentName}</div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-right">
        <div className="card text-center">
          <div className="text-3xl mb-1">{MOOD_EMOJIS[mood]}</div>
          <div className="text-xs text-gray-500">מצב הרוח</div>
          <div className="font-semibold text-sm">{MOOD_LABELS[mood]}</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-1">{pattern?.emoji}</div>
          <div className="text-xs text-gray-500">חברתי</div>
          <div className="font-semibold text-sm">{pattern?.label}</div>
        </div>

        {preferredConnections.length > 0 && (
          <div className="card col-span-2 text-center">
            <div className="text-2xl mb-1">🤝</div>
            <div className="text-xs text-gray-500">רוצה להתחבר עם</div>
            <div className="font-semibold text-sm">{preferredConnections.length} חברים</div>
          </div>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="btn-primary text-xl px-10 py-4 w-full"
      >
        {submitting ? '⏳ שולח...' : '✅ שלח!'}
      </button>

      <p className="text-xs text-gray-400 mt-3">המידע נשמר בצורה מאובטחת</p>
    </div>
  )
}
