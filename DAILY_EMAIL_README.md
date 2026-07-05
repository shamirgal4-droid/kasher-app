# 🌅 מייל משימות יומי

שני מיילים אוטומטיים ביום:
- **בוקר (08:00)** — הרשימה המלאה. נושא: **"🌅 היום יש לך:"**
- **ערב (19:00)** — תזכורת רק על מה שקבוע לשעה (לימודים/פרוייקטים). נושא: **"⏰ תזכורת להיום:"**
  (אם אין באותו יום שום דבר עם שעה — לא נשלחת תזכורת ריקה.)

## איך זה עובד

- רשימת המשימות שלך נשמרת בקובץ **`tasks.json`** (קל לעריכה).
- הסקריפט קורא את הקובץ, בונה מייל יפה (בעברית, מיושר לימין) ושולח דרך Gmail.
- שני מצבי הפעלה:
  1. **Vercel Cron** (מומלץ) — רץ בענן, בחינם, בלי שהמחשב שלך יהיה דלוק.
  2. **Replit / מחשב** — סקריפט שרץ בלולאה 24/7 (`scheduler.py`).

## הקבצים

| קובץ | מה זה |
|------|-------|
| `tasks.json` | רשימת המשימות שלך — **את זה עורכים** |
| `tasks_email.py` | הלוגיקה המשותפת (בניית המייל + שליחה) |
| `api/daily-email.py` | פונקציית Vercel למייל הבוקר |
| `api/evening-reminder.py` | פונקציית Vercel לתזכורת הערב (19:00) |
| `vercel.json` | מגדיר מתי ה-Cron רץ (בוקר + ערב) |
| `scheduler.py` | גרסה שרצה 24/7 ל-Replit/מחשב |

---

## שלב 1: להשיג App Password של Gmail

Gmail לא נותן להתחבר עם הסיסמה הרגילה, צריך "סיסמת אפליקציה":

1. הפעילי אימות דו-שלבי בחשבון: https://myaccount.google.com/security
2. צרי סיסמת אפליקציה: https://myaccount.google.com/apppasswords
3. תקבלי 16 תווים (למשל `abcd efgh ijkl mnop`) — שמרי אותם.

---

## שלב 2 (הכי פשוט): הפעלה ב-GitHub Actions (חינם, בלי חשבון חדש)

מכיוון שהקוד כבר ב-GitHub, אפשר להריץ אותו ישירות משם — בלי Vercel ובלי Replit.

1. הקובץ `.github/workflows/daily-email.yml` כבר מגדיר הרצה אוטומטית פעמיים ביום.
2. ⚠️ workflow מתוזמן רץ **רק מהברנץ' הראשי (main)** — צריך שהקוד יהיה שם.
3. ב-GitHub → **Settings → Secrets and variables → Actions → New repository secret**,
   הוסיפי שלושה סודות:
   - `GMAIL_USER` = `shamirgal4@gmail.com`
   - `GMAIL_APP_PASSWORD` = 16 התווים (בלי רווחים)
   - `RECIPIENT_EMAIL` = `shamirgal4@gmail.com`
4. בדיקה מיידית: **Actions → Daily task email → Run workflow**.

> חינם: ריפו ציבורי — ללא הגבלה; ריפו פרטי — 2000 דקות/חודש (משתמשים בכ-60).
> הערה: אם אין פעילות בריפו 60 יום, GitHub משהה workflows מתוזמנים (מספיק commit כדי לחדש).

---

## שלב 2 (חלופה): הפעלה ב-Vercel (חינם)

1. הפרוייקט כבר מחובר ל-Vercel (זו אפליקציית kasher).
2. ב-Vercel → **Settings → Environment Variables**, הוסיפי:
   - `GMAIL_USER` = הכתובת שלך (`shamirgal4@gmail.com`)
   - `GMAIL_APP_PASSWORD` = 16 התווים מהשלב הקודם (בלי רווחים)
   - `RECIPIENT_EMAIL` = לאן לשלוח (אפשר אותה כתובת)
   - `CRON_SECRET` = מחרוזת אקראית כלשהי (הגנה, אופציונלי)
3. עשי **Redeploy**.
4. זהו! כל בוקר יישלח מייל אוטומטית.

### שעת השליחה

ב-`vercel.json` יש שני Crons — **Vercel רץ לפי UTC** (שעת ישראל פחות 3 בקיץ):
- בוקר: `0 5 * * *` = **08:00** קיץ ישראל ✅
- ערב: `0 16 * * *` = **19:00** קיץ ישראל ✅
- בחורף (UTC+2) שני ל-`0 6 * * *` ו-`0 17 * * *` כדי לשמור על 08:00 ו-19:00.

> תוכנית Vercel החינמית (Hobby) מרשה עד **2 Crons, כל אחד פעם ביום** — בדיוק בוקר + ערב. 👌

בדיקה ידנית (בלי לחכות לבוקר): פשוט פתחי בדפדפן
`https://<your-app>.vercel.app/api/daily-email`
(אם הגדרת `CRON_SECRET`, זה יחזיר 401 — זה תקין; ה-Cron עצמו שולח את הסוד).

> הערה: בתוכנית החינמית של Vercel (Hobby) מותר **Cron אחד ליום** — מספיק בול לצורך הזה.

---

## שלב 2ב: הפעלה ב-Replit (חלופה)

1. צרי Repl חדש מסוג Python והעלי את `tasks.json`, `tasks_email.py`, `scheduler.py`.
2. ב-Replit → **Secrets** (🔒), הוסיפי:
   `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `RECIPIENT_EMAIL`,
   ואופציונלי `SEND_TIME` (למשל `08:00`) ו-`TZ_OFFSET` (`3` בקיץ, `2` בחורף).
3. הריצי: `python scheduler.py`.
4. כדי שירוץ 24/7 בלי שה-Repl יירדם — הפעילי **Reserved VM / Always On**
   (בחלק מהתוכניות זה בתשלום; ב-Vercel זה פשוט חינם, לכן Vercel מומלץ).

---

## איך מעדכנים את הרשימה

עורכים את `tasks.json`. המבנה:

```json
{
  "greeting": "בוקר טוב! ☀️ הנה מה שמחכה לך היום:",
  "footer": "בהצלחה! 💪",
  "sections": [
    {
      "emoji": "📋",
      "title": "פרוייקטים",
      "items": [
        { "text": "אדנה קריקט גריד", "status": "🔴", "time": "" }
      ]
    },
    {
      "emoji": "📚",
      "title": "לימוד",
      "items": [
        { "text": "Claude & Automation", "status": "", "time": "19:00" }
      ]
    }
  ]
}
```

- `status` — אימוג'י/סימון בתחילת השורה (למשל 🔴 🟡 ✅), אפשר להשאיר ריק `""`.
- `time` — שעה בסוגריים בסוף השורה, אפשר ריק `""`.
- להוסיף משימה = להוסיף עוד `{ ... }` ל-`items`.
- **הכי פשוט: פשוט תגידי לי "סיימתי אדנה" / "תוסיפי משימה X", ואני אעדכן את `tasks.json` ואדחוף — המייל הבא כבר יצא עם הגרסה החדשה.**

---

## בדיקה מקומית

```bash
export GMAIL_USER="shamirgal4@gmail.com"
export GMAIL_APP_PASSWORD="הסיסמה-16-תווים"
python tasks_email.py   # שולח מייל בדיקה מיד
```
