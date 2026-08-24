from pydantic import BaseModel
from typing import List, Optional, Dict
import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

class ClassifyResponse(BaseModel):
    id: int
    filename: str
    label: str
    confidence: float
    inference_time_ms: int
    gradcam_image_base64: str

    class Config:
        from_attributes = True

class FeedbackRequest(BaseModel):
    classification_id: int
    was_correct: bool

class FeedbackResponse(BaseModel):
    status: str
    message: str

class ProfileStats(BaseModel):
    total_scans: int
    real_count: int
    fake_count: int
    queries_submitted: int
    avg_inference_ms: float

class ProfileResponse(BaseModel):
    username: str
    email: str
    member_since: datetime.datetime
    stats: ProfileStats

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    id: int
    filename: str
    label: str
    confidence: float
    inference_time_ms: int
    created_at: datetime.datetime
    has_feedback: bool
    was_correct: Optional[bool] = None

    class Config:
        from_attributes = True

class DailyTrend(BaseModel):
    date: str
    real_count: int
    fake_count: int

class StatsResponse(BaseModel):
    total_classifications: int
    real_count: int
    fake_count: int
    feedback_accuracy: float
    daily_trends: List[DailyTrend]

class ModelInfoResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    roc_curve: List[Dict[str, float]]
    dataset_info: Dict[str, str]
