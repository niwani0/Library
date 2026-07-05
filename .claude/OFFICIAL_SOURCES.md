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
