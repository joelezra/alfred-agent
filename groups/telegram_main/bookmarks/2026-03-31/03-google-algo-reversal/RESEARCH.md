# Solo Dev Reverses Google's TurboQuant Algorithm in 7 Days

## Source
- Tweet: @k1rallik (BuBBliK) — 2026-03-31
- Tweet ID: 2038567965465944491
- Quoted tweet: Tom Turney (@no_stp_on_snek) implementing TurboQuant in llama.cpp
- Repo link: https://t.co/uAaxXKPqnk → https://github.com/TheTom/turboquant_plus

## TL;DR
Google published a research paper (TurboQuant, ICLR 2026) on KV cache compression that briefly crashed memory stocks worldwide, but shipped zero production code. Tom Turney read the math, built a full llama.cpp implementation with Metal GPU kernels in ~7 days using Claude Code, achieving 4.9x KV cache compression on a 35B model running locally on a MacBook M5 Max.

## Key Claims / Insights
- 7-day development timeline: Python prototype (days 1-3), C port into llama.cpp with Metal kernels (days 3-5), speed optimization 739 → 2747 tok/s (3.7x speedup) (days 5-7)
- TurboQuant achieves 4.6-6.4x KV cache compression with near-zero accuracy loss
- Three innovations in the repo beyond the paper: Sparse V, Asymmetric K/V, Boundary V (what the tweet called "Temporal decay" likely refers to future Temporal decay compression planned in PLAN.md)
- Google published the paper but released zero official code; community beat them to implementation
- 35B model (Qwen 3.5 MoE) running on a consumer MacBook with compressed cache
- Memory stocks crashed: Micron -7%, SK Hynix -6.2%, Samsung -4.7%, SanDisk -18%, NVIDIA -6.6%
- ~$100 billion in semiconductor market cap erased within 48 hours of paper announcement
- Most analysts say the selloff was a massive overreaction
- Repo reached 4.4k stars (tweet claimed 613 — likely within first week, now much higher)
- Built with Claude Code as AI pair programmer ("lots of steering and babysitting")

## Deep Dive Research

### What is TurboQuant?

TurboQuant is a Google Research compression algorithm for LLM Key-Value (KV) caches — the memory structure that stores intermediate attention states during inference. The larger the context window, the more KV cache memory is required, making it a critical bottleneck for running large models locally or cheaply.

**Publication timeline:**
- April 2025: Paper first posted to arXiv (arXiv:2504.19874)
- March 24, 2026: Google blog post goes viral, triggers stock selloff
- April 23-25, 2026: Formal presentation at ICLR 2026
- Companion papers: PolarQuant (AISTATS 2026, arXiv:2502.02617), QJL (AAAI 2025, arXiv:2406.03482)

### How TurboQuant Works

Two-stage compression pipeline:

**Stage 1 — PolarQuant:**
- Applies a random orthogonal rotation (Walsh-Hadamard Transform) to KV vectors
- This "Gaussianizes" the data — spreads energy uniformly across coordinates
- Converts vectors from Cartesian to polar coordinates (radius + angle)
- Eliminates per-block scaling constants that traditional quantization requires as overhead
- Uses Lloyd-Max algorithm to compute optimal quantization buckets once, ahead of time

**Stage 2 — QJL (Quantized Johnson-Lindenstrauss):**
- A 1-bit error correction layer
- Passes quantization residual errors through a Johnson-Lindenstrauss random Gaussian projection
- Stores only the sign bit (+1 or -1) of resulting values — zero memory overhead
- Makes inner product estimates mathematically unbiased

**Result:** 3-bit precision KV cache with provably near-optimal distortion bounds. Zero model retraining required. Data-oblivious (no calibration needed).

**Official benchmarks:**
- 6x KV cache memory reduction vs FP16
- 8x attention computation speedup on H100 GPUs
- Zero measurable accuracy loss at 3-bit quantization on standard benchmarks
- Perfect needle-in-a-haystack scores at all tested context lengths

### Tom Turney's Implementation (turboquant_plus)

Tom Turney's GitHub handle is @no_stp_on_snek (TheTom on GitHub). He implemented TurboQuant into llama.cpp with Metal GPU kernels for Apple Silicon.

