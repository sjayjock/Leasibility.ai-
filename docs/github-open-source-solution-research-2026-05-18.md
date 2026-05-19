# GitHub/Open-Source Solution Research for Leasibility

**Author:** Manus AI  
**Date:** 2026-05-18  
**Branch:** `feature/github-solution-research`  
**Purpose:** Evaluate whether any GitHub-available solution should change the attached AI-first repair recommendation for Leasibility, and identify open-source components that can improve output quality, delivery speed, and MVP readiness.

## Executive Recommendation

The GitHub research does **not** identify a single open-source repository that should replace the attached AI-first repair path. The highest-quality path remains a **hybrid MVP pipeline**: normalize uploaded plans, extract existing conditions with multimodal AI, store a deterministic scenario schema, run deterministic achieved-vs-requested validation, and produce controlled visual/report outputs. The GitHub projects reviewed are valuable, but they are best used as **supporting infrastructure**, not as the commercial product core.

The most important adjustment to the current roadmap is to explicitly add a **GitHub-backed intake and QA layer** around the AI engine. Leasibility should use mature libraries for PDF parsing, raster preprocessing, OCR, geometry validation, browser-based review, and report generation. This will improve consistency and reduce custom code, while preserving the AI-first architecture required to handle messy commercial office plans and customer-facing feasibility narratives.

> The decision should be: **do not rebuild Leasibility around an academic floor-plan reconstruction repository; do add a curated open-source utility stack to make the AI-first pipeline more reliable, testable, and marketable.**

## Research Method

I reviewed the source-of-truth repository instructions and the attached repair recommendation, then searched GitHub across floor-plan reconstruction, floor-plan recognition, segmentation, vectorization, PDF/vector extraction, OCR, canvas editing, geometry validation, and report generation. The search produced floor-plan-specific candidates such as **CubiCasa5K**, **RoomFormer**, **PolyRoom**, **FRI-Net**, **VecFloorSeg**, and **RasterScan/Floor-Plan-Recognition**, plus mature infrastructure candidates such as **pdfplumber**, **pdfminer.six**, **pypdf**, **OpenCV**, **Pillow**, **Tesseract**, **Segment Anything**, **GroundingDINO**, **Konva**, **react-pdf**, **Playwright**, **Shapely**, and **ezdxf**.[1] [2] [3] [4] [5]

The evaluation used four commercial-MVP criteria. First, the solution must support **messy commercial office floor plans**, not only residential or academic benchmark plans. Second, it must produce **auditable outputs** that can feed achieved-vs-requested reports. Third, it must have a **license and deployment profile** suitable for a commercial SaaS. Fourth, it must accelerate the path to the required MVP acceptance standard rather than introduce model-training, CUDA, checkpoint, or data-preparation delays.

## Main Finding: No Open-Source Floor-Plan Engine Is a Better Core Than the Proposed Hybrid Pipeline

The floor-plan-specific repositories are impressive research assets, but they are not a safer production core for Leasibility than the attached AI-first repair path. **CubiCasa5K** is a major dataset and model reference, with 5,000 floor-plan samples annotated into more than 80 floor-plan object categories, but it is primarily a dataset/model research foundation rather than a commercial office feasibility product.[1] **RoomFormer** is a CVPR 2023 floor-plan reconstruction project under MIT license, but it is still research code and does not directly produce Leasibility’s business deliverables: test-fit scenarios, achieved-vs-requested reports, budgets, schedules, shared reports, and customer-ready PDF outputs.[2]

**PolyRoom** and **FRI-Net** are newer academic approaches, but their READMEs reinforce that they depend on specialized datasets, checkpoints, PyTorch/CUDA stacks, and research evaluation workflows rather than an immediately deployable SaaS workflow.[3] [4] **VecFloorSeg** is potentially interesting for vectorized floor-plan segmentation, but it depends on PyTorch Geometric and other ML setup steps, and its license state is not a strong commercial adoption signal from the GitHub metadata reviewed.[5] **RasterScan/Floor-Plan-Recognition** advertises on-premise floor-plan recognition, but its README includes a machine-code/lifetime-license flow, which means it should be treated as a commercial/closed or license-gated option rather than a clean open-source gem.[6]

