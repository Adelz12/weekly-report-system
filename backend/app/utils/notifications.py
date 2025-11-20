import os
import smtplib
from email.message import EmailMessage
import json
import urllib.request

def send_email(to_email, subject, body):
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')
    from_email = os.getenv('SMTP_FROM', smtp_user)
    dev_mode = (os.getenv('EMAIL_DEV_MODE', 'false').lower() == 'true')

    if not smtp_host or not smtp_user or not smtp_pass:
        # SMTP not configured. In dev mode, log and return success.
        if dev_mode:
            try:
                print('[DEV EMAIL]', {'to': to_email, 'subject': subject, 'body': body})
            except Exception:
                pass
            return True
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as s:
            s.starttls()
            s.login(smtp_user, smtp_pass)
            s.send_message(msg)
        return True
    except Exception:
        if dev_mode:
            try:
                print('[DEV EMAIL - SMTP ERROR, LOGGING INSTEAD]', {'to': to_email, 'subject': subject, 'body': body})
            except Exception:
                pass
            return True
        return False

def send_slack(message):
    webhook = os.getenv('SLACK_WEBHOOK')
    if not webhook:
        return False
    payload = json.dumps({"text": message}).encode('utf-8')
    req = urllib.request.Request(webhook, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status == 200
    except Exception:
        return False
