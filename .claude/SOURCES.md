# SOURCES — provenance ledger for everything vendored into this repo

Single append-only record of every install: source repo, pinned commit,
license, what was installed, and what was skipped or removed and why.
New installs append a new dated section at the BOTTOM of this file.
Do not create separate per-batch *_SOURCES.md files.

Per-skill stamps that ship inside a skill folder (e.g.
`skills/taste-skill/SOURCE.md`) stay where they are; this file is the index.

---

## poshan0126/dotclaude

> NOTE (2026-07-07): the rules/, hooks/, settings.json, and LICENSE from this
> install were moved to `.claude/library/dotclaude/` so they no longer
> auto-load as live config. Paths below reflect the original install.

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

---

## Official Anthropic repos (anthropics/skills, anthropics/claude-plugins-official)

Attribution for the two "official" repos vendored from quemsah/awesome-claude-plugins'
leaderboard (that repo itself is just a scraped ranking site, not installable content
- see chat for why it wasn't installed wholesale).

## anthropics/skills
Commit `9d2f1ae187231d8199c64b5b762e1bdf2244733d`. License: NOT open-source/MIT -
each skill's LICENSE.txt states usage is governed by your agreement with Anthropic
regarding use of Anthropic's services (i.e. these are meant to be used with Claude/
Claude Code, which this repo is). See THIRD_PARTY_NOTICES.md upstream for embedded
third-party notices within individual skills.

Installed (17 skills): algorithmic-art, brand-guidelines, canvas-design, claude-api,
doc-coauthoring, docx, official-frontend-design (renamed from `frontend-design` to
avoid clobbering the pre-existing `frontend-design` skill from claude-code-video-toolkit
- the two are unrelated), internal-comms, mcp-builder, pdf, pptx, skill-creator,
slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx.

Skipped: `spec/` and `template/` (meta docs for the Agent Skills spec itself, not
installable skills).

## anthropics/claude-plugins-official
Commit `26db21ae4fa1748aaa74fc4c01d340aaac92f4f1`. License: Apache 2.0.

Installed:
- 21 skills (from `plugins/*/skills/`) - see `.claude/skills/`. Two plugins' skills
  were identical/near-identical to ones already installed from anthropics/skills
  (`skill-creator`, `frontend-design`) and were not duplicated.
- 29 commands (from `plugins/*/commands/`) - installed to `.claude/commands/`,
  each prefixed with its source plugin name (e.g. `hookify-help.md`) since several
  plugins ship generically-named commands (`help.md` appears in both `hookify` and
  `ralph-loop`) that would otherwise collide.
- 23 agents (from `plugins/*/agents/`) - installed to `.claude/agents/`. Several
  names collided with agents already installed from poshan0126/dotclaude
  (`code-reviewer`, `pr-test-analyzer`, `silent-failure-hunter`) or with each other
  (`code-simplifier` appears in both the `code-simplifier` and `pr-review-toolkit`
  plugins, with different content). Colliding ones were kept under BOTH names,
  prefixed with the plugin name for the newly-added copy - nothing was overwritten:
  - `feature-dev-code-reviewer.md`, `pr-review-toolkit-code-reviewer.md` - dotclaude's
    own `code-reviewer.md` is unchanged.
  - `pr-review-toolkit-pr-test-analyzer.md` - dotclaude's `pr-test-analyzer.md` unchanged.
  - `pr-review-toolkit-silent-failure-hunter.md` - dotclaude's `silent-failure-hunter.md` unchanged.
  - `pr-review-toolkit-code-simplifier.md` kept alongside the plain `code-simplifier.md`
    (from the `code-simplifier` plugin) - different write-ups of the same idea.
  You now have multiple takes on the same review agents; worth comparing and
  pruning down to one per role when you have a moment.

Deliberately NOT installed:
- 12 language-server plugins with no actual content beyond a README/LICENSE
  (`clangd-lsp`, `csharp-lsp`, `gopls-lsp`, `jdtls-lsp`, `kotlin-lsp`, `lua-lsp`,
  `php-lsp`, `pyright-lsp`, `ruby-lsp`, `rust-analyzer-lsp`, `swift-lsp`,
  `typescript-lsp`) - nothing to vendor, and this repo isn't tied to one language.
