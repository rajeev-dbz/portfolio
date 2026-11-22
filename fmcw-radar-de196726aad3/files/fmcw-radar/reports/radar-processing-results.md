# Frequency-modulated continuous-wave (FMCW) radar processing and measurement automation

Part 1 of the same simulated radar project as the companion convolutional vs spiking neural network (CNN/SNN) comparison.
No hardware validation. Completed core study, reviewed November 2026.

## Processing and campaign

77 GHz carrier, 1 GHz bandwidth, 40 microsecond chirps, 20 MHz sampling,
800 samples/chirp and 128 consecutive chirps. Fast Fourier Transform (FFT) range-bin spacing: 0.150 m.
Four ideal receivers estimate a 15 degree target at 14.940 degrees in the
noiseless integration example. Padding refines the angle grid, not resolution.

The 20-distance x 5-speed x 10-repeat campaign retains all 1,000 trials:
759 matches, 241 misses, 1,387 candidate peaks and 628 unmatched candidates.
Detection fractions are non-monotonic; no guaranteed range cutoff is inferred.

## Separate synthetic measurement studies

Crossed gauge repeatability and reproducibility (Gage R&R, GRR) study: 10 positions x 3 virtual operators x 3 repeats. GRR standard
 deviation 0.0361523 m, study variation 10.7202%, variance contribution 1.14923%,
number of distinct categories (ndc) 13. These metrics depend on the chosen synthetic part span.

Relative sensor-offset calibration uses 20 fitting pairs and 20 validation pairs
with independent noise at the same reference positions. Estimated offset
0.121185 m versus injected 0.120000 m. Validation mean difference changes from
0.117401 m to -0.003785 m, and root-mean-square error (RMSE) from 0.118213 m to 0.014346 m.
This does not establish absolute accuracy or generalization to unseen ranges.

Capability and uncertainty studies also use separate synthetic reference data.
They are not physical radar qualification. No hardware, field or real-time testing
was performed. Light detection and ranging (LiDAR) work remains paused.

The companion neural card covers the 15,000-map dataset, frozen CNN/SNN test
comparison and arithmetic energy proxy. The two cards are distinct presentations
of connected work, not independent experimental projects.

## Basic formulas and assumptions

### FMCW slope, delay and range

`S = B/Tc;  τ = 2R/c;  fb ≈ Sτ;  R ≈ c·fb/(2S)`

B is bandwidth (Hz), Tc chirp duration (s), S chirp slope (Hz/s), R range (m), c light speed (m/s), τ round-trip delay (s) and fb beat frequency (Hz). The stationary, ideal mixing model ignores within-chirp Doppler coupling.

For B = 1 GHz and Tc = 40 µs, S = 2.5 × 10¹³ Hz/s. A 30 m target gives a 5 MHz beat frequency.

Source: FMCW analytical signal model; project derivation.

### Range-bin spacing

`ΔR = c/(2B)`

ΔR is ideal FFT range-bin spacing (m) when the sampled chirp spans bandwidth B (Hz). Grid spacing does not establish measured sensor accuracy.

B = 1 GHz gives approximately 0.150 m.

Source: FMCW range-FFT model.

### Doppler velocity

`v = λ·fD/2;  λ = c/fc`

v is radial speed (m/s), fD Doppler frequency (Hz), λ wavelength (m), and fc carrier frequency (Hz). The project defines positive speed as approaching.

fc = 77 GHz gives λ ≈ 3.896 mm; the 128-chirp velocity grid is about 0.380 m/s.

Source: Monostatic Doppler relation.

### Array angle from adjacent phase

`θ = asin(λ·Δφ/(2πd))`

θ is broadside angle (radians), Δφ adjacent-receiver phase difference (radians), d antenna spacing (m) and λ wavelength (m). Assumes a far-field ideal uniform array and the selected unambiguous front hemisphere.

Four half-wavelength receivers; the ideal 15° target is estimated at 14.940° on the padded FFT grid.

Source: Uniform linear-array phase relation.

### Cell-averaging constant false alarm rate (CA-CFAR) threshold

