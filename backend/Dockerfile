FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
# Improve reliability of installs in environments with slower networks
ENV PIP_DEFAULT_TIMEOUT=120
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir --timeout 120 -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "run.py"]