# Convolutional vs spiking neural network (CNN/SNN) radar detection comparison

Neural extension of the same frequency-modulated continuous-wave (FMCW) simulation shown in the companion processing card.
No independent hardware dataset or field experiment.

## Frozen neural comparison

5,000 scenes with 1-3 targets and stationary clutter; three reference signal-to-noise ratios (SNRs)
(0/5/10 dB) give 15,000 maps. Scene-level splits contain 10,500 training,
2,250 validation and 2,250 test maps. Labels occupy nearest Fast Fourier Transform (FFT) cells.

Four models share convolution geometry and 673 trainable parameters. Each
trains for 50 epochs with Adam and training-derived weighted binary cross-entropy.
The SNNs use two leaky integrate-and-fire (LIF) layers, surrogate gradients and 16 neural steps. Minimum
validation loss selects checkpoints; validation background cells calibrate the
threshold at a pooled 1e-5 cell false-positive rate (FPR) target. The protocol is frozen before test. Model names: ReLU = rectified linear unit (ReLU) activation, LeakyReLU = leaky rectified linear unit (LeakyReLU) activation.

| Model | Test cell recall | Test cell FPR |
|---|---:|---:|
| ReLU CNN | 0.000% | 0 |
| LeakyReLU CNN | 6.118% | 8.28e-6 |
| Rate SNN | 10.279% | 9.05e-6 |
| Latency SNN | 17.094% | 9.19e-6 |

Recall remains low. The observed ranking is not an established architecture
advantage. Test FPRs are not exactly matched, and 10 dB subgroup rates exceed
1e-5 for all nonzero detectors. Rate-encoding seeds 13042/13043/13044 produce
10.28-10.68% recall, a 0.405 percentage-point spread; primary seed is unchanged.
All models miss the exact clutter-overlap case: only one scene at three SNRs.

## Target-free backgrounds and arithmetic proxies

A separate study uses 200 background scenes, paired noise-only and clutter-plus-
noise conditions, and three reference noise levels: 1,200 maps. Each condition
contains 30.72 million negative cells, but paired variants are correlated and
normalized noise-only maps repeat across reference levels. Observed noise-only /
clutter-noise false positive (FP) counts: ReLU CNN 0/0, LeakyReLU CNN 0/0, rate SNN 24/28,
latency SNN 0/9. Zero observed FP is not a guarantee of zero true rate.

Ideal event-driven synaptic arithmetic proxies per map: CNN dense 153.5 microjoules,
rate SNN 104.3 microjoules, latency SNN 84.0 microjoules. Dense SNN emulation:
2,455.3 microjoules in the same arithmetic proxy, reflecting 16 convolution passes.
These are not measured RTX 4060 or total-system energy. Historical 45 nm 32-bit floating-point (FP32)
costs are 0.9 pJ/add and 3.7 pJ/multiply (Hubara et al., JMLR 2018, Table 5,
attributed to Horowitz 2014). Memory, neuron dynamics, bias, encoding, temporal
aggregation, control and leakage are unpriced; 13.1 million LIF state updates
per map are reported separately. No hardware energy-saving claim is made.

## Verification and technical references

Final consistency review records 271 checks passed, with unregistered evidence
files explicitly listed as a limitation. This is software/evidence consistency,
not independent experimental or hardware validation.

- PyTorch: https://docs.pytorch.org/docs/2.15/
- snnTorch LIF model: https://snntorch.readthedocs.io/en/latest/snn.neurons_leaky.html
- Spike encoding: https://snntorch.readthedocs.io/en/latest/snntorch.spikegen.html
- Arithmetic reference: https://jmlr.csail.mit.edu/papers/volume18/16-456/16-456.pdf

## Basic formulas and assumptions

### Shared normalized map

`x = clip((10·log10(P/Pnoise) − L)/(U − L), 0, 1)`

P is FFT-cell power, Pnoise the known simulated expected noise-bin power, and L/U fixed clipping limits in dB. x is dimensionless; it is not an estimated hardware noise floor.

L = −20 dB and U = 30 dB; the same float32 map is used for CNN and spike encoding.

Source: Shared simulation preprocessing.

### Training-weighted binary loss