`threshold = α·mean(Ptrain);  α = N·(Pfa^(−1/N) − 1)`

Ptrain contains training-cell power, N is the training-cell count, and the nominal probability of false alarm (Pfa) is defined under the ideal independent exponential-noise model. Hann windowing correlates bins, so the nominal value is not an empirical guarantee.

For N = 144 and nominal Pfa = 10⁻⁵, α ≈ 11.986.

Source: Cell-averaging CFAR analytical threshold.

### Crossed measurement variation

`σ²GRR = σ²repeat + σ²operator + σ²interaction`

Each variance has units m². The full-interaction crossed analysis of variance (ANOVA) separates repeated-measurement, virtual-operator and interaction terms; this is a standalone synthetic study.

GRR standard deviation = 0.0361523 m. Study variation 10.72% differs from variance contribution 1.15%.

Source: Crossed Gage R&R / ANOVA method.

### Relative offset fit and validation error

`δ̂ = mean(bcal − acal);  bcorr = b − δ̂;  RMSE = √mean((bcorr − a)²)`

a and b are paired sensor readings (m), δ̂ the calibration-only fitted offset (m), and RMSE a validation sensor-difference metric (m). Validation pairs use independent noise at the same reference positions.

Validation RMSE: 0.118213 m before correction and 0.014346 m after.

Source: Least-squares intercept fit and held-out RMSE.

### Combined mean-bias uncertainty

`uc = √(urepeat² + uref²);  U = k·uc`

urepeat is the standard uncertainty of the sample mean (m), uref an assumed reference standard uncertainty (m), uc combined uncertainty (m), U expanded uncertainty (m), and k a dimensionless coverage factor. Independent contributions are assumed.

The standalone reference study uses k = 2; this is not uncertainty for a single radar reading.

Source: Root-sum-square propagation for independent standard uncertainties.


## Plot-by-plot explanations and formulas

### Ideal beat-frequency spectrum

The direct ideal beat model produces a 5 MHz peak for a stationary target at 30 m. The FFT recovers that distance within numerical precision; this is a noiseless consistency check, not hardware accuracy.

`fb = 2S·R/c;  R = c·fb/(2S)`

fb: beat frequency (Hz); S: chirp slope (Hz/s); R: target range (m); c: light speed (m/s). This ideal stationary-target relation gives 5 MHz at 30 m.

### Analytical transmit/echo mixing

The transmit-minus-delayed-echo phase model produces the same beat-frequency result. The model works with analytical phase differences rather than sampling the 77 GHz radio-frequency (RF) waveform directly.

`smix(t) = stx(t)·conj(srx(t));  fb ≈ S·τ;  τ = 2R/c`

stx/srx: normalized complex transmit/echo signals; conj: complex conjugate; τ: round-trip delay (s); S: chirp slope (Hz/s). Analytical phase mixing assumes the delayed chirp is present over the observation.

### Clean single-target range-Doppler map

The ideal map resolves a synthetic target in range and radial speed. Positive speed means approaching; 128 consecutive chirps are used without idle time.

`R = c·fb/(2S);  v = λ·fD/2`

R: range (m); fb: fast-time beat frequency (Hz); v: radial speed (m/s); fD: slow-time Doppler frequency (Hz); λ: wavelength (m). Positive speed is approaching in this simulation.

### Noisy single-target range-Doppler map

Receiver noise raises the map floor around the target. This processing example uses the core signal model; its input signal-to-noise ratio (SNR) definition differs from the later neural dataset's reference-bin SNR.

`y = s + n;  SNRinput,dB = 10·log10(Psignal/Pnoise)`

y/s/n: normalized complex received signal, clean signal and noise; Psignal/Pnoise: mean input powers in the same units. This input-SNR definition differs from the later reference-FFT-bin SNR.

### Two-target range-Doppler map

Synthetic targets at 30 m/+5 m/s and 45 m/−3 m/s create two peaks. The 0.150 m range-bin spacing is not measured hardware accuracy, and the 0.380 m/s velocity grid quantizes the estimates.

`ΔR = c/(2B);  Δv = λ/(2M·Tc)`

