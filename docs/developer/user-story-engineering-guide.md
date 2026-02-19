# User Story Engineering Guide

## Overview

This guide provides comprehensive instructions for creating, managing, and implementing user stories in the prompt-optimizer project using the BMad-Method workflow.

## Story Engineering Principles

### 1. Story Quality Standards

Every user story must meet these quality standards:

- **Independent**: Stories should not depend on other stories for implementation
- **Negotiable**: Stories can be refined and adjusted during development
- **Valuable**: Each story must deliver clear value to users
- **Estimable**: Stories should be small enough to estimate accurately
- **Small**: Stories should be completable in 1-3 days
- **Testable**: Stories must have clear, testable acceptance criteria

### 2. Story Statement Format

Use the standard format:

```
As a [user role],
I want [action/capability],
so that [benefit/value].
```

**Examples**:

✅ Good: "As a prompt engineer, I want to save my optimization history, so that I can reuse previous work and track my progress over time."

❌ Bad: "As a user, I want a history feature." (Too vague, no clear value)

### 3. Acceptance Criteria Best Practices

**DO**:

- Start with action verbs (Given/When/Then)
- Make criteria specific and measurable
- Include edge cases where relevant
- Reference technical requirements when needed
- Keep criteria independent

**DON'T**:

- Use vague terms ("should work well", "user-friendly")
- Combine multiple features in one criterion
- Leave room for interpretation
- Skip edge cases

**Example**:

```markdown
✅ Good Acceptance Criteria:

1. User can input prompts up to 10,000 characters with real-time count
2. System displays character count updating as user types
3. Input validation prevents submission of empty prompts
4. System shows warning when character count exceeds 9,500

❌ Bad Acceptance Criteria:

1. User can input prompts
2. System works well
3. Good user experience
```

### 4. Task Breakdown Guidelines

#### Task Structure

```markdown
- [ ] Task N (AC: 1, 2)
  - [ ] Subtask N.1
  - [ ] Subtask N.2
```

#### Task Best Practices

1. **Reference Acceptance Criteria**: Every task should reference the AC it implements
2. **Keep Tasks Atomic**: Each task should be completable in 2-4 hours
3. **Include Testing**: Every feature task should include testing subtasks
4. **Order by Dependency**: Tasks should be ordered by implementation sequence

**Example**:

```markdown
- [ ] Task 1: Implement prompt input component (AC: 1, 3)
  - [ ] Create PromptInput.vue component with text area
  - [ ] Add character counter with real-time updates
  - [ ] Implement validation for empty input
  - [ ] Add warning indicator for high character count
  - [ ] Write unit tests for input validation
  - [ ] Write integration tests for character counting
```

### 5. Dev Notes Requirements

Dev Notes are CRITICAL for developer agents. They must include:

#### Required Sections

1. **Source Tree**: Visual representation of files to be created/modified
2. **Key Information**: Technical details extracted from architecture docs
3. **Testing Standards**: Testing requirements and patterns

#### Source References

**CRITICAL**: Every technical detail MUST include source references:

```markdown
- **Data Models**:
  - User: `{ id: string, name: string }`
  - [Source: docs/architecture/database-architecture.md#user-model]

- **API Contracts**:
  - GET `/api/users/:id` - Returns user object
  - [Source: packages/core/src/services/user/user.service.ts]
```

#### Dev Notes Template

```markdown
## Dev Notes

### Source Tree

\`\`\`
packages/web/src/
├── components/
│ └── ComponentName.vue
├── services/
│ └── serviceName.ts
\`\`\`

### Key Information

- **Data Models**: [Model definitions with source references]
- **API Contracts**: [Endpoints with source references]
- **Components**: [Component specs with source references]
- **Dependencies**: [Required packages and why]
- **Constraints**: [Technical limitations]

### Testing Standards

- **Test Location**: `packages/web/tests/unit/`
- **Framework**: Vitest
- **Coverage Target**: >80%
- **Patterns**: Follow existing patterns in codebase
```

## Story Creation Workflow

### Step 1: Identify Story from Epic

1. Review epic requirements in PRD
2. Identify the smallest valuable increment
3. Ensure story aligns with epic goals
4. Check dependencies with other stories

### Step 2: Create Story File

Use the story creation script:

