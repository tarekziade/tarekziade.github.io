---
layout: post
title: "Catching Code Complexity with a Local LLM"
date: 2026-01-31
author: "Tarek Ziade"
tags: [llm, performance, transformers, tooling, rust]
---

Performance issues in Python often don’t look like bugs.

They don’t crash, they don’t fail tests, and they don’t stand out in code review.
They just quietly turn into cliffs when the input size grows.

This post is about one such performance fix in `transformers`, what it revealed,
and a small experiment that came out of it: **LoopSleuth**, a local LLM-powered
complexity scanner.

## It Started With a Tokenizer Converter

While working on `transformers`, I fixed a performance issue in
[`convert_slow_tokenizer.py`](https://github.com/huggingface/transformers/blob/main/src/transformers/convert_slow_tokenizer.py)
that took a tokenizer conversion step from **4 minutes** down to **~1 second**
when running on very large vocabularies (100k+ tokens).

### The Test That Surfaced It

This started when CI flagged `test_voxtral_tokenizer_converts_from_tekken` as
the slowest test in the suite.

The test loads `mistralai/Voxtral-Mini-3B-2507` and forces the fallback path to
`TokenizersBackend`.

That fallback triggers the slow→fast tokenizer conversion step — and that
conversion was doing repeated `.index()` lookups inside a sort key, turning
large vocabularies into a performance cliff.

The root cause was a classic scaling trap.

### The Original Pattern

```python
# BEFORE (simplified excerpt)
for rank, token in enumerate(bpe_ranks):
    local = sorted(
        local,
        key=lambda x: (
            bpe_ranks.index(x[0]),
            bpe_ranks.index(x[1]),
        ),
    )
```

(Simplified excerpt — the key issue is the repeated `.index()` inside the sort
key.)

At first glance this looks harmless.

But `list.index()` is **O(n)**.

And the real killer is that it happens inside a `sorted()` key function.

Sorting `local` means computing the key for every element, and each key performs
two linear searches through `bpe_ranks`: `sorted()` calls the key function once
per element (O(m)), and each key calls `.index()` twice (O(n)), so the total
becomes O(m·n) — often a scaling trap when m and n are both large.

### The Fix

```python
# AFTER (reduces key computation from O(n) to O(1))
token_to_rank = {token: rank for rank, token in enumerate(bpe_ranks)}

for rank, token in enumerate(bpe_ranks):
    local = sorted(
        local,
        key=lambda x: (
            token_to_rank[x[0]],
            token_to_rank[x[1]],
        ),
    )
```

The optimization is simple:

- replace repeated linear searches with constant-time dictionary lookups

This doesn't eliminate all sorting work (the outer loop still sorts repeatedly),
but it removes the quadratic lookup cost that was dominating runtime.

The takeaway wasn't just "use dicts" — it was that asymptotic traps often hide
in perfectly valid Python idioms.

## Could This Have Been Caught Automatically?

After landing that fix, I kept wondering:

> How many other places in the codebase have the exact same pattern?

This wasn't a correctness issue:

- everything worked
- tests passed
- the slowdown only appeared at scale

And none of the linting tools I normally rely on flagged it.

Ruff's PERF rules catch obvious constructs like unnecessary list copies, but
they don't reason about `.index()` inside a sort key.

In theory, a linter *could* detect patterns like:

- repeated `.index()` inside loops
- `.index()` inside sort keys
- nested iteration over growing structures

But most rule-based linters avoid making strong claims about asymptotic
complexity.

That’s a reasonable trade-off: linters are fast, deterministic, and low-noise —
but they often miss scaling issues unless you add very specific custom rules.

This is where I started wondering whether an LLM could help fill the gap.

## Scanning Transformers With Claude

As an experiment, I ran Claude Code over the repository with one question:

> Find quadratic complexity patterns similar to the tokenizer converter bug.

The result was surprisingly useful.

It scanned ~3,000 Python functions across the codebase in a few minutes and
flagged ~20 instances of the same anti-pattern:

- `.index()` inside loops
- `.index()` inside sort keys
- nested iteration patterns with superlinear blow-up at scale

About half were genuine hot-path candidates; others were technically quadratic
but not performance-critical in practice.

For example:

```python
ymls.sort(key=lambda x: results.index(x[:-4]))
```

Or:

```python
aspect_ratios_ids[i, j] = supported_aspect_ratios.index(ratio)
```

All fixable with the same technique:

```python
lookup = {val: idx for idx, val in enumerate(reference)}
```

This report was a great proof of concept.

But it relied on a large hosted model.

## The Question Became: Can This Work Locally?

Instead of running a massive model in the cloud, I wanted to know:

- could a small local model catch these patterns?
- could we build something closer to a linter?
- could we automate complexity review?

That’s how I ended up hacking together a small prototype I called **LoopSleuth**.

## Why Rust + llama.cpp?

My first instinct was to build this as a Python script on top of
`transformers` itself.

But I wanted this experiment to be:

- fast startup time
- easy CI binary distribution
- no Python runtime dependency
- easy to integrate into tooling

A single static binary makes it easy to drop into CI, like Ruff.

And honestly, I also wanted an excuse to explore the Rust ecosystem that powers
tools like **Ruff** and **Ty**.

So LoopSleuth is written in Rust and uses:

- `rustpython-parser` to extract functions
- `llama.cpp` bindings for local inference

In practice, a small model like **Qwen2.5-Coder 3B (Q4)** already gives
surprisingly good results for this narrow task.

## LoopSleuth: A Small Complexity Scanner

LoopSleuth is a CLI tool that:

1. parses Python modules
2. extracts functions (each function is analyzed in isolation: signature + body, without full module context)
3. sends each function to a local LLM
4. asks a focused question:

> Does this contain patterns that may scale quadratically?

If the model answers "QUADRATIC", it also asks for an optimization suggestion.

This framing treats complexity as a heuristic warning (like a linter) rather
than a mathematical proof.

### How It Works

The prompt is deliberately simple and constrained:

```
Classify this function as OK or QUADRATIC.
Look for list.index(), nested loops, or linear operations inside loops.
Return only one word: OK or QUADRATIC.
```

This makes the model focus on structural patterns rather than trying to perform
full dataflow analysis, and the constrained output format makes parsing reliable.

Example output:

```
⚠️  Functions with O(n²) complexity: 5

🔴 QUADRATIC COMPLEXITY DETECTED IN:
  • bubble_sort
  • find_duplicates
  • remove_elements
  • string_concatenation
  • nested_comparison
```

Because it’s a CLI, it can be used in a few practical ways:

- as a local complexity scanner during development
- as a lightweight pre-pass before calling a large cloud model (reducing token usage)
- as a GitHub Action on pull requests to catch patches that introduce quadratic behavior

## Why Not Just Use Existing Linters?

Before building anything, I tried the usual suspects.

Tools like **Ruff**, **Pylint**, and performance-focused plugins can catch a lot:

- Pylint warns about string concatenation in loops (`consider-using-join`)
- Ruff has `PERF` rules inspired by Perflint

But none of the linters I tried really caught the pattern that triggered this
whole experiment:

- repeated `.index()` lookups inside loops
- `.index()` inside sort key functions
- nested iteration patterns that only become problematic at scale

These tools are excellent at enforcing specific rules, but they generally don’t
try to answer:

> “Does this function scale quadratically with input size?”

That gap is what made the LLM approach interesting to explore.

### A Quick Comparison

One thing I wanted to sanity-check early was whether existing linters would
catch the same issues.

So I built a small test file with a handful of intentionally quadratic
functions (nested loops, `.remove()` in loops, string concatenation, etc.) and
ran:

- LoopSleuth
- Ruff (with `--select ALL`)
- Pylint

The results were pretty stark:

| Tool       | Detects `.index()` in loop? | Reports complexity? |
|------------|----------------------------|---------------------|
| Ruff       | ❌                          | ❌                   |
| Pylint     | ❌                          | ❌                   |
| LoopSleuth | ✅                          | ✅ (heuristic)       |

LoopSleuth flagged all 5 quadratic functions, while Ruff and Pylint flagged
plenty of style and quality issues but neither directly reported algorithmic
complexity problems.

This isn't really a criticism of those tools — they're simply not designed for
that job.

I wrote up the full comparison here:

- [LoopSleuth vs Linters Comparison](https://github.com/tarekziade/loopsleuth/blob/main/COMPARISON.md)

To be clear, there may be ways to approximate some of these checks with custom
rules or plugins, and linters remain the first line of defense for code quality.

LoopSleuth is just exploring a different axis: scaling behavior.

## Still an Experiment

LoopSleuth is not a replacement for linters.

It's a small experiment.

Traditional linters like Ruff or Pylint excel at catching specific code smells.
But most scaling bugs don't come from a single construct.
They come from composition:

- nested iteration
- repeated membership checks
- linear operations inside loops

Rule-based linters struggle to infer:

- "this `.index()` is inside a hot path"
- "this loop is over the same input size"
- "this becomes O(n²) at scale"

LLMs, even small ones, can often reason about these patterns more directly.

That said, LoopSleuth runs against isolated Python functions one by one, which
means it doesn't yet understand:

- cross-function context
- runtime sizes
- whether a loop is actually hot in practice

### Limitations

Like any heuristic tool, LoopSleuth has trade-offs:

**False positives:**
- small fixed-size loops that never scale
- code in non-hot paths
- patterns that look quadratic but have early exits

**False negatives:**
- complexity hidden across function calls
- indirect iteration patterns
- subtle algorithm choices

The accuracy depends heavily on prompt design and model choice.

**Important:** LoopSleuth is a screening tool, not a replacement for profiling
or benchmarking. It flags patterns that may cause issues, but only real
measurements can confirm actual performance problems.

More broadly, I'm interested in whether this approach can extend beyond
complexity analysis to other classes of performance issues.

One direction would be to build a small library of prompts for:

- repeated tensor conversions
- hidden CPU/GPU sync points
- accidental re-tokenization

And in an ideal world, we could fine-tune a small model (like Qwen2.5-Coder 3B)
to specialize on this kind of performance reasoning.

### What's Next

If this experiment proves useful, here are some directions worth exploring:

- **AST-based prefiltering** to skip obviously safe functions
- **Caching inference results** to avoid re-analyzing unchanged code
- **Training on real perf bugs** from issue trackers and PRs
- **GitHub Actions integration** to catch regressions in CI

Right now LoopSleuth is a proof of concept, but these extensions could make it
practical for real codebases.

## Conclusion

LoopSleuth started as a simple question:

> Could we catch quadratic complexity bugs automatically?

The answer is: not perfectly.

But even a small local model can spot surprising amounts of hidden O(n²)
behavior.

And as codebases grow — especially ones like `transformers` — performance traps
scale with them.

LoopSleuth is a small experiment toward making complexity visible earlier.

If you're interested, the project is here:

- [LoopSleuth on GitHub](https://github.com/tarekziade/loopsleuth)

If you have examples of hidden scaling bugs or want to contribute detection
patterns, I'd love to collect them as test cases. Feel free to try it locally or
open an issue.

