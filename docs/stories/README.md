# User Stories

This directory contains user story documents for the prompt-optimizer project.

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
3. **Populate Context** - Add technical details from architecture docs
4. **Review Checklist** - Run story-draft-checklist validation
5. **Approve** - Product Owner validates story completeness
6. **Implement** - Developer agent executes tasks
7. **Verify** - QA agent reviews implementation
8. **Close** - Mark as Done after verification

## Related Documents

- [User Story Template](../workspace-template/user-story-template.md)
- [Story Draft Checklist](../../.bmad-core/checklists/story-draft-checklist.md)
- [Story DoD Checklist](../../.bmad-core/checklists/story-dod-checklist.md)
- [Project PRD](../project/prd.md)
- [Architecture Docs](../architecture/)

## Quick Reference

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

**Last Updated**: 2026-02-19