| Candidate | What It Offers | Commercial MVP Fit | Recommendation |
|---|---|---:|---|
| **CubiCasa/CubiCasa5k** | Dataset and multi-task model for floor-plan image analysis with dense annotations over 80 categories.[1] | Medium as benchmark; low as direct product core. | Use for benchmark thinking or optional R&D only. |
| **ywyue/RoomFormer** | CVPR 2023 single-stage floor-plan reconstruction; MIT license; strongest floor-plan-specific candidate found.[2] | Medium for offline experiment; low-to-medium for production core. | Prototype on 3–5 real office plans only if MVP extraction quality fails. |
| **3dv-casia/PolyRoom** | ECCV 2024 room-aware Transformer; refers users to RoomFormer/MMDetection and external checkpoints.[3] | Low for immediate MVP because setup and deployment complexity are high. | Track as research; do not adopt now. |
| **Daisy-1227/FRI-Net** | ECCV 2024 reconstruction model with pretrained checkpoints and evaluation/training scripts.[4] | Low for immediate MVP because it requires old CUDA/PyTorch-style research setup. | Track as research; do not adopt now. |
| **DrZiji/VecFloorSeg** | Vectorized roughcast floor-plan segmentation.[5] | Low-to-medium as a future segmentation module. | Optional post-MVP experiment. |
| **RasterScan/Floor-Plan-Recognition** | On-premise floor-plan recognition repository with license-machine-code workflow.[6] | Unknown; not clearly open-source production substrate. | Do not depend on it without license/legal review. |

The practical issue is not whether these repositories can reconstruct floor plans under benchmark conditions. The issue is whether they can reliably convert **real broker/architectural office plans** into the specific deliverables Leasibility must sell: three scenarios, refined architectural plan outputs, achieved-vs-requested reporting, budget, schedule, project detail pages, shared reports, and PDFs. None of the reviewed repositories directly solves that full workflow.

## Recommended Open-Source Additions to the Leasibility Roadmap

Although no GitHub repository should replace the AI-first approach, several open-source gems should be added to the build plan. These libraries reduce risk because they are mature, focused, and testable. They should form the **supporting rails** around the AI pipeline.

| Layer | Recommended GitHub/Open-Source Components | Why It Matters for Leasibility | MVP Priority |
|---|---|---|---:|
| **PDF intake and normalization** | `pdfplumber`, `pdfminer.six`, `pypdf`, `PDF.js/pdfjs-dist`, possibly `pypdfium2` after license review | Extract machine-generated PDF text, rectangles, and lines where available; split/crop/merge documents; render plan previews; preserve upload evidence.[7] [8] [9] [10] | P0 |
| **Raster preprocessing and OCR** | `OpenCV`, `Pillow`, `Tesseract`, `pytesseract` | Deskew, binarize, crop, enhance, detect contours, OCR labels, and create QA overlays before/after AI extraction.[11] [12] [13] | P0 |
| **Geometry validation** | `Shapely`, optional `ezdxf` | Validate polygons, intersections, room areas, scale consistency, and future DXF adjacency/export workflows.[14] [15] | P0/P1 |
| **Interactive review and output QA** | `Konva`, `PDF.js`, `Playwright` | Build a human-review plan viewer, visual scenario editor, screenshot regression tests, and browser-rendered report checks.[10] [16] [17] | P1 |
| **Report generation** | `react-pdf`, `Playwright`, `pdf-lib` | Generate branded, repeatable customer-facing reports and manipulate final PDFs as needed.[18] [17] [19] | P0/P1 |
| **Optional segmentation R&D** | `Segment Anything`, `GroundingDINO` | Add segmentation/object detection when multimodal extraction cannot meet accuracy thresholds.[20] [21] | P2 |

### P0 Addition: File Intake and Evidence Preservation

The immediate MVP should add a deterministic file-normalization service before any AI call. This service should classify uploads as vector PDF, scanned PDF, raster image, or unsupported file. When the file is machine-generated, **pdfplumber** can extract detailed information about each text character, rectangle, and line and includes visual debugging support.[7] **pdfminer.six** provides a mature MIT-licensed PDF parsing foundation, while **pypdf** can split, merge, crop, and transform PDF pages.[8] [9] For browser-side PDF preview, **PDF.js** or `pdfjs-dist` can render uploaded plan pages to the UI.[10]