- Hooks from 5 plugins (`explanatory-output-style`, `hookify`, `learning-output-style`,
  `ralph-loop`, `security-guidance`) - these would auto-execute on tool use if wired
  into `settings.json`, same category of change as the dotclaude hooks that required
  explicit sign-off. Not reviewed/wired yet; ask if you want these installed too.
- `external_plugins/*` (asana, context7, discord, fakechat, firebase, github, gitlab,
  greptile, imessage, laravel-boost, linear, playwright, serena, telegram, terraform)
  - these are `.mcp.json` MCP-server connector configs, a different mechanism
  (project-level `.mcp.json` + per-service credentials) than skills/agents/commands.
  Not installed; say the word if you want any of these wired up.

---

## awesome-claude-plugins leaderboard batch

Attribution for the large batch installed from the quemsah/awesome-claude-plugins
leaderboard remainder (after excluding: entries already installed earlier in this
session, near-duplicate forks of the same project, and ~20 general-purpose dev
tools/frameworks that aren't actually Claude Code skills/plugins).

## Scale note

Several entries claimed far more content than expected once cloned (e.g.
antigravity-awesome-skills: 6,013 SKILL.md files; ECC: 887; claude-skills: 772).
Loading that many skill descriptions into context every session would make
Claude Code effectively unusable in this repo. Per your decision, these 11
"mega" repos were capped to a curated sample instead of installed in full:

| Repo | Full size | Installed | Method |
| --- | ---: | ---: | --- |
| antigravity-awesome-skills | 6,013 skills | 137 | The repo's own 14 "Recommended Specialized Plugins" bundles |
| Anthropic-Cybersecurity-Skills | 817 skills | 60 | Stride-sampled across the full alphabetical set (every 13th) |
| claude-skills (alirezarezvani) | 772 skills | 66 | First 4 per top-level category folder |
| ruflo | 344 skills (+ tool mirrors) | 60 | First 5 per plugin, scoped to plugins/ only (skipped .agents/, .claude/, v3/ mirrors of the same content) |
| open-design | 509 skills | 50 | Stride-sampled across skills/ |
| knowledge-work-plugins | 212 skills | 60 | First 4 per category (bio-research, sales, legal, etc.) |
| claude-for-legal | 151 skills | 55 | First 5 per practice-area category |
| agents (wshobson) | 158 skills | 60 | First 5 per plugin, scoped to plugins/ |
| financial-services | 117 skills | 50 | First 20 per category, scoped to plugins/ |
| AI-Research-SKILLs | 98 skills | 50 | First 4 per numbered research category |

All other repos below were installed in full.

## License issues found and excluded

Two repos were cloned, inspected, and then REMOVED after license review --
listed here so you know they were considered and why they didn't make the cut:

- ykdojo/claude-code-tips -- its LICENSE reads "Copyright (c) YK Sugi. All
  Rights Reserved," followed only by a contributor-license clause (rights you
  grant them by submitting a PR) -- not a license grant to users. No basis to
  redistribute it, so its 8 skills were removed after being installed.
- Imbad0202/academic-research-skills -- licensed CC BY-NC 4.0
  (NonCommercial). Given uncertainty about how this repo may end up being used,
  it was removed rather than assumed fine. Its 4 skills + 1 agent were removed
  after being installed. Reinstall it yourself if you're confident your use is
  noncommercial.

One repo carries a non-standard license worth knowing about:
- mksglu/context-mode -- Elastic License 2.0. Permits use, copying, and
  distribution, but explicitly forbids offering the software to third parties
  as a hosted/managed service. Fine for personal/internal use as installed here;
  don't repackage it as a hosted product.

Everything else below is MIT or Apache 2.0 (a couple README-only "License: MIT"
mentions with no separate LICENSE file: andrej-karpathy-skills, pua).

## Full repo list (installed in full unless noted above)

