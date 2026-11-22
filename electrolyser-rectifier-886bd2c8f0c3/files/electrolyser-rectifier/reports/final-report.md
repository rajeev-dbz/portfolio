# Preliminary Design and Electrothermal Simulation of a Thyristor Rectifier for an Illustrative PEM Electrolyser


Rajeev Krishnan | Independent simulation project | 23 October 2026

Final report of the current preliminary simulation study. MATLAB R2026a, Autodesk Fusion and COMSOL Multiphysics 6.4.0.429 were used. This report consolidates the saved calculations and user-demonstrated stationary simulations; it is not experimental or industrial validation.


### Abstract


A reduced PEM cell model was scaled to an illustrative 100-cell, 1000 A load. At 60 degC, its nominal calculated output is 186.224 V and 186.224 kW. An averaged six-pulse bridge supplied from 160 V line-to-line RMS gives a nominal firing angle of 29.449 degrees after semiconductor conduction-drop accounting. Estimated conduction loss is 322.333 W per thyristor and 1934 W for six devices.

One two-sided device assembly was assessed in a stationary solid-domain electrothermal model. With 40 degC cooling air, assumed convection coefficient 100 W/(m2 K), 10 mm copper bars and ideal thermal interfaces, the device-surrogate maximum is 80.087 degC. The last mesh refinement changes this maximum by 0.022 K. The baseline normal-flux heat-balance mismatch is approximately 0.0617%.

Cooling and interface assumptions dominate the thermal uncertainty. Changing assumed convection from 50 to 150 W/(m2 K) gives device-body maxima from 105.870 to 71.382 degC. Adding 2e-4 m2 K/W at each of four alumina interfaces raises the maximum to 91.036 degC. A preliminary 24 V fan comparison gives almost no pressure margin in the higher assumed system-loss case. The fan calculation does not establish the convection coefficient.


### Scope boundary


The work connects a reduced load calculation, semiconductor loss estimates, CAD and stationary FEM. It excludes hardware, hydrogen production, grid compliance, converter control dynamics and solved airflow. The reported body maximum must not be interpreted as a validated semiconductor junction temperature. Unresolved source-model discrepancies and remaining verification work are retained in Section 8.

| Nominal study input | Value |
| --- | --- |

| Stack | 100 cells; 1000 cm2 active area per cell; 60 degC |

| DC current / power | 1000 A / 186.224 kW |

| Supply | 160 V line-to-line RMS; 50 Hz; zero source inductance |

| Thermal assembly | One device, two copper bars, two alumina plates, two heatsinks |


## 1. Reduced electrolyser load


The model adopts activation and membrane-loss relations from Liso et al. [1], a temperature-dependent reference reversible voltage from JRC [2], and an ideal-gas pressure correction. It is a combined-source reduced model rather than an exact reproduction of the published cell. Liquid-water activity is one and saturated atmospheric chambers are assumed. Concentration losses, crossover and transport dynamics are omitted.

Calculation structure<br/>V_cell = E_rev + eta_an + eta_ca + j_SI d_mem / sigma_mem<br/>eta_e = RT/(alpha_e F) asinh[j/(2 i0,e)]<br/>sigma_mem = F^2 c_H D_H/(RT)<br/>I_dc = j A_cell; V_stack = N_cell V_cell; P_dc = I_dc V_stack

Exchange-current densities include the source-specific roughness factors and Arrhenius temperature correction. Current density is converted from A/cm2 to A/m2 for membrane conduction. At 60 degC and 1 A/cm2, the reversible voltage is approximately 1.1952 V, activation contributions are 0.3730 V and 0.0771 V, and membrane loss is 0.2169 V.

| Current load [%] | I_dc [A] | V_stack [V] | P_dc [kW] |
| --- | --- | --- | --- |

| 25 | 250 | 161.407 | 40.352 |

| 50 | 500 | 170.618 | 85.309 |

| 75 | 750 | 178.726 | 134.045 |

| 100 | 1000 | 186.224 | 186.224 |

Load percentages refer to current, not power. Scaling from the 2.89 cm2 reference cell to 1000 cm2 assumes unchanged cell voltage at a given current density; it does not predict large-area flow, thermal or current-distribution effects.


### Reference comparison and unresolved residuals


At 1 A/cm2 and 60 degC, the calculated cell voltage is 1.8622 V versus approximately 1.78 V read visually from Figure 5 of [1], a difference of about +0.082 V. At 80 degC, the anode activation comparison is close by visual inspection, but the calculated cathode activation of approximately 0.0772 V differs from a visual reading near 0.010 V in Figure 7. The cause remains unresolved. No parameters were adjusted to force agreement; these comparisons are not validation.