This layer is not glamorous, but it is essential for market readiness. It lets Leasibility keep an evidence trail: original file, normalized page image, extracted vector/text hints, AI-extracted conditions, scenario spec, rendered output, and final report. That evidence trail is what turns AI output from a demo into a sellable professional workflow.

### P0 Addition: Image Cleanup, OCR, and Diagnostic Overlays

The AI pipeline should not receive raw uploads without preprocessing. **OpenCV** and **Pillow** should be used for image normalization, resizing, sharpening, thresholding, deskewing, crop detection, and overlays.[11] [12] **Tesseract** and `pytesseract` can provide a secondary OCR pass for labels, dimensions, room names, scale notes, and title-block metadata.[13]

This does not mean Leasibility should become a classical computer-vision product. It means the AI engine should be surrounded by deterministic diagnostics. If a user uploads a fuzzy scan, the product should know whether OCR confidence is poor, whether scale is missing, whether the plan is rotated, and whether the output needs manual review.

### P0/P1 Addition: Deterministic Geometry Validation

Leasibility’s credibility depends on whether it can tell users what was achieved versus requested. That cannot be left to an image generator. **Shapely** should be used to validate polygon geometry, area totals, adjacency checks, intersections, overlaps, circulation assumptions, and scenario deltas.[14] If later workflows need CAD-like import/export or DXF support, **ezdxf** can create, read, modify, and preserve DXF documents.[15]

This layer should become part of the acceptance gate. Every scenario should produce structured geometry and summary metrics before the plan image or report is finalized. If the image looks attractive but the schema fails validation, the report should not be marked complete.

### P1 Addition: Human Review and Visual QA

A polished product should eventually allow a user or internal reviewer to see the uploaded plan, extraction overlays, scenario placements, warnings, and final generated plan in one review surface. **Konva** is a strong candidate for this because it is designed to build interactive graphics, editors, and diagrams on the web.[16] **Playwright** should be used for visual regression checks and browser-rendered report validation because it provides reliable browser automation across Chromium, Firefox, and WebKit.[17]

For the first marketable MVP, this does not need to become a full CAD editor. The correct scope is a **review-and-correction surface**: confirm scale, flag wrong labels, approve extracted rooms, and compare scenario outputs.

### P0/P1 Addition: Branded Report Generation

Leasibility’s sellability depends heavily on professional outputs. The app should generate polished reports that brokers, tenants, and landlords can forward. **react-pdf** is a React renderer for creating PDF files in the browser and server, and **Playwright** can also generate PDFs from branded HTML report pages.[18] [17] **pdf-lib** can create and modify PDF documents in JavaScript environments when post-processing is needed.[19]

The simplest near-term path is to generate report pages as branded HTML and use Playwright for PDF export, while keeping react-pdf as an alternative if the report needs stricter document-level layout control. The key is to avoid one-off PDF assembly logic inside the AI engine.

## Updated Build Recommendation

The attached AI-first roadmap should be preserved, but the first engineering sprint should be refined into a **two-track implementation**.

| Track | Scope | Deliverable | Acceptance Evidence |
|---|---|---|---|
| **Track A: AI-first extraction and scenario schema** | Existing-condition extraction, program interpretation, scenario spec generation, achieved-vs-requested metrics | A deterministic JSON scenario package for each uploaded real plan | Real floor-plan tests showing extracted conditions, requested program, three scenarios, and validation metrics. |
| **Track B: Open-source intake, QA, and reporting rails** | PDF/raster normalization, OCR hints, geometry validation, preview rendering, branded report export | Reusable pipeline modules around the AI engine | Uploaded source file, normalized preview, extraction hints, QA warnings, rendered report, and downloadable PDF. |

This change makes the MVP more robust without delaying the launch into an academic model-integration project. The product should first prove it can produce a credible output package from real office plans. Only after that should the team test RoomFormer/CubiCasa-style reconstruction as an optional enhancement.

## What Should Not Be Done

Leasibility should **not** spend the next sprint trying to fully integrate RoomFormer, PolyRoom, FRI-Net, or VecFloorSeg as the core architecture. That path risks a research detour: model environment setup, dataset mismatch, GPU deployment, checkpoint management, licensing ambiguity, and poor alignment with office leasing deliverables. It also does not solve customer-facing reports, budgets, schedules, or shared project pages.

