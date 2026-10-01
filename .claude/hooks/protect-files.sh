#!/usr/bin/env bash
# PreToolUse (Edit|Write): block edits to secrets and the lockfile, and stop new
# AI-generated report files from piling up in the repo root again.
root="${CLAUDE_PROJECT_DIR:-$PWD}"
f=$(jq -r '.tool_input.file_path // empty')
[ -n "$f" ] || exit 0
name=$(basename "$f")
case "$name" in
  .env.example|.env.*.example) ;;
  .env|.env.*)
    echo "Blocked: $name holds secrets. Edit it by hand, or update .env.example instead." >&2
    exit 2 ;;
  package-lock.json)
    echo "Blocked: package-lock.json is generated. Run npm install instead of editing it." >&2
    exit 2 ;;
esac
if [ "$(dirname "$f")" = "$root" ] && [ ! -e "$f" ]; then
  case "$name" in
    *_REPORT.md|*_SUMMARY.md|*_GUIDE.md|*_ANALYSIS.md|*_PLAN.md)
      echo "Blocked: no new report/summary files in the repo root. Put lasting docs in docs/ and report results in chat." >&2
      exit 2 ;;
  esac
fi
exit 0
