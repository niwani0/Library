# Skills Audit — `.claude/skills/`

Audited **1626 skills** (every directory containing a `SKILL.md`) for trigger accuracy,
overlap/collision, and dead weight. Date: 2026-07-07.

| Verdict | Count | Meaning |
| --- | ---: | --- |
| keep | 1438 | Unique scope; description carries enough signal to trigger correctly |
| merge | 87 | Duplicate or heavy overlap with another skill — fold into the named primary |
| rewrite | 73 | Body worth keeping, but the description (or missing frontmatter, or generic name) breaks triggering |
| delete | 28 | Dead weight: exact duplicates, test fixtures, broken imports |

## How verdicts were assigned

- **Trigger accuracy**: a description must say *when* to invoke the skill (task keywords, file types,
  user phrasings). Descriptions that are taglines, fragments, or the skill's own name never trigger;
  descriptions over the 1024-char limit get truncated at load. Skills with
  `disable-model-invocation: true` are exempt — they only fire when the user types them.
- **Collision**: this is a flat namespace. Two failure modes found: (1) *vendored duplicates* —
  the same skill imported twice under different prefixes (`wshobson-*`, `open-design-*`,
  `mem0-mem0-*`, …); (2) *generic names* — plugin-specific skills named `help`, `search`, `status`,
  `plan`, `commit` that will pull unrelated requests toward one plugin's workflow.
