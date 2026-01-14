---
layout: post
title: "The Economics of AI Coding: A Real-World Analysis"
date: 2026-01-14
author: "Tarek Ziade"
tags: [ai, claude, productivity, software-engineering]
---

My whole stream in the past months has been about AI coding. From skeptical
engineers who say it creates unmaintainable code, to enthusiastic (or scared)
engineers who say it will replace us all, the discourse is polarized. But I've
been more interested in a different question: what does AI coding actually cost,
and what does it actually save?

I recently had Claude help me with a substantial refactoring task: splitting a
monolithic Rust project into multiple workspace repositories with proper
dependency management. The kind of task that's tedious, error-prone, and
requires sustained attention to detail across hundreds of files. When it was
done, I asked Claude to analyze the session: how much it cost, how long it took,
and how long a human developer would have taken.

The answer surprised me. Not because AI was faster or cheaper (that's expected),
but because of how much faster and cheaper.

## The Task: Repository Split and Workspace Setup

The work involved:
- Planning and researching the codebase structure
- Migrating code between three repositories
- Updating thousands of import statements
- Configuring Cargo workspaces and dependencies
- Writing Makefiles and build system configuration
- Setting up CI/CD workflows with GitHub Actions
- Updating five different documentation files
- Running and verifying 2300+ tests
- Creating branches and writing detailed commit messages

This is real work. Not a toy problem, not a contrived benchmark. The kind of multi-day slog that every engineer has faced: important but tedious, requiring precision but not creativity.

## The Numbers

### AI Execution Time
Total: approximately 3.5 hours across two sessions
- First session (2-3 hours): Initial setup, file operations, dependency configuration, build testing, CI/CD setup
- Second session (15-20 minutes): Documentation updates, branch creation, final commits, todo tracking

### AI Cost
Total tokens: 72,146 tokens
- Input tokens: ~45,000 (context, file reads, system prompts)
- Output tokens: ~27,000 (tool calls, code generation, documentation)

Estimated marginal cost: approximately $4.95
- Input: ~$0.90 (at ~$3/M tokens for Sonnet 4.5)
- Output: ~$4.05 (at ~$15/M tokens for Sonnet 4.5)

This is the marginal execution cost for this specific task. It doesn't include my Claude subscription, the time I spent iterating on prompts and reviewing output, or the risk of having to revise or fix AI-generated changes. For a complete accounting, you'd also need to consider those factors, though for this task they were minimal.

### Human Developer Time Estimate
Conservative estimate: 2-3 days (16-24 hours)

This is my best guess based on experience with similar tasks, but it comes with uncertainty. A senior engineer deeply familiar with this specific codebase might work faster. Someone encountering similar patterns for the first time might work slower. Some tasks could be partially templated or parallelized across a team.

Breaking down the work:
1. Planning and research (2-4 hours): Understanding codebase structure, planning dependency strategy, reading PyO3/Maturin documentation
2. Code migration (4-6 hours): Copying files, updating all import statements, fixing compilation errors, resolving workspace conflicts
3. Build system setup (2-3 hours): Writing Makefile, configuring Cargo.toml, setting up pyproject.toml, testing builds
4. CI/CD configuration (2-4 hours): Writing GitHub Actions workflows, testing syntax, debugging failures, setting up matrix builds
5. Documentation updates (2-3 hours): Updating multiple documentation files, ensuring consistency, writing migration guides
6. Testing and debugging (3-5 hours): Running test suites, fixing unexpected failures, verifying tests pass, testing on different platforms
7. Git operations and cleanup (1-2 hours): Creating branches, writing commit messages, final verification

Even if we're generous and assume a very experienced developer could complete this in 8 hours of focused work, the time and cost advantages remain substantial. The economics don't depend on the precise estimate.

### The Bottom Line
- AI: ~3.5 hours, ~$5 marginal cost
- Human: ~16-24 hours, ~$800-$2,400 (at $50-100/hr developer rate)
- Savings: approximately 85-90% time reduction, approximately 99% marginal cost reduction

These numbers compare execution time and per-task marginal costs. They don't capture everything (platform costs, review time, long-term maintenance implications), but they illustrate the scale of the difference for this type of systematic refactoring work.

## Why AI Was Faster

The efficiency gains weren't magic. They came from specific characteristics of how AI approaches systematic work:

**No context switching fatigue.** Claude maintained focus across three repositories simultaneously without the cognitive load that would exhaust a human developer. No mental overhead from jumping between files, no "where was I?" moments after a break.

**Instant file operations.** Reading and writing files happens without the delays of IDE loading, navigation, or search. What takes a human seconds per file took Claude milliseconds.

**Pattern matching without mistakes.** Updating thousands of import statements consistently, without typos, without missing edge cases. No ctrl-H mistakes, no regex errors that you catch three files later.

**Parallel mental processing.** Tracking multiple files at once without the working memory constraints that force humans to focus narrowly.

**Documentation without overhead.** Generating comprehensive, well-structured documentation in one pass. No switching to a different mindset, no "I'll document this later" debt.

**Error recovery.** When workspace conflicts or dependency issues appeared, Claude fixed them immediately without the frustration spiral that can derail a human's momentum.

**Commit message quality.** Detailed, well-structured commit messages generated instantly. No wrestling with how to summarize six hours of work into three bullet points.

## What Took Longer

AI wasn't universally faster. Two areas stood out:

**Initial codebase exploration.** Claude spent time systematically understanding the structure before implementing. A human developer might have jumped in faster with assumptions (though possibly paying for it later with rework).

**User preference clarification.** Some back-and-forth on git dependencies versus crates.io, version numbering conventions. A human working alone would just make these decisions implicitly based on their experience.

These delays were minimal compared to the overall time savings, but they're worth noting. AI coding isn't instantaneous magic. It's a different kind of work with different bottlenecks.

## The Economics of Coding

Let me restate those numbers because they still feel surreal:
- 85-90% time reduction
- 99% marginal cost reduction

For this type of task, these are order-of-magnitude improvements over solo human execution. And they weren't achieved through cutting corners or sacrificing immediate quality. The tests passed, the documentation was comprehensive, the commits were well-structured, the code compiled cleanly.

That said, tests passing and documentation existing are necessary but not sufficient signals of quality. Long-term maintainability, latent bugs that only surface later, or future refactoring friction are harder to measure immediately. The code is in production and working, but it's too soon to know if there are subtle issues that will emerge over time.

This creates strange economics for a specific class of work: systematic, pattern-based refactoring with clear success criteria. For these tasks, the time and cost reductions change how we value engineering effort and prioritize maintenance work.

I used to avoid certain refactorings because the payoff didn't justify the time investment. Clean up import statements across 50 files? Update documentation after a restructure? Write comprehensive commit messages? These felt like luxuries when there was always more pressing work.

But at $5 marginal cost and 3.5 hours for this type of systematic task, suddenly they're not trade-offs anymore. They're obvious wins. The economics shift from "is this worth doing?" to "why haven't we done this yet?"

## What This Doesn't Mean

Before the "AI will replace developers" crowd gets too excited, let me be clear about what this data doesn't show:

This was a perfect task for AI. Systematic, pattern-based, well-scoped, with clear success criteria. The kind of work where following existing patterns and executing consistently matters more than creative problem-solving or domain expertise.

AI did not:
- Design the architecture (I did)
- Decide on the repository structure (I did)
- Choose the dependency strategy (we decided together)
- Understand the business context (I provided it)
- Know whether the tests passing meant the code was correct (I validated)

The task was pure execution. Important execution, skilled execution, but execution nonetheless. A human developer would have brought the same capabilities to the table, just slower and at higher cost.

## Where This Goes

I keep thinking about that 85-90% time reduction for this specific type of task. Not simple one-liners where AI already shines, but systematic maintenance work with high regularity, strong compiler or test feedback, and clear end states.

Tasks with similar characteristics might include:
- Updating deprecated APIs across a large codebase
- Migrating from one framework to another with clear patterns
- Standardizing code style and patterns
- Refactoring for testability where tests guide correctness
- Adding comprehensive logging and monitoring
- Writing and updating documentation
- Creating detailed migration guides

Many maintenance tasks are messier: ambiguous semantics, partial test coverage, undocumented invariants, organizational constraints. The economics I observed here don't generalize to all refactoring work. But for the subset that is systematic and well-scoped, the shift is significant.

All the work that we know we should do but often defer because it doesn't feel like progress. What if the economics shifted enough for these specific tasks that deferring became the irrational choice?

I'm not suggesting AI replaces human judgment. Someone still needs to decide what "good" looks like, validate the results, understand the business context. But if the execution of systematic work becomes 10x cheaper and faster, maybe we stop treating certain categories of technical debt like unavoidable burdens and start treating them like things we can actually manage.

## The Real Cost

There's one cost the analysis didn't capture: my time. I wasn't passive during those 3.5 hours. I was reading Claude's updates, reviewing file changes, answering questions, validating decisions, checking test results.

I don't know exactly how much time I spent, but it was less than the 3.5 hours Claude was working. Maybe 2 hours of active engagement? The rest was Claude working autonomously while I did other things.

So the real comparison isn't 3.5 AI hours versus 16-24 human hours. It's 2 hours of human guidance plus 3.5 hours of AI execution versus 16-24 hours of human solo work. Still a massive win, but different from pure automation.

This feels like the right model: AI as an extremely capable assistant that amplifies human direction rather than replacing human judgment. The economics work because you're multiplying effectiveness, not substituting one for the other.

## Final Thoughts

Five dollars marginal cost. Three and a half hours. For systematic refactoring work that would have taken me days and cost hundreds or thousands of dollars in my time.

These numbers make me think differently about certain kinds of work. About how we prioritize technical debt in the systematic, pattern-based category. About what "too expensive to fix" really means for these specific tasks. About whether we're approaching some software maintenance decisions with outdated economic assumptions.

I'm still suspicious of broad claims that AI fundamentally changes how we work. But I'm less suspicious than I was. When the economics shift this dramatically for a meaningful class of tasks, some things that felt like pragmatic trade-offs start to look different.

The tests pass. The documentation is up to date. And I paid less than the cost of a fancy coffee drink.

Maybe the skeptics and the enthusiasts are both right. Maybe AI doesn't replace developers and maybe it does change some things meaningfully. Maybe it just makes certain kinds of systematic work cheap enough that we can finally afford to do them right.

## What About Model and Pricing Changes?

One caveat worth noting: these economics depend on Claude Sonnet 4.5 at January 2026 pricing. Model pricing can change, model performance can regress or improve with updates, tool availability can shift, and organizational data governance constraints might limit what models you can use or what tasks you can delegate to them.

For individuals and small teams, this might not matter much in the short term. For larger organizations making long-term planning decisions, these factors matter. The specific numbers here are a snapshot, not a guarantee.

## References

- [Claude Code](https://claude.com/claude-code) - The AI coding assistant used for this project
- [rustnn project](https://github.com/rustnn/rustnn) - The repository that was split
- Token pricing based on [Claude API pricing](https://www.anthropic.com/api) as of January 2026
