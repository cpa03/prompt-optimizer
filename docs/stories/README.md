# User Stories

This directory contains user story documents for the prompt-optimizer project.

## Quick Start

```
1. Create story → 2. Validate → 3. Approve → 4. Implement → 5. Verify → 6. Close
```

| Step          | Who           | Command/Action                              |
| ------------- | ------------- | ------------------------------------------- |
| Create story  | Scrum Master  | `pnpm story:create 1 "Feature Name"`        |
| Validate      | Scrum Master  | `pnpm story:validate docs/stories/1.x.md`   |
| Approve       | Product Owner | Review checklist, set status to `Approved`  |
| Implement     | Developer     | Execute tasks, update checkboxes            |
| Verify        | QA Agent      | Run tests, populate QA Results section      |
| Close         | All           | Set status to `Done` after verification     |

## Story Workflow

```
Draft → Approved → InProgress → Review → Done
```

### Status Definitions

| Status         | Description                                 | Owner         |
| -------------- | ------------------------------------------- | ------------- |
| **Draft**      | Story is being written and refined          | Scrum Master  |
| **Approved**   | Story validated and ready for development   | Product Owner |
| **InProgress** | Developer agent implementing the story      | Developer     |
| **Review**     | Implementation complete, awaiting QA review | QA Agent      |
| **Done**       | Story verified and closed                   | All           |

## File Naming Convention

Stories follow the format: `{epic}.{story}.{title-short}.md`

Examples:

- `1.1.user-authentication.md` - First story in Epic 1
- `2.3.template-management.md` - Third story in Epic 2

## Story Creation Process

1. **Identify Story** - Scrum Master identifies next story from epic
2. **Draft Story** - Create story file using template
   ```bash
   # Create a new story (auto-assign story number)
   pnpm story:create 1 "User Authentication"
   
   # Create a story with specific number
   pnpm story:create 1.4 "User Authentication"
   ```
3. **Populate Context** - Add technical details from architecture docs
   - Extract data models from architecture documents
   - Reference API contracts and endpoints
   - List relevant components and dependencies
   - Document technical constraints
   - **CRITICAL**: Include source references for all technical details
4. **Review Checklist** - Run story-draft-checklist validation
5. **Approve** - Product Owner validates story completeness
6. **Implement** - Developer agent executes tasks
7. **Verify** - QA agent reviews implementation
8. **Close** - Mark as Done after verification

### Story Quality Standards

When creating stories, ensure:

- ✅ Story follows "As a... I want... so that..." format
- ✅ Acceptance criteria are specific, testable, and measurable
- ✅ Tasks reference acceptance criteria numbers
- ✅ Dev notes include source references (e.g., `[Source: docs/architecture/...]`)
- ✅ File paths follow project structure conventions
- ✅ Testing approach is clearly defined
- ✅ No placeholder text remains (e.g., `[TBD]`, `TODO`)
- ✅ Story is small enough to complete in 1-3 days
- ✅ Dependencies are identified and documented

## Active Stories

### Epic 1: Core Features

**Status**: In Progress  
**Stories**: 3 total (0 done, 0 in progress, 3 draft)

| Story | Title                                  | Status | Priority     | Points | Link                                            |
| ----- | -------------------------------------- | ------ | ------------ | ------ | ----------------------------------------------- |
| 1.1   | Prompt Optimization Core Functionality | Draft  | P0-Critical  | 8      | [View](./1.1.prompt-optimization-core.md)       |
| 1.2   | Model Management Configuration         | Draft  | P0-Critical  | 5      | [View](./1.2.model-management-configuration.md) |
| 1.3   | History Record Management              | Draft  | P1-High     | 8      | [View](./1.3.history-record-management.md)      |

**Epic Index**: [Epic 1 - Core Features Index](./epic-1-index.md)

### Epic 2: Advanced Features

**Status**: Planned  
**Stories**: To be defined (planned for future development)

## Related Documents

- [User Story Template](../workspace-template/user-story-template.md)
- [Story Review Checklist](../workspace-template/story-review-checklist.md)
- [Story Draft Checklist](../../.bmad-core/checklists/story-draft-checklist.md)
- [Story DoD Checklist](../../.bmad-core/checklists/story-dod-checklist.md)
- [Project PRD](../project/prd.md)
- [Architecture Docs](../architecture/)
- [Epic 1 Index](./epic-1-index.md)

## Quick Reference

### Validation Commands

Validate stories before implementation:

```bash
# Validate all stories
pnpm story:validate:all

# Validate a specific story
pnpm story:validate docs/stories/1.1.prompt-optimization-core.md

# JSON output for CI integration
node scripts/validate-story.js --all --json
```

### Story Creation Commands

Create new stories quickly:

```bash
# Create a story with auto-assigned number
pnpm story:create 1 "Feature Name"

# Create a story with specific number
pnpm story:create 2.1 "Feature Name"
```

### Story Sections

| Section             | Purpose                                  | Required |
| ------------------- | ---------------------------------------- | -------- |
| Status              | Current workflow state                   | Yes      |
| Story               | User story statement (As a... I want...) | Yes      |
| Acceptance Criteria | Measurable success criteria              | Yes      |
| Tasks/Subtasks      | Implementation breakdown                 | Yes      |
| Dev Notes           | Technical context and references         | Yes      |
| Testing             | Test approach and scenarios              | Yes      |
| Change Log          | Document history                         | Yes      |
| Dev Agent Record    | Implementation notes                     | No       |
| QA Results          | Quality review findings                  | No       |

### Estimation Guidelines

| Complexity | Typical Duration | Story Points |
| ---------- | ---------------- | ------------ |
| Simple     | < 4 hours        | 1-2          |
| Medium     | 4-8 hours        | 3-5          |
| Complex    | 1-2 days         | 8-13         |
| Epic-level | 3-5 days         | Split story  |

---

**Last Updated**: 2026-02-27
