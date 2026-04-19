#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin.kraken@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-password123}"
TEACHER_EMAIL="${TEACHER_EMAIL:-teacher.kraken@example.com}"
TEACHER_PASSWORD="${TEACHER_PASSWORD:-password123}"

COURSE_CODE="${COURSE_CODE:-INDUCCION-01}"
COURSE_NAME="${COURSE_NAME:-Curso de INDUCCION Kraken}"
TERM_NAME="${TERM_NAME:-Semestre Otono 2026}"
TERM_YEAR="${TERM_YEAR:-2026}"
TERM_PERIOD="${TERM_PERIOD:-Otono}"
TERM_STARTS_AT="${TERM_STARTS_AT:-2026-08-01T00:00:00.000Z}"
TERM_ENDS_AT="${TERM_ENDS_AT:-2026-12-15T00:00:00.000Z}"

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq no esta instalado."
  echo "Instalalo con: brew install jq"
  exit 1
fi

login() {
  local email="$1"
  local password="$2"

  curl -sS -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}"
}

echo "== Login admin =="
ADMIN_LOGIN_JSON="$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")"
ADMIN_TOKEN="$(echo "$ADMIN_LOGIN_JSON" | jq -r '.accessToken')"
ADMIN_ID="$(echo "$ADMIN_LOGIN_JSON" | jq -r '.userId')"

if [[ -z "$ADMIN_TOKEN" || "$ADMIN_TOKEN" == "null" ]]; then
  echo "Error: no se pudo obtener ADMIN_TOKEN"
  echo "$ADMIN_LOGIN_JSON"
  exit 1
fi

echo "== Login teacher =="
TEACHER_LOGIN_JSON="$(login "$TEACHER_EMAIL" "$TEACHER_PASSWORD")"
TEACHER_ID="$(echo "$TEACHER_LOGIN_JSON" | jq -r '.userId')"

if [[ -z "$TEACHER_ID" || "$TEACHER_ID" == "null" ]]; then
  echo "Error: no se pudo obtener TEACHER_ID"
  echo "$TEACHER_LOGIN_JSON"
  exit 1
fi

echo "== Crear curso =="
COURSE_JSON="$(curl -sS -X POST "$BASE_URL/courses" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"$COURSE_CODE\",\"name\":\"$COURSE_NAME\"}")"
COURSE_ID="$(echo "$COURSE_JSON" | jq -r '.id')"

if [[ -z "$COURSE_ID" || "$COURSE_ID" == "null" ]]; then
  echo "Error al crear curso"
  echo "$COURSE_JSON"
  exit 1
fi

echo "== Crear termino =="
TERM_JSON="$(curl -sS -X POST "$BASE_URL/terms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$TERM_NAME\",\"year\":$TERM_YEAR,\"period\":\"$TERM_PERIOD\",\"startsAt\":\"$TERM_STARTS_AT\",\"endsAt\":\"$TERM_ENDS_AT\"}")"
TERM_ID="$(echo "$TERM_JSON" | jq -r '.id')"

if [[ -z "$TERM_ID" || "$TERM_ID" == "null" ]]; then
  echo "Error al crear termino"
  echo "$TERM_JSON"
  exit 1
fi

echo "== Crear offering =="
OFFERING_JSON="$(curl -sS -X POST "$BASE_URL/offerings" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\":\"$COURSE_ID\",\"termId\":\"$TERM_ID\",\"teacherId\":\"$TEACHER_ID\"}")"
OFFERING_ID="$(echo "$OFFERING_JSON" | jq -r '.id')"

if [[ -z "$OFFERING_ID" || "$OFFERING_ID" == "null" ]]; then
  echo "Error al crear offering"
  echo "$OFFERING_JSON"
  exit 1
fi

echo

echo "Creado correctamente:"
echo "ADMIN_ID=$ADMIN_ID"
echo "TEACHER_ID=$TEACHER_ID"
echo "COURSE_ID=$COURSE_ID"
echo "TERM_ID=$TERM_ID"
echo "OFFERING_ID=$OFFERING_ID"
echo

echo "Exports utiles para siguientes curls:"
echo "export BASE_URL=\"$BASE_URL\""
echo "export ADMIN_TOKEN=\"$ADMIN_TOKEN\""
echo "export ADMIN_ID=\"$ADMIN_ID\""
echo "export TEACHER_ID=\"$TEACHER_ID\""
echo "export COURSE_ID=\"$COURSE_ID\""
echo "export TERM_ID=\"$TERM_ID\""
echo "export OFFERING_ID=\"$OFFERING_ID\""