```bash
node scripts/create-story.js <epic>.<story> "<title>"
# or auto-assign story number
node scripts/create-story.js <epic> "<title>"
```

### Step 3: Populate Story Content

1. **Story Statement**: Define user, action, and value
2. **Acceptance Criteria**: Write 3-7 testable criteria
3. **Tasks**: Break down into atomic tasks with AC references
4. **Dev Notes**: Extract technical context with source references

### Step 4: Validate Story

Run the story-draft-checklist:

```bash
# This validates:
# - Story format is correct
# - Acceptance criteria are testable
# - Tasks reference AC numbers
# - Dev notes include source references
# - No placeholder text remains
```

### Step 5: Request Approval

Submit story to Product Owner for validation:

- All acceptance criteria are clear and complete
- Technical context is sufficient
- Story is properly sized (1-3 days)
- Dependencies are identified

## Story Management

### Story Status Workflow

```
Draft → Approved → InProgress → Review → Done
```

### Status Definitions

| Status     | Description                | Next Action           |
| ---------- | -------------------------- | --------------------- |
| Draft      | Story being written        | SM/PO refines content |
| Approved   | Ready for development      | Dev agent implements  |
| InProgress | Implementation in progress | Continue development  |
| Review     | Implementation complete    | QA agent reviews      |
| Done       | Verified and closed        | No further action     |

### Story Estimation

| Complexity | Duration  | Points | Example                          |
| ---------- | --------- | ------ | -------------------------------- |
| Trivial    | < 2 hours | 1      | Single component, no API         |
| Simple     | 2-4 hours | 2      | Component with API call          |
| Medium     | 4-8 hours | 3-5    | Feature with multiple components |
| Complex    | 1-2 days  | 8-13   | Architecture changes             |
| Epic-level | 3+ days   | Split  | Major feature                    |

## Common Mistakes to Avoid

### 1. Missing Source References

❌ Bad:

```markdown
- **Data Models**: User model with id and name fields
```

✅ Good:

```markdown
- **Data Models**:
  - User: `{ id: string, name: string, email: string }`
  - [Source: docs/architecture/database-architecture.md#user-schema]
```

### 2. Vague Acceptance Criteria

❌ Bad:

```markdown
1. User interface is user-friendly
2. Performance is good
3. System is secure
```

✅ Good:

```markdown
1. Page loads in < 2 seconds on 3G connection
2. User can complete task in < 3 clicks
3. API key is encrypted with AES-256 before storage
```

### 3. Tasks Without AC References

❌ Bad:

```markdown
- [ ] Create login form
- [ ] Add validation
```

✅ Good:

```markdown
- [ ] Task 1: Create login form component (AC: 1, 2)
  - [ ] Build form UI with email and password fields
  - [ ] Add real-time validation for email format
```

### 4. Large Stories

❌ Bad: Story estimated at 13+ points

✅ Good: Split into 2-3 smaller stories (3-5 points each)

## Story Review Checklist

Before submitting a story for approval, verify:

- [ ] Story follows "As a... I want... so that..." format
- [ ] Acceptance criteria are specific and testable
- [ ] Tasks reference acceptance criteria numbers
- [ ] Dev notes include source references for ALL technical details
- [ ] File paths follow project structure conventions
- [ ] Testing approach is clearly defined
- [ ] No placeholder text remains (TBD, TODO, etc.)
- [ ] Story can be completed in 1-3 days
- [ ] Dependencies are documented
- [ ] Story delivers independent value

## Tools and Resources

### Story Creation Script

```bash
# Create new story with specific ID
node scripts/create-story.js 2.3 "Feature Name"

# Create story with auto-assigned number
node scripts/create-story.js 2 "Feature Name"
```

### Related Documents

- [User Story Template](../workspace-template/user-story-template.md)
- [Story Draft Checklist](../../.bmad-core/checklists/story-draft-checklist.md)
- [Story DoD Checklist](../../.bmad-core/checklists/story-dod-checklist.md)
- [Project PRD](../project/prd.md)
- [Architecture Docs](../architecture/)

### BMad-Method Agents

For story creation and management, use:

- **Scrum Master (sm)**: Story creation and epic management
- **Product Owner (po)**: Story validation and approval
- **Developer (dev)**: Story implementation
- **QA (qa)**: Story verification and quality gates

---

**Last Updated**: 2026-02-19  
**Maintained By**: user-story-engineer