The adopted IrO2 density of 11.66 g/cm3 replaces a blank source-table entry. Antoine coefficients and SI conductivity interpretation were checked separately in the project source register. Unquantified figure-reading error and parameter substitutions limit the load-model accuracy claim.


## 2. Averaged rectifier and semiconductor loss


A balanced six-pulse controlled bridge is assumed with constant, continuous DC current and ideal 120-degree conduction per device. Source inductance is zero, so commutation overlap is omitted. The average and RMS device currents are evaluated over a full electrical cycle.

Relations used<br/>I_T,av = I_dc/3; I_T,rms = I_dc/sqrt(3)<br/>P_device = V_T0 I_T,av + r_T I_T,rms^2<br/>P_bridge = 6 P_device = 2(V_T0 I_dc + r_T I_dc^2)<br/>V_d0 = (3 sqrt(2)/pi) V_LL,rms<br/>V_stack = V_d0 cos(alpha) - P_bridge/I_dc

Infineon T1700N16H75 forward-loss parameters V_T0 = 0.80 V and r_T = 0.167 milliohm are taken at the datasheet 135 degC condition [3]. They are held fixed; there is no iterative junction-temperature-dependent loss model. Switching, recovery, transformer, reactor and auxiliary losses are omitted.

| I_dc [A] | P_device [W] | P_bridge [W] | alpha [deg] | Conduction-only eta [%] |
| --- | --- | --- | --- | --- |

| 250 | 70.146 | 420.875 | 40.994 | 98.968 |

| 500 | 147.250 | 883.500 | 37.080 | 98.975 |

| 750 | 231.312 | 1387.875 | 33.310 | 98.975 |

| 1000 | 322.333 | 1934.000 | 29.449 | 98.972 |

At nominal load, I_T,av = 333.333 A and I_T,rms = 577.350 A. The calculated 98.972% efficiency includes only the semiconductor conduction losses listed above; it is not total converter efficiency. The independently rearranged bridge-loss identity and average-voltage reconstruction are asserted in the MATLAB script.

Ideal blocking stress is sqrt(2) x 160 = 226.27 V, below the listed 1600 V repetitive blocking rating. Nominal device currents are also below the listed ratings at 85 degC case temperature. These preliminary comparisons do not establish device suitability under transients, fault currents, clamping, cooling or real waveforms.

Figure 1. Ideal device-current waveform from the project MATLAB calculation. It illustrates the assumed conduction duty, not switching or overlap simulation.

![Figure](../../MATLAB/step2_device_current.png)


## 3. Geometry, materials and FEM formulation


| Part | Representation and input |
| --- | --- |

| Device surrogate | 75 mm envelope diameter; 26.5 mm height; 50 mm contact footprints; assumed 1 mm annular relief |

| Copper bars (two) | 100 x 60 x 10 mm baseline; conductivity 5.998e7 S/m; thermal conductivity 400 W/(m K) |

| Alumina plates (two) | 100 x 60 x 1 mm; generic library alumina; thermal conductivity 35 W/(m K) |

| Heatsinks (two) | 100 x 60 mm footprint; 5 mm base; nine 2 mm thick, 30 mm high fins; eight 5 mm channels |

| Heatsink material | COMSOL 6061 solid, T6 temper library material; library temperature dependence |

| Device conductivity | Equivalent k = 140.4294 W/(m K), calibrated against two-sided DC RthJC = 0.017 K/W |

The device conductivity is an equivalent stationary calibration: uniform 1 W heating and prescribed temperatures on the two contact faces are used to match the selected datasheet resistance. It does not resolve the die, package or junction. Device density and heat capacity are placeholder values unsuitable for transient predictions. Datasheet clamping requirements are not mechanically simulated.

The imported baseline is finalized with Form Union and contains seven solid domains. Heat Transfer in Solids covers all seven. Electric Currents and Electromagnetic Heating cover only the two copper bars, avoiding semiconductor heat double-counting. A separate total heat-rate source of 322.3333 W is applied to the device domain.

The copper bars are electrically disconnected within the selected electrical domains, so each has its own terminal and ground. The upper path runs from its terminal end to the device footprint; the lower path runs from the device footprint to its terminal end. Both carry 577.350 A RMS in this stationary resistive equivalent. The contact footprint is equipotential; finite electrical contact resistance and semiconductor conduction are not solved.

