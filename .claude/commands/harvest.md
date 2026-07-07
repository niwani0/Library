---
name: harvest
description: Distill a shipped project into wiki pages — the only way wiki articles get written
argument-hint: "[project or output file] (optional — defaults to most recent unharvested ship)"
---

# Harvest

Distill durable knowledge from a **shipped** project into `wiki/` pages.
This command is the only legitimate source of wiki content (see THE RULE
in the root CLAUDE.md).

## Step 1: Pick the harvest target

- If `$ARGUMENTS` names a project or output file, use it.
- Otherwise, find the most recent `output/` entry that is not yet cited in
  any wiki page's `## Harvested from` section.
- If nothing qualifies, say so and stop. **Never harvest a project whose
  status is not `shipped`** — offer to wait until it ships.

## Step 2: Read the full trail

Read, in order:
1. The `output/` entry (what actually shipped).
2. The full project file in `projects/` (the working log — decisions,
   dead ends, surprises).

## Step 3: Extract durable insights

From the trail, list candidate insights. An insight qualifies only if it is:
- **Durable** — still true when the project is forgotten.
- **Earned** — learned by doing this project, not background knowledge.
- **Reusable** — would change how a future project is done.

Ignore project trivia, timelines, and anything only true for this one artifact.
A harvest yielding zero insights is a valid outcome — say so and stop.

## Step 4: Write to the wiki

For each insight, decide: does it extend an existing `wiki/` page or earn a
new topic?

- **Extend**: integrate the insight into the existing page's prose (rewrite
  sections if needed — wiki pages are living documents, not append logs).
- **New page**: create `wiki/kebab-case-topic.md` only when the insight fits
  no existing page. Topics are earned, not planned — prefer extending.

Every touched page must end with:

```markdown
## Harvested from
- [[YYYY-MM-DD-artifact-name]]
```

(appending the new output entry, keeping prior entries).

## Step 5: Close the loop

1. Update `wiki/_index.md` with any new pages.
2. In the `output/` entry, add a `Harvested: [[wiki page]], ...` line so the
   entry is marked as processed.
3. Confirm the project file's frontmatter says `status: shipped` and it is
   listed under "Shipped" in `projects/_index.md`; fix if not.
4. Report: insights extracted, wiki pages created vs. extended, with links.