`ℓ = −[w·y·ln σ(z) + (1 − y)·ln(1 − σ(z))]`

z is a raw cell logit, y a binary nearest-cell label, σ the sigmoid and w the negative/positive cell ratio fitted from training data only. The loss is averaged over cells. Weighting is not probability calibration.

Training positive weight ≈ 25,338.37; validation and test do not fit the weight.

Source: PyTorch BCEWithLogitsLoss.

### Rate encoding

`p = clip(gx + b, 0, 1);  st ~ Bernoulli(p);  E[Σt st] = T·p`

x and p are dimensionless input/probability; g is gain, b offset, st a binary spike and T a count of neural steps. Draws use an explicit separate generator; neural steps are not radar chirps or physical seconds.

g = 1, b = 0 and T = 16. A finite spike fraction need not equal p exactly.

Source: snnTorch rate coding / PyTorch Bernoulli sampling.

### Linear latency encoding

`q = round_even[(T − 1)·(1 − max(x,h))];  st = 1{x ≥ h}·1{t = q}`

h is a dimensionless threshold, q the zero-based neural-step index and st a binary spike. Below-threshold inputs are silent; other inputs spike once. Rounding follows the library’s nearest-even rule.

T = 16 and h = 0.01. Stronger inputs spike earlier; normalized linear mode sets its effective time scale to T − 1.

Source: snnTorch latency / latency_code_linear.

### LIF state and delayed subtraction

`mt = β·m(t−1) + It − θ·1{m(t−1) > θ};  st = 1{mt > θ}`

m is membrane state, I input current, β retention and θ threshold. These are normalized model quantities, not measured volts or amps. Membranes start at zero for every new input sequence.

β = 0.9, θ = 1; reset-by-subtraction uses the previous state crossing.

Source: snnTorch Leaky forward implementation.

### Surrogate backward gradient

`∂s/∂z ≈ 1/(1 + k·|z|)²`

z is membrane minus threshold; k is a dimensionless surrogate slope. The hard forward output remains binary. This is an assigned backward approximation, not the true derivative of a discontinuous step.

k = 25 for the fast-sigmoid surrogate.

Source: snnTorch FastSigmoid backward implementation.

### Temporal raw-logit readout

`z̄ = (1/T)·Σt [Wout * s²t + bout]`

s²t is the second LIF layer’s spike map; Wout/bout are 1×1 readout convolution weights/bias and * denotes convolution. The output is a real score map, not a calibrated probability map.

Average 16 raw-logit maps, then apply weighted binary cross-entropy (BCE) directly; no output LIF or sigmoid before that loss.

Source: Project temporal-readout design / PyTorch mean reduction.

### Cell-level recall and false positives

`Recall = TP/(TP + FN);  FPR = FP/(FP + TN)`

True positives (TP) and false negatives (FN) count positive FFT cells; false positives (FP) and true negatives (TN) count negative FFT cells. This is exact-cell classification, not object detection or tracking. Thresholds are calibrated on validation negatives and frozen before test.

Pooled nominal validation target = 10⁻⁵; achieved test rates differ and subgroup rates may exceed it.

Source: Thresholded binary classification metrics.

### Synaptic arithmetic proxy

`Esyn = (3.7·Nmul + 0.9·Nadd) × 10⁻¹² J`

Nmul/Nadd are dimensionless operation counts. Coefficients are illustrative 45 nm FP32 pJ/op, not RTX 4060 measurements. Bias, LIF dynamics, encoding, aggregation, memory, control and leakage are unpriced.

A dense multiply-accumulate (MAC) costs 4.6 pJ in this proxy. Ideal binary events can use weight additions, but dense graphics processing unit (GPU) emulation does not automatically skip zero-spike work.

Source: Hubara et al., JMLR 2018, Table 5, attributed to Horowitz 2014.


## Plot-by-plot explanations and formulas

### Clean neural-dataset scene

A clean simulated scene establishes the target and map geometry before noise or clutter are added. The dataset uses nearest-FFT-cell target labels rather than object boxes or tracks.

`P(r,v) = |FFT₂{w·x}|²`

x: simulated complex radar cube; w: slow-time Hann window; FFT₂: range/Doppler transform; P: normalized-unit cell power. Labels mark nearest target cells, not object boxes or tracks.

