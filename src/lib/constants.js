export const MOOD_LABELS = {
  1: 'עצוב מאוד',
  2: 'עצוב',
  3: 'סביר',
  4: 'שמח',
  5: 'שמח מאוד',
}

export const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export const MOOD_COLORS = {
  1: '#E57373',
  2: '#FFB74D',
  3: '#FFF176',
  4: '#81C784',
  5: '#4CAF82',
}

export const MOOD_BG = {
  1: 'bg-red-100 border-red-300',
  2: 'bg-orange-100 border-orange-300',
  3: 'bg-yellow-100 border-yellow-300',
  4: 'bg-green-100 border-green-300',
  5: 'bg-emerald-100 border-emerald-300',
}

export const SOCIAL_PATTERNS = {
  engaged: {
    label: 'מחובר ומעורב',
    description: 'אני מרגיש בסדר עם החברים שלי',
    emoji: '🌟',
    color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  withdrawing: {
    label: 'מתרחק קצת',
    description: 'אני מעדיף להיות יותר לבד עכשיו',
    emoji: '🌙',
    color: 'bg-blue-50 border-blue-300 text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  difficulty: {
    label: 'קשה לי עם חברים',
    description: 'יש לי קושי בקשרים עם חברים',
    emoji: '🌧️',
    color: 'bg-orange-50 border-orange-300 text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  seeking_support: {
    label: 'רוצה יותר חברים',
    description: 'אני מחפש להתחבר עם אנשים',
    emoji: '🌻',
    color: 'bg-purple-50 border-purple-300 text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
  },
}

export const ROLES = {
  admin:     'מנהל מערכת',
  teacher:   'מורה',
  therapist: 'מטפל/ת',
  counselor: 'יועץ/ת חינוכי',
  principal: 'מנהל/ת',
}

export const CHARACTER_COLORS = [
  { id: 'salmon',   hex: '#FF8C69', label: 'אדמדם' },
  { id: 'sky',      hex: '#87CEEB', label: 'תכלת' },
  { id: 'lavender', hex: '#B39DDB', label: 'לבנדר' },
  { id: 'mint',     hex: '#80CBC4', label: 'נענע' },
  { id: 'peach',    hex: '#FFCC80', label: 'אפרסק' },
  { id: 'rose',     hex: '#F48FB1', label: 'ורדרד' },
  { id: 'lime',     hex: '#C5E1A5', label: 'ליים' },
  { id: 'blue',     hex: '#90CAF9', label: 'כחול' },
]

export const CHARACTER_ACCESSORIES = [
  { id: null,      label: 'ללא', emoji: '✨' },
  { id: 'hat',     label: 'כובע',  emoji: '🎩' },
  { id: 'bow',     label: 'פפיון',  emoji: '🎀' },
  { id: 'glasses', label: 'משקפיים', emoji: '🕶️' },
  { id: 'crown',   label: 'כתר',  emoji: '👑' },
]
