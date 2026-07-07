'use strict';

// בדיקות פשוטות לפרסר — רצות בלי וואטסאפ. הרצה: npm test
const assert = require('assert');
const { parse } = require('./parser');

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass++;
    console.log('  ✓ ' + name);
  } catch (err) {
    fail++;
    console.log('  ✗ ' + name + ' — ' + err.message);
  }
}

const NOW = new Date('2026-07-07T10:00:00'); // זמן קבוע לבדיקות

console.log('בדיקות פקודות:');

check('עזרה', () => assert.strictEqual(parse('עזרה').type, 'help'));
check('הוספת משימה', () => {
  const c = parse('משימה לקנות חלב');
  assert.strictEqual(c.type, 'addTask');
  assert.strictEqual(c.text, 'לקנות חלב');
});
check('רשימת משימות (לא מתבלבל עם "משימה")', () =>
  assert.strictEqual(parse('משימות').type, 'listTasks'));
check('בוצע עם מספר', () => {
  const c = parse('בוצע 2');
  assert.strictEqual(c.type, 'done');
  assert.strictEqual(c.index, 2);
});
check('מחק', () => assert.strictEqual(parse('מחק 3').index, 3));

console.log('\nבדיקות תזכורות:');

check('בעוד 10 דקות', () => {
  const c = parse('תזכיר בעוד 10 דקות לשתות מים', NOW);
  assert.strictEqual(c.type, 'remind');
  assert.strictEqual(c.text, 'לשתות מים');
  assert.strictEqual(c.at.getTime(), new Date('2026-07-07T10:10:00').getTime());
});
check('בעוד 2 שעות', () => {
  const c = parse('תזכיר בעוד 2 שעות פגישה', NOW);
  assert.strictEqual(c.at.getTime(), new Date('2026-07-07T12:00:00').getTime());
});
check('מחר ב-9:00', () => {
  const c = parse('תזכיר מחר ב-9:00 להתקשר לרופא', NOW);
  assert.strictEqual(c.text, 'להתקשר לרופא');
  assert.strictEqual(c.at.getTime(), new Date('2026-07-08T09:00:00').getTime());
});
check('היום ב-18:00', () => {
  const c = parse('תזכיר היום ב-18:00 ללכת לחדר כושר', NOW);
  assert.strictEqual(c.at.getTime(), new Date('2026-07-07T18:00:00').getTime());
});
check('כל יום ב-8:00 (חוזר)', () => {
  const c = parse('תזכיר כל יום ב-8:00 לקחת ויטמין', NOW);
  assert.strictEqual(c.text, 'לקחת ויטמין');
  assert.deepStrictEqual(c.recurring, { hour: 8, minute: 0 });
  assert.strictEqual(c.at, null);
});
check('ב-14:30 סתמי היום', () => {
  const c = parse('תזכיר ב-14:30 לענות למייל', NOW);
  assert.strictEqual(c.at.getTime(), new Date('2026-07-07T14:30:00').getTime());
});
check('שעה שכבר עברה -> מחר', () => {
  const c = parse('תזכיר ב-08:00 בוקר טוב', NOW);
  assert.strictEqual(c.at.getTime(), new Date('2026-07-08T08:00:00').getTime());
});
check('תזכורת בלי זמן -> שגיאה', () =>
  assert.strictEqual(parse('תזכיר לעשות משהו', NOW).type, 'remindError'));
check('אנגלית: in 5 minutes', () => {
  const c = parse('remind in 5 minutes call mom', NOW);
  assert.strictEqual(c.at.getTime(), new Date('2026-07-07T10:05:00').getTime());
});
check('לא פקודה -> null', () => assert.strictEqual(parse('היי מה נשמע'), null));

console.log(`\nסה"כ: ${pass} עברו, ${fail} נכשלו`);
process.exit(fail ? 1 : 0);