| Repo | Commit | License |
| --- | --- | --- |
| obra/superpowers | d884ae04edebef577e82ff7c4e143debd0bbec99 | MIT |
| affaan-m/ECC | 4130457d674d2180c5af2c5f634f3cae4cbc6c4f | MIT (capped) |
| multica-ai/andrej-karpathy-skills | 2c606141936f1eeef17fa3043a72095b4765b9c2 | MIT (README-stated) |
| thedotmack/claude-mem | e02494852c992bc6b22b927b0c8f9612fe0cb96a | Apache 2.0 |
| JuliusBrussee/caveman | 0d95a81d35a9f2d123a5e9430d1cfc43d55f1bb0 | MIT |
| nexu-io/open-design | 143830af5958cb4b8bf92ca39648947082fe410d | Apache 2.0 (capped) |
| DietrichGebert/ponytail | 40e50d9e03242aa5dd53ac771950f9127362b25f | MIT |
| Egonex-AI/Understand-Anything | 0e8ad84a2a5236dca533beef618d71ee3f4568f6 | MIT |
| addyosmani/agent-skills | 8c6530305396f341b5da7201cf1f7e390fdb863f | MIT |
| ruvnet/ruflo | a5f86ad0ada8aca3e8f664202a452714355990f5 | MIT (capped) |
| mem0ai/mem0 | cd79fa8914b5b1cf66daacc957d826065df57df8 | Apache 2.0 |
| santifer/career-ops | 220288e93753933ceafe12f7bcb71ae6788bdeb0 | MIT |
| MemPalace/mempalace | da5a48caf5d8a843df7568a00e44c714bd91ab11 | MIT |
| headroomlabs-ai/headroom | e8151f059b4a9ba3fa43c7c67a7d310af08c1f3d | Apache 2.0 |
| bmad-code-org/BMAD-METHOD | 50b3238abb598c8f00725536c8dd2463c87307db | MIT |
| mvanhorn/last30days-skill | a5b3ca1f3ccd76eb176603991ae1ec1e07105ce0 | MIT |
| pbakaus/impeccable | 582f23eae3c9ef4db71366e944b0555d65b7aacc | Apache 2.0 |
| sickn33/antigravity-awesome-skills | 7595cdf403884c25112f8b06450b5f846244a845 | CC BY 4.0 (capped) |
| kepano/obsidian-skills | a1dc48e68138490d522c04cbf5822214c6eb1202 | MIT |
| wshobson/agents | 5cc2549a50fc672230efd0a0307e2fd27ffba792 | MIT (capped) |
| Yeachan-Heo/oh-my-claudecode | d41f1730a71dfbb472424406a765efea5b5f10f0 | MIT |
| hugohe3/ppt-master | a1f206f98ebceec683e033a2119849885015af48 | MIT |
| coreyhaines31/marketingskills | 30dbd7f793b86f0ec2f007757b333afac93c24db | MIT |
| anthropics/financial-services | 4aa51ed3d379731f8f9beff498d749580372699c | Apache 2.0 (capped) |
| eyaltoledano/claude-task-master | c0c98d367c55296bfe69e65680625b6db437af02 | MIT |
| blader/humanizer | 1b48564898e999219882660237fde01bf4843a0f | MIT |
| jarrodwatts/claude-hud | b83b44593af24de1db6183788a51d08715501c02 | MIT |
| gastownhall/beads | 1914af58528b06936e26193f52a091ff211402c5 | MIT |
| rohitg00/agentmemory | 93ae9bc04f3ab5042f982aaadf11f1e3f5137531 | Apache 2.0 |
| OthmanAdi/planning-with-files | 8459756b18998f5f99d0325c3ee28043fd423760 | MIT |
| zarazhangrui/frontend-slides | 9906a34d640d2111f724544cbc50f7f130569ae1 | MIT |
| mukul975/Anthropic-Cybersecurity-Skills | 673da1f3b0b7be34ffc9624ef3858fe45f1c3bed | Apache 2.0 (capped) |
| openai/codex-plugin-cc | 80c31f99570876c3ef40327838b0a2ca1ae2cd9c | Apache 2.0 |
| JimLiu/baoyu-skills | 6b7a2e417500561a5ecdd0b168332f4142584617 | MIT |
| VoltAgent/awesome-claude-code-subagents | c193ad45419c13ceb49a43740186f680ad5ea264 | MIT |
| EveryInc/compound-engineering-plugin | d3f35297adccea3ad8735e988253966ffa8cf74c | MIT |
| phuryn/pm-skills | 18468a95b427e70e258b51389796367c6f684e7d | MIT |
| anthropics/knowledge-work-plugins | 6f13415be2a18d0fd9fa652e29a616cf7e3617a5 | Apache 2.0 (capped) |
| snarktank/ralph | 6c53cb0b831ebe8739c6a003e22af14902d8b0b5 | MIT |
| alirezarezvani/claude-skills | 1bd5b1a0b51c91f6e3335592c2b41ffb9b543002 | MIT (capped) |
| tanweai/pua | f0a2f913a0d2c9188b7fea432b9dc7aa99049ce4 | MIT (README-stated) |
| mksglu/context-mode | aa4e96589f6553c4e130e6dbb1e0f1428032093b | Elastic License 2.0 (see above) |
| vectorize-io/hindsight | 016b5f03639eb44f9f54ce1fd624d0f4792aac46 | MIT |
| muratcankoylan/Agent-Skills-for-Context-Engineering | 175cee7c25b5d98d919369f53427c646cdd86d93 | MIT |
| MiniMax-AI/skills | 60aaae52bb2af8162732751a4332f62a5fef518b | MIT |
| greensock/gsap-skills | aed9cfd3277740755f6bfc1155c7aa645403b760 | MIT |
| huggingface/skills | 4948baec814c92edd91024b76d8c2ffa6df4eb70 | Apache 2.0 |
| AgriciDaniel/claude-seo | d830cdb2ad339bb7f062339fe82228b072e98061 | MIT |
| Jeffallan/claude-skills | e8be415bc94d8d6ebddc2fb50e5d03c6e27d4319 | MIT |
| Orchestra-Research/AI-Research-SKILLs | 773a52944ba4747a18bd4ae9ade53fff041adcbc | MIT (capped) |
| slavingia/skills | eb9f57fba03ddb0382ed3bfe6654d3d7df128c70 | MIT (plugin.json-stated) |
| nicobailon/visual-explainer | 528b71feb85dab5d92b82c3554880826f50a75da | MIT |
| ConardLi/garden-skills | fbd6453c984e2a150c9553efe3075e1f62338df8 | MIT |
| AgriciDaniel/claude-obsidian | cb93ff6d82f9c35a08bf6010e7fac36dfddc827b | MIT |
| anthropics/claude-for-legal | 5ceb305b30b4c82653c9b6642499c12e946ec319 | Apache 2.0 (capped) |

