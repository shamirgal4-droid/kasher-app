'use strict';

/**
 * מנתח הודעות טקסט לפקודות עבור הבוט.
 * מחזיר אובייקט { type, ... } או null אם ההודעה אינה פקודה מוכרת.
 *
 * הפרסר הזה טהור (בלי תלויות) כדי שיהיה קל לבדוק אותו.
 */

// מסיר ניקוד/רווחים מיותרים ומאחד צורות
function normalize(text) {
  return String(text || '').replace(/‏|‎/g, '').trim();
}

// מילות טריגר לכל פקודה (עברית + אנגלית)
const TRIGGERS = {
  help: ['עזרה', 'help', '?', 'עזור', 'פקודות'],
  addTask: ['משימה', 'מטלה', 'add', 'task'],
  listTasks: ['משימות', 'רשימה', 'list', 'tasks'],
  done: ['בוצע', 'סיימתי', 'done', 'v'],
  deleteTask: ['מחק', 'delete', 'del'],
  clearTasks: ['נקה', 'clear'],
  remind: ['תזכיר', 'תזכורת', 'remind', 'remindme'],
  listReminders: ['תזכורות', 'reminders'],
  cancelReminder: ['בטל', 'cancel'],
};

function startsWithTrigger(text, triggers) {
  const lower = text.toLowerCase();
  for (const t of triggers) {
    if (lower === t.toLowerCase()) return { matched: t, rest: '' };
    if (lower.startsWith(t.toLowerCase() + ' ')) {
      return { matched: t, rest: text.slice(t.length).trim() };
    }
  }
  return null;
}

/**
 * מנתח ביטוי זמן מתוך טקסט של תזכורת.
 * מחזיר { at: Date|null, recurring: {hour,minute}|null, text: string } או null אם לא נמצא זמן.
 * @param {string} raw הטקסט אחרי מילת הטריגר "תזכיר"
 * @param {Date} now זמן ההתייחסות (לבדיקות)
 */
