"""
לוגיקה משותפת לשליחת מייל המשימות היומי.
נטען גם ע"י פונקציית Vercel (api/daily-email.py) וגם ע"י scheduler.py (Replit/מקומי).
משתמש רק בספריות סטנדרטיות של פייתון (ללא pip install).
"""
import os
import sys
import json
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# נושאי המייל
SUBJECT = "🌅 היום יש לך:"            # מייל הבוקר (רשימה מלאה)
SUBJECT_REMINDER = "⏰ תזכורת להיום:"  # תזכורת הערב (רק מה שקבוע לשעה)

# נתיב לקובץ המשימות (תמיד ליד הקובץ הזה, כדי שיעבוד גם ב-Vercel וגם ב-Replit)
TASKS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tasks.json")


def load_tasks():
    """טוען את רשימת המשימות מ-tasks.json."""
    with open(TASKS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def filter_timed_items(data):
    """
    מחזיר עותק של הרשימה שכולל רק משימות שיש להן שעה (time לא ריק).
    משמש לתזכורת הערב — למשל 'Claude & Automation (19:00)'.
    שומר רק סעיפים שנשאר בהם לפחות פריט אחד.
    """
    filtered_sections = []
    for section in data.get("sections", []):
        timed = [i for i in section.get("items", []) if i.get("time", "").strip()]
        if timed:
            new_section = dict(section)
            new_section["items"] = timed
            filtered_sections.append(new_section)
    return {
        "greeting": "תזכורת: הדברים שקבועים להיום לפי שעה ⏰",
        "footer": data.get("footer", ""),
        "sections": filtered_sections,
    }


def _format_item(item):
    """מעצב שורת משימה בודדת: '🔴 טקסט (19:00)'."""
    status = item.get("status", "").strip()
    text = item.get("text", "").strip()
    time = item.get("time", "").strip()
    parts = []
    if status:
        parts.append(status)
    parts.append(text)
    line = " ".join(parts)
    if time:
        line += f" ({time})"
    return line


def build_text_body(data):
    """בונה גרסת טקסט רגיל של המייל."""
    lines = [data.get("greeting", "").strip(), ""]
    for section in data.get("sections", []):
        emoji = section.get("emoji", "").strip()
        title = section.get("title", "").strip()
        header = f"{emoji} {title}:".strip()
        lines.append(header)
        for item in section.get("items", []):
            lines.append(f"  - {_format_item(item)}")
        lines.append("")
    footer = data.get("footer", "").strip()
    if footer:
        lines.append(footer)
    return "\n".join(lines).strip() + "\n"


def build_html_body(data):
    """בונה גרסת HTML מעוצבת (RTL) של המייל."""
    sections_html = []
    for section in data.get("sections", []):
        emoji = section.get("emoji", "").strip()
        title = section.get("title", "").strip()
        items_html = []
        for item in section.get("items", []):
            items_html.append(
                f'<li style="margin:6px 0;font-size:16px;line-height:1.5;">'
                f"{_format_item(item)}</li>"
            )
        sections_html.append(
            f'<div style="margin:18px 0;">'
            f'<div style="font-size:18px;font-weight:700;color:#4f46e5;">{emoji} {title}</div>'
            f'<ul style="margin:8px 0 0;padding-inline-start:22px;">{"".join(items_html)}</ul>'
            f"</div>"
        )
    greeting = data.get("greeting", "").strip()
    footer = data.get("footer", "").strip()
    footer_html = (
        f'<p style="margin-top:24px;color:#6b7280;font-size:14px;">{footer}</p>'
        if footer
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:16px;
              box-shadow:0 4px 14px rgba(0,0,0,0.08);overflow:hidden;">
    <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:24px;text-align:center;">
      <div style="font-size:40px;">🌅</div>
      <div style="color:#fff;font-size:22px;font-weight:800;margin-top:6px;">היום יש לך:</div>
    </div>
    <div style="padding:24px;color:#111827;">
      <p style="font-size:17px;margin:0 0 8px;">{greeting}</p>
      {"".join(sections_html)}
      {footer_html}
    </div>
  </div>
</body>
</html>"""


def send_daily_email(mode="morning"):
    """
    שולח מייל דרך Gmail SMTP.
      mode="morning"  -> מייל הבוקר עם הרשימה המלאה ("🌅 היום יש לך:")
      mode="reminder" -> תזכורת הערב רק עם מה שקבוע לשעה ("⏰ תזכורת להיום:")

    דורש משתני סביבה:
      GMAIL_USER          - כתובת הג'ימייל השולחת
      GMAIL_APP_PASSWORD  - App Password של Gmail (16 תווים, לא הסיסמה הרגילה!)
      RECIPIENT_EMAIL     - (אופציונלי) כתובת היעד. ברירת מחדל: GMAIL_USER
    """
    gmail_user = os.environ.get("GMAIL_USER")
    gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
    recipient = os.environ.get("RECIPIENT_EMAIL") or gmail_user

    if not gmail_user or not gmail_pass:
        raise RuntimeError(
            "חסרים משתני סביבה GMAIL_USER ו/או GMAIL_APP_PASSWORD"
        )

    data = load_tasks()

    if mode == "reminder":
        subject = SUBJECT_REMINDER
        data = filter_timed_items(data)
        # אם אין היום כלום עם שעה — לא שולחים תזכורת ריקה
        if not data["sections"]:
            return {"sent_to": recipient, "subject": subject, "skipped": "no timed items"}
    else:
        subject = SUBJECT

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = gmail_user
    msg["To"] = recipient
    msg.attach(MIMEText(build_text_body(data), "plain", "utf-8"))
    msg.attach(MIMEText(build_html_body(data), "html", "utf-8"))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, [recipient], msg.as_string())

    return {"sent_to": recipient, "subject": subject}


if __name__ == "__main__":
    # הרצה ידנית לבדיקה: python tasks_email.py [morning|reminder]
    m = sys.argv[1] if len(sys.argv) > 1 else "morning"
    result = send_daily_email(mode=m)
    print("✅ נשלח:", result)