## Cleanup performed during install

- Fixed 6 dangling symlinks left over from repos that mirror the same skill to
  multiple agent-tool directories (.claude/skills/, .agents/skills/, etc.) --
  replaced with the dereferenced real file.
- Removed a stray openclaw folder (claude-mem repo): a full npm package with
  install scripts and Docker test infra that got swept in because it happened
  to contain a top-level SKILL.md, not a real lightweight skill.
- Deduplicated 12 skills that had been installed twice under a
  self-referential name-name folder pattern (e.g. beads-beads,
  caveman-caveman) because their source repos publish the same skill to
  several agent-tool mirror directories; kept whichever copy was more complete.
- Removed 4 non-skill directories (_template, commands, gmail, notion,
  apify from career-ops/oh-my-claudecode) that were swept in by case-insensitive
  matching on a lowercase skill.md convention used by those repos' own
  internal plugin systems -- not actual Claude Code SKILL.md skills.

## What was NOT installed from this batch

~20 entries from the leaderboard were skipped because they're general-purpose
software (CSS libraries, ML platforms, CI tools, network scanners, etc.) that
happened to get swept into the "Claude Code plugins" scrape rather than being
skills/plugins themselves -- e.g. daisyui, payload, mlflow, kubeshark, es-toolkit,
ginkgo, CopilotKit, promptfoo, deepeval, skypilot, ag-ui, pipecat, superset,
InsForge, tambo, mcp-use, open-code-review, prowler, awesome-web-security, Kami,
daily, qmd, repomix, browser-harness, agent-browser, GitNexus, CLI-Anything,
chrome-devtools-mcp, context7, slidev, RuView, prompts.chat, and the claude-code
CLI itself. Several near-duplicate forks of the same project were also skipped
in favor of the higher-starred original (Understand-Anything, mempalace,
headroom, beads each had a second fork excluded).

