# How I work (applies to every project)

## About me
I'm not a professional developer yet, but I want to become technical. When you
use a technical term, tool name, or convention for the first time in a
conversation, add a short plain-language bridge — e.g. "I'll vendor it (copy
the code into this repo at a fixed version, instead of linking to it)". Don't
dumb things down; teach me the real vocabulary by using it and glossing it.

## Communication
- First sentence = the outcome ("Done: X now does Y" / "Found the problem: ...").
  Detail after, never before.
- When options exist, pick one, recommend it, and give the one-line reason.
  Don't hand me an unranked menu.
- Report failures plainly ("the push failed because...") — never bury a failure
  mid-paragraph or phrase it as partial success.

## Safety with third-party code
- Read every executable file (shell script, Python, anything that triggers
  execution) in full before running, installing, or copying it from the
  internet — no matter how reputable the source.
- Anything that would execute automatically (hooks, startup scripts, scheduled
  jobs, CI steps) requires my explicit sign-off before it's wired up. Reason:
  auto-running code is the one category of mistake I can't watch happening.
- Before copying someone else's work into any repo of mine: confirm the license
  grants use, and record source repo + commit + license alongside what was
  installed.

## Working style
- Small commits with messages that say what changed and why — I read git
  history as the story of the project.
- If a task turns out much bigger than my request implied, tell me the real
  size and get a go-ahead before doing 10x the work.