Thermal contacts are ideal in the baseline. Exposed heatsink faces exchange heat through q_out = h(T - T_air), with h = 100 W/(m2 K) and T_air = 313.15 K. Other exterior faces are insulated. Total selected convection area is 0.12516 m2. There is no fluid domain, radiative cooling or resolved spatial air warming.

Fusion also contains entrance ducts, fin covers and a hidden 120 x 120 x 38 mm candidate fan envelope. These packaging concepts are not included in the seven-solid thermal model. The pressure calculation is separate from this solid model; shrouding effects are not resolved by CFD. Mounting holes and manufacturing details are outside this simulation scope.


## 4. Baseline results and numerical checks


| Mesh | Tetrahedra | Device max [degC] | Sink max [degC] | Cu loss [W] |
| --- | --- | --- | --- | --- |

| Fine | 220,445 | 80.051 | 72.816 | 0.62444 |

| Finer | 317,979 | 80.065 | 72.826 | 0.62527 |

| Extra fine | 550,238 | 80.087 | 72.841 | 0.62606 |

Fine-to-Finer and Finer-to-Extra-fine changes in device maximum are 0.014 K and 0.022 K. The latter is approximately 0.055% of the Finer temperature rise above 40 degC. Copper-loss changes are 0.133% and 0.126%. This demonstrates low sensitivity of these outputs over the tested meshes, not a formal convergence-order or grid-convergence-index result. No claim of monotonic asymptotic error reduction is made.

| Extra fine check | Result |
| --- | --- |

| Device-body / heatsink maximum | 80.087 / 72.841 degC |

| Total input | 322.3333 + 0.62606 = 322.95936 W |

| Convective output / normal-flux output | 322.96 / 322.76 W |

| Normal-flux mismatch | 0.0617% of total input, using rounded values |

| Electrical terminals | 577.350 A each; 0.542353 / 0.542091 mV |

| Electrical terminal / volume power | 0.62610389 / 0.62606 W; approximately 0.007% mismatch |

Terminal-power agreement checks consistency between electrical input and integrated resistive heating. Equal prescribed terminal currents alone do not replace signed current integrals at every terminal and return. The earlier straight-copper-bar exercise checked the analytical R = L/(sigma A) limit and signed end currents; a complete signed-current audit of this assembly remains outstanding.

Figure 2. Baseline stationary temperature distribution, Extra fine mesh, 40 degC air and assumed h = 100 W/(m2 K). The device-body maximum is not a validated junction temperature.

![Figure](../../COMSOL/step3d_temperature_extrafine_40C_h100.png)


## 5. Cooling and thermal-interface sensitivity



### 5.1 Assumed cooling strength and air temperature


| Air [degC] | h [W/(m2 K)] | Device maximum [degC] |
| --- | --- | --- |

| 40 | 50 | 105.87 |

| 40 | 100 | 80.065 |

| 40 | 150 | 71.382 |

| 45 | 100 | 85.039 |

These cases use the Finer mesh. Halving h from 100 to 50 raises the body maximum by 25.805 K. Raising the uniform air temperature by 5 K at h = 100 raises it by 4.974 K. The latter is a uniform warmer-air scenario, not a resolved air-temperature field or proof of the actual mean inlet/outlet condition.

Figure 3. Finer-mesh cooling sensitivity. Lines connect tested cases and are not an independently established continuous performance law.

![Figure](../../MATLAB/step3e_cooling_sensitivity.png)


### 5.2 Assumed interface resistance


| Each interface R [m2 K/W] | Device max [degC] | Sink max [degC] | Cu loss [W] |
| --- | --- | --- | --- |

| 0e+00 | 80.087 | 72.841 | 0.62606 |

| 1e-04 | 85.605 | 72.353 | 0.62606 |

| 2e-04 | 91.036 | 72.146 | 0.62606 |

The same area-specific resistance is applied at four internal faces (9, 12, 19, 22), on both sides of each alumina plate, through Thermal Contact / Equivalent thin resistive layer. The solid alumina remains present. Device-to-copper contacts are unchanged. These values are assumed sensitivity inputs, not measured surface properties.

At 2e-4 m2 K/W, device maximum rises by 10.949 K while sink maximum decreases slightly, consistent with redistributed interface heat flow. Output heat is 322.92 W by convection and 322.93 W by normal flux, versus 322.95936 W input: approximately 0.0122% and 0.0091% discrepancies. Lower sink maximum alone does not indicate improved device cooling.


