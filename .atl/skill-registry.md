# Skill Registry — lubricentro-app

Generated: 2026-04-23

## User Skills

| Skill | Trigger |
|-------|---------|
| branch-pr | When creating a pull request, opening a PR, or preparing changes for review |
| issue-creation | When creating a GitHub issue, reporting a bug, or requesting a feature |
| judgment-day | When user says "judgment day", adversarial review, dual review |
| skill-creator | When user asks to create a new skill or document patterns for AI |

> Skipped: go-testing (Go-only, not relevant), sdd-* (orchestrator-phase only), _shared, skill-registry

## Project Skills

| Skill | Trigger |
|-------|---------|
| frontend-design | When building web components, pages, dashboards, React components, or styling/beautifying any web UI |

> Project-level skills override user-level on name collision.

## Project Conventions

| File | Purpose |
|------|---------|
| CLAUDE.md | Project-level Claude instructions (delegates to AGENTS.md) |
| AGENTS.md | Agent instructions — warns Next.js 16.x has breaking changes, read `node_modules/next/dist/docs/` before writing code |
| .atl/project-specs.md | Full project requirements v0.2 — modules, scenarios, business rules, out-of-scope items |

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

### frontend-design
- Choose a bold, intentional aesthetic direction before coding (not generic AI aesthetics)
- Implement production-grade, functional code — visually striking and cohesive
- Use distinctive typography (avoid generic fonts like Arial/Inter)
- Stack: React + Tailwind v4 + shadcn/ui + framer-motion available

### Project: AGENTS.md Rule
- **CRITICAL**: Next.js 16.2.1 has breaking changes. MUST read `node_modules/next/dist/docs/` before writing any Next.js code.
- Heed all deprecation notices encountered in docs or runtime.
