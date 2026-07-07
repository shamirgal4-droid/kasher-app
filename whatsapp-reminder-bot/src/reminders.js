'use strict';

const schedule = require('node-schedule');
const store = require('./store');

// מיפוי id -> job פעיל בזיכרון
const jobs = new Map();

/**
 * מתזמן תזכורת בודדת.
 * @param {object} reminder רשומת תזכורת מה-store
 * @param {(reminder:object)=>void} fire קולבק שנקרא כשמגיע הזמן
 */
function scheduleReminder(reminder, fire) {
  // חוזרת כל יום
  if (reminder.recurring) {
    const rule = new schedule.RecurrenceRule();
    rule.hour = reminder.recurring.hour;
    rule.minute = reminder.recurring.minute;
    rule.second = 0;
    const job = schedule.scheduleJob(rule, () => fire(reminder));
    if (job) jobs.set(reminder.id, job);
    return job;
  }

  // חד-פעמית
  const when = new Date(reminder.time);
  const job = schedule.scheduleJob(when, () => {
    fire(reminder);
    // תזכורת חד-פעמית מסירה את עצמה אחרי שירתה
    store.removeReminderById(reminder.id);
    jobs.delete(reminder.id);
  });
  if (job) jobs.set(reminder.id, job);
  return job;
}

/**
 * טוען מחדש את כל התזכורות מהאחסון בעליית הבוט.
 * חד-פעמיות שכבר עבר זמנן -> נורות מיד (כדי לא לפספס).
 */
function rehydrate(fire) {
  const now = Date.now();
  for (const reminder of store.listReminders()) {
    if (reminder.recurring) {
      scheduleReminder(reminder, fire);
    } else {
      const when = new Date(reminder.time).getTime();
      if (when <= now) {
        // פספסנו בזמן שהבוט היה כבוי — יורים עכשיו
        fire({ ...reminder, missed: true });
        store.removeReminderById(reminder.id);
      } else {
        scheduleReminder(reminder, fire);
      }
    }
  }
}

function cancelJob(id) {
  const job = jobs.get(id);
  if (job) {
    job.cancel();
    jobs.delete(id);
  }
}

module.exports = { scheduleReminder, rehydrate, cancelJob };
