# User Story Template

Track and manage user stories for the prompt-optimizer project.

## Quick Reference

### Definition of Ready Checklist

Before a story moves to development, verify:

| Criterion                        | Status |
| -------------------------------- | ------ |
| Clear business value defined     | [ ]    |
| Acceptance criteria are testable | [ ]    |
| Technical approach understood    | [ ]    |
| Dependencies identified          | [ ]    |
| Estimated within 1-3 days        | [ ]    |
| Dev notes have source references | [ ]    |

### Story ID Format

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

## Dependencies Template

Track story dependencies and relationships:

### Prerequisites

| Story ID | Type      | Description                    | Status |
| -------- | --------- | ------------------------------ | ------ |
| X.Y      | Required  | Must complete before this      | Status |
| A.B      | Optional  | Nice to have but not blocking  | Status |

### Blocked By

| Story ID | Description                    |
| -------- | ------------------------------ |
| X.Y      | Reason for blocking            |

### Blocks

| Story ID | Description                    |
| -------- | ------------------------------ |
| A.B      | What is blocked by this story  |

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

---

## Estimation & Priority

### Story Points Estimation

| Complexity | Typical Duration | Story Points | Characteristics                             |
| ---------- | ---------------- | ------------ | ------------------------------------------- |
| Trivial    | < 2 hours        | 1            | Single file change, no dependencies         |
| Simple     | 2-4 hours        | 2            | Few files, well-defined scope               |
| Medium     | 4-8 hours        | 3-5          | Multiple files, some integration needed     |
| Complex    | 1-2 days         | 8-13         | Architecture changes, multiple integrations |
| Epic-level | 3+ days          | Split        | Consider splitting into multiple stories    |

### Priority Matrix

| Priority | Definition                                       | Examples                    |
| -------- | ------------------------------------------------ | --------------------------- |
| **P0**   | Critical - blocks release or major functionality | Auth failure, data loss     |
| **P1**   | High - core feature, user-facing                 | New model support, UI fixes |
| **P2**   | Medium - important but not blocking              | UX improvements, refactor   |
| **P3**   | Low - nice to have, future consideration         | Minor optimizations         |

### Risk Assessment Template

For complex stories, include a risk assessment:

| Risk ID  | Description        | Probability  | Impact | Mitigation            |
| -------- | ------------------ | ------------ | ------ | --------------------- |
| RISK-001 | [Risk description] | High/Med/Low | H/M/L  | [Mitigation strategy] |

---

## Story Split Guidelines

### When to Split a Story

Consider splitting a story when:

1. **Duration exceeds 3 days** - Stories should be completable in 1-3 days
2. **Multiple independent features** - Each feature should have its own story
3. **High story points (8+)** - Indicates complexity that should be broken down
4. **Multiple acceptance criteria groups** - Related but independent AC groups
5. **Cross-cutting concerns** - Split technical and business concerns

### How to Split Stories

| Strategy         | When to Use                          | Example                           |
| ---------------- | ------------------------------------ | --------------------------------- |
| By Workflow Step | Process has distinct phases          | Create → Validate → Submit        |
| By User Type     | Different users have different needs | Admin setup vs User configuration |
| By Complexity    | Simple vs Complex variations         | Basic auth → SSO auth             |
| By Data Type     | Different data handling              | Text input → File upload          |
| By Interface     | Multiple UI/CLI/API interfaces       | Web UI story → API endpoint story |

### Maintaining Dependencies

When splitting stories, document dependencies:

```markdown
### Dependencies

| Story ID | Type     | Description                        |
| -------- | -------- | ---------------------------------- |
| 1.1      | Parent   | Original story this was split from |
| 1.2      | Sibling  | Split from same parent             |
| 2.1      | Requires | Must complete before this story    |
```

### Example: Splitting a Large Story

**Original Story 1.1**: "User can manage their profile"

**Split into**:

- Story 1.1a: "User can view their profile information"
- Story 1.1b: "User can update their profile information"
- Story 1.1c: "User can upload a profile picture"

Each split story is independently valuable and testable.

---

## Story Quality Checklist

Before submitting a story for approval, verify:

- [ ] Story follows "As a... I want... so that..." format
- [ ] Acceptance criteria are specific and testable
- [ ] Tasks reference acceptance criteria numbers
- [ ] Dev notes include source references
- [ ] File paths follow project structure conventions
- [ ] Testing approach is defined
- [ ] No placeholder text remains (e.g., `[TBD]`)

## Related Templates

- [Task Template](./task.md) - For tracking implementation tasks
- [Bug Template](./bug.md) - For tracking bugs found during development
- [Experience Template](./experience-template.md) - For recording lessons learned

---

## Related Stories Section

Track dependencies and related stories:

### Dependencies

| Story ID | Type    | Description                         | Status |
| -------- | ------- | ----------------------------------- | ------ |
| X.Y      | Blocks  | This story blocks the current story | Status |
| A.B      | Blocked | This story is blocked by current    | Status |

### Related Stories

| Story ID | Relationship | Description                    |
| -------- | ------------ | ------------------------------ |
| X.Y      | Similar      | Similar implementation pattern |
| A.B      | Extension    | Extends functionality          |

---

## Related Documentation

- [Stories Directory](../stories/README.md) - Story workflow and quick reference
- [Technical Development Guide](../developer/technical-development-guide.md)
- [Project Structure](../developer/project-structure.md)
- [Architecture Documents](../architecture/)

---

## Story Anti-Patterns to Avoid

### Common Mistakes

| Anti-Pattern                | Problem                                      | Better Approach                          |
| --------------------------- | -------------------------------------------- | ---------------------------------------- |
| Vague AC                    | "User can do X" without specifics            | Use Given/When/Then format               |
| Missing source refs         | Technical details without architecture links | Add `[Source: docs/architecture/...]`    |
| Overly large stories        | Story takes more than 3 days                 | Split into smaller, focused stories      |
| No test plan                | No test scenarios defined                    | List specific test cases                 |
| Placeholder text            | `[TBD]`, `TODO` remain                       | Complete all sections before approval    |
| Missing dependencies        | Unknown blockers during implementation       | Document all prerequisites explicitly    |
| Technology assumptions      | Implicit tech choices                        | Specify technologies with rationale      |
| No error handling           | Happy path only                              | Include error scenarios in AC            |
| Scope creep                 | Tasks unrelated to AC                        | Keep tasks focused on acceptance criteria|
| No integration context      | Ignores existing system                      | Document integration points and impacts  |

### Warning Signs

A story likely needs revision if:

1. **Too many acceptance criteria** (>7 ACs suggests story is too large)
2. **Tasks don't map to ACs** (tasks should reference AC numbers)
3. **Multiple file paths unclear** (each task should have clear file targets)
4. **"And then..." phrasing** (suggests hidden complexity)
5. **Vague terms** like "appropriate", "reasonable", "properly"
6. **No edge cases mentioned** (every feature has edge cases)
7. **Copy-paste from requirements** (ACs should be specific, not generic)

### Quality Indicators

Strong stories typically have:

- 3-7 acceptance criteria (focused and specific)
- 4-8 tasks that directly implement ACs
- Clear source references for all technical details
- Explicit error handling and edge cases
- Test scenarios covering happy path + 2-3 edge cases

---

**Last Updated**: 2026-02-22
