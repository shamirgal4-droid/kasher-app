'use strict';

const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const store = require('./store');
const reminders = require('./reminders');
const { parse } = require('./parser');

// ---- הגדרות ----
// כברירת מחדל הבוט מגיב רק בצ'אט "הודעה לעצמי" (Message Yourself).
// אפשר להגדיר ALLOW_ALL_CHATS=1 כדי לאפשר גם צ'אטים פרטיים אחרים.
const ALLOW_ALL_CHATS = process.env.ALLOW_ALL_CHATS === '1';

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, '..', '.wwebjs_auth') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // אם מותקן Chromium מקומי אפשר להצביע עליו דרך משתנה סביבה:
    executablePath: process.env.CHROME_PATH || undefined,
  },
});

let ownId = null;

client.on('qr', (qr) => {
  console.log('\n📱 סרוק את קוד ה-QR עם וואטסאפ (הגדרות → מכשירים מקושרים → קישור מכשיר):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('✅ אומת בהצלחה.'));
client.on('auth_failure', (m) => console.error('❌ כשל אימות:', m));
client.on('disconnected', (r) => console.warn('⚠️  התנתק:', r));

client.on('ready', async () => {
  ownId = client.info.wid._serialized;
  console.log(`\n🤖 הבוט מחובר כ-${ownId}. מוכן לעבודה!`);
  console.log('💡 שלח לעצמך (Message Yourself) את המילה "עזרה" כדי להתחיל.\n');

  // טוען מחדש תזכורות ששמורות מדיסק
  reminders.rehydrate((reminder) => fireReminder(reminder));
});

// שולח את גוף התזכורת לצ'אט שיצר אותה
async function fireReminder(reminder) {
  const prefix = reminder.missed ? '⏰ (תזכורת שהתפספסה) ' : '⏰ תזכורת: ';
  try {
    await client.sendMessage(reminder.chatId, prefix + reminder.text);
  } catch (err) {
    console.error('שגיאה בשליחת תזכורת:', err.message);
  }
}

// מחזיר את מזהה הצ'אט הרלוונטי (בצ'אט-עצמי msg.to הוא שלנו)
function chatIdOf(msg) {
  return msg.fromMe ? msg.to : msg.from;
}

// האם לטפל בהודעה הזו כפקודה?
function shouldHandle(msg) {
  const chatId = chatIdOf(msg);
  if (chatId === ownId) return true; // צ'אט "הודעה לעצמי"
  if (ALLOW_ALL_CHATS && chatId.endsWith('@c.us')) return true; // צ'אט פרטי אחר
  return false;
}

// מאזין גם להודעות שאתה שולח לעצמך (message_create) וגם להודעות נכנסות (message)
client.on('message_create', handle);

async function handle(msg) {
  if (!ownId) return;
  if (!shouldHandle(msg)) return;

  const cmd = parse(msg.body);
  if (!cmd) return; // לא פקודה מוכרת — מתעלמים

  const chatId = chatIdOf(msg);
  const reply = (text) => client.sendMessage(chatId, text);

  switch (cmd.type) {
    case 'help':
      return reply(helpText());

    case 'addTask': {
      const t = store.addTask(cmd.text);
      return reply(`✅ נוספה משימה: ${t.text}`);
    }
    case 'addTaskError':
      return reply('כתוב מה המשימה. לדוגמה: משימה לקנות חלב');

    case 'listTasks': {
      const tasks = store.listTasks();
      if (!tasks.length) return reply('📝 רשימת המשימות ריקה. הוסף עם: משימה <טקסט>');
      const lines = tasks.map((t, i) => `${i + 1}. ${t.text}`);
      return reply('📝 המשימות שלך:\n' + lines.join('\n'));
    }

    case 'done': {
      const removed = store.completeTaskByIndex(cmd.index);
      if (!removed) return reply(`אין משימה מספר ${cmd.index}. שלח "משימות" לרשימה.`);
      return reply(`🎉 כל הכבוד! הושלמה: ${removed.text}`);
    }
    case 'doneError':
      return reply('איזו משימה? לדוגמה: בוצע 2');

    case 'deleteTask': {
      const removed = store.deleteTaskByIndex(cmd.index);
      if (!removed) return reply(`אין משימה מספר ${cmd.index}.`);
      return reply(`🗑️ נמחקה: ${removed.text}`);
    }
    case 'deleteError':
      return reply('איזו משימה למחוק? לדוגמה: מחק 3');

    case 'clearTasks': {
      const n = store.clearTasks();
      return reply(`🧹 נוקו ${n} משימות.`);
    }

    case 'remind': {
      const chat = chatId;
      const rec = cmd.recurring;
      const reminder = store.addReminder({
        chatId: chat,
        text: cmd.text,
        time: cmd.at ? cmd.at.toISOString() : null,
        recurring: rec || null,
      });
      reminders.scheduleReminder(reminder, (r) => fireReminder(r));
      if (rec) {
        return reply(`⏰ נקבעה תזכורת יומית ב-${pad(rec.hour)}:${pad(rec.minute)} — "${cmd.text}"`);
      }
      return reply(`⏰ תזכורת נקבעה ל-${formatDate(cmd.at)} — "${cmd.text}"`);
    }
    case 'remindError':
      return reply(
        cmd.reason === 'no_text'
          ? 'מה להזכיר? לדוגמה: תזכיר בעוד 10 דקות לשתות מים'
          : 'לא הבנתי מתי. נסה: תזכיר בעוד 10 דקות / תזכיר מחר ב-9:00 / תזכיר כל יום ב-8:00'
      );

    case 'listReminders': {
      const list = store.listReminders();
      if (!list.length) return reply('⏰ אין תזכורות פעילות.');
      const lines = list.map((r, i) => {
        const when = r.recurring
          ? `כל יום ${pad(r.recurring.hour)}:${pad(r.recurring.minute)}`
          : formatDate(new Date(r.time));
        return `${i + 1}. [${when}] ${r.text}`;
      });
      return reply('⏰ תזכורות פעילות:\n' + lines.join('\n'));
    }

    case 'cancelReminder': {
      const removed = store.removeReminderByIndex(cmd.index);
      if (!removed) return reply(`אין תזכורת מספר ${cmd.index}. שלח "תזכורות" לרשימה.`);
      reminders.cancelJob(removed.id);
      return reply(`🚫 בוטלה תזכורת: ${removed.text}`);
    }
    case 'cancelError':
      return reply('איזו תזכורת לבטל? לדוגמה: בטל 1');

    default:
      return;
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(d) {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return `יום ${days[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} בשעה ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function helpText() {
  return [
    '🤖 *בוט התזכורות שלך* — הנה מה שאני יודע:',
    '',
    '*משימות:*',
    '• משימה <טקסט> — הוספת משימה',
    '• משימות — הצגת הרשימה',
    '• בוצע <מספר> — סימון משימה כבוצעה',
    '• מחק <מספר> — מחיקת משימה',
    '• נקה — מחיקת כל המשימות',
    '',
    '*תזכורות:*',
    '• תזכיר בעוד 10 דקות <טקסט>',
    '• תזכיר בעוד 2 שעות <טקסט>',
    '• תזכיר היום ב-18:00 <טקסט>',
    '• תזכיר מחר ב-9:00 <טקסט>',
    '• תזכיר כל יום ב-8:00 <טקסט>  (חוזר יומי)',
    '• תזכורות — הצגת תזכורות פעילות',
    '• בטל <מספר> — ביטול תזכורת',
    '',
    'טיפ: שלח לי הכל בצ׳אט "הודעה לעצמי" ואני אזכיר לך שם.',
  ].join('\n');
}

console.log('🚀 מפעיל את בוט התזכורות... (זה עלול לקחת רגע בהפעלה ראשונה)');
client.initialize();
