#!/usr/bin/env bash
# PostToolUse (Edit|Write): format the edited file with the repo's .prettierrc.
# Markdown is skipped on purpose: proseWrap=always would reflow whole documents.
f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -n "$f" ] && [ -f "$f" ] || exit 0
case "$f" in
  */node_modules/*|*/dist/*|*/archive/*) exit 0 ;;
  *.ts|*.tsx|*.js|*.jsx|*.cjs|*.mjs|*.json|*.css|*.scss|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac
cd "${CLAUDE_PROJECT_DIR:-.}" && npx --yes prettier@3.6.2 --write --log-level warn "$f"
