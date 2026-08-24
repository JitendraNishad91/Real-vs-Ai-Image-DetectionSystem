import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from .database import get_db
from . import models, auth
from .email_utils import send_email
from .config import settings

router = APIRouter(prefix="/support", tags=["support"])


class SupportQueryCreate(BaseModel):
    name: str
    email: Optional[str] = ""
    subject: str
    message: str


class ReceivedQuery(BaseModel):
    id: int
    user: Optional[str]
    subject: Optional[str]
    message: Optional[str]
    created_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True


def _build_query_email(name: str, email: str, subject: str, message: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background-color:#0c0b14;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:#161526;border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.25);">
        <div style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:28px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;">New User Query - RealCheck AI</h1>
        </div>
        <div style="padding:28px;color:#e5e7eb;">
          <p style="font-size:13px;margin:0 0 6px;color:#a3a1bc;">From:</p>
          <p style="font-size:15px;font-weight:bold;margin:0 0 16px;color:#ffffff;">{name} ({email or 'no email provided'})</p>
          <p style="font-size:13px;margin:0 0 6px;color:#a3a1bc;">Subject:</p>
          <p style="font-size:15px;font-weight:bold;margin:0 0 16px;color:#ffffff;">{subject}</p>
          <p style="font-size:13px;margin:0 0 6px;color:#a3a1bc;">Message:</p>
          <p style="font-size:14px;line-height:1.6;margin:0;background:#221d3f;border-radius:12px;padding:16px;color:#e5e7eb;">{message}</p>
        </div>
      </div>
    </body>
    </html>
    """


@router.post("/query")
def submit_query(query_in: SupportQueryCreate, db: Session = Depends(get_db)):
    """Anyone (including guests) can ask a question. Stored directly in the Neon `queries` table."""
    name = query_in.name.strip()
    subject = query_in.subject.strip()
    message = query_in.message.strip()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Please provide your name.")
    if len(subject) < 3:
        raise HTTPException(status_code=400, detail="Subject must be at least 3 characters.")
    if len(message) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters.")
    if len(message) > 4000:
        raise HTTPException(status_code=400, detail="Message cannot exceed 4000 characters.")

    # Display identity: name plus optional reply email
    display_user = f"{name} <{query_in.email.strip()}>" if query_in.email and query_in.email.strip() else name

    result = db.execute(
        text('INSERT INTO queries ("user", subject, message, created_at) VALUES (:u, :s, :m, :t) RETURNING id'),
        {"u": display_user, "s": subject, "m": message, "t": datetime.datetime.utcnow()}
    )
    query_id = result.scalar_one()
    db.commit()

    # Best-effort email notification to the owner (never blocks the response)
    try:
        send_email(
            settings.EMAIL_ADDRESS,
            f"RealCheck AI Query: {subject}",
            _build_query_email(name, query_in.email or "", subject, message)
        )
    except Exception as e:
        print(f"[WARNING] Query email notification failed: {e}")

    return {
        "status": "success",
        "id": query_id,
        "message": "Your query has been submitted successfully. We will get back to you soon!"
    }


@router.get("/queries", response_model=List[ReceivedQuery])
def get_queries(db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(auth.get_current_user)):
    """Inbox: all queries received from users (requires login)."""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Log in to view received queries."
        )
    return db.execute(
        text('SELECT id, "user", subject, message, created_at FROM queries ORDER BY created_at DESC')
    ).fetchall()


@router.delete("/queries/{query_id}")
def delete_query(
    query_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    """Delete a single query from the inbox (requires login)."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Log in to manage queries.")

    result = db.execute(text("DELETE FROM queries WHERE id = :qid"), {"qid": query_id})
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"status": "success", "message": "Query deleted."}


@router.delete("/queries")
def clear_queries(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user)
):
    """Clear all queries from the inbox (requires login)."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Log in to manage queries.")

    result = db.execute(text("DELETE FROM queries"))
    db.commit()
    return {"status": "success", "message": f"Cleared {result.rowcount} queries."}
