FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir torch==2.4.1+cpu --extra-index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir fastapi==0.115.0 uvicorn==0.30.6 pydantic==2.9.2 sentence-transformers==3.1.1

COPY main.py .

# Pré-télécharger le modèle au build (pas au runtime)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"

EXPOSE 10000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
