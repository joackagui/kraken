#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

create_user() {
  local email="$1"
  local password="$2"
  local full_name="$3"
  local role="$4"

  curl -sS -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"fullName\":\"$full_name\",\"role\":\"$role\"}"
}

echo "== Creating users in $BASE_URL =="

echo "\n[ADMIN]"
ADMIN_JSON="$(create_user "admin.kraken@example.com" "password123" "Admin Kraken" "ADMIN")"
echo "$ADMIN_JSON"

echo "\n[TEACHER]"
TEACHER_JSON="$(create_user "teacher.kraken@example.com" "password123" "Docente Kraken" "TEACHER")"
echo "$TEACHER_JSON"

echo "\n[STUDENT]"
STUDENT_JSON="$(create_user "student.kraken@example.com" "password123" "Estudiante Kraken" "STUDENT")"
echo "$STUDENT_JSON"

echo "\nDone."
echo "If you run this script again with the same emails, the API may return: Email already in use."