- **Dead weight**: 12 test fixtures from skill-dev tooling repos (`skill-one`, `missing-trigger`,
  `deprecated-shim` → forwards to a skill that doesn't exist, …), 14 doubled-prefix exact duplicates,
  and 1 mangled import (`xlsx-official`) whose intact original (`xlsx`) is already present.

## Headline problems

1. **Six strong skills can never model-trigger at all** — `prd-coach`, `ux-coach`, `prfaq-coach`,
   `product-brief-coach`, `brainstorming-coach`, `market-and-industry-research` have **no YAML
   frontmatter**, so they have no description to match against. (`prd-coach` fixed in this pass.)
2. **Broken imports**: `django-access-review` has doubled frontmatter — its real, keyword-rich
   description is trapped in the body while the active description is just the folder name (fixed);
   `xlsx-official`'s description is a stray sentence fragment from its own body (delete — `xlsx` is intact).
3. **The code-review pile-up**: ten skills answer "review my code" (`code-review`, `code-reviewer`,
   `code-review-checklist`, `code-review-excellence`, `code-review-and-quality`, `ce-code-review`,
   `kwp-code-review`, `bmad-code-review`, `caveman-review`, `review`). Which one fires is a coin toss.
   Same story for TDD (×4+), SEO audit (×3), frontend design (×3), PRD writing (×5+), brainstorming (×4).
4. **Generic-name land grabs**: `plan`, `search`, `status`, `help`, `init`, `commit`, `remember`,
   `recall` … are plugin-specific (mem0 / MemPalace / PUA / BMAD) but own prime keyword real estate.
   Recommended fix is a rename to a prefixed form (e.g. `mempalace-help`), or at minimum a first
   sentence that scopes the skill to its plugin ("Only for MemPalace: …").
5. **A security note, outside verdict scope**: `pro` (PUA leaderboard) instructs posting the user's
   email/phone to `https://pua-skill.pages.dev`. Worth a deliberate decision, not an accidental keep.

## Fixes applied in this pass

- Rewrote the 3 worst descriptions: `django-access-review` (repaired doubled frontmatter),
  `mobile-design` (tagline → trigger conditions), `prd-coach` (added missing frontmatter).
- Rewrote the worst body: `implement` (6 vague lines → explicit workflow with edge cases).

---

## Full verdict table

| Skill | Verdict | Reason |
| --- | --- | --- |
| `agent-only-skill` | delete | test fixture (22-byte body) |
| `claude-only-skill` | delete | test fixture (23-byte body) |
| `custom-skill` | delete | empty fixture (12-byte body, no description) |
| `default-skill` | delete | empty fixture (13-byte body, no description) |
| `deprecated-shim` | delete | fixture: forwards to non-existent `bmad-foo` |
| `disabled-skill` | delete | test fixture for disable-model-invocation |
| `example-command` | delete | example scaffold from plugin-dev tooling |
| `example-skill` | delete | example scaffold from skill-dev tooling |
| `mem0-mem0-context-loader` | delete | duplicate of `mem0-context-loader` (same skill, doubled plugin prefix) |
| `mem0-mem0-dream` | delete | duplicate of `mem0-dream` (same skill, doubled plugin prefix) |
| `mem0-mem0-forget` | delete | duplicate of `mem0-forget` (same skill, doubled plugin prefix) |
| `mem0-mem0-pin` | delete | duplicate of `mem0-pin` (same skill, doubled plugin prefix) |
| `mem0-mem0-remember` | delete | duplicate of `mem0-remember` (same skill, doubled plugin prefix) |
| `mem0-mem0-tour` | delete | duplicate of `mem0-tour` (same skill, doubled plugin prefix) |
| `mempalace-mempalace-recall` | delete | duplicate of `mempalace-recall` (same skill, doubled plugin prefix) |
| `missing-trigger` | delete | lint-test fixture (deliberately bad description) |
| `output-skill` | delete | test fixture |
| `ponytail-ponytail-audit` | delete | duplicate of `ponytail-audit` (identical body) |
| `ponytail-ponytail-debt` | delete | duplicate of `ponytail-debt` (identical body) |
| `ponytail-ponytail-gain` | delete | duplicate of `ponytail-gain` (identical body) |
| `ponytail-ponytail-help` | delete | duplicate of `ponytail-help` (identical body) |
| `ponytail-ponytail-review` | delete | duplicate of `ponytail-review` (identical body) |
| `pua-pua-en` | delete | duplicate of `pua-en` (same skill, doubled plugin prefix) |
| `pua-pua-ja` | delete | duplicate of `pua-ja` (identical body) |
| `pua-pua-loop` | delete | duplicate of `pua-loop` (same skill, doubled plugin prefix) |
| `skill-one` | delete | sample fixture ('Sample skill', 11-byte body) |
| `with-trigger` | delete | lint-test fixture (guards SKILL-06 rule) |
| `xlsx-official` | delete | mangled import of Anthropic xlsx skill (description is a stray body fragment, sections truncated); intact `xlsx` exists |
| `0-autoresearch-skill` | merge | autoresearch pair: fold into `autoresearch` |
| `antigravity-canvas-design` | merge | vendored variant of `canvas-design` — keep one, fold unique content in |
| `antigravity-frontend-design` | merge | vendored variant of `frontend-design` — keep one, fold unique content in |
| `antigravity-mcp-builder` | merge | vendored variant of `mcp-builder` — keep one, fold unique content in |
| `antigravity-pricing-strategy` | merge | vendored variant of `pricing-strategy` — keep one, fold unique content in |
| `antigravity-receiving-code-review` | merge | vendored variant of `receiving-code-review` — keep one, fold unique content in |
| `antigravity-requesting-code-review` | merge | vendored variant of `requesting-code-review` — keep one, fold unique content in |
| `antigravity-seo-audit` | merge | vendored variant of `seo-audit` — keep one, fold unique content in |
| `antigravity-sql-pro` | merge | vendored variant of `sql-pro` — keep one, fold unique content in |
| `antigravity-systematic-debugging` | merge | vendored variant of `systematic-debugging` — keep one, fold unique content in |
| `antigravity-test-driven-development` | merge | vendored variant of `test-driven-development` — keep one, fold unique content in |
| `antigravity-ui-ux-pro-max` | merge | vendored variant of `ui-ux-pro-max` — keep one, fold unique content in |
| `antigravity-webapp-testing` | merge | vendored variant of `webapp-testing` — keep one, fold unique content in |
| `bmad-code-review` | merge | code-review consolidation: fold into `code-review` |
| `brainstorm-ideas-existing` | merge | brainstorming consolidation: fold into `brainstorming` |
| `brainstorm-ideas-new` | merge | brainstorming consolidation: fold into `brainstorming` |
| `caveman-review` | merge | code-review consolidation: fold into `code-review` |
| `ce-code-review` | merge | code-review consolidation: fold into `code-review` |
| `claude-skills-alirezarezvani-ab-test-setup` | merge | vendored variant of `ab-test-setup` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-ad-creative` | merge | vendored variant of `ad-creative` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-analytics-tracking` | merge | vendored variant of `analytics-tracking` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-deep-research` | merge | vendored variant of `research` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-design-system` | merge | vendored variant of `design-system` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-init` | merge | vendored variant of `init` — keep one, fold unique content in |
| `claude-skills-alirezarezvani-internal-comms` | merge | vendored variant of `internal-comms` — keep one, fold unique content in |
| `claude-wireframe-skill` | merge | wireframe consolidation: fold into `wireframe-skill` |
| `code-review-and-quality` | merge | code-review consolidation: fold into `code-review` |
| `code-review-checklist` | merge | code-review consolidation: fold into `code-review` |
| `code-review-excellence` | merge | code-review consolidation: fold into `code-review` |
| `code-reviewer` | merge | code-review consolidation: fold into `code-review` |
| `code-to-prd` | merge | PRD consolidation: fold into `prd` |
| `comprehensive-research-agent` | merge | research consolidation: fold into `research` |
| `create-prd` | merge | PRD consolidation: fold into `prd` |
| `docx-official` | merge | older copy of Anthropic docx skill — fold into `docx` |
| `kwp-code-review` | merge | code-review consolidation: fold into `code-review` |
| `marketingskills-seo-audit` | merge | vendored variant of `seo-audit` — keep one, fold unique content in |
| `mattpocock-code-review` | merge | vendored variant of `code-review` — keep one, fold unique content in |
| `mattpocock-handoff` | merge | vendored variant of `handoff` — keep one, fold unique content in |
| `mattpocock-tdd` | merge | vendored variant of `tdd` — keep one, fold unique content in |
| `obsidian-skills-defuddle` | merge | vendored variant of `defuddle` — keep one, fold unique content in |
| `obsidian-skills-obsidian-bases` | merge | vendored variant of `obsidian-bases` — keep one, fold unique content in |
| `obsidian-skills-obsidian-markdown` | merge | vendored variant of `obsidian-markdown` — keep one, fold unique content in |
| `official-frontend-design` | merge | frontend-design consolidation: fold into `frontend-design` |
| `oh-my-claudecode-autoresearch` | merge | vendored variant of `autoresearch` — keep one, fold unique content in |
| `oh-my-claudecode-remember` | merge | vendored variant of `remember` — keep one, fold unique content in |
| `oh-my-claudecode-wiki` | merge | vendored variant of `wiki` — keep one, fold unique content in |
| `open-design-brainstorming` | merge | vendored variant of `brainstorming` — keep one, fold unique content in |
| `open-design-brandkit` | merge | vendored variant of `brandkit` — keep one, fold unique content in |
| `open-design-docx` | merge | vendored variant of `docx` — keep one, fold unique content in |
| `open-design-gif-sticker-maker` | merge | vendored variant of `gif-sticker-maker` — keep one, fold unique content in |
| `open-design-gsap-frameworks` | merge | vendored variant of `gsap-frameworks` — keep one, fold unique content in |
| `open-design-gsap-react` | merge | vendored variant of `gsap-react` — keep one, fold unique content in |
| `open-design-gsap-utils` | merge | vendored variant of `gsap-utils` — keep one, fold unique content in |
| `open-design-minimax-docx` | merge | vendored variant of `minimax-docx` — keep one, fold unique content in |
| `open-design-pdf` | merge | vendored variant of `pdf` — keep one, fold unique content in |
| `open-design-pptx` | merge | vendored variant of `pptx` — keep one, fold unique content in |
| `open-design-shader-dev` | merge | vendored variant of `shader-dev` — keep one, fold unique content in |
| `open-design-soft-skill` | merge | vendored variant of `soft-skill` — keep one, fold unique content in |
| `open-design-taste-skill-v1` | merge | vendored variant of `taste-skill-v1` — keep one, fold unique content in |
| `pdf-official` | merge | older copy of Anthropic pdf skill — fold into `pdf` |
| `planning-with-files-ar` | merge | language variant — fold into `planning-with-files` (keep translations as references/ inside one skill) |
| `planning-with-files-de` | merge | language variant — fold into `planning-with-files` (keep translations as references/ inside one skill) |
| `planning-with-files-es` | merge | language variant — fold into `planning-with-files` (keep translations as references/ inside one skill) |
| `planning-with-files-zh` | merge | language variant — fold into `planning-with-files` (keep translations as references/ inside one skill) |
| `planning-with-files-zht` | merge | language variant — fold into `planning-with-files` (keep translations as references/ inside one skill) |
| `pm-skills-marketing-ideas` | merge | vendored variant of `marketing-ideas` — keep one, fold unique content in |
| `pptx-official` | merge | older copy of Anthropic pptx skill — fold into `pptx` |
| `product-brainstorming` | merge | brainstorming consolidation: fold into `brainstorming` |
| `ruflo-deep-research` | merge | research consolidation: fold into `research` |
| `security-reviewer` | merge | security review consolidation: fold into `security-auditor` |
| `skills-slavingia-marketing-plan` | merge | vendored variant of `marketing-plan` — keep one, fold unique content in |
| `skills-slavingia-pricing` | merge | vendored variant of `pricing` — keep one, fold unique content in |
| `superpowers-test-driven-development` | merge | TDD consolidation: fold into `test-driven-development` |
| `taste-skill-v1` | merge | taste-skill versions: fold into `taste-skill` |
| `tdd` | merge | TDD consolidation: fold into `test-driven-development` |
| `to-prd` | merge | PRD consolidation: fold into `prd` |
| `wshobson-api-design-principles` | merge | vendored variant of `api-design-principles` — keep one, fold unique content in |
| `wshobson-architecture-decision-records` | merge | vendored variant of `architecture-decision-records` — keep one, fold unique content in |
| `wshobson-auth-implementation-patterns` | merge | vendored variant of `auth-implementation-patterns` — keep one, fold unique content in |
| `wshobson-changelog-automation` | merge | vendored variant of `changelog-automation` — keep one, fold unique content in |
| `wshobson-dbt-transformation-patterns` | merge | vendored variant of `dbt-transformation-patterns` — keep one, fold unique content in |
| `wshobson-e2e-testing-patterns` | merge | vendored variant of `e2e-testing-patterns` — keep one, fold unique content in |
| `wshobson-github-actions-templates` | merge | vendored variant of `github-actions-templates` — keep one, fold unique content in |
| `wshobson-kpi-dashboard-design` | merge | vendored variant of `kpi-dashboard-design` — keep one, fold unique content in |
| `wshobson-nextjs-app-router-patterns` | merge | vendored variant of `nextjs-app-router-patterns` — keep one, fold unique content in |
| `wshobson-openapi-spec-generation` | merge | vendored variant of `openapi-spec-generation` — keep one, fold unique content in |
| `wshobson-screen-reader-testing` | merge | vendored variant of `screen-reader-testing` — keep one, fold unique content in |
| `ask` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `autopilot` | rewrite | thin description (51 chars), no trigger conditions |
| `brainstorming-coach` | rewrite | no frontmatter — never model-triggers |
| `brief` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `cancel` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `canvas` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `capture` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `card-twitter` | rewrite | thin description (56 chars), no trigger conditions |
| `claude-api` | rewrite | description exceeds 1024-char limit — gets truncated at load |
| `commit` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `coverage` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `cron-schedule` | rewrite | thin description (53 chars), no trigger conditions |
| `debug` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `design` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `digest` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `disable` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `django-access-review` | rewrite | WAS BROKEN: doubled frontmatter, active description was the folder name — repaired in this pass (real trigger description restored) |
| `do` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `dream` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `eval` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `evaluation` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `export` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `federation-audit` | rewrite | thin description (53 chars), no trigger conditions |
| `forget` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `handoff` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `health` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `help` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `image` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `implement` | rewrite | worst body of the collection: 6 vague lines (unagreed seams, no missing-spec/failing-baseline path, committed to whatever branch was checked out) — rewritten in this pass |
| `import` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `init` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `iot-witness-verify` | rewrite | thin description (57 chars), no trigger conditions |
| `launch` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `learner` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix; description too thin |
| `litreview` | rewrite | description exceeds 1024-char limit — gets truncated at load |
| `login-flow` | rewrite | thin description (44 chars), no trigger conditions |
| `mama` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix; description too thin |
| `market-and-industry-research` | rewrite | no frontmatter — never model-triggers |
| `mem0-oss-to-platform` | rewrite | description exceeds 1024-char limit — gets truncated at load |
| `mine` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `mobile-design` | rewrite | description was a tagline with zero trigger information — rewritten in this pass |
| `omc-doctor` | rewrite | thin description (53 chars), no trigger conditions |
| `onboard` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `onboarding` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `peek` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `pin` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `plan` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix; description too thin |
| `prd-coach` | rewrite | had no frontmatter, could never model-trigger — frontmatter + trigger description added in this pass |
| `prfaq-coach` | rewrite | no frontmatter — never model-triggers |
| `pro` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `product-brief-coach` | rewrite | no frontmatter — never model-triggers |
| `recall` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `release` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `remember` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `remotion-official` | rewrite | description names the topic but no trigger conditions; collides with `remotion` |
| `save` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `schema` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `search` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `setup` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `skill` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `start` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `stats` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `status` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `team` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `template` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `think` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `tour` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `trace` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `update` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `ux-coach` | rewrite | no frontmatter — never model-triggers |
| `verify` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `video` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `yes` | rewrite | generic name in flat namespace — will over/mis-trigger; rename with plugin prefix |
| `3-statement-model` | keep | unique scope, description carries trigger conditions |
| `3d-web-experience` | keep | unique scope, description carries trigger conditions |
| `8-bit-orbit-video-template` | keep | unique scope, description carries trigger conditions |
| `a-evolve` | keep | unique scope, description carries trigger conditions |
| `a11y-audit` | keep | unique scope, description carries trigger conditions |
| `ab-test-analysis` | keep | unique scope, description carries trigger conditions |
| `ab-test-setup` | keep | unique scope, description carries trigger conditions |
| `ab-testing` | keep | unique scope, description carries trigger conditions |
| `abusing-dpapi-for-credential-access` | keep | unique scope, description carries trigger conditions |
| `academic-language-sentence-frame-generator` | keep | unique scope, description carries trigger conditions |
| `accelerate` | keep | unique scope, description carries trigger conditions |
| `accessibility` | keep | unique scope, description carries trigger conditions |
| `accessibility-review` | keep | unique scope, description carries trigger conditions |
| `accesslint-audit` | keep | unique scope, description carries trigger conditions |
| `accesslint-diff` | keep | unique scope, description carries trigger conditions |
| `accesslint-scan` | keep | unique scope, description carries trigger conditions |
| `account-research` | keep | unique scope, description carries trigger conditions |
| `acestep` | keep | unique scope, description carries trigger conditions |
| `ad-creative` | keep | unique scope, description carries trigger conditions |
| `adaptive-hint-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `address-github-comments` | keep | unique scope, description carries trigger conditions |
| `adr-create` | keep | unique scope, description carries trigger conditions |
| `adr-index` | keep | unique scope, description carries trigger conditions |
| `adr-review` | keep | unique scope, description carries trigger conditions |
| `adr-verify` | keep | unique scope, description carries trigger conditions |
| `ads` | keep | unique scope, description carries trigger conditions |
| `advanced-evaluation` | keep | unique scope, description carries trigger conditions |
| `aeo` | keep | unique scope, description carries trigger conditions |
| `agency-circles-for-systems-action` | keep | unique scope, description carries trigger conditions |
| `agency-scaffold-generator` | keep | unique scope, description carries trigger conditions |
| `agent-architecture-audit` | keep | unique scope, description carries trigger conditions |
| `agent-browser` | keep | unique scope, description carries trigger conditions |
| `agent-decision-receipts` | keep | unique scope, description carries trigger conditions |
| `agent-development` | keep | unique scope, description carries trigger conditions |
| `agent-eval` | keep | unique scope, description carries trigger conditions |
| `agent-evaluation` | keep | unique scope, description carries trigger conditions |
| `agent-harness-construction` | keep | unique scope, description carries trigger conditions |
| `agent-introspection-debugging` | keep | unique scope, description carries trigger conditions |
| `agent-payment-x402` | keep | unique scope, description carries trigger conditions |
| `agent-self-evaluation` | keep | unique scope, description carries trigger conditions |
| `agent-sort` | keep | unique scope, description carries trigger conditions |
| `agentdb-query` | keep | unique scope, description carries trigger conditions |
| `agenthub` | keep | unique scope, description carries trigger conditions |
| `agentic-engineering` | keep | unique scope, description carries trigger conditions |
| `agentic-os` | keep | unique scope, description carries trigger conditions |
| `agentmemory-agents` | keep | unique scope, description carries trigger conditions |
| `agentmemory-architecture` | keep | unique scope, description carries trigger conditions |
| `agentmemory-config` | keep | unique scope, description carries trigger conditions |
| `agentmemory-hooks` | keep | unique scope, description carries trigger conditions |
| `agentmemory-mcp-tools` | keep | unique scope, description carries trigger conditions |
| `agentmemory-rest-api` | keep | unique scope, description carries trigger conditions |
| `agents-md` | keep | unique scope, description carries trigger conditions |
| `agile-product-owner` | keep | unique scope, description carries trigger conditions |
| `ai-act-readiness` | keep | unique scope, description carries trigger conditions |
| `ai-agents-architect` | keep | unique scope, description carries trigger conditions |
| `ai-claim-checker` | keep | unique scope, description carries trigger conditions |
| `ai-expertise-interrogation-designer` | keep | unique scope, description carries trigger conditions |
| `ai-facilitated-collaborative-learning-designer` | keep | unique scope, description carries trigger conditions |
| `ai-feedback-design-principles` | keep | unique scope, description carries trigger conditions |
| `ai-first-engineering` | keep | unique scope, description carries trigger conditions |
| `ai-hallucination-fact-check-protocol` | keep | unique scope, description carries trigger conditions |
| `ai-inventory` | keep | unique scope, description carries trigger conditions |
| `ai-learning-boundary-mapper` | keep | unique scope, description carries trigger conditions |
| `ai-media-generator` | keep | unique scope, description carries trigger conditions |
| `ai-output-critical-audit-designer` | keep | unique scope, description carries trigger conditions |
| `ai-regression-testing` | keep | unique scope, description carries trigger conditions |
| `ai-seo` | keep | unique scope, description carries trigger conditions |
| `ai-slop-cleaner` | keep | unique scope, description carries trigger conditions |
| `ai-socratic-dialogue-designer` | keep | unique scope, description carries trigger conditions |
| `ai-tool-handoff` | keep | unique scope, description carries trigger conditions |
| `ai-wrapper-product` | keep | unique scope, description carries trigger conditions |
| `aia-generation` | keep | unique scope, description carries trigger conditions |
| `aims-audit` | keep | unique scope, description carries trigger conditions |
| `airflow-dag-patterns` | keep | unique scope, description carries trigger conditions |
| `algorithmic-art` | keep | unique scope, description carries trigger conditions |
| `amendment-history` | keep | unique scope, description carries trigger conditions |
| `analytics` | keep | unique scope, description carries trigger conditions |
| `analytics-product` | keep | unique scope, description carries trigger conditions |
| `analytics-tracking` | keep | unique scope, description carries trigger conditions |
| `analyze-feature-requests` | keep | unique scope, description carries trigger conditions |
| `analyzing-cloud-storage-access-patterns` | keep | unique scope, description carries trigger conditions |
| `analyzing-ios-app-security-with-objection` | keep | unique scope, description carries trigger conditions |
| `analyzing-malware-sandbox-evasion-techniques` | keep | unique scope, description carries trigger conditions |
| `analyzing-pdf-malware-with-pdfid` | keep | unique scope, description carries trigger conditions |
| `analyzing-threat-actor-ttps-with-mitre-attack` | keep | unique scope, description carries trigger conditions |
| `analyzing-windows-registry-for-artifacts` | keep | unique scope, description carries trigger conditions |
| `andreessen` | keep | unique scope, description carries trigger conditions |
| `android-clean-architecture` | keep | unique scope, description carries trigger conditions |
| `android-native-dev` | keep | unique scope, description carries trigger conditions |
| `angular-architect` | keep | unique scope, description carries trigger conditions |
| `angular-developer` | keep | unique scope, description carries trigger conditions |
| `angular-migration` | keep | unique scope, description carries trigger conditions |
| `ansoff-matrix` | keep | unique scope, description carries trigger conditions |
| `api-and-interface-design` | keep | unique scope, description carries trigger conditions |
| `api-connector-builder` | keep | unique scope, description carries trigger conditions |
| `api-design` | keep | unique scope, description carries trigger conditions |
| `api-design-principles` | keep | unique scope, description carries trigger conditions |
| `api-designer` | keep | unique scope, description carries trigger conditions |
| `api-docs` | keep | unique scope, description carries trigger conditions |
| `api-documentation` | keep | unique scope, description carries trigger conditions |
| `api-endpoint-builder` | keep | unique scope, description carries trigger conditions |
| `api-patterns` | keep | unique scope, description carries trigger conditions |
| `api-security-best-practices` | keep | unique scope, description carries trigger conditions |
| `api-security-testing` | keep | unique scope, description carries trigger conditions |
| `apple-hig` | keep | unique scope, description carries trigger conditions |
| `apple-hig-expert` | keep | unique scope, description carries trigger conditions |
| `arcads-external-api` | keep | unique scope, description carries trigger conditions |
| `architecture` | keep | unique scope, description carries trigger conditions |
| `architecture-decision-records` | keep | unique scope, description carries trigger conditions |
| `architecture-designer` | keep | unique scope, description carries trigger conditions |
| `architecture-patterns` | keep | unique scope, description carries trigger conditions |
| `argument-structure-scaffold-generator` | keep | unique scope, description carries trigger conditions |
| `arquiteto-de-empresa` | keep | unique scope, description carries trigger conditions |
| `article-writing` | keep | unique scope, description carries trigger conditions |
| `ask-matt` | keep | unique scope, description carries trigger conditions |
| `aso` | keep | unique scope, description carries trigger conditions |
| `aspirational-systems-iceberg` | keep | unique scope, description carries trigger conditions |
| `assessment-design-orchestrator` | keep | unique scope, description carries trigger conditions |
| `assessment-validity-checker` | keep | unique scope, description carries trigger conditions |
| `atlassian-admin` | keep | unique scope, description carries trigger conditions |
| `atlassian-mcp` | keep | unique scope, description carries trigger conditions |
| `atlassian-templates` | keep | unique scope, description carries trigger conditions |
| `audit-support` | keep | unique scope, description carries trigger conditions |
| `audit-xls` | keep | unique scope, description carries trigger conditions |
| `auditing-mcp-servers-for-tool-poisoning` | keep | unique scope, description carries trigger conditions |
| `auth-implementation-patterns` | keep | unique scope, description carries trigger conditions |
| `auto-updater` | keep | unique scope, description carries trigger conditions |
| `autogpt` | keep | unique scope, description carries trigger conditions |
| `automation-audit-ops` | keep | unique scope, description carries trigger conditions |
| `autonomous-agent-harness` | keep | unique scope, description carries trigger conditions |
| `autonomous-loops` | keep | unique scope, description carries trigger conditions |
| `autopilot-loop` | keep | unique scope, description carries trigger conditions |
| `autopilot-predict` | keep | unique scope, description carries trigger conditions |
| `autoresearch` | keep | primary of autoresearch pair — absorb the others |
| `awe-wonder-experience-designer` | keep | unique scope, description carries trigger conditions |
| `awq` | keep | unique scope, description carries trigger conditions |
| `aws-serverless` | keep | unique scope, description carries trigger conditions |
| `axolotl` | keep | unique scope, description carries trigger conditions |
| `babysit` | keep | unique scope, description carries trigger conditions |
| `backend-architect` | keep | unique scope, description carries trigger conditions |
| `backend-patterns` | keep | unique scope, description carries trigger conditions |
| `backend-security-coder` | keep | unique scope, description carries trigger conditions |
| `backwards-design-unit-planner` | keep | unique scope, description carries trigger conditions |
| `banner-design` | keep | unique scope, description carries trigger conditions |
| `baoyu-article-illustrator` | keep | unique scope, description carries trigger conditions |
| `baoyu-comic` | keep | unique scope, description carries trigger conditions |
| `baoyu-compress-image` | keep | unique scope, description carries trigger conditions |
| `baoyu-cover-image` | keep | unique scope, description carries trigger conditions |
| `baoyu-danger-gemini-web` | keep | unique scope, description carries trigger conditions |
| `baoyu-danger-x-to-markdown` | keep | unique scope, description carries trigger conditions |
| `baoyu-design` | keep | unique scope, description carries trigger conditions |
| `baoyu-diagram` | keep | unique scope, description carries trigger conditions |
| `baoyu-electron-extract` | keep | unique scope, description carries trigger conditions |
| `baoyu-format-markdown` | keep | unique scope, description carries trigger conditions |
| `baoyu-image-gen` | keep | unique scope, description carries trigger conditions |
| `baoyu-infographic` | keep | unique scope, description carries trigger conditions |
| `baoyu-markdown-to-html` | keep | unique scope, description carries trigger conditions |
| `baoyu-post-to-wechat` | keep | unique scope, description carries trigger conditions |
| `baoyu-post-to-weibo` | keep | unique scope, description carries trigger conditions |
| `baoyu-post-to-x` | keep | unique scope, description carries trigger conditions |
| `baoyu-slide-deck` | keep | unique scope, description carries trigger conditions |
| `baoyu-translate` | keep | unique scope, description carries trigger conditions |
| `baoyu-url-to-markdown` | keep | unique scope, description carries trigger conditions |
| `baoyu-wechat-summary` | keep | unique scope, description carries trigger conditions |
| `baoyu-xhs-images` | keep | unique scope, description carries trigger conditions |
| `baoyu-youtube-transcript` | keep | unique scope, description carries trigger conditions |
| `bar-prep-questions` | keep | unique scope, description carries trigger conditions |
| `bash-linux` | keep | unique scope, description carries trigger conditions |
| `bazel-build-optimization` | keep | unique scope, description carries trigger conditions |
| `bdi-mental-states` | keep | unique scope, description carries trigger conditions |
| `beachhead-segment` | keep | unique scope, description carries trigger conditions |
| `beads` | keep | unique scope, description carries trigger conditions |
| `beautiful-article` | keep | unique scope, description carries trigger conditions |
| `before-you-build` | keep | unique scope, description carries trigger conditions |
| `belonging-classroom-culture-designer` | keep | unique scope, description carries trigger conditions |
| `benchmark` | keep | unique scope, description carries trigger conditions |
| `benchmark-methodology` | keep | unique scope, description carries trigger conditions |
| `benchmark-optimization-loop` | keep | unique scope, description carries trigger conditions |
| `bigcode-evaluation-harness` | keep | unique scope, description carries trigger conditions |
| `biophilic-learning-environment-designer` | keep | unique scope, description carries trigger conditions |
| `bitsandbytes` | keep | unique scope, description carries trigger conditions |
| `blender-motion-state-inspection` | keep | unique scope, description carries trigger conditions |
| `block-no-verify-hook` | keep | unique scope, description carries trigger conditions |
| `blueprint` | keep | unique scope, description carries trigger conditions |
| `bmad-advanced-elicitation` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-analyst` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-architect` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-dev` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-pm` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-tech-writer` | keep | unique scope, description carries trigger conditions |
| `bmad-agent-ux-designer` | keep | unique scope, description carries trigger conditions |
| `bmad-architecture` | keep | unique scope, description carries trigger conditions |
| `bmad-brainstorming` | keep | unique scope, description carries trigger conditions |
| `bmad-check-implementation-readiness` | keep | unique scope, description carries trigger conditions |
| `bmad-checkpoint-preview` | keep | unique scope, description carries trigger conditions |
| `bmad-correct-course` | keep | unique scope, description carries trigger conditions |
| `bmad-create-architecture` | keep | unique scope, description carries trigger conditions |
| `bmad-create-epics-and-stories` | keep | unique scope, description carries trigger conditions |
| `bmad-create-prd` | keep | unique scope, description carries trigger conditions |
| `bmad-create-story` | keep | unique scope, description carries trigger conditions |
| `bmad-customize` | keep | unique scope, description carries trigger conditions |
| `bmad-dev-auto` | keep | unique scope, description carries trigger conditions |
| `bmad-dev-story` | keep | unique scope, description carries trigger conditions |
| `bmad-document-project` | keep | unique scope, description carries trigger conditions |
| `bmad-domain-research` | keep | unique scope, description carries trigger conditions |
| `bmad-edit-prd` | keep | unique scope, description carries trigger conditions |
| `bmad-editorial-review-prose` | keep | unique scope, description carries trigger conditions |
| `bmad-editorial-review-structure` | keep | unique scope, description carries trigger conditions |
| `bmad-forge-idea` | keep | unique scope, description carries trigger conditions |
| `bmad-generate-project-context` | keep | unique scope, description carries trigger conditions |
| `bmad-help` | keep | unique scope, description carries trigger conditions |
| `bmad-index-docs` | keep | unique scope, description carries trigger conditions |
| `bmad-market-research` | keep | unique scope, description carries trigger conditions |
| `bmad-party-mode` | keep | unique scope, description carries trigger conditions |
| `bmad-prd` | keep | unique scope, description carries trigger conditions |
| `bmad-prfaq` | keep | unique scope, description carries trigger conditions |
| `bmad-product-brief` | keep | unique scope, description carries trigger conditions |
| `bmad-qa-generate-e2e-tests` | keep | unique scope, description carries trigger conditions |
| `bmad-quick-dev` | keep | unique scope, description carries trigger conditions |
| `bmad-retrospective` | keep | unique scope, description carries trigger conditions |
| `bmad-review-adversarial-general` | keep | unique scope, description carries trigger conditions |
| `bmad-review-edge-case-hunter` | keep | unique scope, description carries trigger conditions |
| `bmad-review-verification-gap` | keep | unique scope, description carries trigger conditions |
| `bmad-shard-doc` | keep | unique scope, description carries trigger conditions |
| `bmad-spec` | keep | unique scope, description carries trigger conditions |
| `bmad-sprint-planning` | keep | unique scope, description carries trigger conditions |
| `bmad-sprint-status` | keep | unique scope, description carries trigger conditions |
| `bmad-technical-research` | keep | unique scope, description carries trigger conditions |
| `bmad-ux` | keep | unique scope, description carries trigger conditions |
| `bmad-validate-prd` | keep | unique scope, description carries trigger conditions |
| `board` | keep | unique scope, description carries trigger conditions |
| `board-minutes` | keep | unique scope, description carries trigger conditions |
| `boardroom` | keep | unique scope, description carries trigger conditions |
| `bond-futures-basis` | keep | unique scope, description carries trigger conditions |
| `bond-relative-value` | keep | unique scope, description carries trigger conditions |
| `book-sft-pipeline` | keep | unique scope, description carries trigger conditions |
| `brainstorm-experiments-existing` | keep | unique scope, description carries trigger conditions |
| `brainstorm-experiments-new` | keep | unique scope, description carries trigger conditions |
| `brainstorm-okrs` | keep | unique scope, description carries trigger conditions |
| `brainstorming` | keep | primary of brainstorming consolidation — absorb the others |
| `brand` | keep | unique scope, description carries trigger conditions |
| `brand-discovery` | keep | unique scope, description carries trigger conditions |
| `brand-guidelines` | keep | unique scope, description carries trigger conditions |
| `brand-landingpage` | keep | unique scope, description carries trigger conditions |
| `brand-review` | keep | unique scope, description carries trigger conditions |
| `brand-voice` | keep | unique scope, description carries trigger conditions |
| `brand-voice-enforcement` | keep | unique scope, description carries trigger conditions |
| `brandkit` | keep | unique scope, description carries trigger conditions |
| `break-trace` | keep | unique scope, description carries trigger conditions |
| `brief-section-drafter` | keep | unique scope, description carries trigger conditions |
| `broken-authentication` | keep | unique scope, description carries trigger conditions |
| `browser-auth-flow` | keep | unique scope, description carries trigger conditions |
| `browser-automation` | keep | unique scope, description carries trigger conditions |
| `browser-extract` | keep | unique scope, description carries trigger conditions |
| `browser-form-fill` | keep | unique scope, description carries trigger conditions |
| `browser-intent` | keep | unique scope, description carries trigger conditions |
| `browser-login` | keep | unique scope, description carries trigger conditions |
| `browser-qa` | keep | unique scope, description carries trigger conditions |
| `browser-testing-with-devtools` | keep | unique scope, description carries trigger conditions |
| `browserstack` | keep | unique scope, description carries trigger conditions |
| `brutalist-skill` | keep | unique scope, description carries trigger conditions |
| `buddy-sings` | keep | unique scope, description carries trigger conditions |
| `build-guide` | keep | unique scope, description carries trigger conditions |
| `build-mcp-app` | keep | unique scope, description carries trigger conditions |
| `build-mcp-server` | keep | unique scope, description carries trigger conditions |
| `build-mcpb` | keep | unique scope, description carries trigger conditions |
| `building-detection-rules-with-sigma` | keep | unique scope, description carries trigger conditions |
| `building-red-team-c2-infrastructure-with-havoc` | keep | unique scope, description carries trigger conditions |
| `building-vulnerability-dashboard-with-defectdojo` | keep | unique scope, description carries trigger conditions |
| `bun-runtime` | keep | unique scope, description carries trigger conditions |
| `burp-suite-testing` | keep | unique scope, description carries trigger conditions |
| `business-analyst` | keep | unique scope, description carries trigger conditions |
| `business-growth-skills` | keep | unique scope, description carries trigger conditions |
| `business-investment-advisor` | keep | unique scope, description carries trigger conditions |
| `business-model` | keep | unique scope, description carries trigger conditions |
| `business-operations-skills` | keep | unique scope, description carries trigger conditions |
| `business-pulse` | keep | unique scope, description carries trigger conditions |
| `c-level-agents` | keep | unique scope, description carries trigger conditions |
| `call-prep` | keep | unique scope, description carries trigger conditions |
| `call-summary` | keep | unique scope, description carries trigger conditions |
| `campaign-plan` | keep | unique scope, description carries trigger conditions |
| `canary-watch` | keep | unique scope, description carries trigger conditions |
| `canvas-design` | keep | unique scope, description carries trigger conditions |
| `capa-officer` | keep | unique scope, description carries trigger conditions |
| `capacity-plan` | keep | unique scope, description carries trigger conditions |
| `capacity-planner` | keep | unique scope, description carries trigger conditions |
| `cardputer-buddy` | keep | unique scope, description carries trigger conditions |
| `career-ops` | keep | unique scope, description carries trigger conditions |
| `carrier-relationship-management` | keep | unique scope, description carries trigger conditions |
| `case-brief` | keep | unique scope, description carries trigger conditions |
| `catalyst-calendar` | keep | unique scope, description carries trigger conditions |
| `catchup` | keep | unique scope, description carries trigger conditions |
| `cavecrew` | keep | unique scope, description carries trigger conditions |
| `caveman` | keep | unique scope, description carries trigger conditions |
| `caveman-commit` | keep | unique scope, description carries trigger conditions |
| `caveman-compress` | keep | unique scope, description carries trigger conditions |
| `caveman-help` | keep | unique scope, description carries trigger conditions |
| `caveman-stats` | keep | unique scope, description carries trigger conditions |
| `cc-skill-security-review` | keep | unique scope, description carries trigger conditions |
| `ccg` | keep | unique scope, description carries trigger conditions |
| `ce-brainstorm` | keep | unique scope, description carries trigger conditions |
| `ce-commit` | keep | unique scope, description carries trigger conditions |
| `ce-commit-push-pr` | keep | unique scope, description carries trigger conditions |
| `ce-compound` | keep | unique scope, description carries trigger conditions |
| `ce-compound-refresh` | keep | unique scope, description carries trigger conditions |
| `ce-debug` | keep | unique scope, description carries trigger conditions |
| `ce-doc-review` | keep | unique scope, description carries trigger conditions |
| `ce-dogfood` | keep | unique scope, description carries trigger conditions |
| `ce-explain` | keep | unique scope, description carries trigger conditions |
| `ce-ideate` | keep | unique scope, description carries trigger conditions |
| `ce-optimize` | keep | unique scope, description carries trigger conditions |
| `ce-plan` | keep | unique scope, description carries trigger conditions |
| `ce-polish` | keep | unique scope, description carries trigger conditions |
| `ce-pov` | keep | unique scope, description carries trigger conditions |
| `ce-product-pulse` | keep | unique scope, description carries trigger conditions |
| `ce-promote` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `ce-proof` | keep | unique scope, description carries trigger conditions |
| `ce-resolve-pr-feedback` | keep | unique scope, description carries trigger conditions |
| `ce-riffrec-feedback-analysis` | keep | unique scope, description carries trigger conditions |
| `ce-setup` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `ce-simplify-code` | keep | unique scope, description carries trigger conditions |
| `ce-strategy` | keep | unique scope, description carries trigger conditions |
| `ce-sweep` | keep | unique scope, description carries trigger conditions |
| `ce-test-browser` | keep | unique scope, description carries trigger conditions |
| `ce-test-xcode` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `ce-work` | keep | unique scope, description carries trigger conditions |
| `ce-worktree` | keep | unique scope, description carries trigger conditions |
| `cease-desist` | keep | unique scope, description carries trigger conditions |
| `central-historical-question-evaluator` | keep | unique scope, description carries trigger conditions |
| `change-request` | keep | unique scope, description carries trigger conditions |
| `changelog-automation` | keep | unique scope, description carries trigger conditions |
| `channel-economics` | keep | unique scope, description carries trigger conditions |
| `chaos-engineer` | keep | unique scope, description carries trigger conditions |
| `checking-for-understanding-protocol-designer` | keep | unique scope, description carries trigger conditions |
| `chronology` | keep | unique scope, description carries trigger conditions |
| `churn-prevention` | keep | unique scope, description carries trigger conditions |
| `ci-cd-and-automation` | keep | unique scope, description carries trigger conditions |
| `cisco-ios-patterns` | keep | unique scope, description carries trigger conditions |
| `ck` | keep | unique scope, description carries trigger conditions |
| `claim-chart` | keep | unique scope, description carries trigger conditions |
| `claude-automation-recommender` | keep | unique scope, description carries trigger conditions |
| `claude-d3js-skill` | keep | unique scope, description carries trigger conditions |
| `claude-devfleet` | keep | unique scope, description carries trigger conditions |
| `claude-md` | keep | unique scope, description carries trigger conditions |
| `claude-md-improver` | keep | unique scope, description carries trigger conditions |
| `clean-data-xls` | keep | unique scope, description carries trigger conditions |
| `clearance` | keep | unique scope, description carries trigger conditions |
| `cli-developer` | keep | unique scope, description carries trigger conditions |
| `click-path-audit` | keep | unique scope, description carries trigger conditions |
| `clickhouse-io` | keep | unique scope, description carries trigger conditions |
| `client-comms-log` | keep | unique scope, description carries trigger conditions |
| `client-intake` | keep | unique scope, description carries trigger conditions |
| `client-letter` | keep | unique scope, description carries trigger conditions |
| `client-report` | keep | unique scope, description carries trigger conditions |
| `client-review` | keep | unique scope, description carries trigger conditions |
| `clinical-research` | keep | unique scope, description carries trigger conditions |
| `close-management` | keep | unique scope, description carries trigger conditions |
| `close-reading-skill-builder` | keep | unique scope, description carries trigger conditions |
| `closing-checklist` | keep | unique scope, description carries trigger conditions |
| `cloud-architect` | keep | unique scope, description carries trigger conditions |
| `cloud-penetration-testing` | keep | unique scope, description carries trigger conditions |
| `co-marketing` | keep | unique scope, description carries trigger conditions |
| `code-documenter` | keep | unique scope, description carries trigger conditions |
| `code-review` | keep | primary of code-review consolidation — absorb the others |
| `code-simplification` | keep | unique scope, description carries trigger conditions |
| `code-tour` | keep | unique scope, description carries trigger conditions |
| `codebase-design` | keep | unique scope, description carries trigger conditions |
| `codebase-onboarding` | keep | unique scope, description carries trigger conditions |
| `codehealth-mcp` | keep | unique scope, description carries trigger conditions |
| `codex-cli-runtime` | keep | unique scope, description carries trigger conditions |
| `codex-result-handling` | keep | unique scope, description carries trigger conditions |
| `coding-standards` | keep | unique scope, description carries trigger conditions |
| `cognitive-load-analyser` | keep | unique scope, description carries trigger conditions |
| `cognitive-pattern` | keep | unique scope, description carries trigger conditions |
| `cognitive-tutoring-architecture-designer` | keep | unique scope, description carries trigger conditions |
| `coherent-rubric-logic-builder` | keep | unique scope, description carries trigger conditions |
| `cohort-analysis` | keep | unique scope, description carries trigger conditions |
| `cold-call-prep` | keep | unique scope, description carries trigger conditions |
| `cold-email` | keep | unique scope, description carries trigger conditions |
| `cold-start-interview` | keep | unique scope, description carries trigger conditions |
| `color-font-skill` | keep | unique scope, description carries trigger conditions |
| `command-development` | keep | unique scope, description carries trigger conditions |
| `commercial-forecaster` | keep | unique scope, description carries trigger conditions |
| `commercial-policy` | keep | unique scope, description carries trigger conditions |
| `commercial-skills` | keep | unique scope, description carries trigger conditions |
| `commit-context` | keep | unique scope, description carries trigger conditions |
| `commit-history` | keep | unique scope, description carries trigger conditions |
| `community-marketing` | keep | unique scope, description carries trigger conditions |
| `comp-analysis` | keep | unique scope, description carries trigger conditions |
| `company-values` | keep | unique scope, description carries trigger conditions |
| `compassionate-systems-awareness-orchestrator` | keep | unique scope, description carries trigger conditions |
| `competency-framework-translator` | keep | unique scope, description carries trigger conditions |
| `competency-unpacker` | keep | unique scope, description carries trigger conditions |
| `competitive-ads-extractor` | keep | unique scope, description carries trigger conditions |
| `competitive-analysis` | keep | unique scope, description carries trigger conditions |
| `competitive-battlecard` | keep | unique scope, description carries trigger conditions |
| `competitive-brief` | keep | unique scope, description carries trigger conditions |
| `competitive-intelligence` | keep | unique scope, description carries trigger conditions |
| `competitive-platform-analysis` | keep | unique scope, description carries trigger conditions |
| `competitive-report-structure` | keep | unique scope, description carries trigger conditions |
| `competitor-analysis` | keep | unique scope, description carries trigger conditions |
| `competitor-profiling` | keep | unique scope, description carries trigger conditions |
| `competitors` | keep | unique scope, description carries trigger conditions |
| `compliance-check` | keep | unique scope, description carries trigger conditions |
| `compliance-os` | keep | unique scope, description carries trigger conditions |
| `compliance-readiness` | keep | unique scope, description carries trigger conditions |
| `compliance-tracking` | keep | unique scope, description carries trigger conditions |
| `compose-multiplatform-patterns` | keep | unique scope, description carries trigger conditions |
| `comps-analysis` | keep | unique scope, description carries trigger conditions |
| `conducting-domain-persistence-with-dcsync` | keep | unique scope, description carries trigger conditions |
| `conducting-social-engineering-penetration-test` | keep | unique scope, description carries trigger conditions |
| `confidence-calibration-check` | keep | unique scope, description carries trigger conditions |
| `config-gc` | keep | unique scope, description carries trigger conditions |
| `configure-ecc` | keep | unique scope, description carries trigger conditions |
| `configure-notifications` | keep | unique scope, description carries trigger conditions |
| `configuring-network-segmentation-with-vlans` | keep | unique scope, description carries trigger conditions |
| `confluence-expert` | keep | unique scope, description carries trigger conditions |
| `connections-optimizer` | keep | unique scope, description carries trigger conditions |
| `constitutional-ai` | keep | unique scope, description carries trigger conditions |
| `content-creation` | keep | unique scope, description carries trigger conditions |
| `content-engine` | keep | unique scope, description carries trigger conditions |
| `content-hash-cache-pattern` | keep | unique scope, description carries trigger conditions |
| `content-strategy` | keep | unique scope, description carries trigger conditions |
| `context-budget` | keep | unique scope, description carries trigger conditions |
| `context-compression` | keep | unique scope, description carries trigger conditions |
| `context-degradation` | keep | unique scope, description carries trigger conditions |
| `context-driven-development` | keep | unique scope, description carries trigger conditions |
| `context-engineering` | keep | unique scope, description carries trigger conditions |
| `context-fundamentals` | keep | unique scope, description carries trigger conditions |
| `context-loader` | keep | unique scope, description carries trigger conditions |
| `context-mode` | keep | unique scope, description carries trigger conditions |
| `context-mode-ops` | keep | unique scope, description carries trigger conditions |
| `context-optimization` | keep | unique scope, description carries trigger conditions |
| `context-window-management` | keep | unique scope, description carries trigger conditions |
| `contextualisation-skill-builder` | keep | unique scope, description carries trigger conditions |
| `continuous-agent-loop` | keep | unique scope, description carries trigger conditions |
| `continuous-learning` | keep | unique scope, description carries trigger conditions |
| `continuous-learning-v2` | keep | unique scope, description carries trigger conditions |
| `contract-and-proposal-writer` | keep | unique scope, description carries trigger conditions |
| `copy-editing` | keep | unique scope, description carries trigger conditions |
| `copywriting` | keep | unique scope, description carries trigger conditions |
| `corroboration-skill-builder` | keep | unique scope, description carries trigger conditions |
| `cost-anomaly` | keep | unique scope, description carries trigger conditions |
| `cost-aware-llm-pipeline` | keep | unique scope, description carries trigger conditions |
| `cost-benchmark` | keep | unique scope, description carries trigger conditions |
| `cost-booster-edit` | keep | unique scope, description carries trigger conditions |
| `cost-booster-route` | keep | unique scope, description carries trigger conditions |
| `cost-budget-check` | keep | unique scope, description carries trigger conditions |
| `cost-optimization` | keep | unique scope, description carries trigger conditions |
| `cost-tracking` | keep | unique scope, description carries trigger conditions |
| `council` | keep | unique scope, description carries trigger conditions |
| `coverage-audit` | keep | unique scope, description carries trigger conditions |
| `cowork-plugin-customizer` | keep | unique scope, description carries trigger conditions |
| `cpa-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `cpp-coding-standards` | keep | unique scope, description carries trigger conditions |
| `cpp-pro` | keep | unique scope, description carries trigger conditions |
| `cpp-testing` | keep | unique scope, description carries trigger conditions |
| `cqrs-implementation` | keep | unique scope, description carries trigger conditions |
| `create-agent` | keep | unique scope, description carries trigger conditions |
| `create-cowork-plugin` | keep | unique scope, description carries trigger conditions |
| `create-pr` | keep | unique scope, description carries trigger conditions |
| `crewai` | keep | unique scope, description carries trigger conditions |
| `criterion-referenced-rubric-generator` | keep | unique scope, description carries trigger conditions |
| `critical-thinking-task-designer` | keep | unique scope, description carries trigger conditions |
| `cro` | keep | unique scope, description carries trigger conditions |
| `cross-cultural-task-validity-checker` | keep | unique scope, description carries trigger conditions |
| `crosspost` | keep | unique scope, description carries trigger conditions |
| `csharp-developer` | keep | unique scope, description carries trigger conditions |
| `ctx-doctor` | keep | unique scope, description carries trigger conditions |
| `ctx-index` | keep | unique scope, description carries trigger conditions |
| `ctx-insight` | keep | unique scope, description carries trigger conditions |
| `ctx-purge` | keep | unique scope, description carries trigger conditions |
| `ctx-search` | keep | unique scope, description carries trigger conditions |
| `ctx-stats` | keep | unique scope, description carries trigger conditions |
| `ctx-upgrade` | keep | unique scope, description carries trigger conditions |
| `culturally-responsive-teaching-designer` | keep | unique scope, description carries trigger conditions |
| `curriculum-crosswalk` | keep | unique scope, description carries trigger conditions |
| `curriculum-knowledge-architecture-designer` | keep | unique scope, description carries trigger conditions |
| `customer-escalation` | keep | unique scope, description carries trigger conditions |
| `customer-journey-map` | keep | unique scope, description carries trigger conditions |
| `customer-research` | keep | unique scope, description carries trigger conditions |
| `customer-success-manager` | keep | unique scope, description carries trigger conditions |
| `customize` | keep | unique scope, description carries trigger conditions |
| `d3-visualization` | keep | unique scope, description carries trigger conditions |
| `daa-agent` | keep | unique scope, description carries trigger conditions |
| `data-quality-frameworks` | keep | unique scope, description carries trigger conditions |
| `data-storytelling` | keep | unique scope, description carries trigger conditions |
| `database-architect` | keep | unique scope, description carries trigger conditions |
| `database-migration` | keep | unique scope, description carries trigger conditions |
| `database-optimizer` | keep | unique scope, description carries trigger conditions |
| `dbt-transformation-patterns` | keep | unique scope, description carries trigger conditions |
| `dcf-model` | keep | unique scope, description carries trigger conditions |
| `ddd-aggregate` | keep | unique scope, description carries trigger conditions |
| `ddd-context` | keep | unique scope, description carries trigger conditions |
| `ddd-validate` | keep | unique scope, description carries trigger conditions |
| `debug-fix` | keep | unique scope, description carries trigger conditions |
| `debugging-and-error-recovery` | keep | unique scope, description carries trigger conditions |
| `debugging-strategies` | keep | unique scope, description carries trigger conditions |
| `debugging-wizard` | keep | unique scope, description carries trigger conditions |
| `deck-open-slide-canvas` | keep | unique scope, description carries trigger conditions |
| `deck-refresh` | keep | unique scope, description carries trigger conditions |
| `deep-dive` | keep | unique scope, description carries trigger conditions |
| `deep-interview` | keep | unique scope, description carries trigger conditions |
| `deepinit` | keep | unique scope, description carries trigger conditions |
| `deepspeed` | keep | unique scope, description carries trigger conditions |
| `defending-llms-with-guardrails` | keep | unique scope, description carries trigger conditions |
| `defi-protocol-templates` | keep | unique scope, description carries trigger conditions |
| `defuddle` | keep | unique scope, description carries trigger conditions |
| `dependency-upgrade` | keep | unique scope, description carries trigger conditions |
| `deploy-checklist` | keep | unique scope, description carries trigger conditions |
| `deploying-tailscale-for-zero-trust-vpn` | keep | unique scope, description carries trigger conditions |
| `deployment-pipeline-design` | keep | unique scope, description carries trigger conditions |
| `deployment-procedures` | keep | unique scope, description carries trigger conditions |
| `deprecation-and-migration` | keep | unique scope, description carries trigger conditions |
| `design-consultation` | keep | unique scope, description carries trigger conditions |
| `design-critique` | keep | unique scope, description carries trigger conditions |
| `design-handoff` | keep | unique scope, description carries trigger conditions |
| `design-is` | keep | unique scope, description carries trigger conditions |
| `design-style-skill` | keep | unique scope, description carries trigger conditions |
| `design-system` | keep | unique scope, description carries trigger conditions |
| `detecting-azure-lateral-movement` | keep | unique scope, description carries trigger conditions |
| `detecting-container-escape-with-falco-rules` | keep | unique scope, description carries trigger conditions |
| `detecting-entra-offensive-tools-in-graph-logs` | keep | unique scope, description carries trigger conditions |
| `detecting-lateral-movement-with-splunk` | keep | unique scope, description carries trigger conditions |
| `detecting-network-scanning-with-ids-signatures` | keep | unique scope, description carries trigger conditions |
| `detecting-rdp-brute-force-attacks` | keep | unique scope, description carries trigger conditions |
| `detecting-suspicious-powershell-execution` | keep | unique scope, description carries trigger conditions |
| `developmental-band-system-designer` | keep | unique scope, description carries trigger conditions |
| `developmental-band-translator` | keep | unique scope, description carries trigger conditions |
| `developmental-progression-synthesis` | keep | unique scope, description carries trigger conditions |
| `devops-engineer` | keep | unique scope, description carries trigger conditions |
| `devops-troubleshooter` | keep | unique scope, description carries trigger conditions |
| `diagnosing-bugs` | keep | unique scope, description carries trigger conditions |
| `dialogic-teaching-move-generator` | keep | unique scope, description carries trigger conditions |
| `diff-analyze` | keep | unique scope, description carries trigger conditions |
| `differentiation-adapter` | keep | unique scope, description carries trigger conditions |
| `digital-brain-skill` | keep | unique scope, description carries trigger conditions |
| `digital-worked-example-sequence` | keep | unique scope, description carries trigger conditions |
| `digits-fintech-swiss-template` | keep | unique scope, description carries trigger conditions |
| `dilemma-navigation-for-education-design` | keep | unique scope, description carries trigger conditions |
| `ding` | keep | unique scope, description carries trigger conditions |
| `directory-submissions` | keep | unique scope, description carries trigger conditions |
| `disciplinary-ai-literacy-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `disciplinary-writing-scaffold` | keep | unique scope, description carries trigger conditions |
| `discipline-specific-critical-thinking-task-designer` | keep | unique scope, description carries trigger conditions |
| `discover-plugins` | keep | unique scope, description carries trigger conditions |
| `discussion-protocol-selector` | keep | unique scope, description carries trigger conditions |
| `dispatching-parallel-agents` | keep | unique scope, description carries trigger conditions |
| `dispositional-knowledge-assessment-designer` | keep | unique scope, description carries trigger conditions |
| `django-expert` | keep | unique scope, description carries trigger conditions |
| `doc-coauthoring` | keep | unique scope, description carries trigger conditions |
| `doc-gen` | keep | unique scope, description carries trigger conditions |
| `docker-expert` | keep | unique scope, description carries trigger conditions |
| `document-based-lesson-designer` | keep | unique scope, description carries trigger conditions |
| `documentation-and-adrs` | keep | unique scope, description carries trigger conditions |
| `docx` | keep | unique scope, description carries trigger conditions |
| `domain-modeling` | keep | unique scope, description carries trigger conditions |
| `dossier` | keep | unique scope, description carries trigger conditions |
| `dossier-collect` | keep | unique scope, description carries trigger conditions |
| `dotnet-backend-patterns` | keep | unique scope, description carries trigger conditions |
| `dotnet-core-expert` | keep | unique scope, description carries trigger conditions |
| `doubt-driven-development` | keep | unique scope, description carries trigger conditions |
| `dpa-review` | keep | unique scope, description carries trigger conditions |
| `draft-nda` | keep | unique scope, description carries trigger conditions |
| `draft-offer` | keep | unique scope, description carries trigger conditions |
| `draft-response` | keep | unique scope, description carries trigger conditions |
| `dsar-response` | keep | unique scope, description carries trigger conditions |
| `dual-coding-designer` | keep | unique scope, description carries trigger conditions |
| `dummy-dataset` | keep | unique scope, description carries trigger conditions |
| `e2e-testing-patterns` | keep | unique scope, description carries trigger conditions |
| `earnings-analysis` | keep | unique scope, description carries trigger conditions |
| `earnings-preview` | keep | unique scope, description carries trigger conditions |
| `earnings-preview-beta` | keep | unique scope, description carries trigger conditions |
| `ecc-context-budget` | keep | unique scope, description carries trigger conditions |
| `ecological-inquiry-anchor-designer` | keep | unique scope, description carries trigger conditions |
| `edit-article` | keep | unique scope, description carries trigger conditions |
| `editorial-burgundy-principles-template` | keep | unique scope, description carries trigger conditions |
| `elaborative-interrogation-generator` | keep | unique scope, description carries trigger conditions |
| `elevenlabs` | keep | unique scope, description carries trigger conditions |
| `email-sequence` | keep | unique scope, description carries trigger conditions |
| `emails` | keep | unique scope, description carries trigger conditions |
| `embedded-systems` | keep | unique scope, description carries trigger conditions |
| `emergent-project-design-scaffold` | keep | unique scope, description carries trigger conditions |
| `enhance-prompt` | keep | unique scope, description carries trigger conditions |
| `enrich-lead` | keep | unique scope, description carries trigger conditions |
| `environment-setup-guide` | keep | unique scope, description carries trigger conditions |
| `equity-research` | keep | unique scope, description carries trigger conditions |
| `erroneous-example-designer` | keep | unique scope, description carries trigger conditions |
| `error-analysis-protocol` | keep | unique scope, description carries trigger conditions |
| `escalation-flagger` | keep | unique scope, description carries trigger conditions |
| `ethical-hacking-methodology` | keep | unique scope, description carries trigger conditions |
| `eu-ai-act-specialist` | keep | unique scope, description carries trigger conditions |
| `event-store-design` | keep | unique scope, description carries trigger conditions |
| `executing-nist-rmf-authorization-to-operate` | keep | unique scope, description carries trigger conditions |
| `executing-plans` | keep | unique scope, description carries trigger conditions |
| `expansion-kickoff` | keep | unique scope, description carries trigger conditions |
| `expansion-update` | keep | unique scope, description carries trigger conditions |
| `experiential-learning-cycle-designer` | keep | unique scope, description carries trigger conditions |
| `explain` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `explain-first-interrogator` | keep | unique scope, description carries trigger conditions |
| `explicit-instruction-sequence-builder` | keep | unique scope, description carries trigger conditions |
| `exploiting-deeplink-vulnerabilities` | keep | unique scope, description carries trigger conditions |
| `exploiting-oauth-misconfiguration` | keep | unique scope, description carries trigger conditions |
| `external-context` | keep | unique scope, description carries trigger conditions |
| `extracting-config-from-agent-tesla-rat` | keep | unique scope, description carries trigger conditions |
| `fading-manager` | keep | unique scope, description carries trigger conditions |
| `fal-generate` | keep | unique scope, description carries trigger conditions |
| `fal-lip-sync` | keep | unique scope, description carries trigger conditions |
| `fal-train` | keep | unique scope, description carries trigger conditions |
| `fal-video-edit` | keep | unique scope, description carries trigger conditions |
| `fastapi-expert` | keep | unique scope, description carries trigger conditions |
| `fastapi-templates` | keep | unique scope, description carries trigger conditions |
| `feature-forge` | keep | unique scope, description carries trigger conditions |
| `feature-risk-assessment` | keep | unique scope, description carries trigger conditions |
| `federation-init` | keep | unique scope, description carries trigger conditions |
| `federation-status` | keep | unique scope, description carries trigger conditions |
| `feedback-quality-analyser` | keep | unique scope, description carries trigger conditions |
| `ffmpeg` | keep | unique scope, description carries trigger conditions |
| `field-notes-editorial-template` | keep | unique scope, description carries trigger conditions |
| `figma-create-new-file` | keep | unique scope, description carries trigger conditions |
| `figma-implement-design` | keep | unique scope, description carries trigger conditions |
| `file-conversion` | keep | unique scope, description carries trigger conditions |
| `filesystem-context` | keep | unique scope, description carries trigger conditions |
| `finance-skills` | keep | unique scope, description carries trigger conditions |
| `financial-analyst` | keep | unique scope, description carries trigger conditions |
| `financial-statements` | keep | unique scope, description carries trigger conditions |
| `find-community` | keep | unique scope, description carries trigger conditions |
| `find-skills` | keep | unique scope, description carries trigger conditions |
| `fine-tuning-expert` | keep | unique scope, description carries trigger conditions |
| `finishing-a-development-branch` | keep | unique scope, description carries trigger conditions |
| `first-customers` | keep | unique scope, description carries trigger conditions |
| `fix-issue` | keep | unique scope, description carries trigger conditions |
| `fixed-income-portfolio` | keep | unique scope, description carries trigger conditions |
| `fixing-accessibility` | keep | unique scope, description carries trigger conditions |
| `flash-attention` | keep | unique scope, description carries trigger conditions |
| `flow-state-condition-designer` | keep | unique scope, description carries trigger conditions |
| `flutter-dev` | keep | unique scope, description carries trigger conditions |
| `flutter-expert` | keep | unique scope, description carries trigger conditions |
| `form-cro` | keep | unique scope, description carries trigger conditions |
| `formative-assessment-loop-designer` | keep | unique scope, description carries trigger conditions |
| `formative-assessment-technique-selector` | keep | unique scope, description carries trigger conditions |
| `frame-data-chart-nyt` | keep | unique scope, description carries trigger conditions |
| `frame-light-leak-cinema` | keep | unique scope, description carries trigger conditions |
| `frame-macos-notification` | keep | unique scope, description carries trigger conditions |
| `free-llm-api-resources` | keep | unique scope, description carries trigger conditions |
| `free-tools` | keep | unique scope, description carries trigger conditions |
| `frontend-design` | keep | primary of frontend-design consolidation — absorb the others |
| `frontend-dev` | keep | unique scope, description carries trigger conditions |
| `frontend-developer` | keep | unique scope, description carries trigger conditions |
| `frontend-security-coder` | keep | unique scope, description carries trigger conditions |
| `frontend-skill` | keep | unique scope, description carries trigger conditions |
| `frontend-ui-engineering` | keep | unique scope, description carries trigger conditions |
| `fto-triage` | keep | unique scope, description carries trigger conditions |
| `fullstack-dev` | keep | unique scope, description carries trigger conditions |
| `fullstack-guardian` | keep | unique scope, description carries trigger conditions |
| `funding-digest` | keep | unique scope, description carries trigger conditions |
| `fx-carry-trade` | keep | unique scope, description carries trigger conditions |
| `game-developer` | keep | unique scope, description carries trigger conditions |
| `gap-analysis-from-student-work` | keep | unique scope, description carries trigger conditions |
| `gguf` | keep | unique scope, description carries trigger conditions |
| `gif-sticker-maker` | keep | unique scope, description carries trigger conditions |
| `git-advanced-workflows` | keep | unique scope, description carries trigger conditions |
| `git-guardrails-claude-code` | keep | unique scope, description carries trigger conditions |
| `git-workflow` | keep | unique scope, description carries trigger conditions |
| `git-workflow-and-versioning` | keep | unique scope, description carries trigger conditions |
| `github-actions-advanced` | keep | unique scope, description carries trigger conditions |
| `github-actions-templates` | keep | unique scope, description carries trigger conditions |
| `gitlab-ci-patterns` | keep | unique scope, description carries trigger conditions |
| `gl-recon` | keep | unique scope, description carries trigger conditions |
| `goal-plan` | keep | unique scope, description carries trigger conditions |
| `goal-setting-protocol-designer` | keep | unique scope, description carries trigger conditions |
| `godot-gdscript-patterns` | keep | unique scope, description carries trigger conditions |
| `golang-pro` | keep | unique scope, description carries trigger conditions |
| `google-docs-automation` | keep | unique scope, description carries trigger conditions |
| `google-sheets-automation` | keep | unique scope, description carries trigger conditions |
| `google-slides-automation` | keep | unique scope, description carries trigger conditions |
| `google-workspace-cli` | keep | unique scope, description carries trigger conditions |
| `gpt-5-4-prompting` | keep | unique scope, description carries trigger conditions |
| `gpt-image-2` | keep | unique scope, description carries trigger conditions |
| `gpt-tasteskill` | keep | unique scope, description carries trigger conditions |
| `grammar-check` | keep | unique scope, description carries trigger conditions |
| `grants` | keep | unique scope, description carries trigger conditions |
| `graphql-architect` | keep | unique scope, description carries trigger conditions |
| `grill-me` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `grill-with-docs` | keep | unique scope, description carries trigger conditions |
| `grilling` | keep | unique scope, description carries trigger conditions |
| `grow-sustainably` | keep | unique scope, description carries trigger conditions |
| `growth-loops` | keep | unique scope, description carries trigger conditions |
| `grpo-rl-training` | keep | unique scope, description carries trigger conditions |
| `gsap-core` | keep | unique scope, description carries trigger conditions |
| `gsap-frameworks` | keep | unique scope, description carries trigger conditions |
| `gsap-performance` | keep | unique scope, description carries trigger conditions |
| `gsap-plugins` | keep | unique scope, description carries trigger conditions |
| `gsap-react` | keep | unique scope, description carries trigger conditions |
| `gsap-scrolltrigger` | keep | unique scope, description carries trigger conditions |
| `gsap-timeline` | keep | unique scope, description carries trigger conditions |
| `gsap-utils` | keep | unique scope, description carries trigger conditions |
| `gtm-motions` | keep | unique scope, description carries trigger conditions |
| `gtm-strategy` | keep | unique scope, description carries trigger conditions |
| `hads` | keep | unique scope, description carries trigger conditions |
| `handbook-updates` | keep | unique scope, description carries trigger conditions |
| `harness-engineering` | keep | unique scope, description carries trigger conditions |
| `hexagon-complexity-mapper` | keep | unique scope, description carries trigger conditions |
| `hf-cli` | keep | unique scope, description carries trigger conditions |
| `hf-mcp` | keep | unique scope, description carries trigger conditions |
| `hf-mem` | keep | unique scope, description carries trigger conditions |
| `high-end-visual-design` | keep | unique scope, description carries trigger conditions |
| `hindsight-architect` | keep | unique scope, description carries trigger conditions |
| `hindsight-cloud` | keep | unique scope, description carries trigger conditions |
| `hindsight-docs` | keep | unique scope, description carries trigger conditions |
| `hindsight-local` | keep | unique scope, description carries trigger conditions |
| `hindsight-recall` | keep | unique scope, description carries trigger conditions |
| `hindsight-self-hosted` | keep | unique scope, description carries trigger conditions |
| `hinge-question-designer` | keep | unique scope, description carries trigger conditions |
| `historical-document-set-curator` | keep | unique scope, description carries trigger conditions |
| `historical-source-adapter` | keep | unique scope, description carries trigger conditions |
| `historical-thinking-assessment-designer` | keep | unique scope, description carries trigger conditions |
| `historical-thinking-strategy-modelling-guide` | keep | unique scope, description carries trigger conditions |
| `hook-development` | keep | unique scope, description carries trigger conditions |
| `horizon-track` | keep | unique scope, description carries trigger conditions |
| `hosted-agents` | keep | unique scope, description carries trigger conditions |
| `how-it-works` | keep | unique scope, description carries trigger conditions |
| `hs-release` | keep | unique scope, description carries trigger conditions |
| `html-ppt-retro-quarterly-review` | keep | unique scope, description carries trigger conditions |
| `hud` | keep | unique scope, description carries trigger conditions |
| `hugging-face-evaluation` | keep | unique scope, description carries trigger conditions |
| `huggingface-best` | keep | unique scope, description carries trigger conditions |
| `huggingface-community-evals` | keep | unique scope, description carries trigger conditions |
| `huggingface-datasets` | keep | unique scope, description carries trigger conditions |
| `huggingface-gradio` | keep | unique scope, description carries trigger conditions |
| `huggingface-llm-trainer` | keep | unique scope, description carries trigger conditions |
| `huggingface-local-models` | keep | unique scope, description carries trigger conditions |
| `huggingface-lora-space-builder` | keep | unique scope, description carries trigger conditions |
| `huggingface-paper-publisher` | keep | unique scope, description carries trigger conditions |
| `huggingface-papers` | keep | unique scope, description carries trigger conditions |
| `huggingface-spaces` | keep | unique scope, description carries trigger conditions |
| `huggingface-tokenizers` | keep | unique scope, description carries trigger conditions |
| `huggingface-tool-builder` | keep | unique scope, description carries trigger conditions |
| `huggingface-trackio` | keep | unique scope, description carries trigger conditions |
| `huggingface-vision-trainer` | keep | unique scope, description carries trigger conditions |
| `huggingface-zerogpu` | keep | unique scope, description carries trigger conditions |
| `hunting-advanced-persistent-threats` | keep | unique scope, description carries trigger conditions |
| `hunting-for-dns-based-persistence` | keep | unique scope, description carries trigger conditions |
| `hunting-for-scheduled-task-persistence` | keep | unique scope, description carries trigger conditions |
| `hybrid-cloud-networking` | keep | unique scope, description carries trigger conditions |
| `ib-check-deck` | keep | unique scope, description carries trigger conditions |
| `idea-generation` | keep | unique scope, description carries trigger conditions |
| `idea-refine` | keep | unique scope, description carries trigger conditions |
| `ideal-customer-profile` | keep | unique scope, description carries trigger conditions |
| `identify-assumptions-existing` | keep | unique scope, description carries trigger conditions |
| `identify-assumptions-new` | keep | unique scope, description carries trigger conditions |
| `ideogram4` | keep | unique scope, description carries trigger conditions |
| `image-to-code-skill` | keep | unique scope, description carries trigger conditions |
| `imagegen` | keep | unique scope, description carries trigger conditions |
| `imagegen-frontend-mobile` | keep | unique scope, description carries trigger conditions |
| `imagegen-frontend-web` | keep | unique scope, description carries trigger conditions |
| `imagen` | keep | unique scope, description carries trigger conditions |
| `impeccable` | keep | unique scope, description carries trigger conditions |
| `implementation-intention-designer` | keep | unique scope, description carries trigger conditions |
| `implementing-anti-phishing-training-program` | keep | unique scope, description carries trigger conditions |
| `implementing-attack-surface-management` | keep | unique scope, description carries trigger conditions |
| `implementing-cisa-zero-trust-maturity-model` | keep | unique scope, description carries trigger conditions |
| `implementing-data-loss-prevention-with-microsoft-purview` | keep | unique scope, description carries trigger conditions |
| `implementing-end-to-end-encryption-for-messaging` | keep | unique scope, description carries trigger conditions |
| `implementing-google-workspace-admin-security` | keep | unique scope, description carries trigger conditions |
| `implementing-immutable-backup-with-restic` | keep | unique scope, description carries trigger conditions |
| `implementing-mitre-attack-coverage-mapping` | keep | unique scope, description carries trigger conditions |
| `implementing-next-generation-firewall-with-palo-alto` | keep | unique scope, description carries trigger conditions |
| `implementing-privileged-access-workstation` | keep | unique scope, description carries trigger conditions |
| `implementing-secret-scanning-with-gitleaks` | keep | unique scope, description carries trigger conditions |
| `implementing-soar-playbook-with-palo-alto-xsoar` | keep | unique scope, description carries trigger conditions |
| `implementing-web-application-logging-with-modsecurity` | keep | unique scope, description carries trigger conditions |
| `improve-codebase-architecture` | keep | unique scope, description carries trigger conditions |
| `inbox-setup` | keep | unique scope, description carries trigger conditions |
| `inbox-triage` | keep | unique scope, description carries trigger conditions |
| `incident-responder` | keep | unique scope, description carries trigger conditions |
| `inclusive-design-orchestrator` | keep | unique scope, description carries trigger conditions |
| `incremental-implementation` | keep | unique scope, description carries trigger conditions |
| `individual-spacing-algorithm-explainer` | keep | unique scope, description carries trigger conditions |
| `init-project` | keep | unique scope, description carries trigger conditions |
| `initiating-coverage` | keep | unique scope, description carries trigger conditions |
| `instructional-coaching-conversation-guide` | keep | unique scope, description carries trigger conditions |
| `instrument-data-to-allotrope` | keep | unique scope, description carries trigger conditions |
| `intelligence-route` | keep | unique scope, description carries trigger conditions |
| `intelligence-transfer` | keep | unique scope, description carries trigger conditions |
| `intelligent-tutoring-dialogue-designer` | keep | unique scope, description carries trigger conditions |
| `intended-vs-implemented` | keep | unique scope, description carries trigger conditions |
| `interactive-portfolio` | keep | unique scope, description carries trigger conditions |
| `interdisciplinary-real-world-connection-mapper` | keep | unique scope, description carries trigger conditions |
| `interleaved-thinking` | keep | unique scope, description carries trigger conditions |
| `interleaving-unit-planner` | keep | unique scope, description carries trigger conditions |
| `internal-comms` | keep | unique scope, description carries trigger conditions |
| `interview-me` | keep | unique scope, description carries trigger conditions |
| `interview-prep` | keep | unique scope, description carries trigger conditions |
| `interview-script` | keep | unique scope, description carries trigger conditions |
| `investigating-insider-threat-indicators` | keep | unique scope, description carries trigger conditions |
| `ios-application-dev` | keep | unique scope, description carries trigger conditions |
| `iot-anomalies` | keep | unique scope, description carries trigger conditions |
| `iot-firmware` | keep | unique scope, description carries trigger conditions |
| `iot-fleet` | keep | unique scope, description carries trigger conditions |
| `iot-register` | keep | unique scope, description carries trigger conditions |
| `is-this-a-problem` | keep | unique scope, description carries trigger conditions |
| `iso42001-specialist` | keep | unique scope, description carries trigger conditions |
| `istio-traffic-management` | keep | unique scope, description carries trigger conditions |
| `java-architect` | keep | unique scope, description carries trigger conditions |
| `javascript-pro` | keep | unique scope, description carries trigger conditions |
| `jira-expert` | keep | unique scope, description carries trigger conditions |
| `job-stories` | keep | unique scope, description carries trigger conditions |
| `journal-entry-prep` | keep | unique scope, description carries trigger conditions |
| `json-canvas` | keep | unique scope, description carries trigger conditions |
| `k6-load-testing` | keep | unique scope, description carries trigger conditions |
| `karpathy-guidelines` | keep | unique scope, description carries trigger conditions |
| `kb-article` | keep | unique scope, description carries trigger conditions |
| `kb-retriever` | keep | unique scope, description carries trigger conditions |
| `kg-extract` | keep | unique scope, description carries trigger conditions |
| `kg-traverse` | keep | unique scope, description carries trigger conditions |
| `knowledge-agent` | keep | unique scope, description carries trigger conditions |
| `knowledge-ops` | keep | unique scope, description carries trigger conditions |
| `knowledge-synthesis` | keep | unique scope, description carries trigger conditions |
| `kotlin-specialist` | keep | unique scope, description carries trigger conditions |
| `kpi-dashboard-design` | keep | unique scope, description carries trigger conditions |
| `kubernetes-architect` | keep | unique scope, description carries trigger conditions |
| `kubernetes-specialist` | keep | unique scope, description carries trigger conditions |
| `kud-chart-author` | keep | unique scope, description carries trigger conditions |
| `kud-knowledge-type-mapper` | keep | unique scope, description carries trigger conditions |
| `kwp-brief` | keep | unique scope, description carries trigger conditions |
| `kwp-competitive-brief` | keep | unique scope, description carries trigger conditions |
| `kwp-customer-research` | keep | unique scope, description carries trigger conditions |
| `kwp-debug` | keep | unique scope, description carries trigger conditions |
| `kwp-design-system` | keep | unique scope, description carries trigger conditions |
| `kwp-onboarding` | keep | unique scope, description carries trigger conditions |
| `kwp-search` | keep | unique scope, description carries trigger conditions |
| `kyc-doc-parse` | keep | unique scope, description carries trigger conditions |
| `kyc-rules` | keep | unique scope, description carries trigger conditions |
| `ladder-of-inference-reflection` | keep | unique scope, description carries trigger conditions |
| `lambda-labs` | keep | unique scope, description carries trigger conditions |
| `landing` | keep | unique scope, description carries trigger conditions |
| `langfuse` | keep | unique scope, description carries trigger conditions |
| `langgraph` | keep | unique scope, description carries trigger conditions |
| `language-demand-analyser` | keep | unique scope, description carries trigger conditions |
| `laravel-specialist` | keep | unique scope, description carries trigger conditions |
| `last30days` | keep | unique scope, description carries trigger conditions |
| `latent-briefing` | keep | unique scope, description carries trigger conditions |
| `launch-review` | keep | unique scope, description carries trigger conditions |
| `launch-strategy` | keep | unique scope, description carries trigger conditions |
| `lbo-model` | keep | unique scope, description carries trigger conditions |
| `lead-magnets` | keep | unique scope, description carries trigger conditions |
| `lean-canvas` | keep | unique scope, description carries trigger conditions |
| `learn-codebase` | keep | unique scope, description carries trigger conditions |
| `learning-analytics-interpretation-guide` | keep | unique scope, description carries trigger conditions |
| `learning-progression-builder` | keep | unique scope, description carries trigger conditions |
| `learning-target-authoring-guide` | keep | unique scope, description carries trigger conditions |
| `legacy-modernizer` | keep | unique scope, description carries trigger conditions |
| `legal-cold-start-interview` | keep | unique scope, description carries trigger conditions |
| `legal-customize` | keep | unique scope, description carries trigger conditions |
| `legal-matter-workspace` | keep | unique scope, description carries trigger conditions |
| `legal-response` | keep | unique scope, description carries trigger conditions |
| `legal-risk-assessment` | keep | unique scope, description carries trigger conditions |
| `lesson-observation-protocol-designer` | keep | unique scope, description carries trigger conditions |
| `lesson-opening-designer` | keep | unique scope, description carries trigger conditions |
| `lesson-study-cycle-designer` | keep | unique scope, description carries trigger conditions |
| `leverage-and-response-design` | keep | unique scope, description carries trigger conditions |
| `lfg` | keep | unique scope, description carries trigger conditions |
| `linkerd-patterns` | keep | unique scope, description carries trigger conditions |
| `lint-and-validate` | keep | unique scope, description carries trigger conditions |
| `linux-privilege-escalation` | keep | unique scope, description carries trigger conditions |
| `list-projects` | keep | unique scope, description carries trigger conditions |
| `litgpt` | keep | unique scope, description carries trigger conditions |
| `llama-cpp` | keep | unique scope, description carries trigger conditions |
| `llama-factory` | keep | unique scope, description carries trigger conditions |
| `llamaguard` | keep | unique scope, description carries trigger conditions |
| `llm-app-patterns` | keep | unique scope, description carries trigger conditions |
| `lm-evaluation-harness` | keep | unique scope, description carries trigger conditions |
| `local-build-reminder` | keep | unique scope, description carries trigger conditions |
| `loop-library` | keep | unique scope, description carries trigger conditions |
| `loop-worker` | keep | unique scope, description carries trigger conditions |
| `ltx2` | keep | unique scope, description carries trigger conditions |
| `m5-onboard` | keep | unique scope, description carries trigger conditions |
| `macro-rates-monitor` | keep | unique scope, description carries trigger conditions |
| `make-plan` | keep | unique scope, description carries trigger conditions |
| `mamba` | keep | unique scope, description carries trigger conditions |
| `managed-agent` | keep | unique scope, description carries trigger conditions |
| `markdown-html-orchestrator` | keep | unique scope, description carries trigger conditions |
| `market-ingest` | keep | unique scope, description carries trigger conditions |
| `market-pattern` | keep | unique scope, description carries trigger conditions |
| `market-research` | keep | unique scope, description carries trigger conditions |
| `market-segments` | keep | unique scope, description carries trigger conditions |
| `market-sizing` | keep | unique scope, description carries trigger conditions |
| `marketing-ideas` | keep | unique scope, description carries trigger conditions |
| `marketing-loops` | keep | unique scope, description carries trigger conditions |
| `marketing-plan` | keep | unique scope, description carries trigger conditions |
| `marketing-psychology` | keep | unique scope, description carries trigger conditions |
| `math-olympiad` | keep | unique scope, description carries trigger conditions |
| `matter-workspace` | keep | unique scope, description carries trigger conditions |
| `mcp-builder` | keep | unique scope, description carries trigger conditions |
| `mcp-developer` | keep | unique scope, description carries trigger conditions |
| `mcp-integration` | keep | unique scope, description carries trigger conditions |
| `mcp-setup` | keep | unique scope, description carries trigger conditions |
| `mcp-tool-developer` | keep | unique scope, description carries trigger conditions |
| `md-document` | keep | unique scope, description carries trigger conditions |
| `md-review` | keep | unique scope, description carries trigger conditions |
| `media-literacy-deconstruction-protocol` | keep | unique scope, description carries trigger conditions |
| `megatron-core` | keep | unique scope, description carries trigger conditions |
| `mem-search` | keep | unique scope, description carries trigger conditions |
| `mem0` | keep | unique scope, description carries trigger conditions |
| `mem0-cli` | keep | unique scope, description carries trigger conditions |
| `mem0-context-loader` | keep | unique scope, description carries trigger conditions |
| `mem0-dream` | keep | unique scope, description carries trigger conditions |
| `mem0-forget` | keep | unique scope, description carries trigger conditions |
| `mem0-integrate` | keep | unique scope, description carries trigger conditions |
| `mem0-pin` | keep | unique scope, description carries trigger conditions |
| `mem0-remember` | keep | unique scope, description carries trigger conditions |
| `mem0-scope` | keep | unique scope, description carries trigger conditions |
| `mem0-search` | keep | unique scope, description carries trigger conditions |
| `mem0-status` | keep | unique scope, description carries trigger conditions |
| `mem0-test-integration` | keep | unique scope, description carries trigger conditions |
| `mem0-tour` | keep | unique scope, description carries trigger conditions |
| `mem0-vercel-ai-sdk` | keep | unique scope, description carries trigger conditions |
| `memory-dream` | keep | unique scope, description carries trigger conditions |
| `memory-management` | keep | unique scope, description carries trigger conditions |
| `memory-reviewer` | keep | unique scope, description carries trigger conditions |
| `memory-systems` | keep | unique scope, description carries trigger conditions |
| `memory-triage` | keep | unique scope, description carries trigger conditions |
| `mempalace` | keep | unique scope, description carries trigger conditions |
| `mempalace-openclaw` | keep | unique scope, description carries trigger conditions |
| `mempalace-recall` | keep | unique scope, description carries trigger conditions |
| `mempalace-search` | keep | unique scope, description carries trigger conditions |
| `mempalace-status` | keep | unique scope, description carries trigger conditions |
| `mental-model-mapper` | keep | unique scope, description carries trigger conditions |
| `meta-ad-builder` | keep | unique scope, description carries trigger conditions |
| `metacognitive-monitoring-ai-contexts` | keep | unique scope, description carries trigger conditions |
| `metacognitive-prompt-library` | keep | unique scope, description carries trigger conditions |
| `metrics-dashboard` | keep | unique scope, description carries trigger conditions |
| `metrics-review` | keep | unique scope, description carries trigger conditions |
| `micro-saas-launcher` | keep | unique scope, description carries trigger conditions |
| `microservices-architect` | keep | unique scope, description carries trigger conditions |
| `microservices-patterns` | keep | unique scope, description carries trigger conditions |
| `migrate-to-shoehorn` | keep | unique scope, description carries trigger conditions |
| `miles` | keep | unique scope, description carries trigger conditions |
| `minimalist-review` | keep | unique scope, description carries trigger conditions |
| `minimalist-skill` | keep | unique scope, description carries trigger conditions |
| `minimax-docx` | keep | unique scope, description carries trigger conditions |
| `minimax-multimodal-toolkit` | keep | unique scope, description carries trigger conditions |
| `minimax-music-gen` | keep | unique scope, description carries trigger conditions |
| `minimax-music-playlist` | keep | unique scope, description carries trigger conditions |
| `minimax-pdf` | keep | unique scope, description carries trigger conditions |
| `minimax-xlsx` | keep | unique scope, description carries trigger conditions |
| `mixed-age-learning-task-designer` | keep | unique scope, description carries trigger conditions |
| `ml-pipeline` | keep | unique scope, description carries trigger conditions |
| `mlflow` | keep | unique scope, description carries trigger conditions |
| `mobile-app-design` | keep | unique scope, description carries trigger conditions |
| `mobile-app-ui-design` | keep | unique scope, description carries trigger conditions |
| `modal` | keep | unique scope, description carries trigger conditions |
| `model-update` | keep | unique scope, description carries trigger conditions |
| `monetization` | keep | unique scope, description carries trigger conditions |
| `monetization-strategy` | keep | unique scope, description carries trigger conditions |
| `monitoring-expert` | keep | unique scope, description carries trigger conditions |
| `morning-note` | keep | unique scope, description carries trigger conditions |
| `motivation-diagnostic-task-redesign` | keep | unique scope, description carries trigger conditions |
| `moviepy` | keep | unique scope, description carries trigger conditions |
| `mtls-configuration` | keep | unique scope, description carries trigger conditions |
| `multi-agent-patterns` | keep | unique scope, description carries trigger conditions |
| `multi-perspective-decision-wheel` | keep | unique scope, description carries trigger conditions |
| `multi-reviewer-patterns` | keep | unique scope, description carries trigger conditions |
| `mvp` | keep | unique scope, description carries trigger conditions |
| `nanobanana-ppt` | keep | unique scope, description carries trigger conditions |
| `nanogpt` | keep | unique scope, description carries trigger conditions |
| `nemo-curator` | keep | unique scope, description carries trigger conditions |
| `nemo-evaluator` | keep | unique scope, description carries trigger conditions |
| `nemo-guardrails` | keep | unique scope, description carries trigger conditions |
| `nested-subagents` | keep | unique scope, description carries trigger conditions |
| `nestjs-expert` | keep | unique scope, description carries trigger conditions |
| `neural-train` | keep | unique scope, description carries trigger conditions |
| `nextflow-development` | keep | unique scope, description carries trigger conditions |
| `nextjs-app-router-patterns` | keep | unique scope, description carries trigger conditions |
| `nextjs-best-practices` | keep | unique scope, description carries trigger conditions |
| `nextjs-developer` | keep | unique scope, description carries trigger conditions |
| `nft-standards` | keep | unique scope, description carries trigger conditions |
| `nnsight` | keep | unique scope, description carries trigger conditions |
| `north-star-metric` | keep | unique scope, description carries trigger conditions |
| `observability-and-instrumentation` | keep | unique scope, description carries trigger conditions |
| `observability-engineer` | keep | unique scope, description carries trigger conditions |
| `obsidian-bases` | keep | unique scope, description carries trigger conditions |
| `obsidian-cli` | keep | unique scope, description carries trigger conditions |
| `obsidian-markdown` | keep | unique scope, description carries trigger conditions |
| `obsidian-vault` | keep | unique scope, description carries trigger conditions |
| `offers` | keep | unique scope, description carries trigger conditions |
| `office-productivity` | keep | unique scope, description carries trigger conditions |
| `oh-my-issues` | keep | unique scope, description carries trigger conditions |
| `omc-reference` | keep | unique scope, description carries trigger conditions |
| `omc-setup` | keep | unique scope, description carries trigger conditions |
| `omc-teams` | keep | unique scope, description carries trigger conditions |
| `openapi-spec-generation` | keep | unique scope, description carries trigger conditions |
| `openrlhf` | keep | unique scope, description carries trigger conditions |
| `operating-havoc-c2` | keep | unique scope, description carries trigger conditions |
| `opportunity-solution-tree` | keep | unique scope, description carries trigger conditions |
| `option-vol-analysis` | keep | unique scope, description carries trigger conditions |
| `org-design` | keep | unique scope, description carries trigger conditions |
| `outcome-roadmap` | keep | unique scope, description carries trigger conditions |
| `outdoor-learning-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `p10` | keep | unique scope, description carries trigger conditions |
| `p7` | keep | unique scope, description carries trigger conditions |
| `p9` | keep | unique scope, description carries trigger conditions |
| `pandas-pro` | keep | unique scope, description carries trigger conditions |
| `panel-review` | keep | unique scope, description carries trigger conditions |
| `parallel-debugging` | keep | unique scope, description carries trigger conditions |
| `parallel-feature-development` | keep | unique scope, description carries trigger conditions |
| `pathfinder` | keep | unique scope, description carries trigger conditions |
| `paywalls` | keep | unique scope, description carries trigger conditions |
| `pci-compliance` | keep | unique scope, description carries trigger conditions |
| `pdf` | keep | unique scope, description carries trigger conditions |
| `pdf-conversion-router` | keep | unique scope, description carries trigger conditions |
| `pedagogical-content-knowledge-developer` | keep | unique scope, description carries trigger conditions |
| `peft` | keep | unique scope, description carries trigger conditions |
| `performance-optimization` | keep | unique scope, description carries trigger conditions |
| `performing-agentless-vulnerability-scanning` | keep | unique scope, description carries trigger conditions |
| `performing-aws-account-enumeration-with-scout-suite` | keep | unique scope, description carries trigger conditions |
| `performing-cloud-native-forensics-with-falco` | keep | unique scope, description carries trigger conditions |
| `performing-deception-technology-deployment` | keep | unique scope, description carries trigger conditions |
| `performing-false-positive-reduction-in-siem` | keep | unique scope, description carries trigger conditions |
| `performing-ics-asset-discovery-with-claroty` | keep | unique scope, description carries trigger conditions |
| `performing-lateral-movement-detection` | keep | unique scope, description carries trigger conditions |
| `performing-network-forensics-with-wireshark` | keep | unique scope, description carries trigger conditions |
| `performing-paste-site-monitoring-for-credentials` | keep | unique scope, description carries trigger conditions |
| `performing-ransomware-response` | keep | unique scope, description carries trigger conditions |
| `performing-soc-tabletop-exercise` | keep | unique scope, description carries trigger conditions |
| `performing-threat-emulation-with-atomic-red-team` | keep | unique scope, description carries trigger conditions |
| `performing-web-application-vulnerability-triage` | keep | unique scope, description carries trigger conditions |
| `perma-based-lesson-designer` | keep | unique scope, description carries trigger conditions |
| `perspective-taking-designer` | keep | unique scope, description carries trigger conditions |
| `pestle-analysis` | keep | unique scope, description carries trigger conditions |
| `phenomenon-based-unit-anchor` | keep | unique scope, description carries trigger conditions |
| `php-pro` | keep | unique scope, description carries trigger conditions |
| `pii-detect` | keep | unique scope, description carries trigger conditions |
| `place-based-curriculum-orchestrator` | keep | unique scope, description carries trigger conditions |
| `place-based-inquiry-anchor` | keep | unique scope, description carries trigger conditions |
| `planning-and-task-breakdown` | keep | unique scope, description carries trigger conditions |
| `planning-with-files` | keep | unique scope, description carries trigger conditions |
| `platform-design` | keep | unique scope, description carries trigger conditions |
| `playground` | keep | unique scope, description carries trigger conditions |
| `playwright-expert` | keep | unique scope, description carries trigger conditions |
| `playwright-recording` | keep | unique scope, description carries trigger conditions |
| `playwright-skill` | keep | unique scope, description carries trigger conditions |
| `plugin-settings` | keep | unique scope, description carries trigger conditions |
| `plugin-structure` | keep | unique scope, description carries trigger conditions |
| `pod-sales` | keep | unique scope, description carries trigger conditions |
| `ponytail` | keep | unique scope, description carries trigger conditions |
| `ponytail-audit` | keep | unique scope, description carries trigger conditions |
| `ponytail-debt` | keep | unique scope, description carries trigger conditions |
| `ponytail-gain` | keep | unique scope, description carries trigger conditions |
| `ponytail-help` | keep | unique scope, description carries trigger conditions |
| `ponytail-review` | keep | unique scope, description carries trigger conditions |
| `popups` | keep | unique scope, description carries trigger conditions |
| `porters-five-forces` | keep | unique scope, description carries trigger conditions |
| `positioning-ideas` | keep | unique scope, description carries trigger conditions |
| `postgres-best-practices` | keep | unique scope, description carries trigger conditions |
| `postgres-pro` | keep | unique scope, description carries trigger conditions |
| `postgresql` | keep | unique scope, description carries trigger conditions |
| `ppt-editing-skill` | keep | unique scope, description carries trigger conditions |
| `ppt-master` | keep | unique scope, description carries trigger conditions |
| `ppt-orchestra-skill` | keep | unique scope, description carries trigger conditions |
| `ppt-template-creator` | keep | unique scope, description carries trigger conditions |
| `pptx` | keep | unique scope, description carries trigger conditions |
| `pptx-author` | keep | unique scope, description carries trigger conditions |
| `pptx-generator` | keep | unique scope, description carries trigger conditions |
| `pr-feedback-quality-gate` | keep | unique scope, description carries trigger conditions |
| `pr-review` | keep | unique scope, description carries trigger conditions |
| `practice-problem-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `prd` | keep | primary of PRD consolidation — absorb the others |
| `pre-mortem` | keep | unique scope, description carries trigger conditions |
| `prepared-environment-designer` | keep | unique scope, description carries trigger conditions |
| `pricing` | keep | unique scope, description carries trigger conditions |
| `pricing-strategy` | keep | unique scope, description carries trigger conditions |
| `prioritization-frameworks` | keep | unique scope, description carries trigger conditions |
| `prioritize-assumptions` | keep | unique scope, description carries trigger conditions |
| `prioritize-features` | keep | unique scope, description carries trigger conditions |
| `privacy-policy` | keep | unique scope, description carries trigger conditions |
| `process-doc` | keep | unique scope, description carries trigger conditions |
| `processize` | keep | unique scope, description carries trigger conditions |
| `product-manager` | keep | unique scope, description carries trigger conditions |
| `product-marketing` | keep | unique scope, description carries trigger conditions |
| `product-name` | keep | unique scope, description carries trigger conditions |
| `product-research` | keep | unique scope, description carries trigger conditions |
| `product-strategy` | keep | unique scope, description carries trigger conditions |
| `product-vision` | keep | unique scope, description carries trigger conditions |
| `productive-failure-desirable-difficulty-designer` | keep | unique scope, description carries trigger conditions |
| `productive-failure-protocol` | keep | unique scope, description carries trigger conditions |
| `professional-development-session-designer` | keep | unique scope, description carries trigger conditions |
| `programmatic-seo` | keep | unique scope, description carries trigger conditions |
| `progressive-hint-ladder` | keep | unique scope, description carries trigger conditions |
| `project-artifact` | keep | unique scope, description carries trigger conditions |
| `project-brief-designer` | keep | unique scope, description carries trigger conditions |
| `project-development` | keep | unique scope, description carries trigger conditions |
| `project-session-manager` | keep | unique scope, description carries trigger conditions |
| `prompt-engineer` | keep | unique scope, description carries trigger conditions |
| `prompt-engineering` | keep | unique scope, description carries trigger conditions |
| `prompt-guard` | keep | unique scope, description carries trigger conditions |
| `prompt-literacy-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `prospect` | keep | unique scope, description carries trigger conditions |
| `prospecting` | keep | unique scope, description carries trigger conditions |
| `prototype` | keep | unique scope, description carries trigger conditions |
| `pua` | keep | unique scope, description carries trigger conditions |
| `pua-cancel-loop` | keep | unique scope, description carries trigger conditions |
| `pua-en` | keep | unique scope, description carries trigger conditions |
| `pua-flavor` | keep | unique scope, description carries trigger conditions |
| `pua-ja` | keep | unique scope, description carries trigger conditions |
| `pua-kpi` | keep | unique scope, description carries trigger conditions |
| `pua-loop` | keep | unique scope, description carries trigger conditions |
| `pua-mama` | keep | unique scope, description carries trigger conditions |
| `pua-off` | keep | unique scope, description carries trigger conditions |
| `pua-offline` | keep | unique scope, description carries trigger conditions |
| `pua-on` | keep | unique scope, description carries trigger conditions |
| `pua-p10` | keep | unique scope, description carries trigger conditions |
| `pua-p7` | keep | unique scope, description carries trigger conditions |
| `pua-p9` | keep | unique scope, description carries trigger conditions |
| `pua-pro` | keep | unique scope, description carries trigger conditions |
| `pua-reap-orphans` | keep | unique scope, description carries trigger conditions |
| `pua-survey` | keep | unique scope, description carries trigger conditions |
| `pua-team-status` | keep | unique scope, description carries trigger conditions |
| `pua-teardown-all` | keep | unique scope, description carries trigger conditions |
| `pua-trae` | keep | unique scope, description carries trigger conditions |
| `pua-yes` | keep | unique scope, description carries trigger conditions |
| `public-relations` | keep | unique scope, description carries trigger conditions |
| `python-pro` | keep | unique scope, description carries trigger conditions |
| `pytorch-fsdp2` | keep | unique scope, description carries trigger conditions |
| `pyvene` | keep | unique scope, description carries trigger conditions |
| `qwen-edit` | keep | unique scope, description carries trigger conditions |
| `rag-architect` | keep | unique scope, description carries trigger conditions |
| `rag-engineer` | keep | unique scope, description carries trigger conditions |
| `rails-expert` | keep | unique scope, description carries trigger conditions |
| `ralph` | keep | unique scope, description carries trigger conditions |
| `ralplan` | keep | unique scope, description carries trigger conditions |
| `ray-data` | keep | unique scope, description carries trigger conditions |
| `react-best-practices` | keep | unique scope, description carries trigger conditions |
| `react-expert` | keep | unique scope, description carries trigger conditions |
| `react-modernization` | keep | unique scope, description carries trigger conditions |
| `react-native-architecture` | keep | unique scope, description carries trigger conditions |
| `react-native-dev` | keep | unique scope, description carries trigger conditions |
| `react-native-expert` | keep | unique scope, description carries trigger conditions |
| `react-state-management` | keep | unique scope, description carries trigger conditions |
| `reading-comprehension-strategy-selector` | keep | unique scope, description carries trigger conditions |
| `recap` | keep | unique scope, description carries trigger conditions |
| `receiving-code-review` | keep | unique scope, description carries trigger conditions |
| `recovering-from-ransomware-attack` | keep | unique scope, description carries trigger conditions |
| `redesign-skill` | keep | unique scope, description carries trigger conditions |
| `refactor` | keep | unique scope, description carries trigger conditions |
| `referral-program` | keep | unique scope, description carries trigger conditions |
| `referrals` | keep | unique scope, description carries trigger conditions |
| `reflective-practice-prompt-generator` | keep | unique scope, description carries trigger conditions |
| `regenerative-project-design-orchestrator` | keep | unique scope, description carries trigger conditions |
| `reggio-documentation-protocol` | keep | unique scope, description carries trigger conditions |
| `registry-browser` | keep | unique scope, description carries trigger conditions |
| `release-notes` | keep | unique scope, description carries trigger conditions |
| `release-notes-one-pager` | keep | unique scope, description carries trigger conditions |
| `release-skills` | keep | unique scope, description carries trigger conditions |
| `remotion` | keep | unique scope, description carries trigger conditions |
| `requesting-code-review` | keep | unique scope, description carries trigger conditions |
| `research` | keep | primary of research consolidation — absorb the others |
| `research-decision-room` | keep | unique scope, description carries trigger conditions |
| `research-finance` | keep | unique scope, description carries trigger conditions |
| `research-summarizer` | keep | unique scope, description carries trigger conditions |
| `research-synthesize` | keep | unique scope, description carries trigger conditions |
| `resolving-merge-conflicts` | keep | unique scope, description carries trigger conditions |
| `restorative-practice-protocol-designer` | keep | unique scope, description carries trigger conditions |
| `retrieval-practice-generator` | keep | unique scope, description carries trigger conditions |
| `retrieve-first-gate` | keep | unique scope, description carries trigger conditions |
| `retro` | keep | unique scope, description carries trigger conditions |
| `revenue-operations` | keep | unique scope, description carries trigger conditions |
| `review-resume` | keep | unique scope, description carries trigger conditions |
| `revops` | keep | unique scope, description carries trigger conditions |
| `roadmap-update` | keep | unique scope, description carries trigger conditions |
| `ruflo-doctor` | keep | unique scope, description carries trigger conditions |
| `ruler-emotional-literacy-sequence` | keep | unique scope, description carries trigger conditions |
| `runpod` | keep | unique scope, description carries trigger conditions |
| `rust-engineer` | keep | unique scope, description carries trigger conditions |
| `rwkv` | keep | unique scope, description carries trigger conditions |
| `saas-metrics-coach` | keep | unique scope, description carries trigger conditions |
| `saas-mvp-launcher` | keep | unique scope, description carries trigger conditions |
| `saelens` | keep | unique scope, description carries trigger conditions |
| `safety-scan` | keep | unique scope, description carries trigger conditions |
| `sales-enablement` | keep | unique scope, description carries trigger conditions |
| `salesforce-developer` | keep | unique scope, description carries trigger conditions |
| `sast-configuration` | keep | unique scope, description carries trigger conditions |
| `scaffold-exercises` | keep | unique scope, description carries trigger conditions |
| `scaffolded-task-modifier` | keep | unique scope, description carries trigger conditions |
| `scanning-iac-and-images-with-trivy` | keep | unique scope, description carries trigger conditions |
| `scientific-problem-selection` | keep | unique scope, description carries trigger conditions |
| `sciomc` | keep | unique scope, description carries trigger conditions |
| `scope-and-sequence-designer` | keep | unique scope, description carries trigger conditions |
| `scoping-for-transformative-learning-inquiry` | keep | unique scope, description carries trigger conditions |
| `screen-reader-testing` | keep | unique scope, description carries trigger conditions |
| `screenshot` | keep | unique scope, description carries trigger conditions |
| `scroll-experience` | keep | unique scope, description carries trigger conditions |
| `scvi-tools` | keep | unique scope, description carries trigger conditions |
| `search-strategy` | keep | unique scope, description carries trigger conditions |
| `secrets-management` | keep | unique scope, description carries trigger conditions |
| `sector-overview` | keep | unique scope, description carries trigger conditions |
| `secure-code-guardian` | keep | unique scope, description carries trigger conditions |
| `security-and-hardening` | keep | unique scope, description carries trigger conditions |
| `security-auditor` | keep | primary of security review consolidation — absorb the others |
| `seeds-regenerative-inquiry-cycle` | keep | unique scope, description carries trigger conditions |
| `self-determined-project-design-protocol` | keep | unique scope, description carries trigger conditions |
| `self-efficacy-builder-sequence` | keep | unique scope, description carries trigger conditions |
| `self-explanation-prompt-designer` | keep | unique scope, description carries trigger conditions |
| `self-improve` | keep | unique scope, description carries trigger conditions |
| `self-regulation-scaffold-generator` | keep | unique scope, description carries trigger conditions |
| `sentencepiece` | keep | unique scope, description carries trigger conditions |
| `sentiment-analysis` | keep | unique scope, description carries trigger conditions |
| `seo` | keep | unique scope, description carries trigger conditions |
| `seo-ahrefs` | keep | unique scope, description carries trigger conditions |
| `seo-audit` | keep | primary of SEO audit consolidation — absorb the others |
| `seo-backlinks` | keep | unique scope, description carries trigger conditions |
| `seo-bing` | keep | unique scope, description carries trigger conditions |
| `seo-cluster` | keep | unique scope, description carries trigger conditions |
| `seo-competitor-pages` | keep | unique scope, description carries trigger conditions |
| `seo-content` | keep | unique scope, description carries trigger conditions |
| `seo-content-brief` | keep | unique scope, description carries trigger conditions |
| `seo-dataforseo` | keep | unique scope, description carries trigger conditions |
| `seo-drift` | keep | unique scope, description carries trigger conditions |
| `seo-ecommerce` | keep | unique scope, description carries trigger conditions |
| `seo-firecrawl` | keep | unique scope, description carries trigger conditions |
| `seo-flow` | keep | unique scope, description carries trigger conditions |
| `seo-geo` | keep | unique scope, description carries trigger conditions |
| `seo-google` | keep | unique scope, description carries trigger conditions |
| `seo-hreflang` | keep | unique scope, description carries trigger conditions |
| `seo-image-gen` | keep | unique scope, description carries trigger conditions |
| `seo-images` | keep | unique scope, description carries trigger conditions |
| `seo-local` | keep | unique scope, description carries trigger conditions |
| `seo-maps` | keep | unique scope, description carries trigger conditions |
| `seo-page` | keep | unique scope, description carries trigger conditions |
| `seo-plan` | keep | unique scope, description carries trigger conditions |
| `seo-profound` | keep | unique scope, description carries trigger conditions |
| `seo-programmatic` | keep | unique scope, description carries trigger conditions |
| `seo-schema` | keep | unique scope, description carries trigger conditions |
| `seo-seranking` | keep | unique scope, description carries trigger conditions |
| `seo-sitemap` | keep | unique scope, description carries trigger conditions |
| `seo-sxo` | keep | unique scope, description carries trigger conditions |
| `seo-technical` | keep | unique scope, description carries trigger conditions |
| `seo-unlighthouse` | keep | unique scope, description carries trigger conditions |
| `sequence-load` | keep | unique scope, description carries trigger conditions |
| `service-learning-project-designer` | keep | unique scope, description carries trigger conditions |
| `session-history` | keep | unique scope, description carries trigger conditions |
| `session-report` | keep | unique scope, description carries trigger conditions |
| `setup-matt-pocock-skills` | keep | unique scope, description carries trigger conditions |
| `setup-pre-commit` | keep | unique scope, description carries trigger conditions |
| `setupdotclaude` | keep | unique scope, description carries trigger conditions |
| `sglang` | keep | unique scope, description carries trigger conditions |
| `shadcn` | keep | unique scope, description carries trigger conditions |
| `shader-dev` | keep | unique scope, description carries trigger conditions |
| `sheltered-instruction-lesson-modifier` | keep | unique scope, description carries trigger conditions |
| `ship` | keep | unique scope, description carries trigger conditions |
| `shipping-and-launch` | keep | unique scope, description carries trigger conditions |
| `shipping-artifacts` | keep | unique scope, description carries trigger conditions |
| `shopify-expert` | keep | unique scope, description carries trigger conditions |
| `shot` | keep | unique scope, description carries trigger conditions |
| `signup` | keep | unique scope, description carries trigger conditions |
| `simpo` | keep | unique scope, description carries trigger conditions |
| `single-point-rubric-designer` | keep | unique scope, description carries trigger conditions |
| `site-architecture` | keep | unique scope, description carries trigger conditions |
| `skill-creator` | keep | unique scope, description carries trigger conditions |
| `skill-development` | keep | unique scope, description carries trigger conditions |
| `skillify` | keep | unique scope, description carries trigger conditions |
| `skills-pr-review` | keep | unique scope, description carries trigger conditions |
| `skypilot` | keep | unique scope, description carries trigger conditions |
| `slack-gif-creator` | keep | unique scope, description carries trigger conditions |
| `slide-making-skill` | keep | unique scope, description carries trigger conditions |
| `slides` | keep | unique scope, description carries trigger conditions |
| `smart-explore` | keep | unique scope, description carries trigger conditions |
| `sms` | keep | unique scope, description carries trigger conditions |
| `social` | keep | unique scope, description carries trigger conditions |
| `social-reddit-card` | keep | unique scope, description carries trigger conditions |
| `socratic-questioning-sequence-generator` | keep | unique scope, description carries trigger conditions |
| `soft-skill` | keep | unique scope, description carries trigger conditions |
| `solidity-security` | keep | unique scope, description carries trigger conditions |
| `source-credibility-evaluation-protocol` | keep | unique scope, description carries trigger conditions |
| `source-driven-development` | keep | unique scope, description carries trigger conditions |
| `sourcing-skill-builder` | keep | unique scope, description carries trigger conditions |
| `spaced-practice-scheduler` | keep | unique scope, description carries trigger conditions |
| `spark-engineer` | keep | unique scope, description carries trigger conditions |
| `spark-optimization` | keep | unique scope, description carries trigger conditions |
| `spec-driven-development` | keep | unique scope, description carries trigger conditions |
| `spec-miner` | keep | unique scope, description carries trigger conditions |
| `spring-boot-engineer` | keep | unique scope, description carries trigger conditions |
| `sprint-plan` | keep | unique scope, description carries trigger conditions |
| `sql-injection-testing` | keep | unique scope, description carries trigger conditions |
| `sql-pro` | keep | unique scope, description carries trigger conditions |
| `sql-queries` | keep | unique scope, description carries trigger conditions |
| `sre-engineer` | keep | unique scope, description carries trigger conditions |
| `srl-session-wrapper` | keep | unique scope, description carries trigger conditions |
| `stakeholder-map` | keep | unique scope, description carries trigger conditions |
| `standup` | keep | unique scope, description carries trigger conditions |
| `startup-canvas` | keep | unique scope, description carries trigger conditions |
| `stitch-loop` | keep | unique scope, description carries trigger conditions |
| `stitch-skill` | keep | unique scope, description carries trigger conditions |
| `strategy-red-team` | keep | unique scope, description carries trigger conditions |
| `stripe-integration` | keep | unique scope, description carries trigger conditions |
| `stuck-and-error-diagnosis-coach` | keep | unique scope, description carries trigger conditions |
| `study-strategy-selector` | keep | unique scope, description carries trigger conditions |
| `subagent-driven-development` | keep | unique scope, description carries trigger conditions |
| `summarize-interview` | keep | unique scope, description carries trigger conditions |
| `summarize-meeting` | keep | unique scope, description carries trigger conditions |
| `swanlab` | keep | unique scope, description carries trigger conditions |
| `swap-curve-strategy` | keep | unique scope, description carries trigger conditions |
| `swift-expert` | keep | unique scope, description carries trigger conditions |
| `swiss-creative-mode-template` | keep | unique scope, description carries trigger conditions |
| `switch-project` | keep | unique scope, description carries trigger conditions |
| `swot-analysis` | keep | unique scope, description carries trigger conditions |
| `systematic-debugging` | keep | primary of systematic-debugging pair — absorb the others |
| `systems-awareness-iceberg` | keep | unique scope, description carries trigger conditions |
| `systems-wellbeing-impact-mapper` | keep | unique scope, description carries trigger conditions |
| `tailwind-design-system` | keep | unique scope, description carries trigger conditions |
| `tailwind-patterns` | keep | unique scope, description carries trigger conditions |
| `task-coordination-strategies` | keep | unique scope, description carries trigger conditions |
| `task-management` | keep | unique scope, description carries trigger conditions |
| `taste-skill` | keep | primary of taste-skill versions — absorb the others |
| `teach` | keep | unique scope, description carries trigger conditions |
| `teach-back-evaluator` | keep | unique scope, description carries trigger conditions |
| `teacher-inquiry-cycle-designer` | keep | unique scope, description carries trigger conditions |
| `team-communication-protocols` | keep | unique scope, description carries trigger conditions |
| `tear-sheet` | keep | unique scope, description carries trigger conditions |
| `technological-pedagogical-content-knowledge-developer` | keep | unique scope, description carries trigger conditions |
| `tensorboard` | keep | unique scope, description carries trigger conditions |
| `tensorrt-llm` | keep | unique scope, description carries trigger conditions |
| `terraform-engineer` | keep | unique scope, description carries trigger conditions |
| `terraform-specialist` | keep | unique scope, description carries trigger conditions |
| `test-driven-development` | keep | primary of TDD consolidation — absorb the others |
| `test-fixing` | keep | unique scope, description carries trigger conditions |
| `test-master` | keep | unique scope, description carries trigger conditions |
| `test-scenarios` | keep | unique scope, description carries trigger conditions |
| `test-writer` | keep | unique scope, description carries trigger conditions |
| `text-complexity-analyser` | keep | unique scope, description carries trigger conditions |
| `the-fool` | keep | unique scope, description carries trigger conditions |
| `theme-factory` | keep | unique scope, description carries trigger conditions |
| `thesis-tracker` | keep | unique scope, description carries trigger conditions |
| `think-aloud-script-generator` | keep | unique scope, description carries trigger conditions |
| `three-horizons-learning-transition-mapper` | keep | unique scope, description carries trigger conditions |
| `three-part-lesson-designer` | keep | unique scope, description carries trigger conditions |
| `timeline-report` | keep | unique scope, description carries trigger conditions |
| `to-issues` | keep | unique scope, description carries trigger conditions |
| `tool-design` | keep | unique scope, description carries trigger conditions |
| `top-web-vulnerabilities` | keep | unique scope, description carries trigger conditions |
| `track-management` | keep | unique scope, description carries trigger conditions |
| `train-sentence-transformers` | keep | unique scope, description carries trigger conditions |
| `transfer-bridge` | keep | unique scope, description carries trigger conditions |
| `transformer-lens` | keep | unique scope, description carries trigger conditions |
| `transformers-js` | keep | unique scope, description carries trigger conditions |
| `trauma-informed-practice-designer` | keep | unique scope, description carries trigger conditions |
| `triage` | keep | user-invoked only (disable-model-invocation) — generic name and thin description cannot mis-trigger |
| `trl-training` | keep | unique scope, description carries trigger conditions |
| `typescript-pro` | keep | unique scope, description carries trigger conditions |
| `ubuntu-collective-knowledge-task-designer` | keep | unique scope, description carries trigger conditions |
| `udl-barrier-anticipator` | keep | unique scope, description carries trigger conditions |
| `udl-lesson-auditor` | keep | unique scope, description carries trigger conditions |
| `udl-options-designer` | keep | unique scope, description carries trigger conditions |
| `ui-a11y` | keep | unique scope, description carries trigger conditions |
| `ui-review` | keep | unique scope, description carries trigger conditions |
| `ui-skills` | keep | unique scope, description carries trigger conditions |
| `ui-styling` | keep | unique scope, description carries trigger conditions |
| `ui-ux-pro-max` | keep | unique scope, description carries trigger conditions |
| `ultragoal` | keep | unique scope, description carries trigger conditions |
| `ultraqa` | keep | unique scope, description carries trigger conditions |
| `ultrawork` | keep | unique scope, description carries trigger conditions |
| `unassisted-evidence-checkpoint` | keep | unique scope, description carries trigger conditions |
| `understand` | keep | unique scope, description carries trigger conditions |
| `understand-chat` | keep | unique scope, description carries trigger conditions |
| `understand-dashboard` | keep | unique scope, description carries trigger conditions |
| `understand-diff` | keep | unique scope, description carries trigger conditions |
| `understand-domain` | keep | unique scope, description carries trigger conditions |
| `understand-explain` | keep | unique scope, description carries trigger conditions |
| `understand-knowledge` | keep | unique scope, description carries trigger conditions |
| `understand-onboard` | keep | unique scope, description carries trigger conditions |
| `uninterrupted-work-cycle-designer` | keep | unique scope, description carries trigger conditions |
| `unity-ecs-patterns` | keep | unique scope, description carries trigger conditions |
| `unsloth` | keep | unique scope, description carries trigger conditions |
| `user-personas` | keep | unique scope, description carries trigger conditions |
| `user-segmentation` | keep | unique scope, description carries trigger conditions |
| `user-stories` | keep | unique scope, description carries trigger conditions |
| `using-agent-skills` | keep | unique scope, description carries trigger conditions |
| `using-git-worktrees` | keep | unique scope, description carries trigger conditions |
| `using-superpowers` | keep | unique scope, description carries trigger conditions |
| `validate-idea` | keep | unique scope, description carries trigger conditions |
| `value-prop-statements` | keep | unique scope, description carries trigger conditions |
| `value-proposition` | keep | unique scope, description carries trigger conditions |
| `variation-theory-task-designer` | keep | unique scope, description carries trigger conditions |
| `vector-search` | keep | unique scope, description carries trigger conditions |
| `venice-audio-speech` | keep | unique scope, description carries trigger conditions |
| `verification-before-completion` | keep | unique scope, description carries trigger conditions |
| `version-bump` | keep | unique scope, description carries trigger conditions |
| `view-pdf` | keep | unique scope, description carries trigger conditions |
| `vision-analysis` | keep | unique scope, description carries trigger conditions |
| `visual-explainer` | keep | unique scope, description carries trigger conditions |
| `visual-skills-image` | keep | unique scope, description carries trigger conditions |
| `visual-skills-video` | keep | unique scope, description carries trigger conditions |
| `visual-verdict` | keep | unique scope, description carries trigger conditions |
| `vllm` | keep | unique scope, description carries trigger conditions |
| `vocabulary-tiering-tool` | keep | unique scope, description carries trigger conditions |
| `vue-expert` | keep | unique scope, description carries trigger conditions |
| `vue-expert-js` | keep | unique scope, description carries trigger conditions |
| `vulnerability-scanner` | keep | unique scope, description carries trigger conditions |
| `wasm-agent` | keep | unique scope, description carries trigger conditions |
| `wasm-gallery` | keep | unique scope, description carries trigger conditions |
| `wcag-audit-patterns` | keep | unique scope, description carries trigger conditions |
| `web-artifacts-builder` | keep | unique scope, description carries trigger conditions |
| `web-design-engineer` | keep | unique scope, description carries trigger conditions |
| `web-security-testing` | keep | unique scope, description carries trigger conditions |
| `web-video-presentation` | keep | unique scope, description carries trigger conditions |
| `web3-testing` | keep | unique scope, description carries trigger conditions |
| `webapp-testing` | keep | unique scope, description carries trigger conditions |
| `websocket-engineer` | keep | unique scope, description carries trigger conditions |
| `weekly-agency-review` | keep | unique scope, description carries trigger conditions |
| `weekly-digests` | keep | unique scope, description carries trigger conditions |
| `weights-and-biases` | keep | unique scope, description carries trigger conditions |
| `wellbeing-learning-connection-mapper` | keep | unique scope, description carries trigger conditions |
| `what-the` | keep | unique scope, description carries trigger conditions |
| `wiki` | keep | unique scope, description carries trigger conditions |
| `wiki-cli` | keep | unique scope, description carries trigger conditions |
| `wiki-fold` | keep | unique scope, description carries trigger conditions |
| `wiki-ingest` | keep | unique scope, description carries trigger conditions |
| `wiki-lint` | keep | unique scope, description carries trigger conditions |
| `wiki-mode` | keep | unique scope, description carries trigger conditions |
| `wiki-query` | keep | unique scope, description carries trigger conditions |
| `wiki-retrieve` | keep | unique scope, description carries trigger conditions |
| `wireframe-skill` | keep | primary of wireframe consolidation — absorb the others |
| `witness` | keep | unique scope, description carries trigger conditions |
| `wordpress-pro` | keep | unique scope, description carries trigger conditions |
| `worked-example-fading-designer` | keep | unique scope, description carries trigger conditions |
| `worked-example-to-problem-solving-transition-designer` | keep | unique scope, description carries trigger conditions |
| `workflow-patterns` | keep | unique scope, description carries trigger conditions |
| `wowerpoint` | keep | unique scope, description carries trigger conditions |
| `write-agentmemory-skill` | keep | unique scope, description carries trigger conditions |
| `writer-memory` | keep | unique scope, description carries trigger conditions |
| `writing-great-skills` | keep | unique scope, description carries trigger conditions |
| `writing-plans` | keep | unique scope, description carries trigger conditions |
| `writing-rules` | keep | unique scope, description carries trigger conditions |
| `writing-skills` | keep | unique scope, description carries trigger conditions |
| `wwas` | keep | unique scope, description carries trigger conditions |
| `xlsx` | keep | unique scope, description carries trigger conditions |
| `xlsx-author` | keep | unique scope, description carries trigger conditions |
