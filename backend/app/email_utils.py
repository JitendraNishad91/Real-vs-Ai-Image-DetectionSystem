import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .config import settings


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Sends an HTML email via Gmail SMTP (SSL, port 465). Returns True on success."""
    if not settings.EMAIL_ADDRESS or not settings.EMAIL_PASSWORD:
        print("[WARNING] Email credentials missing in .env — cannot send email.")
        return False

    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"RealCheck AI <{settings.EMAIL_ADDRESS}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(html_body, "html", "utf-8"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
            server.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD)
            server.sendmail(settings.EMAIL_ADDRESS, to_email, message.as_string())

        print(f"[SUCCESS] Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email to {to_email}: {e}")
        return False


def build_reset_code_email(username: str, code: str) -> str:
    """Branded HTML email containing the 6-digit password reset code."""
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#0c0b14;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#161526;border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.25);">
        <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">RealCheck AI</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">Image Forensics Platform</p>
        </div>
        <div style="padding:36px 32px;color:#e5e7eb;">
          <h2 style="font-size:18px;margin:0 0 12px;color:#ffffff;">Password Reset Request</h2>
          <p style="font-size:14px;line-height:1.6;color:#a3a1bc;margin:0 0 24px;">
            Hi <strong style="color:#c4b5fd;">{username}</strong>, use the verification code below to reset your password.
            This code expires in {settings.RESET_CODE_EXPIRE_MINUTES} minutes.
          </p>
          <div style="text-align:center;margin:0 0 28px;">
            <span style="display:inline-block;background:#221d3f;border:1px solid rgba(139,92,246,0.45);border-radius:14px;
                         padding:16px 34px;font-size:30px;font-weight:800;letter-spacing:10px;color:#a78bfa;">
              {code}
            </span>
          </div>
          <p style="font-size:12px;line-height:1.6;color:#6b6985;margin:0;">
            If you did not request a password reset, you can safely ignore this email — your account remains secure.
          </p>
        </div>
        <div style="padding:18px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="font-size:11px;color:#6b6985;margin:0;">&copy; 2026 RealCheck AI &mdash; XtraGrad Major Project</p>
        </div>
      </div>
    </body>
    </html>
    """
