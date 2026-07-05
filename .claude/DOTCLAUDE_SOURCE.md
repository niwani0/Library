Vendored from https://github.com/poshan0126/dotclaude at commit
`e59380ad5e89fb27033c3fa9fc12d1d3d734bba1`, MIT licensed (see `DOTCLAUDE_LICENSE`).

What was installed:
- `skills/` - 12 skills: catchup, claude-md, context-budget, debug-fix, explain,
  fix-issue, pr-review, refactor, setupdotclaude, ship, tdd, test-writer.
- `agents/` - 7 subagents: code-reviewer, doc-reviewer, frontend-designer,
  performance-reviewer, pr-test-analyzer, security-reviewer, silent-failure-hunter.
- `rules/` - 6 rule files (some always-loaded, some path-scoped via `paths:`
  frontmatter - see each file and https://code.claude.com/docs/en/memory#path-specific-rules).
- `hooks/` - 8 shell scripts wired into `settings.json`:
  - PreToolUse (Edit|Write): `protect-files.sh`, `warn-large-files.sh`, `scan-secrets.sh`
  - PreToolUse (Bash): `block-dangerous-commands.sh`
  - PostToolUse (Edit|Write): `format-on-save.sh`, `auto-test.sh`
  - SessionStart: `session-start.sh`
  - Notification: `notify.sh`
- `settings.json` - permission allow/deny list plus the hook wiring above.

What was intentionally NOT installed:
- `CLAUDE.md` from the source repo - that file documents the dotclaude repo
  itself, not a target project. Its `CLAUDE.template.md` counterpart is meant
  to be customized by that repo's own `/setupdotclaude` skill (now installed
  here) rather than copied verbatim, since it assumes npm-style build/test
  commands that don't apply to this repo.
- `hooks/tests/` (fixtures for developing dotclaude's own hooks) and
  `plugins/`/`.claude-plugin/` (marketplace packaging - irrelevant once
  vendored directly into `.claude/`).

All 8 hook scripts were read in full before installing: they block dangerous
git/shell operations, scan for hardcoded secrets, protect sensitive/generated
files, auto-format and auto-test edited files, inject minimal git-status
context at session start, and send OS notifications. None of them make
network calls beyond `gh pr view` (already-sanctioned) in verbose mode.
