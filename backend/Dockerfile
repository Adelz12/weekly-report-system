FROM python:3.9-slim

WORKDIR /app

# Install system build deps needed for some Python wheels (pycairo/reportlab)
RUN apt-get update && apt-get install -y --no-install-recommends \
build-essential \
gcc \
pkg-config \
libcairo2-dev \
libpango1.0-dev \
libfreetype6-dev \
libpng-dev \
python3-dev \
meson \
ninja-build \
ca-certificates \
&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Improve reliability of installs in environments with slower networks
ENV PIP_DEFAULT_TIMEOUT=120
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "run.py"]