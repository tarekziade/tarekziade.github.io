---
layout: post
title: "WebNN is the future of browsers AI"
date: 2025-11-21
author: "Tarek Ziade"
tags: [AI, WebNN, Browsers]
---

For years, running machine learning in the browser meant juggling GPU support,
WASM fallbacks, and flags. WebNN changes that by giving the web a standard
inference API between JavaScript and hardware. It is the missing piece that
turns the browser into a first-class AI client runtime.

Running AI locally is the long game. A decade from now laptops and phones will
run much larger models natively, and the best experiences won’t require sending
your data off to a cloud service. WebNN is how the web gets there.

## What WebNN really is

WebNN is a W3C draft specification that exposes a graph-based neural network
API to the web platform. Instead of binding directly to CUDA or Metal, browsers
map WebNN calls to whatever native acceleration they have: DirectML on Windows,
Core ML on macOS and iOS, NNAPI on Android, or a CPU path via TFLite/XNNPACK.
When a CPU path exists, the browser can fall back there. Think of it as `canvas`
for neural networks: you provide the graph, the browser picks the fastest safe
backend.

- Spec: [https://www.w3.org/TR/webnn/](https://www.w3.org/TR/webnn/)
- Demos: [https://webmachinelearning.github.io/webnn-samples-intro/](https://webmachinelearning.github.io/webnn-samples-intro/)

### WebNN as a graph converter

WebNN is a graph builder and validator. The browser takes the graph you define
in JS, converts it into a static graph aimed at one of the underlying runtimes
in the OS (DirectML, Core ML, NNAPI, TFLite/XNNPACK, or ONNX Runtime on newer
Windows), and hands it to that native library. The heavy lifting lives there:
compilation, scheduling, and kernel selection. WebNN is the portable contract
that keeps your app code unchanged while the browser targets the best backend.

In Chromium, WebNN uses DirectML by default on Windows and can use the
OS-shipped ONNX Runtime backend on Windows 11 24H2+, falling back to DirectML
otherwise.

### Why not “just use WebGPU”?

Libraries like ONNX Runtime Web and TF.js already use WebGPU to get more speed,
but that means treating a graphics API as an inference runtime: writing shaders,
managing bindings, and re-implementing scheduling. WebGPU is great for explicit
control; WebNN is the spec we actually want for AI, with portable graphs,
browser-managed backend choice, and no shader boilerplate.

## Why this matters

- **Performance without flags:** WebNN can route to GPU, NPU, or CPU without
  developers writing backend-specific code. That means near-native throughput
  for models like Whisper Tiny or Segment Anything, but delivered via a web
  page.
- **Predictable portability:** The standard defines ops once; browsers own the
  mapping to the best hardware path they have. Apps no longer maintain separate
  WebGPU and WASM code paths.
- **Battery-aware:** Because browsers control the scheduling and backend choice,
  they can pick energy-efficient accelerators over brute-force GPU usage on
  laptops or mobile.

## The current state (and why it feels real now)

Chromium-based browsers ship WebNN behind a flag, and ONNX Runtime Web can
use the WebNN execution provider when present. According to the public
implementation status ([webmachinelearning.github.io/webnn-status](https://webmachinelearning.github.io/webnn-status/)), the
95 ops in the spec are now covered across Core ML, Windows ML/DirectML, the
WebNN execution provider for ONNX Runtime, and TFLite/XNNPACK (LiteRT) with
only a handful still in flight. That’s enough to make real apps: speech commands,
lightweight summarization, image segmentation, and style transfer.

The momentum is similar to what we saw with WebGPU two years ago: early adopters
can ship progressive enhancements now, and the API will solidify while hardware
vendors line up their drivers.

The big shift is that WebNN moves backend selection into the browser while
keeping a high-level graph API. It is closer to Core ML or DirectML than to raw
GPU programming.

## Why I am bullish

The web wins by being portable and low friction. AI has been the missing
capability that pushed teams toward native wrappers or cloud-heavy designs.
WebNN gives us a standard, permissionless way to run meaningful AI locally in
the browser while respecting energy and privacy constraints. It unlocks the
boring path to mass adoption: no installs, instant upgrades, and enough
abstraction that developers can stay focused on UX rather than driver matrices.

Now is the time to experiment, measure, and ship progressive AI features. The
future of AI in browsers looks like WebNN.