### Reference-noise-level comparison

The same base scene is shown at 0/5/10 dB reference-bin SNR. SNR is defined using a hypothetical on-bin target at 30 m relative to expected mean noise-bin power, not whole-cube input SNR.

`SNRref,dB = 10·log10(Pref/E[Pnoise,bin])`

Pref: FFT peak power of a hypothetical on-bin 30 m target; E[Pnoise,bin]: expected noise power per FFT cell. The ratio sets receiver-noise strength, not total cube or target-specific SNR.

### Target, stationary clutter and noise

The target-plus-noise, clutter-only and combined maps show why near-zero-Doppler cells need separate analysis. Stationary point scatterers are synthetic and their labels remain background, including exact target/clutter overlap cases.

`y = starget + sclutter + n`

y: received complex cube; starget: target contribution; sclutter: stationary point-scatterer contribution; n: receiver noise. All amplitudes are normalized simulation quantities, and clutter is not labelled as a target.

### Initial 10-epoch CNN experiment

This is an intermediate baseline, not the final test result. Minimum validation loss selects epoch 10 at 0.942408. Online training loss and fixed-checkpoint validation loss describe different evaluation conditions.

`Lepoch = Σb(nb·ℓb)/Σb nb;  e* = argmin_e Lval(e)`

ℓb: mean training-weighted binary loss for batch b; nb: batch target-cell count; e*: first epoch with minimum validation loss. Cell weighting accounts for a smaller final batch.

### CNN 10- versus 50-epoch experiment

The fresh runs share seeds and settings apart from epoch budget; their first ten loss curves overlap. The 50-epoch ReLU CNN selects epoch 42 by validation loss. More training does not by itself guarantee better recall at a low false-positive rate.

`e* = argmin_e Lval(e)`

e*: selected epoch; Lval: weighted validation loss computed without parameter updates. Each run selects from its own fixed epoch budget; the first minimum wins ties.

### Intermediate CNN validation comparison

ReLU and LeakyReLU CNNs use a common pooled validation cell-FPR target. Conservative ties yield 0% recall for ReLU, versus 6.56% for LeakyReLU. These are validation metrics, not test scores.

`Recall = TP/(TP + FN);  FPR = FP/(FP + TN)`

TP/FN: correctly detected/missed target FFT cells; FP/TN: falsely positive/correctly negative background cells. Ratios are dimensionless, thresholds remain frozen, and these are cell metrics rather than object detection rates.

### Intermediate comparison including rate-SNN

Adding the rate-SNN gives 11.51% validation recall at the common pooled nominal target. Its rate encoding uses one fixed validation spike realization; this plot predates the latency-SNN comparison.

`Recall = TP/(TP + FN);  FPR = FP/(FP + TN)`

TP/FN: correctly detected/missed target FFT cells; FP/TN: falsely positive/correctly negative background cells. Ratios are dimensionless, thresholds remain frozen, and these are cell metrics rather than object detection rates.

### Final four-model validation comparison

Latency-SNN reaches 17.99% validation cell recall, versus rate-SNN 11.51% and LeakyReLU CNN 6.56%. Every nonzero detector's 10 dB subgroup exceeds the nominal pooled FPR target; pooled calibration is not per-SNR calibration.

`Recall = TP/(TP + FN);  FPR = FP/(FP + TN)`

TP/FN: correctly detected/missed target FFT cells; FP/TN: falsely positive/correctly negative background cells. Ratios are dimensionless, thresholds remain frozen, and these are cell metrics rather than object detection rates.

### Frozen held-out test comparison

Selected checkpoints and validation thresholds are frozen before test access. On 2,250 test maps, latency-SNN recall is 17.09%, rate-SNN 10.28%, LeakyReLU CNN 6.12%, and ReLU CNN 0%. Achieved test FPRs differ; recall is low and no architecture-wide advantage is established.

`Recall = TP/(TP + FN);  FPR = FP/(FP + TN)`

TP/FN: correctly detected/missed target FFT cells; FP/TN: falsely positive/correctly negative background cells. Ratios are dimensionless, thresholds remain frozen, and these are cell metrics rather than object detection rates.