## 6. Busbar thickness and thermal hand check


| Bar thickness [mm] | Device max [degC] | Combined Cu loss [W] |
| --- | --- | --- |

| 5 | 80.497 | 1.161 |

| 10 | 80.087 | 0.62605 |

| 15 | 80.138 | 0.44715 |

Both bars are scaled only through thickness about their device-contact planes. Each heatsink/insulator stack is translated to retain contact. The transformed 10 mm case reproduces 80.087 degC and gives 0.62605 W loss, versus 0.62606 W in the original. Cases use Extra fine sizing, unchanged current, source heat and cooling.

Increasing thickness from 5 to 15 mm reduces copper loss from 1.16100 to 0.44715 W. The 10-to-15 mm reduction is approximately 28.6%, while device maximum changes by only +0.051 K. Thickness affects electrical resistance, spreading and through-thickness thermal conduction together. These three cases do not establish an optimum or justify attributing the small temperature difference to one mechanism. Each thickness was not independently mesh-converged.


### 6.1 Isothermal convection estimate


For a perfectly isothermal combined exposed surface, R_conv,ideal = 1/(h A_total) = 0.07990 K/W. At 322.95936 W, T_surface,ideal = 40 + Q R = 65.804 degC. Actual simulated surfaces are not isothermal; this value is the area-weighted convection temperature implied by the simplified balance when h is uniform, and an idealized reference relative to maxima.

Effective maximum-temperature resistances derived from FEM are (72.841 - 40)/322.95936 = 0.10169 K/W for the sink maximum and (80.087 - 40)/322.95936 = 0.12412 K/W for the device maximum. These refer to the combined assembly and summarize FEM results; they are not independent thermal-network validation.

For the interface sweep, a simple equal-flow, uniform-flux estimate provides an additional scale check. Each branch carries Q/2 and crosses two interfaces of area 0.006 m2. The added equivalent resistance of the two parallel branches is R_area/0.006, giving about 5.38 K and 10.77 K added rise for 1e-4 and 2e-4 m2 K/W. FEM increases are 5.518 K and 10.949 K. This approximate agreement is consistent with the imposed resistance scale; spatial spreading and nonuniform heat flux are omitted from the hand estimate.


### 6.2 Interpretation


Within the tested assumptions, cooling strength and interface resistance have much larger effects on device temperature than bar thickness. Copper loss is small relative to the imposed device source, but the bar-current geometry remains important for the electrical-loss calculation. A source-specific thermal network including spreading and device thermal endpoints is still needed for a fuller analytical comparison.


## 7. Preliminary fan and flow assessment


A Delta PFB1224GHE, 24 V DC, 120 x 120 x 38 mm fan is retained as a candidate [4]. The local datasheet gives nominal 1.35 A / 32.4 W and free-air flow around 217.79 CFM with maximum static pressure around 27.31 mmH2O. Free-air flow and shutoff pressure are separate endpoints, not simultaneous operating values.

The model assumes equal parallel flow through two shrouded heatsinks, eight 5 x 30 mm channels per sink and 100 mm channel length. Total flow area is 0.0024 m2 and hydraulic diameter is 8.571 mm. Air inputs near 40 degC are approximate: rho = 1.127 kg/m3, Cp = 1007 J/(kg K), viscosity = 1.91e-5 Pa s.

Flow and pressure estimates<br/>Vdot_required = Q/(rho Cp DeltaT_air)<br/>DeltaP_system = (f L/Dh + K) rho v_channel^2/2<br/>f = 0.3164/Re^0.25, used only for 4000 &lt;= Re &lt;= 100000

For a 10 K assumed air rise, required total flow is approximately 1.707 m3/min (60.30 CFM), channel velocity 11.86 m/s and Reynolds number about 6000. Short developing rectangular channels, splitter losses, leakage and unequal flow are not resolved. Lower-Reynolds-number cases deliberately have no pressure estimate in the selected script.

| Assumed K | Crossing flow [m3/min] | Pressure [Pa] | Air rise [K] | Margin at required flow [Pa] |
| --- | --- | --- | --- | --- |

| 1.5 | 1.8918 | 185.64 | 9.026 | 40.59 |

| 2 | 1.7112 | 192.51 | 9.978 | 0.97 |

Fan-curve points are approximate visual readings of the primary m3/min and mmH2O axes on datasheet page 4. Fan pressure is scaled by rho40/rho25 at fixed speed, using rho25 = 1.184 kg/m3; straight interpolation is used. Crossings are illustrative model intersections, not measured duty points.