function parseWhen(raw, now = new Date()) {
  let text = raw.replace(/^לי\b/, '').trim();

  const patterns = [
    // בעוד N דקות  (בלי \b בסוף — הוא לא עובד אחרי אותיות עברית)
    {
      re: /בעוד\s+(\d+)\s*(?:דקות|דקה|דק'?)/,
      build: (m) => ({ at: new Date(now.getTime() + parseInt(m[1], 10) * 60000), recurring: null }),
    },
    // בעוד N שעות
    {
      re: /בעוד\s+(\d+)\s*(?:שעות|שעה)/,
      build: (m) => ({ at: new Date(now.getTime() + parseInt(m[1], 10) * 3600000), recurring: null }),
    },
    // in N minutes / in N hours (אנגלית)
    {
      re: /\bin\s+(\d+)\s*(?:m|min(?:ute)?s?)\b/i,
      build: (m) => ({ at: new Date(now.getTime() + parseInt(m[1], 10) * 60000), recurring: null }),
    },
    {
      re: /\bin\s+(\d+)\s*(?:h|hours?|hrs?)\b/i,
      build: (m) => ({ at: new Date(now.getTime() + parseInt(m[1], 10) * 3600000), recurring: null }),
    },
    // כל יום ב-HH:MM  (חוזר)
    {
      re: /כל\s*יום\s*(?:ב-?\s*)?(\d{1,2})(?::(\d{2}))?/,
      build: (m) => ({ at: null, recurring: { hour: parseInt(m[1], 10), minute: m[2] ? parseInt(m[2], 10) : 0 } }),
    },
    // every day at HH:MM (אנגלית)
    {
      re: /every\s*day\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?/i,
      build: (m) => ({ at: null, recurring: { hour: parseInt(m[1], 10), minute: m[2] ? parseInt(m[2], 10) : 0 } }),
    },
    // מחר ב-HH:MM
    {
      re: /מחר\s*(?:ב-?\s*)?(\d{1,2})(?::(\d{2}))?/,
      build: (m) => ({ at: atClock(now, parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, 1), recurring: null }),
    },
    // tomorrow at HH:MM
    {
      re: /tomorrow\s*(?:at\s*)?(\d{1,2})(?::(\d{2}))?/i,
      build: (m) => ({ at: atClock(now, parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, 1), recurring: null }),
    },
    // היום ב-HH:MM
    {
      re: /היום\s*(?:ב-?\s*)?(\d{1,2})(?::(\d{2}))?/,
      build: (m) => ({ at: atClock(now, parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0, 0), recurring: null }),
    },
    // ב-HH:MM סתמי (היום, ואם עבר אז מחר)
    {
      re: /(?:^|\s)ב-?\s*(\d{1,2}):(\d{2})\b/,
      build: (m) => ({ at: atClockAuto(now, parseInt(m[1], 10), parseInt(m[2], 10)), recurring: null }),
    },
    // at HH:MM (אנגלית) — היום, ואם עבר אז מחר
    {
      re: /\bat\s*(\d{1,2}):(\d{2})\b/i,
      build: (m) => ({ at: atClockAuto(now, parseInt(m[1], 10), parseInt(m[2], 10)), recurring: null }),
    },
  ];

  for (const p of patterns) {
    const m = text.match(p.re);
    if (m) {
      const when = p.build(m);
      if (when.at && (when.at.getHours() > 23 || isNaN(when.at.getTime()))) continue;
      // מסירים את ביטוי הזמן מהטקסט כדי לקבל את תוכן התזכורת
      const reminderText = text.replace(m[0], '').replace(/\s+/g, ' ').trim();
      return { ...when, text: reminderText };
    }
  }
  return null;
}

// מחזיר Date להיום/מחר בשעה נתונה. dayOffset: 0=היום, 1=מחר
function atClock(now, hour, minute, dayOffset) {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// שעה היום; אם כבר עברה — מחר
function atClockAuto(now, hour, minute) {
  let d = atClock(now, hour, minute, 0);
  if (d.getTime() <= now.getTime()) {
    d = atClock(now, hour, minute, 1);
  }
  return d;
}

/**
 * מנתח הודעה שלמה לפקודה.
 * @param {string} body
 * @param {Date} now
 * @returns {object|null}
 */
function parse(body, now = new Date()) {
  const text = normalize(body);
  if (!text) return null;

  // עזרה
  if (startsWithTrigger(text, TRIGGERS.help)) return { type: 'help' };

  // רשימת משימות (לפני addTask כי "משימות" מכיל "משימה")
  if (startsWithTrigger(text, TRIGGERS.listTasks)) return { type: 'listTasks' };

  // רשימת תזכורות (לפני remind)
  if (startsWithTrigger(text, TRIGGERS.listReminders)) return { type: 'listReminders' };

  // תזכורת
  const remindM = startsWithTrigger(text, TRIGGERS.remind);
  if (remindM) {
    const when = parseWhen(remindM.rest, now);
    if (!when) return { type: 'remindError', reason: 'no_time' };
    if (!when.text) return { type: 'remindError', reason: 'no_text' };
    return { type: 'remind', at: when.at, recurring: when.recurring, text: when.text };
  }

  // ביטול תזכורת
  const cancelM = startsWithTrigger(text, TRIGGERS.cancelReminder);
  if (cancelM) {
    const n = parseInt(cancelM.rest.replace(/\D/g, ''), 10);
    if (!n) return { type: 'cancelError' };
    return { type: 'cancelReminder', index: n };
  }

  // בוצע N
  const doneM = startsWithTrigger(text, TRIGGERS.done);
  if (doneM) {
    const n = parseInt(doneM.rest.replace(/\D/g, ''), 10);
    if (!n) return { type: 'doneError' };
    return { type: 'done', index: n };
  }

  // מחק N
  const delM = startsWithTrigger(text, TRIGGERS.deleteTask);
  if (delM) {
    const n = parseInt(delM.rest.replace(/\D/g, ''), 10);
    if (!n) return { type: 'deleteError' };
    return { type: 'deleteTask', index: n };
  }

  // נקה משימות
  if (startsWithTrigger(text, TRIGGERS.clearTasks)) return { type: 'clearTasks' };

  // הוספת משימה
  const addM = startsWithTrigger(text, TRIGGERS.addTask);
  if (addM) {
    if (!addM.rest) return { type: 'addTaskError' };
    return { type: 'addTask', text: addM.rest };
  }

  return null;
}

module.exports = { parse, parseWhen, normalize };