### Predeclared encoding-seed sensitivity

With the same trained model and frozen threshold, three rate-encoding seeds give 10.28–10.68% recall, a 0.405 percentage-point spread. Seed 13042 stays primary. This tests encoding randomness, not training-seed robustness or a confidence interval.

`st ~ Bernoulli(p);  Recall spread = max_seed(Recall) − min_seed(Recall)`

st: binary rate-encoding spike at a neural step; p: normalized input probability. Recall spread is reported in percentage points across the three predeclared encoding seeds, not selected training seeds.

### Clutter and zero-Doppler failure cases

All detectors miss the exact-overlap stratum, which is only one base scene at three SNRs. Zero-row false-positive rates are higher than off-row rates, with latency-SNN highest on that row despite its higher overall recall.

`Recallg = TPg/(TPg + FNg);  FPRg = FPg/(FPg + TNg)`

g: a specified target or background stratum; TP/FN count its target cells and FP/TN its negative cells. The exact-overlap group has only three SNR variants of one base scene.

### Target-free background false positives

A separate 200-scene study yields 1,200 paired background maps. Observed noise/clutter false-positive counts are CNNs 0/0, rate-SNN 24/28 and latency-SNN 0/9. Reference variants are correlated and normalized noise-only inputs repeat; zero observed FP is not proof of zero true risk.

`FPR = FP/Nnegative`

FP: observed false-positive cells; Nnegative: all target-free cells in that condition (30.72 million). Reference variants and paired conditions are correlated, so cell count is not an independent-trial count.

### Spike activity and arithmetic energy proxy

Ideal event-driven synaptic arithmetic is estimated separately from dense emulation. Proxies per map are CNN 153.5 µJ, rate-SNN 104.3 µJ and latency-SNN 84.0 µJ; dense SNN emulation is 2,455.3 µJ in the same arithmetic model. Unpriced memory, neuron updates and other overheads prevent a measured-energy or hardware-savings claim.

`Esyn = (3.7·Nmul + 0.9·Nadd) × 10⁻¹² J`

Nmul/Nadd: dimensionless arithmetic operation counts per map. Coefficients are illustrative 45 nm FP32 pJ/op from Hubara et al., Table 5; memory, LIF dynamics and other unpriced costs are excluded, so this is not measured GPU energy.


## Numeric result tables

Displayed values are rounded; the numeric JSON download retains stored precision.

### Scene-level dataset splits

Each of 5,000 base scenes has three SNR variants; variants of one scene never cross splits.

| Split | Base scenes | Maps | Positive cell labels |
|---|---|---|---|
| train | 3500 | 10500 | 21216 |
| validation | 750 | 2250 | 4509 |
| test | 750 | 2250 | 4446 |

Positive-label totals include the three correlated variants; they are not independent target trials.

Source: Verified full-dataset metadata.

### Training and selected checkpoints

All models use 673 parameters and 50 training epochs; checkpoint selection uses validation loss only.

| Model | Epochs | Selected epoch | Validation loss | Observed duration (min) |
|---|---|---|---|---|
| ReLU CNN | 50 | 42 | 0.884708 | 3.98 |
| LeakyReLU CNN | 50 | 49 | 0.901633 | 4.11 |
| Rate SNN | 50 | 42 | 1.052828 | 143.59 |
| Latency SNN | 50 | 46 | 0.917231 | 141.12 |

Observed wall times are run records, not controlled speed benchmarks; 16-step SNNs do more work despite equal parameter and epoch counts.

Source: Completed training metadata.

### Validation-calibrated operating points

Negative validation cells calibrate thresholds at a pooled nominal FPR target of 10⁻⁵.

| Model | Raw-logit threshold | TP | FP | Cell recall | Cell FPR |
|---|---|---|---|---|---|
| ReLU CNN | 4.685950 | 0 | 0 | 0.000% | 0.00000e+00 |
| LeakyReLU CNN | 6.809141 | 296 | 1151 | 6.565% | 9.99171e-06 |
| Rate SNN | 3.806142 | 519 | 1151 | 11.510% | 9.99171e-06 |
| Latency SNN | 4.975199 | 811 | 1149 | 17.986% | 9.97435e-06 |

