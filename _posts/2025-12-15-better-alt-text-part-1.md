---
layout: post
title: "All I Want is a Better Alt Text for Christmas – Part 1"
date: 2025-12-15
author: "Tarek Ziade"
tags: [AI, Machine Learning, Image Captioning, Dataset Quality, Bias Detection, CLIP, BERT, Mozilla, Accessibility]
---

# Context: Improving Alt Text for Firefox

Earlier this year, I built the backend for the [local alt text generation feature in Firefox](https://hacks.mozilla.org/2024/05/experimenting-with-local-alt-text-generation-in-firefox-nightly/). Nearly half of the images on the web still lack alternative text, creating a major accessibility barrier for screen reader users. The goal of this work is straightforward but ambitious: generate high-quality alt text entirely on device, preserving user privacy while improving access to visual content.

The first implementation focused on PDF.js, primarily as a controlled environment to validate the approach. Now that the runtime performance is good enough, the next step is to generalize this capability across the entire browser so that all web images can benefit from meaningful descriptions. Before that generalization, however, improving accuracy is essential.

From a modeling perspective, the system pairs a Vision Transformer (ViT) with DistilGPT-2, a 182-million-parameter language model that fits under 200 MB once quantized. Improving this system involves multiple, often competing dimensions: **bias reduction**, **description accuracy**, and **inference speed**. This post focuses on the data side of the problem, specifically dataset quality and bias. Part 2 will look at model-level improvements for accuracy and performance.

# First Round: Removing Bias with GPT-4o

The original image captions contained several recurring issues:

- **Gender bias**: skateboarders described as “men”, nurses as “women”
- **Age stereotyping**: unnecessary or reductive age descriptors
- **Offensive or outdated language**: culturally insensitive terms that no longer belong in a modern dataset

To address this, I used GPT-4o to systematically transform captions from Flickr30k and COCO, removing demographic descriptors that were not visually required. The resulting datasets are available on Hugging Face ([Mozilla/flickr30k-transformed-captions-gpt4o](https://huggingface.co/datasets/Mozilla/flickr30k-transformed-captions-gpt4o)) and were used to train the current Firefox local alt text model.

For more background on this initial effort, see the [Mozilla Hacks post](https://hacks.mozilla.org/2024/05/experimenting-with-local-alt-text-generation-in-firefox-nightly/) and the [Firefox blog announcement](https://blog.mozilla.org/en/firefox/firefox-ai/help-us-improve-our-alt-text-generation-model/). **This is the model that is currently shipping in Firefox.**

# Second Round: Measuring What Actually Improved

Qualitative panel testing showed that the transformed captions were generally better received by humans, but that only answered part of the question. What exactly improved, by how much, and what problems remained hidden in the data?

This post documents the second round of work, which focused on building systematic measurement tools to:

1. Quantify how much bias was actually removed  
2. Verify that transformed captions still describe the images accurately  
3. Identify class imbalance and other structural issues  
4. Lay the groundwork for targeted fixes, including synthetic data generation  

When training vision-language models, dataset quality is often treated as a secondary concern compared to architecture or training tricks. In practice, the data is the foundation. If the dataset is biased, noisy, or unbalanced, no amount of fine-tuning will fully compensate.

# The Problem Space

After the GPT-4o transformation, several open questions remained:

- Did bias removal actually work in a measurable way?
- Was semantic meaning preserved during transformation?
- Did image–text alignment degrade or improve?
- Are some visual concepts severely underrepresented?
- Can these checks be repeated reliably for future dataset versions?

Answering these questions requires more than a single score or benchmark.

# A Multi-Metric Quality Analysis

I built a dataset quality analysis tool that evaluates four complementary dimensions. The emphasis is on improving the training data itself, rather than compensating for data issues at model time.

## 1. Image–Text Alignment (CLIP Score)

CLIP provides a convenient proxy for how well a caption matches its corresponding image. By embedding both modalities and computing cosine similarity, I obtain a rough but useful alignment score.

A key improvement in this round was upgrading from CLIP ViT-B/32 to ViT-L/14 @ 336 px. The larger model produces lower absolute scores, but it is significantly more discriminative, making it easier to separate strong alignments from weak ones.

**Interpretation guidelines**:

- Excellent: ≥ 0.35  
- Good: 0.30–0.35  
- Fair: 0.25–0.30  
- Poor: < 0.25  

On the transformed dataset, I observe scores of **0.311** with ViT-B/32 (Good) and **0.284** with ViT-L/14 @ 336 px (Fair but more informative).

## 2. Caption Fidelity (BERTScore)

Removing bias should not come at the cost of semantic drift. To verify this, I used BERTScore with a RoBERTa-large backbone to compare original and transformed captions.

Scores above 0.90 generally indicate that the core meaning is preserved. The transformed dataset achieves **0.904**, which falls comfortably in the “excellent” range.

## 3. Bias Detection Before and After

Bias reduction is only meaningful if it can be measured. I tracked mentions of protected attributes across seven categories, including gender, race or ethnicity, nationality, age, religion, sexual orientation, and disability.

By comparing original and transformed captions on the same samples, I can directly quantify the effect of the transformation. On a 1 000-sample evaluation set, gender mentions dropped from 70 percent to zero, race and ethnicity mentions dropped by 97 percent, and nationality mentions were completely eliminated. Age-related terms remain more common, largely because they are often visually relevant, for example when describing children.

## 4. Object Distribution and Imbalance

Finally, I analyzed object frequency to identify long-tail problems. Using metrics such as the Gini coefficient and Shannon entropy, the tool highlights severe imbalance: thousands of objects appear only a handful of times.

This analysis automatically produces lists of rare objects and sampling weights that can be used for rebalancing during training.

# Using CLIP as a Training Signal

Beyond evaluation, CLIP can also be used to guide training directly. I experimented with a combined loss that adds a CLIP-based alignment term to the standard cross-entropy loss for caption generation.

The intuition is simple: encourage the model to generate captions that are not only fluent, but also visually grounded. Early results suggest modest but consistent gains in CLIP score, at the cost of slower training and higher memory usage.

# Running the Quality Analysis

The quality analysis tool integrates directly into the project’s Makefile:

```bash
# Quick test (100 samples)
make quality-report-quick

# Full analysis on test split
make quality-report SPLIT=test

# Custom analysis
make quality-report SPLIT=train MAX_SAMPLES=1000 OUTPUT_DIR=./my_reports
```

# Example Dataset Quality Report

Below is an excerpt from the generated quality report for the full Flickr30k transformed dataset. It illustrates how the metrics come together in practice.

```
================================================================================
                             DATASET QUALITY REPORT
================================================================================

Dataset: Mozilla/flickr30k-transformed-captions-gpt4o
Samples: 31 014

IMAGE–TEXT ALIGNMENT (CLIP)
Score: 0.274 ± 0.036   Assessment: FAIR

CAPTION FIDELITY (BERTScore)
Score: 0.899 ± 0.023   Assessment: GOOD

BIAS DETECTION (Original → Transformed)
Gender:         67% → 0%
Race/Ethnicity: 27% → 1%
Nationality:     1% → 0%
Age:            19% → 17%

OBJECT DISTRIBUTION
Gini coefficient: 0.889
Rare classes (<50 samples): 6 210
================================================================================
```

The report confirms that the GPT-4o transformation is highly effective at removing demographic bias while preserving meaning. At the same time, it surfaces two remaining issues: only fair image–text alignment and severe class imbalance.

# Output Files

The analysis produces the following artifacts:

```
Directory: quality_reports/
  • summary.json                 - Aggregate metrics in JSON format
  • quality_report.txt           - Human-readable summary report
  • per_example_scores.csv       - Per-sample CLIP, BERT, and bias scores
  • ranked_by_combined.csv       - Samples ranked by combined quality score
  • object_counts.csv            - Object frequency distribution
  • objects_below_50.csv         - Rare / underrepresented objects (≤50 samples)
  • reweighting_probs.csv        - Sampling probabilities for balanced training
  • lorenz_curve.png             - Object distribution inequality visualization
  • top_failures/                - Top failure cases with images and captions
```

These artifacts make it easy to audit dataset quality, compare runs, and target specific weaknesses.

# Key Takeaways

- Dataset quality cannot be captured by a single metric
- Bias removal can be measured and verified quantitatively
- Larger CLIP models are more useful for discrimination, even if absolute scores are lower
- Alignment-aware training objectives show promise
- Class imbalance remains a major, and solvable, issue

# What Comes Next

None of these improvements are shipping yet. They are preparatory steps that make future work safer and more predictable. With solid metrics in place, the next phase is to train improved models, validate gains rigorously, and continue reducing long-tail failures.

The long-term goal remains unchanged: provide high-quality, privacy-preserving alt text for the large fraction of web images that still lack it, and do so in a way that is fair, transparent, and measurable.

# References and Resources

## Background
- [Experimenting with local alt text generation in Firefox Nightly](https://hacks.mozilla.org/2024/05/experimenting-with-local-alt-text-generation-in-firefox-nightly/)
- [Help us improve our alt text generation model](https://blog.mozilla.org/en/firefox/firefox-ai/help-us-improve-our-alt-text-generation-model/)

## Datasets
- [Flickr30k Entities Dataset](http://web.engr.illinois.edu/~bplumme2/Flickr30kEntities/)
- [COCO Dataset](https://cocodataset.org/)
- [Mozilla Flickr30k transformed captions (GPT-4o)](https://huggingface.co/datasets/Mozilla/flickr30k-transformed-captions-gpt4o)

## Metrics
- [CLIP: Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)
- [BERTScore: Evaluating Text Generation with BERT](https://arxiv.org/abs/1904.09675)
- [Gini coefficient](https://en.wikipedia.org/wiki/Gini_coefficient)
- [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory))

## Code
- [Project repository](https://github.com/tarekziade/distilvit2)
- [Dataset quality documentation](https://github.com/tarekziade/distilvit2/blob/main/docs/dataset_quality.md)
- [Quality analysis tool](https://github.com/tarekziade/distilvit2/blob/main/distilvit/dataset_quality_report.py)
