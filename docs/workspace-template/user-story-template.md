# User Story Template

Track and manage user stories for the prompt-optimizer project.

## Story Overview

### Story ID

- **Format**: `{epic}.{story}` (e.g., `1.1`, `2.3`)
- **Title**: Brief descriptive title

### Status Options

- **Draft**: Story is being written
- **Approved**: Ready for development
- **InProgress**: Currently being implemented
- **Review**: Implementation complete, awaiting review
- **Done**: Completed and verified

---

## Story Format

```markdown
**As a** [user role],
**I want** [action/capability],
**so that** [benefit/value].
```

---

## Acceptance Criteria Template

Numbered list of specific, testable criteria:

1. [Criterion 1 - specific, measurable outcome]
2. [Criterion 2 - specific, measurable outcome]
3. [Criterion 3 - specific, measurable outcome]

**Good Acceptance Criteria:**

- Start with action verbs (Given/When/Then)
- Are testable and verifiable
- Define clear boundaries
- Include edge cases where relevant

---

## Tasks / Subtasks Template

```markdown
- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1
- [ ] Task 3 (AC: #)
  - [ ] Subtask 3.1
```

**Task Guidelines:**

- Reference applicable acceptance criteria
- Keep tasks small and achievable
- Include testing tasks
- Order by implementation sequence

---

## Dev Notes Section

Include relevant context for implementation:

### Source Tree

```
relevant/file/path/
├── file1.ts
└── file2.ts
```

### Key Information

- **Data Models**: Relevant schemas and types
- **API Contracts**: Endpoints and request/response formats
- **Components**: UI components to create/modify
- **Dependencies**: Required packages or services
- **Constraints**: Technical limitations or requirements

### Testing Standards

- **Test Location**: `tests/unit/` or `tests/integration/`
- **Framework**: Vitest
- **Coverage Target**: >80%
- **Patterns**: Follow existing test patterns in codebase

---

## File List Template

Track files modified during implementation:

| File              | Action                   | Description       |
| ----------------- | ------------------------ | ----------------- |
| `path/to/file.ts` | Created/Modified/Deleted | Brief description |

---

## Change Log Template

| Date       | Version | Description   | Author   |
| ---------- | ------- | ------------- | -------- |
| YYYY-MM-DD | 1.0     | Initial draft | [Author] |

---

## Example Story

### Story 1.1: Add User Authentication

**Status**: Done

**Story**:

> **As a** user,
> **I want** to securely log in to my account,
> **so that** I can access my personalized settings.

**Acceptance Criteria**:

1. User can log in with email and password
2. Invalid credentials show appropriate error message
3. Session persists for 24 hours
4. User can log out successfully

**Tasks**:

- [x] Task 1 (AC: 1)
  - [x] Create login form component
  - [x] Implement form validation
- [x] Task 2 (AC: 2)
  - [x] Add error handling for invalid credentials
- [x] Task 3 (AC: 3)
  - [x] Implement session management
- [x] Task 4 (AC: 4)
  - [x] Add logout functionality

---

## Usage Instructions

1. **Create Story**: Copy this template and fill in story details
2. **Define AC**: Write clear, testable acceptance criteria
3. **Break Down**: Create tasks that reference AC numbers
4. **Track Progress**: Update task checkboxes as work progresses
5. **Document Changes**: Update file list and change log
6. **Review**: Mark as Review when implementation complete
7. **Complete**: Mark as Done after QA verification

## Related Templates

- [Task Template](./task.md) - For tracking implementation tasks
- [Bug Template](./bug.md) - For tracking bugs found during development
- [Experience Template](./experience-template.md) - For recording lessons learned

---

**Last Updated**: 2026-02-19
