---
name: olmocr
description: Convert PDFs, PNGs, and JPEGs into clean Markdown/plain text using AllenAI's olmOCR toolkit. Use when the user wants to OCR a scanned or image-based document, extract readable text from a PDF with complex layout (tables, equations, multi-column, handwriting), or convert documents to Markdown at scale. Requires the olmocr package and either a local GPU or a reachable vLLM/OpenAI-compatible inference server — this skill does not itself perform OCR, it drives the CLI once set up.
---

# olmOCR (AllenAI)

Wrapper skill for https://github.com/allenai/olmocr (Apache 2.0). olmOCR is
a real, heavyweight OCR pipeline built on a 7B-parameter vision-language
model — it is not a lightweight instruction set, and this skill cannot run
OCR by itself. Confirm the user has (or is willing to set up) one of the
inference paths below before promising results.

## Prerequisites — pick one inference path

1. **Local GPU** — a recent NVIDIA GPU with ≥12GB VRAM (RTX 4090 / L40S /
   A100 / H100 class) and ~30GB free disk for model weights.
2. **Remote inference server** — any vLLM or OpenAI-API-compatible endpoint
   already serving an olmOCR model (self-hosted, or one of the external
   providers the upstream README lists as verified, e.g. a vLLM instance
   running `vllm serve allenai/olmOCR-2-7B-1025-FP8 --max-model-len 16384`).

Also needs system packages for PDF rendering: `poppler-utils` plus a few
font packages (`ttf-mscorefonts-installer`, `msttcorefonts`,
`fonts-crosextra-caladea`, `fonts-crosextra-carlito`, `gsfonts`,
`lcdf-typetools` on Debian/Ubuntu).

## Install

Use a clean virtualenv/conda env — olmOCR's dependency set conflicts with
a lot of existing Python environments.

```bash
# Remote-inference only (no GPU deps, ~small install)
pip install olmocr

# Local GPU inference
pip install olmocr[gpu] --extra-index-url https://download.pytorch.org/whl/cu128
```

## Run

```bash
# Local GPU, single PDF or image, output as Markdown
olmocr ./localworkspace --markdown --pdfs some-file.pdf

# Multiple files via glob
olmocr ./localworkspace --markdown --pdfs docs/*.pdf

# Against a remote/already-running inference server instead of spawning one locally
olmocr ./localworkspace --server http://remote-server:8000/v1 \
  --model allenai/olmOCR-2-7B-1025-FP8 --markdown --pdfs *.pdf
```

With `--markdown`, converted output lands in `./localworkspace/markdown/<name>.md`.
Without it, results are written in Dolma-style JSONL instead — ask the user
which they want before running.

## Workflow

1. Confirm which inference path applies (local GPU vs remote server) and
   that `olmocr` is actually installed — check with `python -m olmocr.pipeline --help` or `olmocr --help` rather than assuming.
2. Confirm the workspace directory and whether `--markdown` output is wanted.
3. Run the conversion, then read back the resulting file(s) to the user
   rather than just reporting the command succeeded.
4. For anything beyond a handful of files, warn about cost/GPU-time before
   running — this is a real inference workload, not free/instant.

## Out of scope

- Training or fine-tuning olmOCR models (see the upstream repo's `olmocr/train` if asked).
- Running the olmOCR-Bench benchmark suite (`pip install olmocr[bench]`) unless specifically requested.
- Any use case better served by a lightweight OCR library — reach for this only when layout fidelity (tables, equations, multi-column, handwriting) actually matters.
