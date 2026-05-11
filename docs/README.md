# Orbo — Codebase Documentation

This folder is the canonical guide to the Orbo codebase. Start here.

If you're new (or returning after a long gap), read in this order:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — what Orbo is, the top-level structure of the app, how the major subsystems fit together. Read this first.
2. **[CHEMISTRY.md](./CHEMISTRY.md)** — the chemistry engine: atoms, bonds, recipes, the SMILES parser, the physics solver, and the 2D Lewis renderer. Read this when working on anything in `src/chem/`, `src/render/`, or the sandbox.
3. **[LEARNING_MODULES.md](./LEARNING_MODULES.md)** — the lessons framework: how a lesson is structured, what reusable primitives exist, and how to add a new lesson. Read this when working on anything in `src/learn/`.

These docs are about **architecture and intent** — the *why* behind the code. They deliberately don't duplicate things that are already clear from reading a file (function signatures, what a component renders). For local detail, the source files have JSDoc-style header comments that explain each module's purpose.

## Convention

When you make a meaningful architectural change — adding a subsystem, changing a pattern, retiring an approach — update the relevant doc here. The goal is that someone (including future-you) returning after weeks away can get oriented from these files alone without reverse-engineering the code.
