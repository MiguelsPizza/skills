#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/skills"
TARGET="${1:-maintainable-typescript}"

build_archive() {
  local skill_name="$1"
  local archive_path="$SKILLS_DIR/$skill_name.zip"

  if [[ ! -f "$SKILLS_DIR/$skill_name/SKILL.md" ]]; then
    echo "Skill directory not found or missing SKILL.md: $SKILLS_DIR/$skill_name" >&2
    exit 1
  fi

  rm -f "$archive_path"

  (
    cd "$SKILLS_DIR"
    zip -qr "$archive_path" "$skill_name" -x "*/.DS_Store"
  )

  echo "Built $archive_path"
}

if [[ "$TARGET" == "all" ]]; then
  while IFS= read -r skill_path; do
    build_archive "$(basename "$(dirname "$skill_path")")"
  done < <(find "$SKILLS_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md | sort)
  exit 0
fi

build_archive "$TARGET"