ReLU ties force a conservative zero-detection threshold; all thresholds are frozen before test evaluation.

Source: Saved validation-calibration summaries.

### Frozen held-out test: four detectors

2,250 test maps and 4,446 target cells; checkpoints and validation thresholds remain frozen.

| Model | TP | FP | FN | Cell recall | Cell FPR |
|---|---|---|---|---|---|
| ReLU CNN | 0 | 0 | 4446 | 0.000% | 0.00000e+00 |
| LeakyReLU CNN | 272 | 954 | 4174 | 6.118% | 8.28157e-06 |
| Rate SNN | 457 | 1042 | 3989 | 10.279% | 9.04549e-06 |
| Latency SNN | 760 | 1059 | 3686 | 17.094% | 9.19306e-06 |

Latency-SNN has the highest observed recall here, but recall is low, achieved FPRs differ, and one trained seed per model does not establish a general architecture advantage.

Source: Frozen primary test summaries; full exact counts downloadable.

### Frozen test results by SNR

The same 750 base test scenes contribute one map at each reference SNR; no threshold is recalibrated by group.

| Model | Reference SNR (dB) | TP | FP | Cell recall | Cell FPR |
|---|---|---|---|---|---|
| ReLU CNN | 0 | 0 | 0 | 0.000% | 0.00000e+00 |
| ReLU CNN | 5 | 0 | 0 | 0.000% | 0.00000e+00 |
| ReLU CNN | 10 | 0 | 0 | 0.000% | 0.00000e+00 |
| LeakyReLU CNN | 0 | 28 | 40 | 1.889% | 1.04171e-06 |
| LeakyReLU CNN | 5 | 76 | 215 | 5.128% | 5.59917e-06 |
| LeakyReLU CNN | 10 | 168 | 699 | 11.336% | 1.82038e-05 |
| Rate SNN | 0 | 64 | 112 | 4.318% | 2.91678e-06 |
| Rate SNN | 5 | 141 | 272 | 9.514% | 7.08361e-06 |
| Rate SNN | 10 | 252 | 658 | 17.004% | 1.71361e-05 |
| Latency SNN | 0 | 133 | 108 | 8.974% | 2.81261e-06 |
| Latency SNN | 5 | 239 | 269 | 16.127% | 7.00548e-06 |
| Latency SNN | 10 | 388 | 682 | 26.181% | 1.77611e-05 |

Every nonzero detector exceeds the nominal pooled target in its 10 dB subgroup; pooled control is not subgroup control.

Source: Saved per-SNR primary test counts.

### Predeclared rate-encoding seeds

Same trained rate-SNN and threshold; only the encoding random number generator (RNG) seed changes.

| Encoding seed | TP | FP | Cell recall | Cell FPR |
|---|---|---|---|---|
| 13042 (primary) | 457 | 1042 | 10.279% | 9.04549e-06 |
| 13043 | 475 | 1051 | 10.684% | 9.12362e-06 |
| 13044 | 470 | 1037 | 10.571% | 9.00208e-06 |

Recall spread is 0.405 percentage points; seed 13042 stays primary, with no best-seed selection or training-seed robustness claim.

Source: Verified encoding-seed summary.

### Target-cell clutter strata

Exact overlap is one base scene repeated at three SNRs; the other groups contain 84 and 4,359 target cells.

| Model | Target stratum | Positive cells | TP | Cell recall |
|---|---|---|---|---|
| ReLU CNN | Exact overlap | 3 | 0 | 0.000% |
| ReLU CNN | Zero row, no overlap | 84 | 0 | 0.000% |
| ReLU CNN | Off zero row | 4359 | 0 | 0.000% |
| LeakyReLU CNN | Exact overlap | 3 | 0 | 0.000% |
| LeakyReLU CNN | Zero row, no overlap | 84 | 6 | 7.143% |
| LeakyReLU CNN | Off zero row | 4359 | 266 | 6.102% |
| Rate SNN | Exact overlap | 3 | 0 | 0.000% |
| Rate SNN | Zero row, no overlap | 84 | 13 | 15.476% |
| Rate SNN | Off zero row | 4359 | 444 | 10.186% |
| Latency SNN | Exact overlap | 3 | 0 | 0.000% |
| Latency SNN | Zero row, no overlap | 84 | 13 | 15.476% |
| Latency SNN | Off zero row | 4359 | 747 | 17.137% |

