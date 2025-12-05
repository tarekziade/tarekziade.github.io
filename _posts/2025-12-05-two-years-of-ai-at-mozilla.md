---
layout: post
title: "Two Years of Building AI in Firefox"
date: 2025-12-05
author: "Tarek Ziade"
tags: [AI, Firefox, Machine Learning, Privacy]
---

When I started working on AI at Mozilla two years ago, I was a Python developer
with a background in web services and six months of machine learning experience
from working on the Nuclia DB project. I was not someone who had trained models
from scratch or built production ML infrastructure. Today, Firefox ships
multiple AI features that run entirely on-device, and I helped build the
infrastructure that makes that possible. This is a retrospective on what we
accomplished and what I learned along the way.

## Building the Foundation: The ML Inference Runtime

The first major challenge was creating a runtime that could run machine learning
models directly in Firefox. We needed something that worked across platforms,
respected user privacy, and didn't require sending data to external servers.

We built the Firefox ML inference engine on top of two core technologies: the
ONNX runtime for executing models, and Transformers.js to simplify the
inference work. The architecture we settled on uses a dedicated content process
for inference, keeping it isolated from the main browser process. Remote
Settings distributes both the runtime and model configurations, while IndexedDB
caches downloaded models locally.

One critical evolution was moving away from WebAssembly to run a pure C++ ONNX
runtime under Transformers.js. This shift gave us significantly better
performance and tighter integration with Firefox's internals. Getting this
right required deep systems-level work, and I was fortunate to work with
fantastic engineers like Paul Adenot and Serge Guelton who brought the
expertise needed to make it happen.

This multi-process design was crucial. It gave us stability, security, and the
ability to update models without shipping new browser versions. We also created
our own model hub, giving us control over model distribution while still
supporting Hugging Face for developers who want broader model selection.

The API we exposed is deliberately simple. Developers create an engine instance
with a task name and model ID, then run inference either synchronously or with
streaming output. Behind the scenes, Firefox handles downloading models,
managing cache, and choosing the right backend.

## The First Real Project: PDF.js Alt Text

With the runtime in place, we needed a real feature to prove it worked. PDF.js
alt text generation became that first end-to-end project, and I have written
about it in detail before. But looking back now, it was more than just a
feature. It was the template for everything that came after.

We chose a Vision Transformer paired with a distilled GPT-2 decoder, compressed
to 180 million parameters and under 200MB on disk. The model runs in a couple
of seconds on a laptop, generates descriptions locally, and never sends your
PDF content anywhere. This shipped in Firefox 130, and it set the standard for
how we approach AI: small models, local execution, and privacy by default.

The harder work was not the model architecture. It was dealing with biased
training data and building a validation pipeline. COCO and Flickr30k datasets
carried gender stereotypes and cultural assumptions. We rebuilt the dataset
using GPT-4o annotations to generate cleaner, more neutral captions. Then we
built a human-in-the-loop validation app where users could correct outputs,
feeding those corrections back into retraining. That iterative cycle was what
made the model genuinely useful.

## Smart Tab Management and Beyond

Once the runtime was stable and we had proven we could ship a real feature, the
next step was expanding to other use cases. Smart Tabs launched in Firefox 141,
bringing local AI to tab management.

The feature is simple: right-click a tab group, select "Suggest more tabs for
group," and Firefox analyzes tab titles and descriptions to suggest similar
tabs. Users can accept or reject suggestions. The AI runs entirely on-device,
so your browsing data stays private.

This project showed that the infrastructure we built was flexible enough to
handle different tasks. Smart Tabs did not require a new runtime or a new model
distribution system—it reused what we already had. That reusability was proof
the architecture was working.

After Smart Tabs, we added many other small features following the same
pattern: laser-focused models running on-device for specific tasks. Each one
reinforced the core principle: AI should solve real problems without
compromising privacy. The infrastructure we built made it cheap to ship new
capabilities, and the local-first approach meant users stayed in control of
their data.

## AI Window and the Server-Side Challenge

The reality is that not all AI features can run locally. Small, specialized
models work well on-device, but larger language models (the kind that can handle
complex conversations and broad knowledge tasks) still need server-side compute.
That is where AI Window comes in.

Announced in November 2025, AI Window is an opt-in feature that brings a
conversational AI assistant directly into Firefox. Unlike our local features,
this required building infrastructure to support server-side inference while
maintaining Firefox's commitment to user choice and control.

Over the past several months, I have been working on the server-side LLM
service and the overall architecture to make sure Firefox can reliably call
external services when needed. This meant designing APIs, handling failures
gracefully, managing rate limits, and ensuring the system could scale while
still respecting user preferences. The work was less about the models
themselves and more about building the bridge between Firefox and external AI
providers in a way that gives users real control.

This hybrid approach (local AI for privacy-sensitive tasks, server-side AI for
compute-intensive ones) is where the browser needs to go. But it raises
important questions about privacy.

## The Privacy Challenge for Server-Side AI

Local AI gives you perfect privacy: your data never leaves your device. But
when a model runs on a server, you are trusting someone else with your prompts,
your documents, and your questions. That trust model needs to change.

