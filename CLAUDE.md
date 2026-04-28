# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository (`revolverroofing/redesign`) is currently a fresh, empty scaffold. The working tree contains only a `.gitkeep` placeholder and the single commit `Initialize repository`. There is no source code, README, package manifest, build configuration, lint setup, or test suite yet.

As a result, this file intentionally does not document build, lint, test, or run commands, nor an architecture overview — none exist to describe. **The first task that introduces real code (or scaffolds a framework) should also expand this file** with:

- The exact commands to install dependencies, build, lint, type-check, run the dev server, and run a single test.
- The high-level architecture: the chosen stack, how the app is organized into layers/modules, and any cross-cutting conventions that aren't obvious from a single file.
- Any project-specific conventions (naming, directory layout, commit style) that future contributors must follow.

Until then, treat the repo as a blank slate and confirm the intended stack with the user before scaffolding.

## Branch convention

Development for AI-assisted changes happens on dedicated branches (e.g. `claude/<topic>-<suffix>`). Push completed work to the designated branch; do not push directly to `main`.