**Development timeline (reconstructed from repo and discussion):**
- Days 1-3: Python prototype, 511+ unit tests with 100% diagnostic code coverage, validated MSE against paper within 1%
- Days 3-5: C port into llama.cpp, Metal GPU kernel implementation. Key bugs discovered: Metal JIT silently falls back to CPU with custom headers; column-major storage transposes rotation matrices
- Days 5-7: Speed optimization battle — from 739 tok/s (0.27x vs q8_0) through multiple optimization steps to 2,747 tok/s (1.02x parity with q8_0)

**Speed optimization journey (M5 Max, turbo3):**
- Initial fp32 implementation: 739 tok/s (0.27x q8_0)
- fp16 Walsh-Hadamard Transform: 1,074 tok/s
- Vectorized butterflies: 1,411 tok/s
- Graph-side rotation: 2,095 tok/s
- Final optimized: 2,747 tok/s (1.02x parity with q8_0)

**Compression format family:**
- turbo2: 2-bit, 6.4x compression, +6.48% PPL vs q8_0
- turbo3: 3-bit, 4.6-5.1x compression, +1.06% PPL
- turbo4: 4-bit, 3.8x compression, +0.23% PPL

### Three Key Technical Innovations Beyond the Paper

**1. Sparse V Dequantization:**
Skips V (value) dequantization for attention positions where softmax weight is below 1e-6. Achieves +22.8% decode speed at 32K context with zero measurable PPL degradation. Validated on wikitext-103 (50 chunks). Not TurboQuant-specific — works across q8_0, q4_0, and turbo3 KV formats. Also improves NIAH (Needle-in-a-Haystack) retrieval: 9/9 vs 7/9 baseline, suggesting the skipped positions introduce quantization noise that was hurting retrieval.

**2. Asymmetric K/V Compression:**
Keeps Key cache at q8_0 (8-bit) precision while compressing only the Value cache to turbo3/turbo4. Critical finding: quality degradation in KV compression comes almost entirely from Key compression. V compression has negligible quality impact when K precision is maintained. This rescues quality on low-bit models. Tested on Qwen2.5-7B Q4_K_M: +1.0% PPL impact with asymmetric vs much larger impact with symmetric compression.

**3. Boundary V (Layer-Aware Compression):**
Protects the first and last 2 transformer layers at higher precision while compressing middle layers at turbo bit-widths. These boundary layers show "disproportionate sensitivity" to quantization noise. Protecting them recovers 37-91% of the quality gap across models from 28 to 64 layers.

**Future plans ("plus" features):**
- Adaptive bit allocation
- Temporal decay compression (this is likely what the original tweet called "Temporal decay")
- Expert-aware MoE compression
- Extended beyond KV cache compression

### The Memory Stock Crash

**Why investors panicked:**
AI model inference requires KV cache that grows linearly with context length. Data centers use expensive DRAM and HBM chips to store this. If KV cache can be compressed 6x, the theory goes, AI companies need fewer memory chips.

**Stocks affected (week of March 24-26, 2026):**
- Micron (MU): -7% on announcement day, -30% since March 18 earnings
- SK Hynix: -6.2% in a single session
- Samsung Electronics: -4.7%
- SanDisk: -18% over five days (irrational — SanDisk makes NAND flash, not DRAM)
- NVIDIA: -6.6%
- Total erased: ~$100 billion in semiconductor market cap

