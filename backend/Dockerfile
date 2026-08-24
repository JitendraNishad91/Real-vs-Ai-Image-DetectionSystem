FROM python:3.10-slim

WORKDIR /app

# Stream logs immediately (no buffering) — critical for cloud debugging
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install system dependencies for OpenCV & Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create database volume directory
RUN mkdir -p /app/data

EXPOSE 8000

# Railway injects $PORT — fall back to 8000 for local docker-compose
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