ΔR: range-bin spacing (m); B: chirp bandwidth (Hz); Δv: velocity-bin spacing (m/s); M: chirp count; Tc: chirp duration (s). The velocity relation assumes consecutive chirps with no idle time.

### CA-CFAR detection and retained candidates

Both targets match within one range and velocity bin. Two additional unmatched peaks remain in the output; truth labels are used to assess detections, not to remove false candidates.

`threshold = α·mean(Ptrain);  α = N·(Pfa^(−1/N) − 1)`

Ptrain: training-cell power; N = 144 training cells; Pfa = 10⁻⁵ nominal probability; α ≈ 11.986. The analytical coefficient assumes independent exponential noise, while the Hann window correlates actual map bins.

### Ideal four-receiver angle spectrum

A 15° broadside target is estimated at 14.940° with a 256-point padded spatial FFT. Padding creates a finer angle grid without adding physical angular resolution to the four-element array.

`θ = asin(λ·Δφ/(2πd))`

θ: angle from broadside (radians); Δφ: adjacent-receiver phase difference (radians); d: element spacing (m); λ: wavelength (m). Applies to the ideal far-field uniform array within the chosen front hemisphere.

### Angle error over 600 noisy snapshots

There are 200 independent array snapshots at each of 5/10/20 dB channel SNR. Error bars show ±1 sample standard deviation, not confidence intervals. This standalone noise study is separate from the noiseless integrated radar cube.

`ei = θ̂i − θtrue;  s = √[Σi(ei − ē)²/(n − 1)]`

ei: signed angle error (degrees); ē: sample mean error (degrees); s: sample standard deviation (degrees); n = 200 snapshots per SNR. The plotted ±s bars are not confidence intervals.

### Automated campaign: match fraction versus distance

All 1,000 trials are retained. The first sampled distance below 90% match fraction is 39.211 m, but later fractions are non-monotonic; this does not establish a guaranteed detection-range cutoff.

`Match fraction = Nmatched/Ntrials`

Nmatched: trials with a valid truth-to-detection match; Ntrials: all trials at that distance, including misses. The fraction is dimensionless and is conditional on the project’s matching rule.

### Campaign range error

Range-error statistics describe matched trials only. Misses remain recorded separately, so the plotted conditional errors must not be interpreted as accuracy for every trial. Matching gates and FFT quantization affect the distribution.

`ei = R̂i − Ri;  bias = mean(ei);  s = √[Σi(ei − ē)²/(n − 1)]`

Ri/R̂i: true/estimated range (m); ei: range error (m); n: matched observations in the plotted group. Bias and sample spread exclude misses and therefore describe matched trials only.

### Campaign radial-speed error

Bias and spread summarize matched speed estimates across the campaign. The finite Doppler grid and selection of matched detections limit the interpretation; this is simulated estimation error, not calibrated hardware uncertainty.

`ei = v̂i − vi;  bias = mean(ei);  s = √[Σi(ei − ē)²/(n − 1)]`

vi/v̂i: true/estimated radial speed (m/s); ei: speed error (m/s); n: matched observations. The finite Doppler grid and match selection affect these conditional statistics.

### Campaign angle error

Angle statistics describe the campaign's matched detections with the ideal four-receiver model. Missing detections are not assigned zero error, and angular performance depends on SNR and the array assumptions.

`ei = θ̂i − θi;  bias = mean(ei);  s = √[Σi(ei − ē)²/(n − 1)]`

θi/θ̂i: true/estimated broadside angle (degrees); ei: angle error (degrees); n: matched observations. Missing detections are not treated as zero-error estimates.

### Synthetic crossed Gage R&R

Ten positions, three virtual operators and three repeats give 90 measurements. GRR study variation is 10.72%, while variance contribution is 1.15%; these are different metrics and depend on the chosen synthetic part span.

`σ²GRR = σ²repeat + σ²operator + σ²interaction;  %SV = 100·σGRR/σtotal`

Variance components have units m²; σGRR and σtotal are standard deviations (m); %SV is study variation (%). This full-interaction synthetic crossed study is not real operator or radar qualification.

