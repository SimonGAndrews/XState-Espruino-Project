# SCXML Reference Material

This folder contains reference material related to **SCXML (State Chart XML)**, which provides
the formal semantic foundation for hierarchical state machines used in this project.

SCXML is particularly relevant for understanding:

- compound (hierarchical) states
- entry and exit ordering
- transition semantics involving sets of active states
- guard evaluation and target resolution

## Purpose of This Folder

The intent of this folder is to provide a **local, stable reference** to key SCXML materials that
inform design decisions in this repository.

This may include:

- PDF or HTML copies of the SCXML specification (where licensing permits)
- extracts of specific sections used during development
- notes or annotations referencing relevant clauses

The content here is **informational**, not normative; the authoritative source remains the W3C
specification.

## Primary Reference

The main SCXML specification is published by the W3C:

- SCXML 1.0: State Chart XML  
  https://www.w3.org/TR/scxml/

Of particular relevance to this project are:

- Section 3.1.4 — Transitions in the presence of compound states
- Section 3.1.5 — Entering and exiting states

## Licensing Notes

SCXML is a W3C Recommendation. Copies or extracts should be handled in accordance with the W3C
licensing terms.

If full copies of the specification are included here, they should be:

- clearly attributed
- unmodified
- stored for reference only

## Relationship to Project Design

Design decisions influenced by SCXML semantics are recorded separately as **Architectural
Decision Records (ADRs)** under:

docs/decisions/

This folder exists to support those decisions with authoritative background material.
