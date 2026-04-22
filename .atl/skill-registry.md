# Skill Registry — lubricentro-app

Generated: 2026-03-31

## User Skills

| Skill | Trigger |
|-------|---------|
| branch-pr | When creating a pull request, opening a PR, or preparing changes for review |
| issue-creation | When creating a GitHub issue, reporting a bug, or requesting a feature |
| judgment-day | When user says "judgment day", adversarial review, dual review |
| skill-creator | When user asks to create a new skill or document patterns for AI |

> Skipped: go-testing (Go-only, not relevant), sdd-* (orchestrator-phase only), _shared, skill-registry

## Project Conventions

| File | Purpose |
|------|---------|
| CLAUDE.md | Project-level Claude instructions (delegates to AGENTS.md) |
| AGENTS.md | Agent instructions — warns Next.js 16.x has breaking changes, read `node_modules/next/dist/docs/` before writing code |

## Compact Rules

### branch-pr
- Create a GitHub issue before opening a PR (issue-first enforcement)
- PR title: short, under 70 chars; details in body
- Include test plan in PR body

### issue-creation
- File issues before implementing features or fixes
- Bug reports: include steps to reproduce, expected vs actual
- Feature requests: include motivation and proposed approach

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize findings, apply fixes, re-judge until both pass or escalate after 2 iterations
- Use before merging significant implementations

### Project: AGENTS.md Rule
- **CRITICAL**: Next.js 16.2.1 has breaking changes. MUST read `node_modules/next/dist/docs/` before writing any Next.js code.
- Heed all deprecation notices encountered in docs or runtime.
