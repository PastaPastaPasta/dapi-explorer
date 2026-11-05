# Round 5 DAPI console handoff

The DAPI items are fixed and committed locally on `lab/unified`. Nothing was pushed or deployed.

| Reviewer item | Status | Result |
| --- | --- | --- |
| Opus 6: console identity and empty values | Fixed | The bar says **dashhq / DAPI console**, with Platform-tool navigation and a direct Explorer return. Missing/nonfinite/blank values have an em dash and a reason. Credit units render atomically with a valid amount; real zero stays zero. Tenderdash has a visible version and expandable exact build. |
| Sol 15: sampled node remote from health | Fixed | The responding ProTx link, single-node scope and Radar aggregate link sit beside Platform status. |
| Sol 25: smaller menu while claiming to be Explorer | Fixed | The task explicitly allows an honest console identity. DAPI now uses that identity consistently and provides the Explorer return. |
| Opus 3 / stream wrong-network item | Fixed in owned apps | Identity and contract misses use the shared shell notice. Pending, found, absent and failed probes remain distinct; the recovery URL preserves the exact lookup and other URL parameters. |
| Opus 25: link consistency | Fixed in owned apps | Inline/action links use the family treatment. |

The value pass also fixed the SDK's binary-hash rendering, which previously could throw `.trim is not a function`, supplied visible hash fallbacks, removed fake zero defaults from missing epoch diagnostics and gave incomplete fields explicit reasons. Identity→Explorer continuation appears only after a successful identity lookup. The footer reaches the bottom of short pages.

Validation passed: `npm test` (11 tests), `npx tsc --noEmit`, and `./lab/build.sh dapi`. The repo has no lint script/config. Tests cover missing values versus real zero, atomic credit units, binary/missing hashes and pending/found/absent/failed network recovery while preserving both lookup parameters.

Guarded Playwright journeys passed on 390×844 phone (`isMobile`, touch) and 1440×900 desktop, in both themes. They verified the Explorer handoff with exact ID/network, populated diagnostic values, visible Tenderdash build, actual recovery clicks, theme persistence, no page exceptions, no blocked writes and no overflow. Funding, signing, broadcasting and authentication completion were not exercised.

The main 52-page Explorer/DAPI screenshot run and all supplementary screenshots were opened and visually inspected. DAPI Core, Platform and stream phone/dark repeats were clean. Repeated dashboard captures still logged an upstream 502 while rendering populated data; original reports retain those errors. This is not a claim of flawless upstream availability.

Before: `shots/r5-s2-before/dapi.png`, captured at `0557ca0cfc4e8081868e2ac880de50bb65dc56c7`. After: `shots/r5-s2-final-journeys/dapi-status-390-dark.png`, `dapi-handoff-390-light.png`, and `dapi-wrong-network-390-light.png`, captured from the clean build at `e967e560cc7d5b96835e486943a69b04d3d19df6`. Paths are relative to the lab root. Live values and responding nodes vary. This handoff is a documentation-only successor to the captured source.

The complete per-item checklist, validation details and evidence caveats are in [Explorer's Platform handoff](../../explorer/docs/round5-platform.md). Its [evidence inventory](../../explorer/docs/round5-platform-evidence.json) records SHA-256 hashes, exact revisions, settings and inspection status for all 78 before/final PNGs.

Code-review-validator verdict: **APPROVED** after direct correctness, maintainability, architecture and security/reliability review, including the final recovery diff. No blocker remains. The simplification pass retained `BalanceStat`, `HashValue` and `NetworkRecovery` as useful shared behavior.

Both apps pin shell **1.6.1**, JavaScript SHA-256 `6f69ba7e08b119acca951e70e8614d8a1ba9a62c660aa79a48cf38c538e320b0`, matching design commit `f48aa1109da34d4630b25e4b788ff0a70c6bd225`. Shell **1.6.2** arrived during final captures; the brief's final family integration must re-vendor it, rebuild and repeat recovery/menu checks. No owned reviewer item remains open. The separate Fees retirement page remains with its owner.