---

## Arcads (krusemediallc/arcads-claude-code)

These skills (`arcads-external-api` and the `shared/skills/*` folders below it) are
vendored from https://github.com/krusemediallc/arcads-claude-code at commit
`0b0d3610bbdcfcc2607c77a748d6abb341adda46`, MIT licensed (Copyright (c) 2026
Caleb Kruse / Kruse Media LLC — see `LICENSE`).

The upstream repo's setup scripts (`scripts/setup.sh`, `.env` credential
handling, `references/` image folders) were intentionally not copied. To use
these skills, add your own Arcads API key: see `arcads-external-api/SKILL.md`
for the required `.env` variables (`ARCADS_BASIC_AUTH` or `ARCADS_API_KEY`).

---

## Design, video, and education skill batches

> NOTE: originally recorded in `skills/SOURCES.md`; references to `ARCADS_SOURCE.md` now point to the Arcads section above.

Attribution for skills vendored into `.claude/skills/` beyond the Arcads and
Leonxlnx/taste-skill batches (see `ARCADS_SOURCE.md` and
`taste-skill/SOURCE.md` for those).

| Folder(s) installed | Source repo | Commit | License |
| --- | --- | --- | --- |
| `org-design` | https://github.com/cpj-fyi/Org-Design | `84b6d3062fbaf0590210d635ceabf10a2362890d` | MIT |
| `mobile-app-ui-design` | https://github.com/ceorkm/mobile-app-ui-design | `4c67a0e71727b6afaaafbcbb1b11c7660de5fac9` | MIT |
| `mobile-app-design` | https://github.com/awesome-skills/mobile-app-design | `83e4721da7d19f0094d5e2af155d77dc2d63889c` | MIT |
| `banner-design`, `brand`, `design-system`, `design`, `slides`, `ui-styling`, `ui-ux-pro-max` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (from `.claude/skills/`) | `4baa399d00da806f83ed93652172f66943205153` | MIT (see each folder's `LICENSE`) |
| `claude-wireframe-skill` | https://github.com/Magdoub/claude-wireframe-skill | `44a5814d1583c4dc7cafa36611838669f0895af9` | MIT |
| `baoyu-design` | https://github.com/JimLiu/baoyu-design (from `skills/baoyu-design/`; the repo's `release-skills` maintainer skill was intentionally skipped) | `2e30c7c4505cba221911586a7a09628172ebb940` | MIT |
| `wireframe-skill` | https://github.com/yhassy/wireframe-skill | `948d4331343b18d913d5bc502da72ed0c5f19101` | MIT |
| `visual-skills-image`, `visual-skills-video` | https://github.com/smixs/visual-skills (folders `image/` and `video/`) | `50905021f4243df27e34cb42c7ae263c03d9306a` | MIT |
| `acestep`, `elevenlabs`, `ffmpeg`, `frontend-design`, `ideogram4`, `ltx2`, `moviepy`, `playwright-recording`, `qwen-edit`, `remotion-official`, `remotion`, `runpod` | https://github.com/digitalsamba/claude-code-video-toolkit (from `.claude/skills/`; the repo's `skills/openclaw-video-toolkit` orchestrator, built for the separate "openclaw" runtime, was intentionally skipped) | `9826feb491cffe18367e85f6f759bffcfb93d3da` | MIT (see each folder's `LICENSE`) |
| `ai-media-generator` | https://github.com/Hao0321/ai-media-generator | `fdb63315f851792c2e342288b6c3b696077d94b9` | MIT |
| 165 skills under `skills/*/*/` in the source repo, flattened here to one folder per skill (category grouping dropped since Claude Code discovers skills as direct children of `.claude/skills/`) | https://github.com/GarethManning/education-agent-skills | `9c06a5c557bf929c8e6b702056fcd0f56836670b` | **CC BY-SA 4.0** (share-alike — modifications/redistribution of these specific skills must carry the same license and attribution) |

Setup scripts, `.env`/API-key handling, CLI packaging, and non-skill reference
assets (screenshots, example projects, docs sites) from each source repo were
left out; only the `SKILL.md` (+ its supporting scripts/references) for each
skill was vendored.

---

<!-- Append new install sections below this line. -->
