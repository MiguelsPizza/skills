#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"

TARGET_DIR="$(resolve_target_dir "${1:-.}")"

echo "Running duplicate code audit against: $TARGET_DIR"

if has_local_bin "$TARGET_DIR" fallow; then
  run_or_skip "Fallow duplication" run_local_bin "$TARGET_DIR" fallow --root "$TARGET_DIR" dupes --quiet
else
  print_section "Fallow duplication"
  echo "Skipped: install fallow in the target repo"
  echo "Tip: copy $TEMPLATE_DIR/.fallowrc.json to $TARGET_DIR/.fallowrc.json for repo-owned duplication policy."
fi

echo
echo "Duplicate code audit finished."
