#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
STUDENT_EMAIL="${STUDENT_EMAIL:-student.kraken@example.com}"
STUDENT_PASSWORD="${STUDENT_PASSWORD:-password123}"
OFFERING_ID="${OFFERING_ID:-2cc10f9a-9776-44db-a302-4f5a19604e9f}"
TRACK="${TRACK:-INDUCCION}"
ACADEMIC_YEAR="${ACADEMIC_YEAR:-2026}"

if [[ -z "$OFFERING_ID" ]]; then
  echo "Error: debes definir OFFERING_ID"
  echo "Ejemplo: OFFERING_ID=2cc10f9a-9776-44db-a302-4f5a19604e9f ./docs/curls/bootstrap-student-apply.sh"
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq no esta instalado."
  echo "Instalalo con: brew install jq"
  exit 1
fi

login_student() {
  curl -sS -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}"
}

echo "== Login student =="
STUDENT_LOGIN_JSON="$(login_student)"
STUDENT_TOKEN="$(echo "$STUDENT_LOGIN_JSON" | jq -r '.accessToken')"
STUDENT_ID="$(echo "$STUDENT_LOGIN_JSON" | jq -r '.userId')"

if [[ -z "$STUDENT_TOKEN" || "$STUDENT_TOKEN" == "null" ]]; then
  echo "Error: no se pudo obtener STUDENT_TOKEN"
  echo "$STUDENT_LOGIN_JSON"
  exit 1
fi

echo "== Apply al offering =="
APPLY_JSON="$(curl -sS -X POST "$BASE_URL/offerings/$OFFERING_ID/apply" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$STUDENT_ID\",\"track\":\"$TRACK\",\"academicYear\":$ACADEMIC_YEAR}")"

echo "$APPLY_JSON"
echo
echo "Valores utiles:"
echo "export STUDENT_TOKEN=\"$STUDENT_TOKEN\""
echo "export STUDENT_ID=\"$STUDENT_ID\""
