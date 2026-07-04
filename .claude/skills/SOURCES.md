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
