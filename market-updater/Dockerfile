# ETAPA 1: Construcción e instalación de dependencias
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir \
    --prefix=/install -r requirements.txt


# ETAPA 2: Ejecución
FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd --system app \
    && useradd --system --gid app app

COPY --from=builder /install /usr/local

COPY --chown=app:app app/ ./app/
# hadolint ignore=DL3066
USER app

CMD ["python", "-m", "app.main"]