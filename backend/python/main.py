"""
GloryBagh Villa — Python Backend
FastAPI + Gmail SMTP

Run locally:
    uvicorn main:app --reload --port 8000

Production (Render / Railway):
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()  # loads .env file

app = FastAPI(title="GloryBagh Villa API", version="1.0.0")

# ── CORS — allow your frontend domain ──────────────────
# Replace with your actual deployed frontend URL
ALLOWED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",      # Live Server (VS Code)
    "https://yourdomain.com",     # ← REPLACE with your real domain
    "https://www.yourdomain.com", # ← REPLACE with your real domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Config from .env ────────────────────────────────────
GMAIL_USER     = os.getenv("GMAIL_USER")       # your Gmail address
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")   # Gmail App Password (NOT your login password)
OWNER_EMAIL    = os.getenv("OWNER_EMAIL")       # where to send inquiries (can be same as GMAIL_USER)


# ── Inquiry data model ──────────────────────────────────
class InquiryForm(BaseModel):
    firstName : str
    lastName  : Optional[str] = ""
    email     : EmailStr
    phone     : Optional[str] = "Not provided"
    checkin   : Optional[str] = "Not specified"
    checkout  : Optional[str] = "Not specified"
    guests    : Optional[str] = "Not specified"
    occasion  : Optional[str] = "Not specified"
    message   : Optional[str] = "No special requests."


# ── Email sender ────────────────────────────────────────
def send_email(to: str, subject: str, html_body: str, reply_to: str = None):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"GloryBagh Villa <{GMAIL_USER}>"
    msg["To"]      = to
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.attach(MIMEText(html_body, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        server.sendmail(GMAIL_USER, to, msg.as_string())


# ── Email templates ─────────────────────────────────────
def owner_email_html(data: InquiryForm) -> str:
    return f"""
    <html><body style="font-family:Georgia,serif;background:#1c1a0f;margin:0;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1c1a0f;">
      <tr><td align="center" style="padding:40px 20px;">
        <table width="580" cellpadding="0" cellspacing="0"
               style="background:#2b2710;border:1px solid rgba(201,168,76,0.3);border-radius:2px;max-width:100%;">

          <!-- Header -->
          <tr><td style="padding:36px 40px 24px;border-bottom:1px solid rgba(201,168,76,0.2);">
            <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">
              GLORYBAGH VILLA · UDAIPUR
            </p>
            <h1 style="margin:10px 0 0;font-size:26px;font-weight:300;color:#f5f0e8;letter-spacing:1px;">
              New Booking Inquiry
            </h1>
          </td></tr>

          <!-- Guest details -->
          <tr><td style="padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <tr><td colspan="2" style="padding-bottom:20px;">
                <p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;
                           color:#c9a84c;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:10px;">
                  GUEST INFORMATION
                </p>
              </td></tr>

              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;width:40%;">Name</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">
                  {data.firstName} {data.lastName}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Email</td>
                <td style="padding:8px 0;font-size:15px;color:#c9a84c;">
                  <a href="mailto:{data.email}" style="color:#c9a84c;">{data.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Phone</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">{data.phone}</td>
              </tr>

              <tr><td colspan="2" style="padding:24px 0 16px;">
                <p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;
                           color:#c9a84c;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:10px;">
                  STAY DETAILS
                </p>
              </td></tr>

              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Check-in</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">{data.checkin}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Check-out</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">{data.checkout}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Guests</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">{data.guests}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:11px;letter-spacing:2px;
                            text-transform:uppercase;color:#7a6e52;">Occasion</td>
                <td style="padding:8px 0;font-size:15px;color:#f5f0e8;">{data.occasion}</td>
              </tr>

              <tr><td colspan="2" style="padding:24px 0 16px;">
                <p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;
                           color:#c9a84c;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:10px;">
                  SPECIAL REQUESTS
                </p>
              </td></tr>
              <tr>
                <td colspan="2" style="padding:8px 0;font-size:14px;color:#d4c9a8;line-height:1.7;">
                  {data.message}
                </td>
              </tr>

            </table>
          </td></tr>

          <!-- CTA -->
          <tr><td style="padding:24px 40px 36px;border-top:1px solid rgba(201,168,76,0.15);">
            <a href="mailto:{data.email}?subject=Re: Your GloryBagh Villa Inquiry"
               style="display:inline-block;background:#c9a84c;color:#1c1a0f;
                      padding:12px 28px;font-size:11px;letter-spacing:3px;
                      text-transform:uppercase;text-decoration:none;font-weight:600;">
              REPLY TO GUEST
            </a>
            <p style="margin:16px 0 0;font-size:11px;color:#7a6e52;">
              Received: {datetime.now().strftime("%d %B %Y, %I:%M %p")}
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
    </body></html>
    """


def guest_email_html(data: InquiryForm) -> str:
    return f"""
    <html><body style="font-family:Georgia,serif;background:#f5f0e8;margin:0;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;">
      <tr><td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border:1px solid #e0d8c8;border-radius:2px;max-width:100%;">

          <!-- Header gold bar -->
          <tr><td style="background:#1c1a0f;padding:28px 40px;">
            <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">
              GLORYBAGH VILLA · UDAIPUR
            </p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#f5f0e8;letter-spacing:1px;">
              We've received your inquiry
            </h1>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#2b2710;line-height:1.7;">
              Dear <strong>{data.firstName}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#5a5040;line-height:1.8;">
              Thank you for reaching out to GloryBagh Villa. We have received your inquiry
              and our hospitality team will contact you within a few hours to discuss
              availability and personalise your stay.
            </p>

            <!-- Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#faf7f2;border:1px solid #e0d8c8;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;font-size:10px;letter-spacing:3px;
                           text-transform:uppercase;color:#c9a84c;">YOUR INQUIRY SUMMARY</p>
                <p style="margin:5px 0;font-size:13px;color:#5a5040;">
                  <span style="color:#2b2710;font-weight:500;">Check-in:</span> &nbsp;{data.checkin}
                </p>
                <p style="margin:5px 0;font-size:13px;color:#5a5040;">
                  <span style="color:#2b2710;font-weight:500;">Check-out:</span> &nbsp;{data.checkout}
                </p>
                <p style="margin:5px 0;font-size:13px;color:#5a5040;">
                  <span style="color:#2b2710;font-weight:500;">Guests:</span> &nbsp;{data.guests}
                </p>
                <p style="margin:5px 0;font-size:13px;color:#5a5040;">
                  <span style="color:#2b2710;font-weight:500;">Occasion:</span> &nbsp;{data.occasion}
                </p>
              </td></tr>
            </table>

            <p style="margin:0 0 8px;font-size:13px;color:#5a5040;line-height:1.7;">
              For urgent queries, reach us directly:
            </p>
            <p style="margin:0;font-size:13px;color:#2b2710;">
              📞 &nbsp;+91 98985 95891 &nbsp;·&nbsp; 💬 WhatsApp available
            </p>
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#1c1a0f;padding:20px 40px;">
            <p style="margin:0;font-size:11px;color:#7a6e52;letter-spacing:1px;">
              GloryBagh Villa &nbsp;·&nbsp; Udaipur, Rajasthan &nbsp;·&nbsp;
              <a href="mailto:glorybaghvilla@gmail.com"
                 style="color:#c9a84c;text-decoration:none;">glorybaghvilla@gmail.com</a>
            </p>
          </td></tr>

        </table>
      </td></tr>
    </table>
    </body></html>
    """


# ── API Routes ──────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "GloryBagh Villa API is running ✦"}


@app.post("/inquiry")
async def submit_inquiry(data: InquiryForm):
    # Validate config
    if not GMAIL_USER or not GMAIL_PASSWORD or not OWNER_EMAIL:
        raise HTTPException(
            status_code=500,
            detail="Email not configured. Check .env file."
        )

    try:
        # 1. Send inquiry to villa owner (YOUR Gmail)
        send_email(
            to        = OWNER_EMAIL,
            subject   = f"New Inquiry — {data.firstName} {data.lastName} | GloryBagh Villa",
            html_body = owner_email_html(data),
            reply_to  = data.email   # so you can reply directly to guest
        )

        # 2. Send confirmation to guest
        send_email(
            to        = data.email,
            subject   = "Your Inquiry — GloryBagh Villa, Udaipur",
            html_body = guest_email_html(data),
        )

        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Inquiry received. We will contact you shortly."}
        )

    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="Gmail authentication failed. Check GMAIL_USER and GMAIL_PASSWORD in .env"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
