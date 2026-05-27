#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"

TARGET_DIR="$(resolve_target_dir "${1:-.}")"

echo "Running dead code and dependency audit against: $TARGET_DIR"

if [[ -f "$TARGET_DIR/tsconfig.json" ]]; then
  if has_local_bin "$TARGET_DIR" tsc; then
    run_or_skip "TypeScript compile check" run_local_bin "$TARGET_DIR" tsc --noEmit -p "$TARGET_DIR/tsconfig.json"
  else
    print_section "TypeScript compile check"
    echo "Skipped: install typescript in the target repo"
  fi
else
  print_section "TypeScript compile check"
  echo "Skipped: no tsconfig.json at repo root"
fi

if has_local_bin "$TARGET_DIR" vp; then
  run_or_skip "Vite+ lint" run_in_target_dir "$TARGET_DIR" "$TARGET_DIR/node_modules/.bin/vp" lint
elif has_local_bin "$TARGET_DIR" oxlint; then
  run_or_skip "Oxlint" run_local_bin "$TARGET_DIR" oxlint "$TARGET_DIR"
else
  print_section "Lint"
  echo "Skipped: install oxlint or use Vite+ in the target repo"
fi

if has_local_bin "$TARGET_DIR" fallow; then
  run_or_skip "Fallow dead code" run_local_bin "$TARGET_DIR" fallow --root "$TARGET_DIR" dead-code --quiet
else
  print_section "Fallow dead code"
  echo "Skipped: install fallow in the target repo"
  echo "Tip: copy $TEMPLATE_DIR/.fallowrc.json to $TARGET_DIR/.fallowrc.json for repo-owned maintainability policy."
fi

echo
echo "Dead code audit finished."
