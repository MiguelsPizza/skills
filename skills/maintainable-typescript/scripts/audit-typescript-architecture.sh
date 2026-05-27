#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"

TARGET_DIR="$(resolve_target_dir "${1:-.}")"

echo "Running architecture audit against: $TARGET_DIR"

if has_local_bin "$TARGET_DIR" fallow; then
  run_or_skip "Fallow circular dependencies" run_local_bin "$TARGET_DIR" fallow --root "$TARGET_DIR" dead-code --circular-deps --quiet
  run_or_skip "Fallow boundary violations" run_local_bin "$TARGET_DIR" fallow --root "$TARGET_DIR" dead-code --boundary-violations --quiet
else
  print_section "Fallow architecture"
  echo "Skipped: install fallow in the target repo"
  echo "Tip: copy $TEMPLATE_DIR/.fallowrc.json to $TARGET_DIR/.fallowrc.json and configure boundaries when the repo has architectural import rules."
fi

echo
echo "Architecture audit finished."
