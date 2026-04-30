# Project: Leasibility.AI

## Current objective
Perform a technical audit of the existing repository before making implementation changes.

## Audit goal
Determine whether the space-planning subsystem is:
1. salvageable with targeted module replacement,
2. best rebuilt as a deterministic geometry/layout engine with AI-assisted plan extraction,
3. or requires a larger architectural change.

## Source-of-truth documents
- Latest audit packet in /docs
- Original business plan / pre-build docs
- Testing and revision notes
- Manus proposal notes (treat as hypotheses, not facts)
- Fiverr conversation (external engineering opinion)

## Rules for this audit
- Do not start rebuilding immediately.
- First inspect the repository and produce an audit report.
- Treat Manus claims as unverified until confirmed in code.
- Focus first on the space planner / layout engine.
- Preserve the UI, reporting, and PDF pipeline unless the code proves they must change.
- Distinguish confirmed facts, plausible but unverified claims, and contradictions.

## Required outputs
1. Architecture map
2. Confirmed vs unconfirmed assumptions
3. Contradictions between intended behavior and actual implementation
4. Recommendation: patch, hybrid rebuild, or clean subsystem rebuild
5. Recommended target architecture for V1
6. List of additional documents/spec details needed before implementation
