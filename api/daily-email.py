"""
פונקציית Vercel Serverless ששולחת את מייל המשימות היומי.
מופעלת אוטומטית כל בוקר ע"י Vercel Cron (ראה vercel.json).
אפשר גם להפעיל ידנית בדפדפן: https://<your-app>.vercel.app/api/daily-email
"""
import os
import sys
import json
from http.server import BaseHTTPRequestHandler

# מאפשר לייבא את הלוגיקה המשותפת מתיקיית השורש של הפרוייקט
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tasks_email import send_daily_email  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # הגנה: אם הוגדר CRON_SECRET, מוודאים שהבקשה הגיעה מ-Vercel Cron
        secret = os.environ.get("CRON_SECRET")
        if secret:
            auth = self.headers.get("Authorization", "")
            if auth != f"Bearer {secret}":
                self._respond(401, {"ok": False, "error": "unauthorized"})
                return
        try:
            result = send_daily_email()
            self._respond(200, {"ok": True, **result})
        except Exception as e:  # noqa: BLE001
            self._respond(500, {"ok": False, "error": str(e)})

    def _respond(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)