The K = 2 case has only 0.97 Pa estimated pressure margin at the required flow. That is too small to support a robust selection given curve-reading, tolerance and installation uncertainties. Fan power heating is not included in the Q-based air-rise estimate. No verified relationship from these flows to h = 100 W/(m2 K) has been calculated. Retain the fan as a candidate pending better pressure-loss data or installed-flow validation.


## 8. Conclusions, limitations and next work


The implemented study provides a traceable preliminary chain from an illustrative PEM load through average thyristor losses to stationary temperatures. The nominal semiconductor conduction estimate is 322.333 W per device. One baseline assembly predicts 80.087 degC device-body maximum and 72.841 degC heatsink maximum at 40 degC air with assumed h = 100 W/(m2 K). Numerical heat and electrical power comparisons are close, and the tested baseline outputs have low mesh sensitivity.

Cooling assumptions materially affect the result. The tested h range produces 71.382 to 105.870 degC device-body maxima; assumed interface resistance raises the baseline by up to 10.949 K. Increasing copper thickness reduces resistive loss, while its tested effect on device temperature is small. These findings identify modelling priorities rather than certify a hardware design.

| Outstanding item | Consequence / next action |
| --- | --- |

| PEM reference mismatch | Resolve source conventions and parameter substitutions; compare against digitized data with reading uncertainty. |

| Convection and fan uncertainty | Establish pressure losses and actual airflow; derive or validate heat transfer. Include air warming, bypass, fan heating and flow split. |

| Device thermal surrogate | Do not compare its body maximum directly with the 135 degC junction limit. Establish consistent case/junction endpoints and source-specific network. |

| Contacts and insulation | Measure or source interface resistance, clamping and actual pad properties. No dielectric or mechanical certification is implied. |

| Electrical verification | Complete signed return-current integrals for the assembly and a geometry-matched analytical resistance comparison. |

| Scope of converter model | No overlap, switching/recovery loss, ripple, control, protection, THD or grid-compliance assessment. |

| Reproducibility | Independent COMSOL rerun and automatic extraction of all sensitivity outputs are not completed. Some CSVs are manually transcribed rounded results. |

This report closes the documented preliminary results package, not every evidence gate in the frozen implementation plan. A detailed source-specific thermal-network comparison, assembly signed-current audit and reproducibility rerun remain open. No physical tests or proprietary product claims are made.


### Recommended continuation


First complete the remaining analytical and current-conservation checks. Then prioritize measured or justified cooling/contact data over adding geometric manufacturing detail. A subsequent project can extend the model to conjugate heat transfer or converter dynamics after these baseline uncertainties are addressed. No further parameter sweep is necessary merely to reproduce the comparisons already reported.


## 9. Reproduction and evidence inventory


Run MATLAB from the project MATLAB folder. Scripts overwrite their named outputs. Review assumptions before running. Base calculations use no optional toolbox. COMSOL files were operated by the applicant; the report author inspected saved sources, tables and supplied screenshots without independently rerunning the solver.

| Order / artifact | Purpose |
| --- | --- |

| project_parameters.m; step1_activation_check.m | Shared inputs; reduced cell and illustrative stack outputs |

| step2_rectifier.m; step2_current_waveform_check.m | Average losses, firing angles, efficiency accounting and ideal current waveform |

| step3d_cooling_airflow_estimate.m; step3d_fan_curve_check.m | Assumed air-rise and fan/system comparison |

| step3e_thermal_checks.m | Manual FEM result compilation, mesh and cooling CSVs, cooling plot |

| step3f_thermal_resistance_check.m | Ideal convection check and effective FEM resistance summary |

| step3g_busbar_thickness_results.m | Manual compilation of 5, 10, 15 mm cases |

| step3h_contact_resistance_results.m | Manual compilation of contact cases and rounded heat balance |

COMSOL baseline: COMSOL/step3d_cooling_design.mph, nominal 10 mm bars, ideal contacts, 40 degC air, h = 100 and Extra fine mesh. Thickness study: COMSOL/step3g_busbar_thickness_sensitivity.mph, last demonstrated case 15 mm. Contact study: COMSOL/step3h_contact_resistance_sensitivity.mph, last demonstrated resistance 2e-4 m2 K/W at each selected alumina interface. Confirm saved parameters and recompute before using any displayed historical table column.

