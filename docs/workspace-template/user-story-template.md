# User Story Template

Track and manage user stories for the prompt-optimizer project.

## Story Overview

### Story ID

- **Format**: `{epic}.{story}` (e.g., `1.1`, `2.3`)
- **Title**: Brief descriptive title
- **Location**: `docs/stories/{epic}.{story}.{title-short}.md`

### Status Options

- **Draft**: Story is being written
- **Approved**: Ready for development
- **InProgress**: Currently being implemented
- **Review**: Implementation complete, awaiting review
- **Done**: Completed and verified

### Story Workflow

1. **Draft** → SM/PO creates story from epic requirements
2. **Approved** → PO validates story completeness
3. **InProgress** → Dev agent implements story
4. **Review** → QA agent reviews implementation
5. **Done** → Story verified and closed

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

Include relevant context for implementation. This section should contain enough information that the developer doesn't need to read external architecture documents.

**CRITICAL**: Only include information extracted from actual project documents. Do not invent or assume technical details.

### Source Tree

```
relevant/file/path/
├── file1.ts
└── file2.ts
```

### Key Information

- **Data Models**: Relevant schemas and types (with source reference)
- **API Contracts**: Endpoints and request/response formats (with source reference)
- **Components**: UI components to create/modify (with source reference)
- **Dependencies**: Required packages or services
- **Constraints**: Technical limitations or requirements

**Example Source References**:

- `[Source: docs/architecture/database-architecture-improvements.md#section]`
- `[Source: docs/developer/technical-development-guide.md#section]`

### Previous Story Insights

If this story builds on previous work, include relevant notes:

- Key decisions from previous story
- Workarounds or gotchas discovered
- Technical debt considerations

### Testing Standards

- **Test Location**: `packages/{core,web,ui}/tests/unit/` or `tests/integration/`
- **Framework**: Vitest
- **Coverage Target**: >80%
- **Patterns**: Follow existing test patterns in codebase
- **Reference**: [Testing Guide](../developer/technical-development-guide.md#39-测试规范)

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

## Dev Agent Record Template

Track AI agent development activities (populated during implementation):

### Agent Model Used

- **Model**: [e.g., Claude-3.5-Sonnet, GPT-4o, etc.]
- **Date**: YYYY-MM-DD

### Debug Log References

- [Reference to debug logs or traces if generated]

### Completion Notes List

- [Note about implementation decisions]
- [Note about issues encountered and resolved]
- [Note about deviations from original plan]

### File List

| File              | Action                   | Description       |
| ----------------- | ------------------------ | ----------------- |
| `path/to/file.ts` | Created/Modified/Deleted | Brief description |

---

## QA Results Template

Track quality assurance review results (populated after review):

### Review Date

- **Date**: YYYY-MM-DD
- **Reviewer**: [Name/Role]

### Quality Assessment

- **Code Quality**: [Assessment]
- **Test Coverage**: [Percentage or status]
- **Standards Compliance**: [Pass/Fail/Concerns]

### Issues Found

| ID  | Severity        | Description         | Resolution             |
| --- | --------------- | ------------------- | ---------------------- |
| #1  | High/Medium/Low | [Issue description] | [Resolution or status] |

### Final Status

- [ ] **Approved**: Ready for merge
- [ ] **Changes Requested**: Needs fixes before merge
- [ ] **Blocked**: Waiting on dependencies

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
4. **Add Dev Notes**: Include relevant technical context with source references
5. **Track Progress**: Update task checkboxes as work progresses
6. **Document Changes**: Update file list and change log
7. **Dev Agent Record**: Record agent model, debug logs, and completion notes
8. **Review**: Mark as Review when implementation complete
9. **QA Review**: Populate QA Results section after review
10. **Complete**: Mark as Done after QA verification

## Best Practices

### Writing Good Stories

- Keep stories small and focused (can be completed in 1-3 days)
- Each story should deliver independent value
- Stories should be testable and verifiable
- Include clear acceptance criteria

### Dev Notes Guidelines

- Extract technical context from architecture documents
- Reference source documents for all technical details
- Include file paths and naming conventions
- Document any relevant constraints or gotchas
- Add testing requirements specific to the story

### Task Breakdown

- Reference acceptance criteria numbers in task descriptions
- Keep tasks atomic and achievable
- Include testing as explicit subtasks
- Order tasks by implementation sequence

## Related Templates

- [Task Template](./task.md) - For tracking implementation tasks
- [Bug Template](./bug.md) - For tracking bugs found during development
- [Experience Template](./experience-template.md) - For recording lessons learned

## Related Documentation

- [Technical Development Guide](../developer/technical-development-guide.md)
- [Project Structure](../developer/project-structure.md)
- [Architecture Documents](../architecture/)

---

**Last Updated**: 2026-02-19
