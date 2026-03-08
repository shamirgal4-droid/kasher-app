// ==========================================
// מנוע ניתוח סיכונים — אפליקציית קשר
// ==========================================

// מחזיר את רמת ההתרעה לתלמיד על בסיס היסטוריית צ'ק-אינים
// history = מסודר מהחדש לישן
export function analyzeStudent(student, history) {
  if (!history || history.length === 0) return null

  const latest = history[0]
  const last3   = history.slice(0, 3)
  const last7   = history.slice(0, 7)

  const flags = []

  // ---- בדיקות מצב רוח ----

  // 3+ ימים רצופים מצב 1
  const consecutive1 = countConsecutiveLow(history, 1)
  if (consecutive1 >= 3) {
    flags.push({ level: 'red', reason: `${consecutive1} ימים רצופים מצב רוח 1 (עצוב מאוד)` })
  }

  // 4+ ימים רצופים מצב 1-2
  const consecutive2 = countConsecutiveLow(history, 2)
  if (consecutive2 >= 4) {
    flags.push({ level: 'red', reason: `${consecutive2} ימים רצופים מצב רוח נמוך מאוד` })
  }

  // מצב 1 היום + דפוס חברתי קשה
  if (latest.mood === 1 && ['withdrawing', 'difficulty'].includes(latest.social_pattern)) {
    flags.push({ level: 'red', reason: 'מצב רוח 1 + קשיים חברתיים ביום אחד' })
  }

  // ירידה חדה — מ-5/4 ל-1/2 תוך יומיים
  if (history.length >= 2 && latest.mood <= 2 && history[1].mood >= 4) {
    flags.push({ level: 'orange', reason: `ירידה חדה ממצב ${history[1].mood} ל-${latest.mood} תוך יום` })
  }

  // 2+ ימים רצופים מצב 1-2 (אורנג')
  if (consecutive2 >= 2 && consecutive2 < 4 && !flags.some(f => f.level === 'red')) {
    flags.push({ level: 'orange', reason: `${consecutive2} ימים רצופים מצב רוח נמוך` })
  }

  // ---- בדיקות חברתיות ----

  // seeking_support ב-3+ ימים אחרונים
  const seekingCount = last3.filter(ci => ci.social_pattern === 'seeking_support').length
  if (seekingCount >= 2) {
    flags.push({ level: 'orange', reason: `${seekingCount} ימים של "רוצה יותר חברים" השבוע` })
  }

  // difficulty ב-2+ ימים
  const difficultyCount = last3.filter(ci => ci.social_pattern === 'difficulty').length
  if (difficultyCount >= 2) {
    flags.push({ level: 'orange', reason: `קשיים חברתיים חוזרים (${difficultyCount} ימים)` })
  }

  // ---- בדיקות צהוב ----

  // מצב 1-2 יחיד
  if (latest.mood <= 2 && !flags.some(f => f.level !== 'yellow')) {
    flags.push({ level: 'yellow', reason: 'מצב רוח נמוך היום' })
  }

  // withdrawing ביום בודד
  if (latest.social_pattern === 'withdrawing' && flags.length === 0) {
    flags.push({ level: 'yellow', reason: 'מתרחק/ת קצת היום' })
  }

  // לא עשה צ'ק-אין 3+ ימים (אם יש היסטוריה קודמת)
  const daysSinceLastCI = daysBetween(new Date(), new Date(latest.created_at))
  if (daysSinceLastCI >= 3 && history.length > 0) {
    flags.push({ level: 'yellow', reason: `לא עשה/תה צ'ק-אין ${daysSinceLastCI} ימים` })
  }

  if (flags.length === 0) return null

  // דרגת הסיכון הגבוהה ביותר
  const level = flags.some(f => f.level === 'red')
    ? 'red'
    : flags.some(f => f.level === 'orange')
    ? 'orange'
    : 'yellow'

  return {
    student,
    level,
    flags,
    latest,
    moodTrend: getMoodTrend(last7),
  }
}

function countConsecutiveLow(history, maxMood) {
  let count = 0
  for (const ci of history) {
    if (ci.mood <= maxMood) count++
    else break
  }
  return count
}

function daysBetween(a, b) {
  return Math.floor(Math.abs(a - b) / 86400000)
}

function getMoodTrend(history) {
  if (history.length < 2) return 'stable'
  const avg = arr => arr.reduce((s, ci) => s + ci.mood, 0) / arr.length
  const recent = avg(history.slice(0, Math.ceil(history.length / 2)))
  const older  = avg(history.slice(Math.ceil(history.length / 2)))
  if (recent < older - 0.5) return 'declining'
  if (recent > older + 0.5) return 'improving'
  return 'stable'
}

// מחזיר תיאור רמת הסיכון
export const ALERT_CONFIG = {
  red: {
    label:      'חשש ממשי',
    sublabel:   'דורש טיפול מיידי',
    bg:         'bg-red-50',
    border:     'border-red-300',
    text:       'text-red-700',
    badgeBg:    'bg-red-500',
    icon:       '🔴',
    dot:        'bg-red-500',
  },
  orange: {
    label:      'מעקב מומלץ',
    sublabel:   'מצריך תשומת לב',
    bg:         'bg-orange-50',
    border:     'border-orange-300',
    text:       'text-orange-700',
    badgeBg:    'bg-orange-400',
    icon:       '🟠',
    dot:        'bg-orange-400',
  },
  yellow: {
    label:      'שים/י לב',
    sublabel:   'לניטור שוטף',
    bg:         'bg-yellow-50',
    border:     'border-yellow-200',
    text:       'text-yellow-700',
    badgeBg:    'bg-yellow-400',
    icon:       '🟡',
    dot:        'bg-yellow-400',
  },
}
