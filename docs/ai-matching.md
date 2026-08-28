# 🧠 Multimodal AI Matching Formulation

## Hybrid Scoring Equation

$$S_{total} = \Big( w_v \cdot S_{visual} + w_t \cdot S_{text} + w_c \cdot S_{cat} \Big) \times \Big( D_{spatial} \times D_{temporal} \Big) + B_{ocr}$$

### 1. Dynamic Weight Rebalancing
- When both items have photos:
  - $w_v = 0.45$, $w_t = 0.30$, $w_c = 0.25$
- When either item lacks photos:
  - $w_v = 0.00$, $w_t = 0.70$, $w_c = 0.30$

### 2. Spatiotemporal Decay Functions
- **Temporal Decay**:
  $$D_{temporal} = \exp(-0.05 \cdot \Delta t_{\text{days}})$$
- **Spatial Decay**:
  $$D_{spatial} = \frac{1}{1 + 0.5 \cdot \text{distance(km)}}$$
  Or Campus Zone Adjacency: Exact Match = `1.0`, Adjacent Zone = `0.8`, Distant Zone = `0.4`.

### 3. OCR Bonus
$$B_{ocr} = +0.25 \quad \text{if } |\text{lost.ocr\_tokens} \cap \text{found.ocr\_tokens}| > 0$$

### 4. Decision Thresholds
- $S_{total} \ge 0.80 \rightarrow$ `HIGH_CONFIDENCE`
- $0.55 \le S_{total} < 0.80 \rightarrow$ `POTENTIAL`
- $S_{total} < 0.55 \rightarrow$ `REJECTED` (Discarded)
