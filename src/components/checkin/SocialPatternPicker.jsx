import { SOCIAL_PATTERNS } from '../../lib/constants'

export default function SocialPatternPicker({ value, onChange }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
        איך אתה מרגיש עם חברים?
      </h2>
      <p className="text-center text-gray-500 mb-6">בחר/י את מה שהכי מתאים לך עכשיו</p>

      <div className="grid grid-cols-1 gap-3">
        {Object.entries(SOCIAL_PATTERNS).map(([key, pattern]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-4 p-5 rounded-3xl border-2 text-right transition-all duration-150
                        ${value === key
                          ? `${pattern.color} shadow-md scale-[1.02]`
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:scale-[1.01]'
                        }`}
          >
            <span className="text-4xl">{pattern.emoji}</span>
            <div>
              <div className="font-semibold text-gray-800">{pattern.label}</div>
              <div className="text-sm text-gray-500 mt-0.5">{pattern.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
