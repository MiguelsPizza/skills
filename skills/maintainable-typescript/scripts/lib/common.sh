#!/usr/bin/env bash

set -euo pipefail

AUDIT_COMMON_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$AUDIT_COMMON_DIR/../.." && pwd)"
TEMPLATE_DIR="$SKILL_DIR/assets/tooling-templates"
AUDIT_STATUS=0

print_section() {
  echo
  echo "==> $1"
}

fail() {
  echo "$1" >&2
  exit 1
}

resolve_target_dir() {
  local input_dir="${1:-.}"
  if [[ ! -d "$input_dir" ]]; then
    fail "Target directory not found: $input_dir"
  fi

  local absolute_dir
  absolute_dir="$(cd "$input_dir" && pwd)"

  if [[ ! -f "$absolute_dir/package.json" ]]; then
    fail "No package.json found in $absolute_dir"
  fi

  printf '%s\n' "$absolute_dir"
}

has_local_bin() {
  local target_dir="$1"
  local bin_name="$2"
  [[ -x "$target_dir/node_modules/.bin/$bin_name" ]]
}

run_local_bin() {
  local target_dir="$1"
  local bin_name="$2"
  shift 2
  run_in_target_dir "$target_dir" "$target_dir/node_modules/.bin/$bin_name" "$@"
}

run_in_target_dir() {
  local target_dir="$1"
  shift
  (
    cd "$target_dir" || exit
    "$@"
  )
}

run_or_skip() {
  local label="$1"
  shift
  print_section "$label"
  local status
  if "$@"; then
    return 0
  else
    status=$?
  fi
  if (( status > AUDIT_STATUS )); then
    AUDIT_STATUS=$status
  fi
  echo "Failed ($status): $label" >&2
  return 0
}
