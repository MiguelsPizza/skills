#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/skills"
SKILL_NAME="maintainable-typescript"
ARCHIVE_PATH="$SKILLS_DIR/$SKILL_NAME.zip"

if [[ ! -d "$SKILLS_DIR/$SKILL_NAME" ]]; then
  echo "Skill directory not found: $SKILLS_DIR/$SKILL_NAME" >&2
  exit 1
fi

rm -f "$ARCHIVE_PATH"

(
  cd "$SKILLS_DIR"
  zip -qr "$ARCHIVE_PATH" "$SKILL_NAME" -x "*/.DS_Store"
)

echo "Built $ARCHIVE_PATH"
