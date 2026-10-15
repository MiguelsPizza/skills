#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/skills"
TARGET="${1:-maintainable-typescript}"

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "Skills directory not found: $SKILLS_DIR" >&2
  exit 1
fi

build_archive() (
  local skill_name="$1"
  local archive_path="$SKILLS_DIR/$skill_name.zip"

  if [[ ! "$skill_name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
    echo "Invalid skill name: $skill_name" >&2
    exit 1
  fi

  if [[ ! -f "$SKILLS_DIR/$skill_name/SKILL.md" ]]; then
    echo "Skill directory not found or missing SKILL.md: $SKILLS_DIR/$skill_name" >&2
    exit 1
  fi
  if [[ -d "$archive_path" ]]; then
    echo "Archive path is a directory: $archive_path" >&2
    exit 1
  fi

  local archive_dir
  archive_dir="$(mktemp -d "$SKILLS_DIR/.$skill_name.XXXXXX")"
  trap 'rm -rf "$archive_dir"' EXIT

  (
    cd "$SKILLS_DIR"
    zip -qr "$archive_dir/$skill_name.zip" "$skill_name" -x "*/.DS_Store"
  )
  mv -f "$archive_dir/$skill_name.zip" "$archive_path"

  echo "Built $archive_path"
)

if [[ "$TARGET" == "all" ]]; then
  shopt -s nullglob
  skill_paths=("$SKILLS_DIR"/*/SKILL.md)
  if (( ${#skill_paths[@]} == 0 )); then
    echo "No skills found in $SKILLS_DIR" >&2
    exit 1
  fi
  for skill_path in "${skill_paths[@]}"; do
    build_archive "$(basename "$(dirname "$skill_path")")"
  done
  exit 0
fi

build_archive "$TARGET"
