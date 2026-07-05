"""
גרסה שרצה 24/7 בלולאה — מתאימה ל-Replit או להרצה על מחשב/שרת.
בודקת כל דקה, וברגע שמגיעה השעה שהוגדרה (ברירת מחדל 08:00 שעון ישראל) — שולחת מייל.
משתמשת רק בספריות סטנדרטיות של פייתון.

הרצה:  python scheduler.py

משתני סביבה:
  GMAIL_USER, GMAIL_APP_PASSWORD, RECIPIENT_EMAIL  (כמו ב-tasks_email.py)
  SEND_TIME  - שעת השליחה בפורמט "HH:MM" (ברירת מחדל "08:00")
  TZ_OFFSET  - הפרש שעות מ-UTC (ברירת מחדל 3 = שעון קיץ ישראל IDT; בחורף 2)
"""
import os
import time
from datetime import datetime, timedelta, timezone

from tasks_email import send_daily_email

SEND_TIME = os.environ.get("SEND_TIME", "08:00")
TZ_OFFSET = int(os.environ.get("TZ_OFFSET", "3"))  # 3 = קיץ (IDT), 2 = חורף (IST)


def _now_local():
    return datetime.now(timezone.utc) + timedelta(hours=TZ_OFFSET)


def main():
    print(f"⏰ הסקריפט פועל. שולח כל יום בשעה {SEND_TIME} (UTC+{TZ_OFFSET}).")
    last_sent_date = None
    while True:
        now = _now_local()
        current_hhmm = now.strftime("%H:%M")
        today = now.date()
        if current_hhmm == SEND_TIME and last_sent_date != today:
            try:
                result = send_daily_email()
                last_sent_date = today
                print(f"✅ {now.isoformat()} נשלח ל-{result['sent_to']}")
            except Exception as e:  # noqa: BLE001
                print(f"❌ {now.isoformat()} שגיאה בשליחה: {e}")
        time.sleep(30)


if __name__ == "__main__":
    main()