COMSOL tables contain appended historical results. The labelled MATLAB CSVs separate cases, but they are rounded manual transcriptions rather than automatic model extraction. The baseline electrical export also includes historical columns; its final five values provide the current terminal results. The baseline temperature PNG is the report figure source. Native models and source files remain in the project and are not embedded in the PDF.


### Reporting conventions


Temperatures are in degC and temperature differences in K. Interface resistance is area-specific (m2 K/W); effective assembly resistance is K/W. One-assembly heat input is about 323 W, not the six-device bridge loss of 1934 W. Mesh refinement applies to the baseline; each changed geometry or interface case has not separately undergone a three-mesh study. Numerical balances use rounded exports unless full precision is available.


## 10. References and source traceability


[1] Liso, V., Savoia, G., Araya, S. S., Cinti, G. and Kaer, S. K. (2018). Modelling and Experimental Analysis of a Polymer Electrolyte Membrane Water Electrolysis Cell at Different Operating Temperatures. Energies 11, 3273. Tables 3-4; equations 31-37; Figures 5 and 7.<br/><link href="https://doi.org/10.3390/en11123273" color="#245779">Source link</link>

[2] European Commission JRC. EU harmonised polarisation curve test method for low-temperature water electrolysis. JRC104045, Equation 2, printed page 20. Temperature correlation implemented in kelvin.<br/><link href="https://publications.jrc.ec.europa.eu/repository/bitstream/JRC104045/kjna29182enn_online.pdf" color="#245779">Source link</link>

[3] Infineon. T1700N16H75 Phase Control Thyristor technical information. Revision 3.2, 11 May 2021. Pages 2-4: electrical loss parameters, thermal resistances and envelope. Local copy: MATLAB/infineon-t1700n16h75-vt-datasheet-en.pdf.<br/><link href="https://www.infineon.com/assets/row/public/documents/60/49/infineon-t1700n16h75-vt-datasheet-en.pdf" color="#245779">Source link</link>

[4] Delta Electronics. PFB1224GHE specification. Local six-page PDF: COMSOL/PFB1224GHE.pdf. Page 4 pressure/flow curve; page 5 dimensions; page 6 nominal test conditions. Approximate curve readings only.<br/><link href="https://www.delta-fan.com/Download/Spec/PFB1224GHE.pdf" color="#245779">Source link</link>

[5] WaterTAP documentation. Air-water equilibrium property package. Used to cross-check Antoine coefficients 8.07131, 1730.63 and 233.426; temperature in degC and saturation pressure in mmHg. Rolling source; version not pinned.<br/><link href="https://watertap.readthedocs.io/en/stable/_modules/watertap/property_models/air_water_equilibrium_prop_pack.html" color="#245779">Source link</link>

[6] Assessing Optical and Electrical Properties of Highly Active IrOx Catalysts for the Electrochemical Oxygen Evolution Reaction via Spectroscopic Ellipsometry. ACS Catalysis (2020). Project register records crystalline IrO2 reference density 11.66 g/cm3 as a replacement assumption; effective catalyst density is not established.<br/><link href="https://pubs.acs.org/accacs/article/10/23/14210/498212/Assessing-Optical-and-Electrical-Properties-of" color="#245779">Source link</link>

[7] NASA-hosted technical report, NTRS citation 19800005932, printed page 55. Project method reference for hydraulic diameter and smooth turbulent-channel friction approximation; not measured data for this assembly.<br/><link href="https://ntrs.nasa.gov/api/citations/19800005932/downloads/19800005932.pdf" color="#245779">Source link</link>

[8] Oriental Motor, cooling-fan technical reference, F-52; Omron, Axial Fans Technical Guide. Method references for system pressure/flow and air-rise estimates; project uses explicit assumed air properties.<br/><link href="https://www.orientalmotor.com/products/pdfs/F_TecRef/TecRefAll.pdf" color="#245779">Source link</link>

[9] COMSOL Multiphysics 6.4 Heat Transfer documentation: Heat Flux and modelling heat-flux definitions. Boundary formulation reference; not validation of the chosen cooling coefficient.<br/><link href="https://doc.comsol.com/6.4/doc/com.comsol.help.heat/heat_ug_ht_features.09.065.html" color="#245779">Source link</link>

Source provenance: project SOURCES_ASSUMPTIONS.md and PROGRESS_RESULTS.md, local MATLAB sources/CSVs, manufacturer PDFs and applicant screenshots through 23 October 2026. Existing source links are reproduced for traceability; this report does not claim a new external source audit. Earlier progress-register entries predate the latest sweeps and should not be treated as the current results summary.