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