### Relative sensor-offset correction

Fit on 20 calibration pairs, then assess 20 independent-noise validation pairs at the same reference positions. Validation sensor-difference RMSE falls from 0.118213 m to 0.014346 m. This is relative agreement, not absolute accuracy or unseen-range generalization.

`δ̂ = mean(bcal − acal);  eafter = bval − aval − δ̂;  RMSE = √mean(eafter²)`

a/b: paired sensor readings (m); δ̂: offset fitted using calibration pairs only (m); eafter: validation residual (m). Validation uses new noise at the same reference positions.

### Synthetic reference capability

Fifty readings of a 30 m reference use an assumed 1 m tolerance, injected noise/bias and a 1 mm quantization increment. Capability, resolution and mean-bias uncertainty are separate checks on this synthetic reference dataset, not radar hardware approval.

`Cg = 0.2·Ttol/(6s);  Cgk = (0.1·Ttol − |b|)/(3s)`

Ttol: chosen full tolerance width (m); s: sample standard deviation of readings (m); b: sample mean minus reference (m). These dimensionless indices use the standalone synthetic reference study, with Ttol = 1 m.


## Numeric result tables

Displayed values are rounded; the numeric JSON download retains stored precision.

### Radar settings and ideal range check

Parameters and outputs of the stationary noiseless check, using the analytical mixing model.

| Parameter | Value | Unit |
|---|---|---|
| Carrier frequency | 77.000 | GHz |
| Chirp bandwidth | 1.000 | GHz |
| Chirp duration | 40.000 | µs |
| Sampling rate | 20.000 | MS/s |
| Ideal target range | 30.000 | m |
| Samples per chirp | 800.000 | samples |
| Chirp slope | 2.50000e+13 | Hz/s |
| Round-trip delay | 200.000 | ns |
| Mixed beat frequency | 5.000 | MHz |
| Recovered ideal range | 30.000 | m |
| Absolute numerical range error | 1.06581e-14 | m |
| FFT range-bin spacing | 0.150 | m |
| Signed-FFT sampling boundary | 60.000 | m |
| Within one range bin | Yes | boolean |

Numerical agreement validates the model implementation, not measured radar accuracy.

Source: Saved radar-parameter CSV.

### All CFAR candidates retained

Two targets are present; matched and unmatched candidates are all shown.

| Candidate | Range (m) | Radial speed (m/s) | FFT power | Matched to truth |
|---|---|---|---|---|
| 1 | 24.450 | -14.458 | 8.29503e+04 | No |
| 2 | 45.000 | -3.044 | 2.53634e+09 | Yes |
| 3 | 30.000 | 4.946 | 2.51544e+09 | Yes |
| 4 | 42.000 | 16.741 | 8.76189e+04 | No |

Two unmatched candidates remain in the output rather than being removed using truth.

Source: Saved CFAR-candidate CSV.

### Angle error versus channel SNR

Standalone array snapshots: 200 trials at each channel SNR, 600 in total.

| Channel SNR (dB) | Trials | Mean signed error (°) | Sample standard deviation (°) |
|---|---|---|---|
| 5 | 200 | -1.080 | 7.468 |
| 10 | 200 | 0.101 | 2.065 |
| 20 | 200 | -0.001 | 0.639 |

These snapshot statistics are separate from the noiseless integrated radar cube; standard deviations are not confidence intervals.

Source: Saved angle-summary CSV.

### Automated campaign totals

20 distances × 5 speeds × 10 repetitions; every trial is retained.

| Outcome | Count |
|---|---|
| Trials | 1000 |
| Matches | 759 |
| Misses | 241 |
| Candidate peaks | 1387 |
| Unmatched candidates | 628 |

One aggregate match fraction does not describe performance at every distance.

Source: Saved per-distance campaign summaries.

### Campaign results at every sampled distance

Each row pools 50 trials across five speeds; this is a sampled match fraction, not a guaranteed range limit.

