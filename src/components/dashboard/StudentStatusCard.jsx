import { MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS, SOCIAL_PATTERNS } from '../../lib/constants'

function timeAgo(dateStr) {
  if (!dateStr) return 'לא עשה צ\'ק-אין'
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'לפני פחות משעה'
  if (hours < 24) return `לפני ${hours} שעות`
  return `לפני ${days} ימים`
}

export default function StudentStatusCard({ student, checkIn, hasNote, onClick }) {
  const mood = checkIn?.mood
  const pattern = checkIn?.social_pattern
  const patternInfo = pattern ? SOCIAL_PATTERNS[pattern] : null

  return (
    <button
      onClick={onClick}
      className="card hover:shadow-md hover:scale-[1.01] transition-all duration-150 text-right w-full relative"
    >
      {/* Note badge */}
      {hasNote && (
        <span className="absolute top-3 left-3 w-3 h-3 bg-yellow-400 rounded-full" title="יש הערה" />
      )}

      {/* Mood color bar */}
      <div
        className="h-2 rounded-full mb-3"
        style={{ backgroundColor: mood ? MOOD_COLORS[mood] : '#e5e7eb' }}
      />

      {/* Student name */}
      <div className="font-bold text-gray-800 text-base mb-1">{student.name}</div>
      <div className="text-xs text-gray-400 mb-3">כיתה {student.class}</div>

      {/* Mood + pattern */}
      {checkIn ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl">{MOOD_EMOJIS[mood]}</span>
          <span className="text-sm text-gray-600">{MOOD_LABELS[mood]}</span>
          {patternInfo && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${patternInfo.badge}`}>
              {patternInfo.label}
            </span>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">טרם עשה צ'ק-אין</div>
      )}

      <div className="text-xs text-gray-400 mt-2">{timeAgo(checkIn?.created_at)}</div>
    </button>
  )
}
