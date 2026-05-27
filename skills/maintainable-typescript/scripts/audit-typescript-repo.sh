#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-.}"

bash "$SCRIPT_DIR/audit-typescript-dead-code.sh" "$TARGET_DIR"
bash "$SCRIPT_DIR/audit-typescript-duplicate-code.sh" "$TARGET_DIR"
bash "$SCRIPT_DIR/audit-typescript-architecture.sh" "$TARGET_DIR"

source "$SCRIPT_DIR/lib/common.sh"

RESOLVED_TARGET_DIR="$(resolve_target_dir "$TARGET_DIR")"

if has_local_bin "$RESOLVED_TARGET_DIR" fallow; then
  run_or_skip "Fallow health" run_local_bin "$RESOLVED_TARGET_DIR" fallow --root "$RESOLVED_TARGET_DIR" health --score --hotspots --targets --quiet
else
  print_section "Fallow health"
  echo "Skipped: install fallow in the target repo"
fi