All models miss the three overlap cells, but that small correlated stratum cannot support general conclusions.

Source: Cached primary test clutter-stratum summary.

### False positives on and off the zero-Doppler row

These are negative cells in target-containing test maps, not target-free background scenes.

| Model | Background stratum | Negative cells | FP | Cell FPR |
|---|---|---|---|---|
| ReLU CNN | Zero-Doppler row | 899913 | 0 | 0.00000e+00 |
| ReLU CNN | Other rows | 114295641 | 0 | 0.00000e+00 |
| LeakyReLU CNN | Zero-Doppler row | 899913 | 29 | 3.22253e-05 |
| LeakyReLU CNN | Other rows | 114295641 | 925 | 8.09305e-06 |
| Rate SNN | Zero-Doppler row | 899913 | 46 | 5.11161e-05 |
| Rate SNN | Other rows | 114295641 | 996 | 8.71424e-06 |
| Latency SNN | Zero-Doppler row | 899913 | 86 | 9.55648e-05 |
| Latency SNN | Other rows | 114295641 | 973 | 8.51301e-06 |

Latency-SNN has the highest zero-row FPR despite the best overall recall; the limitation is retained.

Source: Verified negative-cell stratum counts.

### Separate target-free background study

200 base scenes, paired conditions and three reference levels; 30.72 million negative cells per condition.

| Model | Condition | Negative cells | FP | Cell FPR |
|---|---|---|---|---|
| ReLU CNN | Noise only | 30720000 | 0 | 0.00000e+00 |
| ReLU CNN | Clutter + noise | 30720000 | 0 | 0.00000e+00 |
| LeakyReLU CNN | Noise only | 30720000 | 0 | 0.00000e+00 |
| LeakyReLU CNN | Clutter + noise | 30720000 | 0 | 0.00000e+00 |
| Rate SNN | Noise only | 30720000 | 24 | 7.81250e-07 |
| Rate SNN | Clutter + noise | 30720000 | 28 | 9.11458e-07 |
| Latency SNN | Noise only | 30720000 | 0 | 0.00000e+00 |
| Latency SNN | Clutter + noise | 30720000 | 9 | 2.92969e-07 |

Normalized noise-only reference maps repeat, conditions are paired, and zero observed false positives do not guarantee zero true risk.

Source: Frozen background-only evaluation summaries.

### Synaptic arithmetic proxy per test map

Illustrative historical 45 nm FP32 costs: 0.9 pJ/add and 3.7 pJ/multiply; not RTX 4060 energy measurements.

| Model | Scenario / operation type | Operations per map | Proxy (µJ/map) |
|---|---|---|---|
| ReLU CNN | Dense MACs | 33359392 | 153.453 |
| LeakyReLU CNN | Dense MACs | 33359392 | 153.453 |
| Rate SNN | Ideal event additions | 115916409 | 104.325 |
| Rate SNN | Dense emulation MACs | 533750272 | 2455.251 |
| Latency SNN | Ideal event additions | 93306860 | 83.976 |
| Latency SNN | Dense emulation MACs | 533750272 | 2455.251 |

Dense SNN emulation uses 16 passes; bias, LIF dynamics, encoding, temporal aggregation, memory, control and leakage are unpriced, so no total-energy savings are established.

Source: Verified activity counts; Hubara et al., Table 5 arithmetic reference.

### Spike activity and unpriced neuron updates

Fractions are mean activity per neural step over 2,250 test maps; neurons are updated at all 16 steps.

| Model | Input activity | Hidden 1 activity | Hidden 2 activity | Event adds / dense MACs | LIF updates per map |
|---|---|---|---|---|---|
| Rate SNN | 35.083% | 19.605% | 52.730% | 21.717% | 13107200 |
| Latency SNN | 6.180% | 18.132% | 70.801% | 17.481% | 13107200 |

Low input spike activity does not imply low activity in every hidden layer or measured hardware energy savings.

Source: Verified per-layer activity counters.

