#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="${1:-.}"

bash "$SCRIPT_DIR/audit-typescript-dead-code.sh" "$TARGET_DIR"
bash "$SCRIPT_DIR/audit-typescript-duplicate-code.sh" "$TARGET_DIR"
bash "$SCRIPT_DIR/audit-typescript-architecture.sh" "$TARGET_DIR"
