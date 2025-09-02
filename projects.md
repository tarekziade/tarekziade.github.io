---
layout: page
title: Projects
permalink: /projects/
---

# Professional Work

A high-level overview of my last few years as a software developer.

## Mozilla


- **Firefox AI Runtime**  
  - Designed and built the [Firefox AI runtime](https://firefox-source-docs.mozilla.org/toolkit/components/ml/index.html) from scratch in Gecko.  
  - Developed a **model hub system** for efficient model distribution and execution.  
  - Helped extend the runtime to support **native backends**: ONNX Runtime (C++) and Llama.cpp.  

- **Team Building & Features**  
  - Built and ramped up a team of ML engineers to create features powered by the runtime:
    - Smart tab grouping  
    - Search and suggest  
    - Link preview  

- **Standards & APIs**  
  - Initiated the [WebExtension AI API](https://firefox-source-docs.mozilla.org/toolkit/components/ml/extensions.html) to expose AI-powered capabilities to extensions.  
  - Represent Mozilla in the **W3C Machine Learning Working Group**, collaborating with other browser vendors to shape web AI standards.  

- **Cloud Inference**
  - Designed and led the deployment of a **litellm-based service** for running inference in the cloud, complementing on-device inference and enabling scalable experimentation.


Also, check out the Mozilla blog and Mozilla Hacks posts by me for some of the work I do there. I try to write in them on a regular basis:
<ul>
  <li><a href="https://blog.mozilla.org/en/author/tziademozilla-com/">Mozilla Blog</a></li>
  <li><a href="https://hacks.mozilla.org/author/tziademozilla-com">Mozilla Hacks</a></li>
</ul>


## Nuclia

- Contributed to [NucliaDB](https://nuclia.com/vector-database/), a **vector search database** optimized for AI-driven search and retrieval.  

## Elastic

- **Principal Engineer → Tech Lead**  
  - Began as **Principal Engineer** for Automation & Tooling, then transitioned to **Tech Lead** for **Ingestion features** in Enterprise Search.  

- **Connectors Project**  
  - Founded and built the [**Elastic Connectors project**](https://github.com/elastic/connectors) from scratch.  
  - Led a team to extend and maintain connectors, enabling integration of diverse data sources at scale.  
  - The project remains in active use and continues to be a core part of Enterprise Search.  

---

# Side Projects

Outside of my professional roles, I explore building developer-focused tools that solve real-world problems.

## Python-dev

I was part of the **Python core development team**, with a focus on **packaging
tooling** such as `distutils`.  During that time, I contributed to shaping
several PEPs in the packaging ecosystem and developed features that landed in
the Python standard library.  

Although I eventually stepped back due to the lack of time,
the experience taught me a great deal about large-scale open source
collaboration and the challenges of balancing community needs with technical
constraints.  

## Flake8

I am the **original author of Flake8**, a linting tool that combines
**PyFlakes** and **pep8** hence the name *Flake8*.  I created it to streamline
Python code quality checks into a single, easy-to-use tool.  

I handed over maintenance of Flake8 many years ago, and the community has
continued to evolve it. These days, I often recommend
[**Ruff**](https://github.com/astral-sh/ruff), which offers similar
functionality with a much faster Rust-based implementation.  

## Molotov

One of my main focuses throughout my career has been building tools that help
developers work more effectively, while ensuring they remain open source.  

When we began developing web services at Mozilla, such as Firefox Sync, the scale we
had to support was massive, so we needed a reliable way to run load tests.  

Plenty of tools already existed, but none were simple enough to let us build and
execute tests quickly. At first, we tried a “smart” approach: a central HTTP
service coordinating agents that ran the tests. But it quickly became clear this
didn’t scale well—you ended up fighting to scale the testing framework itself.  
We eventually shifted to using cloud vendor orchestration services and existing
dashboard systems for centralized result collection.  

That experience shaped **Molotov**, a lightweight Python CLI designed with a KISS
philosophy. It became just one thing: a single command to run load tests from a
single host, nothing more.  

I still use it from time to time today whenever I need to run performance tests
on my personal and professional projects, and try to keep Molotov up-to-date.

[Molotov Documentation](https://molotov.readthedocs.io/en/stable/)  
