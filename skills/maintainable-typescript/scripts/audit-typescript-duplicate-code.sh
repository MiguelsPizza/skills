#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib/common.sh"

TARGET_DIR="$(resolve_target_dir "${1:-.}")"
JSCPD_CONFIG="$TARGET_DIR/.jscpd.json"

if [[ ! -f "$JSCPD_CONFIG" ]]; then
  JSCPD_CONFIG="$TEMPLATE_DIR/.jscpd.json"
fi

echo "Running duplicate code audit against: $TARGET_DIR"

if has_local_bin "$TARGET_DIR" jscpd; then
  run_or_skip "jscpd" run_local_bin "$TARGET_DIR" jscpd --config "$JSCPD_CONFIG" "$TARGET_DIR"
  if [[ "$JSCPD_CONFIG" == "$TEMPLATE_DIR/.jscpd.json" ]]; then
    echo "Tip: copy $TEMPLATE_DIR/.jscpd.json to $TARGET_DIR/.jscpd.json if you want the config versioned in the target repo."
  fi
else
  print_section "jscpd"
  echo "Skipped: install jscpd in the target repo"
fi

echo
echo "Duplicate code audit finished."
