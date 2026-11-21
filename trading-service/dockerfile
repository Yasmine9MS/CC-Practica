# ETAPA 1: Construcción
FROM python:3.13-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir \
    --prefix=/install -r requirements.txt


# ETAPA 2: Ejecución
FROM python:3.13-slim AS runtime

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app app

COPY --from=builder /install /usr/local

COPY --chown=app:app app/ ./app/

USER app

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]