#!/usr/bin/env bash

set -euo pipefail

TARGET_DIR="${1:-.}"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Target directory not found: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -f "$TARGET_DIR/package.json" ]]; then
  echo "No package.json found in $TARGET_DIR" >&2
  exit 1
fi

run_tool() {
  local label="$1"
  shift

  echo
  echo "==> $label"
  if "$@"; then
    return 0
  fi

  echo "Failed: $label" >&2
  return 1
}

has_local_bin() {
  local bin_name="$1"
  [[ -x "$TARGET_DIR/node_modules/.bin/$bin_name" ]]
}

run_local_bin() {
  local bin_name="$1"
  shift
  "$TARGET_DIR/node_modules/.bin/$bin_name" "$@"
}

run_in_target_dir() {
  (
    cd "$TARGET_DIR"
    "$@"
  )
}

echo "Auditing TypeScript repo: $TARGET_DIR"

if [[ -f "$TARGET_DIR/tsconfig.json" ]]; then
  if has_local_bin tsc; then
    run_tool "TypeScript compile check" run_local_bin tsc --noEmit -p "$TARGET_DIR/tsconfig.json" || true
  else
    echo
    echo "==> TypeScript compile check"
    echo "Skipped: install typescript in the target repo"
  fi
else
  echo
  echo "==> TypeScript compile check"
  echo "Skipped: no tsconfig.json at repo root"
fi

echo
if has_local_bin vp; then
  echo "==> Vite+ lint"
  run_in_target_dir "$TARGET_DIR/node_modules/.bin/vp" lint || true
elif has_local_bin oxlint; then
  echo "==> Oxlint"
  run_local_bin oxlint "$TARGET_DIR" || true
else
  echo "==> Lint"
  echo "Skipped: install oxlint or use Vite+ in the target repo"
fi

echo
echo "==> Fallow"
if has_local_bin fallow; then
  run_local_bin fallow --root "$TARGET_DIR" --quiet || true
else
  echo "Skipped: install fallow in the target repo"
fi

echo
echo "Audit finished."