Leasibility should also avoid using AI image generation as the only source of truth. Image generation may help create refined visual outputs, but the commercial product must keep a structured scenario schema and deterministic validation layer. The current roadmap is correct on this point.

## Recommended Next Development Steps

The next implementation branch should remain focused on the engine repair, but it should include the open-source support stack from this research. The exact next branch should be `feature/ai-engine-pipeline-v1`.

| Sequence | Development Step | Libraries to Evaluate First | Output |
|---:|---|---|---|
| 1 | Build file-normalization module | `pdfplumber`, `pdfminer.six`, `pypdf`, `PDF.js`, `OpenCV`, `Pillow` | Original upload classified, normalized, previewed, and stored with diagnostic metadata. |
| 2 | Build extraction-hints module | `pdfplumber`, `Tesseract/pytesseract`, `OpenCV` | Text labels, candidate dimensions, lines, rectangles, and OCR confidence passed to the AI extractor. |
| 3 | Build scenario schema and validator | `Shapely` | Structured existing conditions, three scenarios, area checks, collisions, achieved-vs-requested report inputs. |
| 4 | Build controlled visual rendering path | Existing app renderer plus deterministic overlays; optionally Konva for review | Plan outputs tied to schema rather than image-only generation. |
| 5 | Build branded report export | `Playwright` first, `react-pdf` or `pdf-lib` as needed | Shareable report page and downloadable PDF with plan images, metrics, budget, schedule, and assumptions. |
| 6 | Run real-office-plan acceptance suite | 10 real floor plans supplied by Stephen | Evidence package proving real upload-to-report flow before marketing launch. |

## Strategic Product Implication

The GitHub research strengthens the business case for a **quality-controlled AI product**, not a pure model demo. Leasibility’s defensibility should come from its workflow, deliverable quality, commercial real estate assumptions, scenario comparison logic, report packaging, and repeatable project history. Open-source projects can handle commodity tasks such as PDF parsing, OCR, image cleanup, geometry checks, and report rendering. The proprietary value should remain in Leasibility’s CRE-specific extraction prompts, scenario rules, output templates, QA gates, cost/schedule assumptions, and customer-facing workflow.

## Final Decision

Proceed with the attached AI-first roadmap, with one explicit modification: add the **Open-Source Intake, QA, and Reporting Rails** as a first-class part of `feature/ai-engine-pipeline-v1`. Do not adopt any floor-plan-specific GitHub model as the production core before the product has passed real plan acceptance testing.

## References

[1]: https://github.com/CubiCasa/CubiCasa5k "CubiCasa/CubiCasa5k"
[2]: https://github.com/ywyue/RoomFormer "ywyue/RoomFormer"
[3]: https://github.com/3dv-casia/PolyRoom "3dv-casia/PolyRoom"
[4]: https://github.com/Daisy-1227/FRI-Net "Daisy-1227/FRI-Net"
[5]: https://github.com/DrZiji/VecFloorSeg "DrZiji/VecFloorSeg"
[6]: https://github.com/RasterScan/Floor-Plan-Recognition "RasterScan/Floor-Plan-Recognition"
[7]: https://github.com/jsvine/pdfplumber "jsvine/pdfplumber"
[8]: https://github.com/pdfminer/pdfminer.six "pdfminer/pdfminer.six"
[9]: https://github.com/py-pdf/pypdf "py-pdf/pypdf"
[10]: https://github.com/mozilla/pdf.js "mozilla/pdf.js"
[11]: https://github.com/opencv/opencv "opencv/opencv"
[12]: https://github.com/python-pillow/Pillow "python-pillow/Pillow"
[13]: https://github.com/tesseract-ocr/tesseract "tesseract-ocr/tesseract"
[14]: https://github.com/shapely/shapely "shapely/shapely"
[15]: https://github.com/mozman/ezdxf "mozman/ezdxf"
[16]: https://github.com/konvajs/konva "konvajs/konva"
[17]: https://github.com/microsoft/playwright "microsoft/playwright"
[18]: https://github.com/diegomura/react-pdf "diegomura/react-pdf"
[19]: https://github.com/Hopding/pdf-lib "Hopding/pdf-lib"
[20]: https://github.com/facebookresearch/segment-anything "facebookresearch/segment-anything"
[21]: https://github.com/IDEA-Research/GroundingDINO "IDEA-Research/GroundingDINO"
