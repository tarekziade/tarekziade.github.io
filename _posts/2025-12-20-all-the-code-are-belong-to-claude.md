---
layout: post
title: "all the code are belong to claude*"
date: 2025-12-20
categories: ai
tags: [ai, claude, rust, tooling]
---


I have been writing code for a long time, long enough to be suspicious of tools
that claim to fundamentally change how I work. And yet, here we are.

The latest iterations of Claude Code are genuinely impressive. Not in a flashy
demo way, but in the quiet, dangerous way where you suddenly realize you have
delegated large parts of your thinking to it. This post is about that
experience, how Claude helped me build `rustnn`, what worked remarkably well,
and where I had to consciously pull myself back.

## Claude as a serious coding partner

For rustnn, I leaned heavily on Claude Code. The quality of the generated Rust
was consistently high. Beyond producing correct syntax, it reasoned about what
the code was supposed to do. It was context-aware in a way that made iterative
design feel natural. I could ask for refactors, architectural changes, or
alternative approaches, and get answers that actually respected the existing
codebase and long-running tests.

This mirrors what many developers have been reporting toward the end of 2025.
Claude Code’s agent-oriented design and large-context reasoning make it
particularly strong for repository-wide work: multi-file refactors, non-trivial
debugging sessions, and architectural changes that need to fit an existing
mental model. Compared to Codex-style systems, which still shine for fast edits
and local completions, Claude tends to perform better when the task requires
sustained reasoning and understanding of project-wide constraints.

Anthropic’s recent Claude releases have reinforced that positioning.
Improvements in long-context handling, reasoning depth, and agentic workflows
make it easier to treat Claude as something closer to a collaborator than an
autocomplete engine.

The turning point for me was when I stopped treating Claude like a chat bot and
started treating it like a constrained agent.

That is where CLAUDE.md comes in.

## Tuning CLAUDE.md

I stumbled upon an excellent LangChain article on how to turn Claude Code into a
domain-specific coding agent.

It clicked immediately. Instead of repeatedly explaining the same constraints,
goals, and conventions, I encoded them once. Rust style rules. Project intent.
Explicit boundaries. How to react to test failures.

The effect was immediate. Output quality improved, and the amount of
back-and-forth dropped significantly. Claude stopped proposing things that were
clearly out of scope and started behaving like someone who had actually read and
understood the project.

For rustnn, I went one step further and anchored development around WPT
conformance tests. That gave both Claude and me a shared, objective target.
Tests either pass or they do not. No bikeshedding.

Tweaking CLAUDE.md quickly revealed itself as a never-ending process. There are
plenty of articles describing different approaches, and none of them are
definitive. The current direction seems to be layering information across
multiple files, structuring project documentation so it is optimized for agent
consumption while remaining readable for humans, and doing so without
duplicating the same knowledge in multiple places.

That balance turns out to be just as important as the model itself.


## The slippery slope

There is a trap though, and it is a subtle one.

Once Claude is good enough, you start routing *everything* through it.

- Re-running tests.  
- Interpreting obvious build errors.  
- Copying and pasting logs that you already understand.

It feels efficient, but it is not free. Each interaction has a cost, and when
you are in a tight edit-build-test loop, those costs add up fast. Worse, you
start outsourcing mechanical thinking that you should probably still be doing
yourself.

I definitely fell into that trap.

## Reducing costs

The solution, for me, was to drastically reduce how much I talk to Claude, and
to stop using its prompt environment as a catch-all interface to the project.

Claude became an extra terminal. One I open for very specific tasks, then close.
It is not a substitute for my own brain, nor for the normal edit–build–test
loop.

Reducing the context window is also critical. A concrete example is Python
tracebacks. They are verbose, repetitive, and largely machine-generated noise.
Sending full tracebacks back to the model is almost always wasteful.

That is why I added a hook to rewrite them on the fly into a compact form.

The idea is simple: keep the signal, drop the boilerplate. Same information, far
fewer tokens. In practice, this not only lowers costs, it often produces better
answers because the model is no longer drowning in irrelevant frames and runtime
noise. On Python-heavy codebases, this change alone reduced my usage costs by
roughly 20%.

Pre-compacting inputs turned out to be one of the most effective cost-control
strategies I have found so far, especially when combined with a more deliberate,
intentional way of interacting with the model.

## Memory across sessions actually matters

Another pain point is session amnesia. You carefully explain design decisions,
trade-offs, and long-term goals, only to repeat them again tomorrow.

A well-crafted `CLAUDE.md` mitigates part of this problem. It works well for
static knowledge: coding style, project constraints, architectural boundaries,
and things that rarely change. It gives Claude a stable baseline and avoids a
lot of repetitive explanations.

But it does not capture evolving context.

It does not remember why a specific workaround exists, which approach you
rejected last week, or what subtle behavior a particular test exposed yesterday.
As soon as the session ends, that knowledge is gone, and you are back to
re-teaching the same mental model.

This is where cross-session, cross-project memory becomes interesting.

I am currently experimenting with `claude-mem` 

The idea is simple but powerful: maintain a centralized, persistent memory that
is automatically updated based on interactions. Instead of manually curating
context, relevant facts, decisions, and preferences are summarized and carried
forward. Over time, this builds a lightweight but durable understanding of how
*you* work and how your projects evolve.

Compared to `CLAUDE.md`, this kind of memory is dynamic rather than declarative.
It captures intent, not just rules. It also scales across projects, which
matters when you jump between repositories that share design philosophy,
tooling, or constraints.

It is still early, and it is not magic. You need to be careful about what gets
remembered and how summaries are formed. But the direction feels right.
Persistent memory reduces cognitive reset costs, shortens warm-up time, and
makes the interaction feel less like starting over and more like continuing a
conversation you paused yesterday.

That difference adds up.

## Final thoughts

Claude Code is good. Very good. Good enough that you need discipline to use it
well.

With a tuned `CLAUDE.md`, clear test-driven goals like WPT conformance, and some
tooling to reduce noise and cost, it becomes a powerful accelerator. Without
that discipline, it is easy to overuse it and slowly burn budget on things you
already know how to do.

I do not think this replaces engineering skill. If anything, it amplifies both
good and bad habits. The trick is to make sure it is amplifying the right ones.

## References

- [My Claude tools](https://github.com/tarekziade/claude-tools) 
- [How to Turn Claude Code into a Domain-Specific Coding Agent](https://blog.langchain.com/how-to-turn-claude-code-into-a-domain-specific-coding-agent/)
- [OpenAI Codex vs GitHub Copilot vs Claude](https://www.allaboutai.com/ai-agents/open-ai-codex-vs-github-copilot-vs-claude/)
- [Anthropic bolsters AI model Claude’s coding and agentic abilities with Opus 4.5](https://www.reuters.com/business/retail-consumer/anthropic-bolsters-ai-model-claudes-coding-agentic-abilities-with-opus-45-2025-11-24/)
- [claude-mem](https://github.com/thedotmack/claude-mem)

*The title is a deliberate reference to “All your base are belong to us.” The
grammar is broken on purpose. It is a joke, but also a reminder that when tools
like Claude get this good, it is easy to give them more control than you
intended