**The overreaction argument (why analysts say it's wrong):**

1. TurboQuant only compresses inference-stage KV cache — not model weights, not HBM
2. A 70B model loads ~140GB of weights into HBM regardless of cache compression — this doesn't change
3. HBM demand is driven by model weights, not the variable cache
4. The algorithm was still a research paper with no official production code
5. SanDisk selling off made zero sense — they make NAND storage, not DRAM
6. Jevons Paradox: cheaper inference → more inference → more total memory demand (what happened after DeepSeek)
7. Goldman Sachs projects 4.9% DRAM undersupply in 2026
8. Micron's entire 2026 HBM production is reportedly sold out under binding contracts
9. SK Hynix + Samsung control ~80% of HBM supply; manufacturing cannot quickly scale

**What Cloudflare CEO Matthew Prince said:** Called TurboQuant "Google's DeepSeek moment" — which may have amplified the panic.

**Analyst consensus:** Broadly bullish on Micron despite volatility. Average price target $524.73 (+37% upside at time of writing). Forward P/E just 6.92x, well below semiconductor sector average.

### Community Implementation Landscape

Multiple independent implementations were built within days of the paper:

| Project | Focus | Status |
|---------|-------|--------|
| TheTom/turboquant_plus | llama.cpp + Metal (Apple Silicon) | 4.4k stars, most complete |
| tonbistudio/turboquant-pytorch | From-scratch PyTorch, 5x compression | Active |
| back2matching/turboquant | HuggingFace drop-in, pip installable | pip install turboquant |
| RecursiveIntell/turbo-quant | Rust standalone library | Active |
| 0xSero/turboquant | vLLM adapter, Triton kernels | Active |
| nicedreamzapp/claude-code-local | Run Claude Code locally with TurboQuant | 122B at 41 tok/s |

**llama.cpp main branch:** Not yet merged as of late March 2026. Multiple active forks exist.

**Google official release:** Expected Q2 2026.

### Real-World Performance Validation

30+ community testers across:
- Apple Silicon: M1/M2/M3/M5 Max
- NVIDIA: RTX 3080 Ti / 3090 / 4090 / 5090
- AMD: 6800 XT / 9070 XT

Notable results:
- 104B model (Command-R+) at 128K context on MacBook M5 Max 128GB: works with turbo3
- RTX 5090 (Qwen 3.5-27B): 700K token context fits in 32GB VRAM with 4.6x compression
- M1 Max: turbo4 decode speed +33.9% at 38K context
- NIAH 70B: 30/30 single needle accuracy with TurboQuant

### Competition
- NVIDIA's KVTC method: claims 20x compression but requires per-model calibration
- Both debut at ICLR 2026

## Key Links Found
- https://github.com/TheTom/turboquant_plus — Main implementation (4.4k stars)
- https://github.com/ggml-org/llama.cpp/discussions/20969 — llama.cpp community discussion
- https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/ — Google blog post
- https://arxiv.org/abs/2504.19874 — TurboQuant arXiv paper
- https://arxiv.org/abs/2502.02617 — PolarQuant companion paper
- https://arxiv.org/abs/2406.03482 — QJL companion paper
- https://x.com/no_stp_on_snek/status/2036792058854121601 — Tom Turney's announcement tweet
- https://www.marktechpost.com/2026/03/25/google-introduces-turboquant-a-new-compression-algorithm-that-reduces-llm-key-value-cache-memory-by-6x-and-delivers-up-to-8x-speedup-all-with-zero-accuracy-loss/ — MarkTechPost overview
- https://www.decodingdiscontinuity.com/p/turboquant-memory-stock-sell-off-panic-paper-google — Why market overreacted
- https://en.bulios.com/status/259757-turboquant-panic-hits-memory-stocks-but-the-ai-fuel-story-is-still-hbm — Bulios analysis
- https://www.tradingkey.com/analysis/stocks/us-stocks/261722379-samsung-hk-hynix-memory-hbm-dram-google-turboquant-semi-conductor-tradingkey — TradingKey stock analysis
- https://winbuzzer.com/2026/03/26/googles-turboquant-reduces-ai-llm-cache-memory-xcxwbn/ — WinBuzzer summary
- https://vucense.com/ai-intelligence/local-llms/turboquant-extreme-compression-inference-sovereignty/ — Local inference guide
- https://github.com/tonbistudio/turboquant-pytorch — PyTorch implementation
- https://github.com/nicedreamzapp/claude-code-local — Claude Code local with TurboQuant

## Actionable Takeaways
- Install turboquant_plus if you run large models on Apple Silicon: `pip install turboquant` or clone TheTom/turboquant_plus and follow llama.cpp integration docs
- Use turbo4 (4-bit, 3.8x compression, +0.23% PPL) as the safe default — nearly identical quality to q8_0 with 3.8x memory savings
- Asymmetric K/V (keep K at q8_0, compress V) is the best quality/compression tradeoff for most use cases
- Enable Sparse V for free +22.8% decode speedup at long contexts with zero quality cost
- For stock market: the TurboQuant selloff was an overreaction — HBM demand (training) is unaffected, only inference DRAM (cache) is impacted; Jevons Paradox will likely increase total memory demand
- Watch for Google's official Q2 2026 release and llama.cpp main branch merge
- The pattern of "read the paper, implement before Google ships code" is a real opportunity for developer reputation

## Category
AI Tools / Dev / Hardware

## Type
Actionable / Reference / Inspiration
