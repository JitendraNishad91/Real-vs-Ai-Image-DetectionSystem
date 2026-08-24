import unittest
from fastapi.testclient import TestClient
import io
import time
from PIL import Image

# Import app modules relative to backend path
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Force an isolated local SQLite DB so tests never touch the production (Neon) database.
# Must be set BEFORE importing app modules because config reads env at import time.
os.environ["DATABASE_URL"] = "sqlite:///./data/test_realcheck.db"
os.environ["SECRET_KEY"] = "test_secret_key_for_unittest_only"

from app.main import app
from app.database import Base, engine

class TestRealCheckAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create tables in sqlite db
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

        # Warm up the inference engine once (TensorFlow graph init can take
        # several seconds on the very first prediction and would otherwise
        # pollute the latency assertion below).
        img = Image.new('RGB', (32, 32), color='blue')
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        cls.client.post("/classify", files={"file": ("warmup.jpg", buf.getvalue(), "image/jpeg")})

    def test_auth_flow(self):
        import uuid
        unique = uuid.uuid4().hex[:8]
        username = f"testuser_{unique}"
        email = f"{username}@example.com"

        # Test Register
        reg_response = self.client.post("/auth/register", json={
            "username": username,
            "email": email,
            "password": "securepassword123"
        })
        self.assertEqual(reg_response.status_code, 201)
        self.assertEqual(reg_response.json()["username"], username)
        self.assertEqual(reg_response.json()["email"], email)

        # Duplicate email must be rejected
        dup_response = self.client.post("/auth/register", json={
            "username": f"other_{unique}",
            "email": email,
            "password": "securepassword123"
        })
        self.assertEqual(dup_response.status_code, 400)

        # Test Login
        login_response = self.client.post("/auth/login", json={
            "email": email,
            "password": "securepassword123"
        })
        self.assertEqual(login_response.status_code, 200)
        self.assertIn("access_token", login_response.json())
        self.assertEqual(login_response.json()["token_type"], "bearer")
        self.assertEqual(login_response.json()["username"], username)

    def test_forgot_and_reset_password_flow(self):
        import uuid
        unique = uuid.uuid4().hex[:8]
        username = f"resetuser_{unique}"
        email = f"{username}@example.com"

        reg = self.client.post("/auth/register", json={
            "username": username,
            "email": email,
            "password": "oldpassword123"
        })
        self.assertEqual(reg.status_code, 201)

        # Request reset code (email delivery will fail locally, but code is stored in DB)
        forgot_response = self.client.post("/auth/forgot-password", json={"email": email})
        self.assertEqual(forgot_response.status_code, 200)
        self.assertEqual(forgot_response.json()["status"], "success")

        # Unknown email still returns generic success (no account enumeration)
        unknown_response = self.client.post("/auth/forgot-password", json={"email": "ghost@example.com"})
        self.assertEqual(unknown_response.status_code, 200)
        self.assertEqual(unknown_response.json()["status"], "success")

        # Fetch the generated code straight from the database
        from app import models
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.email == email).first()
            self.assertIsNotNone(user.reset_code)
            code = user.reset_code
        finally:
            db.close()

        # Wrong code rejected
        wrong = self.client.post("/auth/reset-password", json={
            "email": email, "code": "000000", "new_password": "newpassword123"
        })
        self.assertEqual(wrong.status_code, 400)

        # Correct code resets password
        reset_response = self.client.post("/auth/reset-password", json={
            "email": email, "code": code, "new_password": "newpassword123"
        })
        self.assertEqual(reset_response.status_code, 200)

        # Old password fails, new password works
        old_login = self.client.post("/auth/login", json={
            "email": email, "password": "oldpassword123"
        })
        self.assertEqual(old_login.status_code, 400)
        new_login = self.client.post("/auth/login", json={
            "email": email, "password": "newpassword123"
        })
        self.assertEqual(new_login.status_code, 200)

    def test_classify_and_feedback(self):
        # Create a dummy RGB image in memory
        img = Image.new('RGB', (100, 100), color = 'red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        # Measure classify time
        start_time = time.time()
        response = self.client.post(
            "/classify",
            files={"file": ("test.jpg", img_byte_arr, "image/jpeg")}
        )
        end_time = time.time()
        elapsed_time = end_time - start_time

        # Validate response
        self.assertEqual(response.status_code, 200)
        self.assertLess(elapsed_time, 1.0, "Classification took longer than 1 second")
        
        data = response.json()
        self.assertIn("id", data)
        self.assertIn("label", data)
        self.assertIn("confidence", data)
        self.assertIn("gradcam_image_base64", data)

        # Test Feedback
        feedback_response = self.client.post("/feedback", json={
            "classification_id": data["id"],
            "was_correct": True
        })
        self.assertEqual(feedback_response.status_code, 200)
        self.assertEqual(feedback_response.json()["status"], "success")

    def test_stats_and_model_info(self):
        # Test Stats
        stats_response = self.client.get("/stats")
        self.assertEqual(stats_response.status_code, 200)
        self.assertIn("total_classifications", stats_response.json())
        self.assertIn("daily_trends", stats_response.json())

        # Test Model Info
        model_response = self.client.get("/model-info")
        self.assertEqual(model_response.status_code, 200)
        self.assertEqual(model_response.json()["accuracy"], 93.45)

if __name__ == "__main__":
    unittest.main()
