# Orbo

**An interactive organic chemistry learning platform — structured pedagogy meets open-ended molecular exploration.**

Orbo is built on the conviction that chemistry is best learned by doing. Rather than static diagrams or isolated simulations, it combines a curriculum layer with a hands-on 3D molecule builder, so students can move fluidly between guided instruction and free experimentation.

## What it does

**Learning Modules** walk students through chemistry concepts using interactive, narrative-driven lessons. Each lesson is paced through phases — explanation, interaction, and quiz — building intuition incrementally before moving to the next idea. The first module covers atomic structure and the periodic table, with more on the way.

**The Sandbox** is an open-ended 3D molecule builder where students can construct molecules atom-by-atom, drop in structures from SMILES strings, and toggle a live 2D Lewis structure view. It's the graduation experience — a playground for students who have worked through the modules and want to explore freely.

The two pillars are intentionally connected: the same periodic table, the same atoms, the same chemical logic underlie both the lessons and the sandbox. Students aren't context-switching between different tools; they're deepening their relationship with the same system.

## Why it's different

Tools like PhET have spent decades building excellent isolated chemistry simulations. Orbo's differentiation is the **curriculum layer above them** — narrative pacing, cross-lesson state, and interactive primitives that connect (atom builder ↔ periodic table ↔ molecule builder). The goal is not just to show chemistry, but to teach it in a way that builds lasting mental models.

## Tech stack

React + TypeScript + Three.js SPA, built with Vite. 2D Lewis structure rendering via RDKit (WASM). No backend — all persistence is via `localStorage` behind an interface designed to swap in Supabase when multi-user support is added.

## Docs

See [`docs/`](./docs/) for architecture and implementation guides:

- [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — top-level structure and major subsystems
- [`CHEMISTRY.md`](./docs/CHEMISTRY.md) — the chemistry engine (atoms, bonds, SMILES, physics solver, 2D renderer)
- [`LEARNING_MODULES.md`](./docs/LEARNING_MODULES.md) — lesson framework and how to add new lessons
