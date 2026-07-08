Vendored from https://github.com/bradautomates/claude-video at commit
83da59fa78c3eee9e20f515fe75c438bb5166efd, MIT licensed (Copyright (c) 2026
Bradley Bonanno).

The plugin's SessionStart hook (hooks/scripts/check-setup.sh) was reviewed
and copied to .claude/hooks/watch-check-setup.sh -- it's a read-only status
check (warns about missing ffmpeg/yt-dlp/API keys or loose .env permissions,
no destructive actions) -- but wiring it into .claude/settings.json requires
separate user confirmation since that file is hook-protected. Not yet wired.