I am looking forward to industry standards around end-to-end encryption for
running LLM inference with full privacy guarantees. The technology already
exists. Flower.ai has built federated learning infrastructure with end-to-end
encryption that allows large models to run on remote GPUs while keeping user
data encrypted. Nvidia has Confidential Computing on H100 and Blackwell GPUs,
using hardware-based trusted execution environments to protect code and data
during inference. The performance overhead is minimal (often less than 5%) and
the privacy guarantees are real.

But here is the problem: none of this is part of the de facto OpenAI API
standard that most LLM services use today. If you want to call GPT-4 or Claude
or any major hosted model, there is no standardized way to do it with
end-to-end encryption or confidential compute guarantees. Your data goes to the
server in plaintext, and you have to trust the provider's privacy policy.

My hope is that it will soon be possible to run inference on the cloud with
strong privacy guarantees as a standard feature, not a niche offering. The
hardware is ready. The cryptographic techniques exist. What we need now is for
the industry to adopt these capabilities as table stakes for AI services. Until
that happens, local AI remains the gold standard for privacy, and server-side
AI remains a compromise.

## What Made This Possible

Building AI features in a browser is not the same as building AI features in a
standalone app or a cloud service. The constraints are different. You have
limited resources, strict privacy requirements, and the need to work across
Windows, macOS, and Linux. Here is what made it work:

- **Starting small**: We did not try to build everything at once. The first
  runtime was minimal. The first model was simple. We added complexity only
  when we needed it.

- **Privacy as a requirement, not a feature**: Every decision started with "can
  this run locally?" If the answer was no, we either changed the approach or
  did not build it.

- **Reusable infrastructure**: We built the runtime once and used it for
  multiple features. That meant each new AI capability got cheaper to ship.

- **Learning from real users**: The validation app for PDF.js alt text was not
  just about improving the model—it was about understanding what real people
  needed. User feedback drove every iteration.

## What I Learned

Two years ago, I did not know how to train a model or what ONNX was. Now I have
shipped multiple AI features in production. Here is what stuck with me:

- **You do not need a PhD**: Machine learning has a reputation for being
  inaccessible, but the tools have gotten good enough that you can learn by
  doing. I started with a pre-trained model, fine-tuned it, and kept iterating.
  Most of the work was engineering, not research.

- **Data quality beats model size**: We spent more time cleaning datasets and
  handling bias than we did optimizing model architecture. A smaller model
  trained on better data outperformed a larger model trained on messy data.

- **Privacy is possible**: The narrative around AI assumes everything needs to
  run in the cloud. It does not. Local models work. They are fast enough, small
  enough, and private by default.

- **Building the process matters more than building the model**: The validation
  pipeline, the retraining loop, the distribution system. That infrastructure
  was more important than any single model.

## What is Next

This work is not finished. We plan to iterate on PDF.js alt text, expand
Smart Tabs, and bring AI Window to users who want conversational AI in their
browser. WebNN is coming, and that will give us even better performance for
local models. The Firefox ML runtime is still experimental, but it is stable
enough that other teams are starting to build on it.

The bigger challenge is pushing the industry toward privacy-preserving
server-side AI. Confidential compute and end-to-end encryption for LLM
inference should not be experimental features. They should be the default. I
hope to see more providers adopt these technologies and for standards bodies to
make privacy guarantees a core part of the AI API specifications.

On a personal level, these two years showed me that AI in the browser is not
just possible—it is the right way to do it. Local models give users control.
They protect privacy. And they prove that you do not need to send your data to
a server farm to get intelligent features. But when you do need server-side
compute, it should come with strong privacy guarantees, not just promises.

What excites me the most is running AI locally. That is where the future of
open AI lies: not just open models and open weights, but truly open AI that runs
on your device, under your control, without gatekeepers or surveillance. The
browser is the perfect platform to make that future real.

I am proud of what we built. More importantly, I am excited about what comes next.

## Useful links

### Firefox Features
- [Firefox ML Documentation](https://firefox-source-docs.mozilla.org/toolkit/components/ml/index.html)
- [Mozilla Blog: AI Window](https://blog.mozilla.org/en/firefox/ai-window/)
- [Mozilla Blog: Help us improve our alt-text generation model](https://blog.mozilla.org/en/firefox/firefox-ai/help-us-improve-our-alt-text-generation-model)
- [Mozilla Hacks: Experimenting with Local Alt-Text Generation](http://hacks.mozilla.org/2024/05/experimenting-with-local-alt-text-generation-in-firefox-nightly/)
- [Mozilla Blog: Here's what we're working on in Firefox](https://blog.mozilla.org/en/mozilla/heres-what-were-working-on-in-firefox/)
- [Smart Tab Management in Firefox](https://dig.watch/updates/smart-tab-management-comes-to-firefox-with-local-ai)

### Privacy-Preserving AI
- [Flower.ai: Federated AI Framework](https://flower.ai/)
- [Flower Intelligence: End-to-end encryption for AI](https://flower.ai/intelligence/)
- [NVIDIA Confidential Computing](https://www.nvidia.com/en-us/data-center/solutions/confidential-computing/)
- [NVIDIA H100 Confidential Computing for AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/) (Performance benchmarks showing <5% overhead)
- [ArXiv: Confidential Computing on H100 GPU Performance Study](https://arxiv.org/html/2409.03992v1)
