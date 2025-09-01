---
layout: page
title: Projects
permalink: /projects/
---

# Projects

Here are some of the things I’ve worked on.

## Molotov

One of my main focuses throughout my career has been building tools that help
developers work more effectively, while ensuring they remain open source. When
we began developing web services at Mozilla, such as Firefox Sync, the scale we
had to support was massive, so we needed a reliable way to run load tests.

Plenty of tools already existed, but none were simple enough to let us build and
execute tests quickly. At first, we tried a “smart” approach: a central HTTP
service coordinating agents that ran the tests. But it quickly became clear this
didn’t scale well. You ended up fighting to scale the testing framework itself.
We eventually shifted to using cloud vendor orchestration services and existing
dashboard systems for centralized result collection.

That experience shaped Molotov, a lightweight Python CLI designed with a KISS
philosophy. It became just one thing: a single command to run load tests from a
single host, nothing more.

I still use it from time to time today whenever I need to run performance tests
on my projects.

<a href="https://molotov.readthedocs.io/en/stable/">Molotov Documentation</a> 

