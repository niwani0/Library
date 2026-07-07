---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implement the work described in the PRD or issues the user pointed at.

## Before writing code

- Locate the spec. If the user didn't name a PRD or issues, look in the repo's
  usual spots (docs/, tasks/, a linked issue). If none exists, stop and ask —
  do not invent requirements.
- Read the whole spec before starting. If requirements conflict with each other
  or with existing behavior, surface the conflict and get a ruling instead of
  building one interpretation.
- Establish a baseline: run the typecheck and full test suite once. If either
  already fails, report it and agree on whether to fix or work around it —
  never silently absorb pre-existing failures into your change.
- If you are on the default branch, create a feature branch before any commit.

## While implementing

- Work one issue or PRD section at a time, in dependency order. Commit at each
  seam so a bad step can be reverted without losing the rest.
- Use /tdd at seams agreed with the user. If no seams were agreed, propose them
  in one sentence and proceed unless overruled.
- After each change, typecheck and run the specific test files you touched —
  not the full suite.
- Implement only what the spec asks. Record discovered-but-out-of-scope work as
  follow-up notes; do not expand the change.

## When done

- Run the full test suite once. Fix what your change broke; report what was
  already broken before you started.
- Use /code-review on the result. Apply findings that are real defects; list
  any you skipped and why.
- Commit remaining work with one message per issue or section addressed. Do not
  push, open a PR, or merge unless asked.
- Report back: what was implemented, what was intentionally deferred, and the
  final test status.
