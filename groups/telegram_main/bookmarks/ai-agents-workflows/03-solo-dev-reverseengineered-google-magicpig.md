# Solo Dev Reverse-Engineered Google's Billion-Dollar Algorithm in 7 Days with Claude

**Bookmarked:** Mar 30, 2026 (18:44 MYT)
**Author:** @k1rallik (BuBBliK) — 1.5M views, 9k likes, 9.2k bookmarks
**Tweet ID:** 2038567965465944491
**Category:** AI Agents & Workflows
**Type:** Inspiration / Reference
**Actionable:** Mindset — what's possible with AI-assisted development

---

## What Happened

Google published a paper about MagicPIG — an algorithm using Locality-Sensitive Hashing (LSH) for faster LLM inference — that **crashed memory stocks worldwide**. Then shipped zero code.

**Tom Turney** read the math, opened his terminal, and built the whole thing with Claude. Then made it faster than Google promised.

---

## The 7-Day Timeline

| Days | What He Built |
|------|---------------|
| Day 1-3 | Core algorithms, 141 tests, Python prototype |
| Day 3-5 | C port into llama.cpp, Metal GPU kernels |
| Day 5-7 | Speed optimization: 739 → 2747 tok/s (3.7x speedup) |

---

## How He Got the 3.7x Speedup

Pure engineering through:
- fp32 → fp16 WHT (half-precision Walsh-Hadamard Transform)
- half4 vectorized butterfly operations
- Graph-side rotation
- Block-32 storage layout

---

## His Own Research on Top

Beyond implementing Google's paper, he added original improvements:
- **Sparse V:** Skip 90% of value decompressions at long context
- **Asymmetric K/V:** Keep keys precise, compress values harder
- **Temporal decay:** Old tokens get lower precision automatically

**Result:** 35B model running on a MacBook with 4.6x compressed cache.

**613 GitHub stars in a week.** Google still hasn't released their own code.

---

## What This Demonstrates

1. **A solo developer can outpace a $2T company's research team** using AI-assisted development in days
2. **The gap between "paper published" and "working implementation"** has collapsed from months to days
3. **The bottleneck is no longer coding** — it's understanding the math and knowing what to build
4. **Claude as a research implementation partner** is viable for serious algorithms, not just CRUD apps

---

## Deeper Relevance

This is the same dynamic playing out across every field:
- Academic paper → working implementation → improvements → shipped product
- Timeline has collapsed from 1-2 years to 7 days

For builders, the implication is: the speed at which you can go from "interesting research" to "working product" is no longer a bottleneck. The moat shifts to taste, distribution, and domain knowledge.

---

## The Broader Context

Google spent enormous resources on this algorithm, published the theory without code (presumably to be cautious about competitive exposure), and within a week had:
- A better implementation than their paper described
- A solo developer with a GitHub repo outperforming their benchmarks
- 613 stars on an independent repo while Google's official code didn't exist

The lesson: **publishing research without implementation is no longer a meaningful competitive moat in an AI-assisted world.**
