# Evaluation and Quality Benchmarks

This directory is reserved for future test fixtures, labeled civic report datasets, and evaluation harnesses for CivicSignal AI.

## Planned Contents (Phase 1 & Phase 2)

1. **Labeled Datasets (`evaluation/datasets/`)**:
   - Canonical civic issue reports with ground-truth classifications (e.g., Pothole, Water Leak, Streetlight, Illegal Dumping).
   - Priority ground truth (Critical, High, Medium, Low) based on municipal SLAs.

2. **Gemini Prompt Evaluation (`evaluation/prompts/`)**:
   - Quantitative evaluation scripts measuring categorization precision, recall, and deduplication accuracy.
   - Latency and token consumption tracking for Gemini 1.5 Flash / Pro model variants.

3. **Benchmarking Harnesses (`evaluation/runners/`)**:
   - Automated offline evaluation runs validating model prompts against regression test suites before deployment.

*Note: Phase 0 establishes the directory structure without creating mock datasets or premature fixtures.*
