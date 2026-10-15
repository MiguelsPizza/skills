#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

RESOLVED_TARGET_DIR="$(resolve_target_dir "${1:-.}")"

run_or_skip "Dead code audit" bash "$SCRIPT_DIR/audit-typescript-dead-code.sh" "$RESOLVED_TARGET_DIR"
run_or_skip "Duplicate code audit" bash "$SCRIPT_DIR/audit-typescript-duplicate-code.sh" "$RESOLVED_TARGET_DIR"
run_or_skip "Architecture audit" bash "$SCRIPT_DIR/audit-typescript-architecture.sh" "$RESOLVED_TARGET_DIR"

if has_local_bin "$RESOLVED_TARGET_DIR" fallow; then
  run_or_skip "Fallow health" run_local_bin "$RESOLVED_TARGET_DIR" fallow --root "$RESOLVED_TARGET_DIR" health --score --hotspots --targets --quiet
else
  print_section "Fallow health"
  echo "Skipped: install fallow in the target repo"
fi

exit "$AUDIT_STATUS"
