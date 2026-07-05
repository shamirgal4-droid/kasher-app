"""
גרסה שרצה 24/7 בלולאה — מתאימה ל-Replit או להרצה על מחשב/שרת.
בודקת כל דקה, וברגע שמגיעה השעה שהוגדרה (ברירת מחדל 08:00 שעון ישראל) — שולחת מייל.
משתמשת רק בספריות סטנדרטיות של פייתון.

הרצה:  python scheduler.py

משתני סביבה:
  GMAIL_USER, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL  (כמו ב-tasks_email.py)
  SEND_TIME      - שעת מייל הבוקר (רשימה מלאה), ברירת מחדל "08:00"
  REMINDER_TIME  - שעת תזכורת הערב (רק מה שקבוע לשעה), ברירת מחדל "19:00"
  TZ_OFFSET      - הפרש שעות מ-UTC (ברירת מחדל 3 = שעון קיץ ישראל IDT; בחורף 2)
"""
import os
import time
from datetime import datetime, timedelta, timezone

from tasks_email import send_daily_email

SEND_TIME = os.environ.get("SEND_TIME", "07:00")
REMINDER_TIME = os.environ.get("REMINDER_TIME", "19:00")
TZ_OFFSET = int(os.environ.get("TZ_OFFSET", "3"))  # 3 = קיץ (IDT), 2 = חורף (IST)


def _now_local():
    return datetime.now(timezone.utc) + timedelta(hours=TZ_OFFSET)


def main():
    print(
        f"⏰ הסקריפט פועל. בוקר: {SEND_TIME} | תזכורת ערב: {REMINDER_TIME} (UTC+{TZ_OFFSET})."
    )
    # שומרים בנפרד מתי כל מייל נשלח לאחרונה כדי לא לשלוח כפול באותו יום
    last_sent = {"morning": None, "reminder": None}
    schedule = {"morning": SEND_TIME, "reminder": REMINDER_TIME}
    while True:
        now = _now_local()
        current_hhmm = now.strftime("%H:%M")
        today = now.date()
        for mode, when in schedule.items():
            if current_hhmm == when and last_sent[mode] != today:
                try:
                    result = send_daily_email(mode=mode)
                    last_sent[mode] = today
                    print(f"✅ {now.isoformat()} [{mode}] {result}")
                except Exception as e:  # noqa: BLE001
                    print(f"❌ {now.isoformat()} [{mode}] שגיאה בשליחה: {e}")
        time.sleep(30)


if __name__ == "__main__":
    main()