| Distance (m) | Trials | Matches | Match fraction | Unmatched candidates |
|---|---|---|---|---|
| 5.000 | 50 | 50 | 100.000% | 55 |
| 7.632 | 50 | 50 | 100.000% | 23 |
| 10.263 | 50 | 50 | 100.000% | 31 |
| 12.895 | 50 | 50 | 100.000% | 23 |
| 15.526 | 50 | 50 | 100.000% | 28 |
| 18.158 | 50 | 50 | 100.000% | 31 |
| 20.789 | 50 | 50 | 100.000% | 36 |
| 23.421 | 50 | 50 | 100.000% | 24 |
| 26.053 | 50 | 50 | 100.000% | 32 |
| 28.684 | 50 | 50 | 100.000% | 33 |
| 31.316 | 50 | 50 | 100.000% | 24 |
| 33.947 | 50 | 50 | 100.000% | 34 |
| 36.579 | 50 | 48 | 96.000% | 38 |
| 39.211 | 50 | 31 | 62.000% | 35 |
| 41.842 | 50 | 43 | 86.000% | 26 |
| 44.474 | 50 | 6 | 12.000% | 35 |
| 47.105 | 50 | 21 | 42.000% | 23 |
| 49.737 | 50 | 1 | 2.000% | 33 |
| 52.368 | 50 | 6 | 12.000% | 30 |
| 55.000 | 50 | 3 | 6.000% | 34 |

Non-monotonic later results are retained; conditional error statistics for all 100 distance-speed conditions are also downloadable.

Source: Saved campaign summary by range; exact CSV included.

### Synthetic crossed-ANOVA variance components

10 positions × 3 virtual operators × 3 repeats; full interaction retained.

| Component | Estimated variance (m²) |
|---|---|
| Repeatability | 3.28282e-04 |
| Virtual operator | 8.08714e-04 |
| Part/operator interaction | 1.69990e-04 |
| Part-to-part | 1.12420e-01 |
| Total Gage R&R | 1.30699e-03 |
| Total variation | 1.13727e-01 |

Gage R&R and total rows are derived totals, not additional independent components to sum again.

Source: Saved variance-components JSON.

### Synthetic measurement-system metrics

All metrics depend on the artificial part span and scenario.

| Metric | Value | Unit |
|---|---|---|
| GRR standard deviation | 0.036152 | m |
| Study variation | 10.7202 | % |
| Variance contribution | 1.1492 | % |
| Distinct categories (ndc) | 13 | count |

Study variation and variance contribution are different percentages; this is not hardware or real-operator approval.

Source: Saved Gage R&R metrics JSON.

### Held-out relative sensor-offset correction

20 fitting pairs and 20 independent-noise validation pairs at the same positions; fitted offset 0.121185 m versus injected 0.120000 m.

| Validation metric | Before correction | After correction |
|---|---|---|
| Mean sensor difference (m) | 0.117401 | -0.003785 |
| Sensor-difference RMSE (m) | 0.118213 | 0.014346 |

A constant correction removes relative bias; it does not reduce the injected random noise or establish absolute accuracy.

Source: Saved sensor-offset metrics JSON.

### Standalone reference capability and uncertainty

Synthetic 30 m reference, 1 m full tolerance, 1 mm quantization and 50 readings; independent reference/repeat assumptions.

| Metric | Value | Unit |
|---|---|---|
| Readings | 50 | count |
| Mean reading | 30.01702 | m |
| Mean bias | 17.020 | mm |
| Reading sample standard deviation | 18.370 | mm |
| Cg | 1.81458 | dimensionless |
| Cgk | 1.50573 | dimensionless |
| Synthetic increment / tolerance | 0.100 | % |
| Radar FFT spacing / tolerance | 15.000 | % |
| Assumed reference standard uncertainty | 2.000 | mm |
| Combined mean-bias standard uncertainty | 3.279 | mm |
| Expanded mean-bias uncertainty (k=2) | 6.557 | mm |

The uncertainty is for mean bias, not a single radar reading; the 15% FFT-spacing/tolerance ratio is kept distinct from the synthetic 0.1% increment.

Source: Saved reference-capability metrics and uncertainty budget.

