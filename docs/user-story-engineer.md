# User Story Engineer - Agent Memory

This document serves as the longtime memory for the user-story-engineer agent, capturing learnings, insights, and best practices from ongoing work.

## Agent Overview

**Domain**: user-story-engineer  
**Objective**: Deliver small, safe, measurable improvements strictly inside the user story management domain.

## Workflow

```
INITIATE → PLAN → IMPLEMENT → VERIFY → SELF-REVIEW → SELF EVOLVE → DELIVER (PR)
```

### INITIATE Phase
- Check for existing PR with label `user-story-engineer`
- If PR exists: ensure up to date with default branch, review, fix if necessary and comment
- If Issue exists: execute and create/update PR
- If none: proactive scan limited to domain
- If nothing valuable: proactive scan repository health

### Key Files & Locations
- Stories directory: `docs/stories/`
- Story template: `docs/workspace-template/user-story-template.md`
- Validation script: `scripts/validate-story.js`
- Creation script: `scripts/create-story.js`
- Checklist: `.bmad-core/checklists/story-draft-checklist.md`

## Learnings & Insights

### Story Quality Standards
- Stories should have **Priority** and **Story Points** defined
- Validation script checks for:
  - Required sections (Status, Story, AC, Tasks, Dev Notes, Testing, Change Log)
  - Valid status values (Draft, Approved, InProgress, Review, Done)
  - Valid priority values (P0-Critical, P1-High, P2-Medium, P3-Low)
  - Valid story points (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
  - Source references in Dev Notes
  - No placeholder text

### Common Issues Found

1. **Missing Priority/Story Points**
   - Symptom: Validation warnings
   - Fix: Add `**Priority**: P0-Critical` and `**Story Points**: 8` after Status line

2. **Placeholder Text**
   - Symptom: Validation warnings for `[TBD]`, `[To be filled...]`
   - Fix: Complete all sections before approval

3. **Missing Source References**
   - Symptom: Warning "No source references found in Dev Notes"
   - Fix: Add `[Source: docs/architecture/...]` for all technical details

### Validation Command
```bash
# Validate all stories
node scripts/validate-story.js --all

# Validate specific story
node scripts/validate-story.js docs/stories/1.1.example.md

# JSON output for CI
node scripts/validate-story.js --all --json
```

### Creation Command
```bash
# Auto-assign story number
pnpm story:create 1 "Feature Name"

# Specific story number
pnpm story:create 1.4 "Feature Name"
```

## Best Practices

### Story Structure
1. Status line must be first after title
2. Priority and Story Points should follow Status
3. Story statement uses "As a... I want... so that..." format
4. Acceptance Criteria are numbered and measurable
5. Tasks reference AC numbers: `Task 1 (AC: 1, 3)`

### Dev Notes
- Must include Source Tree
- Must have Data Models with source refs
- Must have API Contracts with source refs
- Must reference actual files from architecture docs

### Dependencies Section
- Prerequisites: Stories that must complete first
- Blocked By: Stories blocking this one
- Blocks: Stories this story blocks

## Current State

### Epic 1: Core Features
| Story | Title | Status | Priority | Points |
|-------|-------|--------|----------|--------|
| 1.1 | Prompt Optimization Core | Draft | P0-Critical | 8 |
| 1.2 | Model Management Configuration | Draft | P0-Critical | 5 |
| 1.3 | History Record Management | Draft | P1-High | 8 |

### Validation Status
- All stories: 100/100 score
- 0 issues, 0 warnings
- Ready for development

## Improvement History

### 2026-02-25
- Added Priority and Story Points to all Epic 1 stories
- Created user-story-engineer.md memory document

### 2026-02-24
- Added missing HistoryImport.vue subtask to Story 1.3

### 2026-02-23
- Improved story validation placeholder detection

## PR Requirements
- Label: user-story-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Notes
- Never refactor unrelated modules
- Never introduce unnecessary abstraction
- Keep changes small and focused
- Always verify with validation script before PR
