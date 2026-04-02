#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"

TARGET_DIR="$(resolve_target_dir "${1:-.}")"
DEPCRUISE_CONFIG="$TARGET_DIR/.dependency-cruiser.mjs"

if [[ ! -f "$DEPCRUISE_CONFIG" ]]; then
  DEPCRUISE_CONFIG="$TEMPLATE_DIR/.dependency-cruiser.mjs"
fi

echo "Running architecture audit against: $TARGET_DIR"

if has_local_bin "$TARGET_DIR" depcruise; then
  run_or_skip "dependency-cruiser" run_local_bin "$TARGET_DIR" depcruise "$TARGET_DIR" --config "$DEPCRUISE_CONFIG"
  if [[ "$DEPCRUISE_CONFIG" == "$TEMPLATE_DIR/.dependency-cruiser.mjs" ]]; then
    echo "Tip: copy $TEMPLATE_DIR/.dependency-cruiser.mjs to $TARGET_DIR/.dependency-cruiser.mjs if you want repo-owned boundary rules."
  fi
else
  print_section "dependency-cruiser"
  echo "Skipped: install dependency-cruiser in the target repo"
fi

if has_local_bin "$TARGET_DIR" ast-grep; then
  if [[ -f "$TARGET_DIR/sgconfig.yml" ]]; then
    run_or_skip "ast-grep" run_local_bin "$TARGET_DIR" ast-grep scan --project "$TARGET_DIR"
  else
    print_section "ast-grep"
    echo "Skipped: target repo has no sgconfig.yml"
    echo "Tip: copy $TEMPLATE_DIR/sgconfig.yml and $TEMPLATE_DIR/ast-grep/ into the target repo root."
  fi
else
  print_section "ast-grep"
  echo "Skipped: install @ast-grep/cli in the target repo"
fi

echo
echo "Architecture audit finished."
