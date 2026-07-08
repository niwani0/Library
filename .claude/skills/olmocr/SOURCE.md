Wrapper skill for https://github.com/allenai/olmocr at commit
f7cfe4c22098b154c76b6ec950d1c0a464eecf8d, Apache 2.0 licensed.

olmocr itself is not a Claude Code skill/plugin -- it's AllenAI's real OCR
pipeline (7B-parameter vision-language model, needs a GPU or a reachable
vLLM/OpenAI-compatible inference server). This SKILL.md is an original
summary of the upstream README's install/usage instructions, written to
teach Claude Code how to drive the `olmocr` CLI once the user has it set
up -- it does not vendor the actual package, model weights, or any
verbatim README text.
