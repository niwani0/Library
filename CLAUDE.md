# Library — Second Brain

An Obsidian vault managed as a knowledge pipeline. Knowledge flows through
stages; it is never filed by topic. Plain markdown only — no Obsidian plugins,
no Dataview, no templater. `[[wikilinks]]` are allowed (core Obsidian).

## The pipeline

```
capture      work          ship         distill
inbox/  -->  projects/ --> output/  --> wiki/
```

| Stage | What lives here | Enters when | Leaves when |
|---|---|---|---|
| `inbox/` | Raw captures: thoughts, links, quotes, half-ideas | Instantly, zero friction | Pulled into a project (or deleted) |
| `projects/` | Active work-in-progress, **one file per project** | An inbox note grows intent | The project ships or is abandoned |
| `output/` | Shipped artifacts: posts, code, talks, decisions | Something actually ships | Never — this is the permanent record |
| `wiki/` | Distilled, evergreen topic notes | **Harvested from a shipped project only** | Never — but pages get revised on re-harvest |

## THE RULE

**Wiki articles are harvested from finished projects — never written directly.**

A wiki page exists only because something shipped and taught you something
durable. If you feel the urge to "just write a wiki page about X", that urge
is an inbox note. Capture it in `inbox/`, let it become a project, ship the
project, then harvest. No exceptions — not for Claude, not for the human.

Corollaries:
- Every wiki page cites at least one `output/` artifact in a `Harvested from`
  section. A wiki page with no source is a bug: demote it to `inbox/`.
- Wiki pages are updated the same way they are born: by re-harvesting after
  another relevant project ships.

## Conventions

### inbox/
- Zero friction. No naming rules, no frontmatter, no organizing. Dumping a
  sentence into a file named `asdf.md` is correct behavior.
- Suggested (not required) name: `YYYY-MM-DD-few-words.md`.
- Never edit inbox notes in place to "improve" them — either pull them into a
  project or leave them alone.

### projects/
- One file per project: `kebab-case-name.md`.
- Frontmatter:
  ```yaml
  ---
  status: active   # active | stalled | shipped | abandoned
  started: YYYY-MM-DD
  ---
  ```
- The project file is the single working document: goal at top, then a
  running log of notes, drafts, decisions. Absorb relevant inbox notes into
  it (copy the content in, delete the inbox file).

### output/
- One file per shipped artifact: `YYYY-MM-DD-kebab-case-name.md`.
- Contains: what shipped, a link to the artifact (URL, repo, file), and a
  link back to the project file that produced it.
- Marking a project `status: shipped` and creating its `output/` entry happen
  together.

### wiki/
- One page per topic: `kebab-case-topic.md`. Topics are earned, not planned.
- Every page ends with a `## Harvested from` section listing `[[output entries]]`.
- Written for your future self: dense, factual, no narrative filler.

### _index.md
- Every stage folder has an `_index.md` mapping its contents.
- Whoever adds, moves, or removes a file updates that folder's `_index.md`
  in the same change. Indexes are maintained by hand — no plugins.

## Claude's responsibilities

- **Respect the flow direction.** Never move content backward (wiki → project)
  or skip stages (inbox → wiki).
- **Never organize inbox/.** Do not rename, tag, or sort inbox notes unless
  pulling them into a project on request.
- **Enforce THE RULE.** If asked to write a wiki article directly, refuse and
  offer to capture the idea in `inbox/` instead.
- **Keep indexes true.** Update the affected `_index.md` files with every file
  operation.
- **`/harvest`** distills a shipped project into wiki pages — see
  `.claude/commands/harvest.md`.
