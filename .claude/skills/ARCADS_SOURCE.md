These skills (`arcads-external-api` and the `shared/skills/*` folders below it) are
vendored from https://github.com/krusemediallc/arcads-claude-code at commit
`0b0d3610bbdcfcc2607c77a748d6abb341adda46`, MIT licensed (Copyright (c) 2026
Caleb Kruse / Kruse Media LLC — see `LICENSE`).

The upstream repo's setup scripts (`scripts/setup.sh`, `.env` credential
handling, `references/` image folders) were intentionally not copied. To use
these skills, add your own Arcads API key: see `arcads-external-api/SKILL.md`
for the required `.env` variables (`ARCADS_BASIC_AUTH` or `ARCADS_API_KEY`).
