# Story Review Checklist

This checklist helps reviewers evaluate user stories before they move to implementation.

## Quick Reference Card

| Check                  | Pass Criteria                                    | Common Issues                      |
| ---------------------- | ------------------------------------------------ | ---------------------------------- |
| **Goal Clarity**       | WHAT and WHY are explicit                        | Vague purpose, missing context     |
| **Acceptance Criteria**| 3-7 specific, testable criteria                  | Too many, unmeasurable, vague      |
| **Tasks**              | All tasks reference AC numbers                   | Orphan tasks, missing tests        |
| **Dev Notes**          | Source references included                       | No architecture links, assumptions |
| **Testing**            | Test scenarios listed                            | No test plan, missing edge cases   |
| **Dependencies**       | Prerequisites documented                         | Hidden blockers, unclear order     |

## Story Quality Score

Calculate story quality (max 100 points):

| Category             | Points | Criteria                                 |
| -------------------- | ------ | ---------------------------------------- |
| Goal Clarity         | 20     | Clear purpose, business value, context   |
| Acceptance Criteria  | 20     | Specific, measurable, testable (3-7 ACs) |
| Tasks                | 15     | All map to ACs, include testing          |
| Dev Notes            | 20     | Source refs, technical details complete  |
| Testing Plan         | 15     | Scenarios defined, edge cases covered    |
| Dependencies         | 10     | Prerequisites explicit, order clear      |

**Score Interpretation:**
- **85-100**: Excellent - Ready for development
- **70-84**: Good - Minor improvements needed
- **55-69**: Fair - Requires revision before approval
- **<55**: Poor - Significant rework needed

## Pre-Implementation Review (Before Development)

### Definition of Ready

A story is ready for development when all criteria are met:

- [ ] Story has clear business value defined
- [ ] Acceptance criteria are complete and testable
- [ ] Technical approach is understood by the team
- [ ] Dependencies are identified and resolved
- [ ] No blocking issues or questions
- [ ] Estimated effort is within 1-3 days
- [ ] Dev notes contain sufficient context with source references

### Story Structure

- [ ] Story follows "As a... I want... so that..." format
- [ ] Story is small enough to complete in 1-3 days
- [ ] Story delivers independent value
- [ ] Story title is clear and descriptive

### Acceptance Criteria

- [ ] All acceptance criteria are specific and testable
- [ ] Acceptance criteria start with action verbs
- [ ] Each criterion has clear success boundaries
- [ ] Edge cases are considered where relevant
- [ ] Criteria are measurable and verifiable

### Tasks and Subtasks

- [ ] Tasks reference acceptance criteria numbers
- [ ] Tasks are ordered by implementation sequence
- [ ] Tasks are small and achievable
- [ ] Testing tasks are included
- [ ] No duplicate tasks

### Dev Notes Quality

- [ ] Technical context is sufficient for implementation
- [ ] Source references are included for all technical details
- [ ] File paths follow project structure conventions
- [ ] Dependencies are documented
- [ ] Constraints and limitations are noted
- [ ] No placeholder text remains (e.g., `[TBD]`, `TODO`)

### Testing Approach

- [ ] Test scenarios are identified
- [ ] Test location is specified
- [ ] Coverage targets are defined
- [ ] Test patterns are referenced

## Post-Implementation Review (Before Merge)

### Code Quality

- [ ] Code follows project conventions
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Performance considerations addressed

### Test Coverage

- [ ] Unit tests written for new code
- [ ] Integration tests added where needed
- [ ] All tests passing
- [ ] Coverage meets target (>80%)

### Documentation

- [ ] Code comments added for complex logic
- [ ] README updated if needed
- [ ] API documentation updated if needed
- [ ] Change log updated

### Acceptance Criteria Verification

- [ ] All acceptance criteria met
- [ ] Manual testing completed
- [ ] Edge cases verified
- [ ] Error scenarios tested

### Integration

- [ ] No regressions in existing functionality
- [ ] Dependencies work correctly
- [ ] UI/UX is consistent with existing patterns

## Quick Review Guide

### For Product Owners

Focus on:

1. Business value alignment
2. Acceptance criteria completeness
3. Story scope appropriateness
4. User experience considerations

### For Developers

Focus on:

1. Technical feasibility
2. Implementation approach
3. Test coverage
4. Code quality

### For QA

Focus on:

1. Testability of acceptance criteria
2. Edge case coverage
3. Test scenarios completeness
4. Integration risks

## Review Status Definitions

| Status             | Definition                          | Next Step              |
| ------------------ | ----------------------------------- | ---------------------- |
| **Approved**       | Story meets all quality standards   | Proceed to development |
| **Changes Needed** | Minor improvements required         | Address feedback       |
| **Blocked**        | Dependencies or blockers identified | Resolve blockers       |
| **Rejected**       | Story requires significant rework   | Return to drafting     |

## Common Issues and Solutions

### Issue: Vague Acceptance Criteria

**Symptom**: Criteria like "User can do X" without specifics

**Solution**: Use Given/When/Then format

- Given: User is on the settings page
- When: User clicks "Save"
- Then: Settings are persisted and success message shows

### Issue: Missing Source References

**Symptom**: Technical details without architecture references

**Solution**: Add source citations

- `[Source: docs/architecture/database-architecture-improvements.md#schema]`

### Issue: Overly Large Stories

**Symptom**: Story would take more than 3 days

**Solution**: Split into smaller stories

- Each story should deliver independent value
- Maintain clear dependencies between stories

### Issue: No Testing Plan

**Symptom**: No test scenarios or test approach defined

**Solution**: Add testing section

- List specific test scenarios
- Define coverage targets
- Reference testing patterns

## Review Process

1. **Self-Review**: Story author reviews against checklist
2. **Peer Review**: Team member reviews for completeness
3. **PO Review**: Product Owner validates business alignment
4. **Final Approval**: Story moves to "Approved" status

## Related Documents

- [User Story Template](./user-story-template.md)
- [Story Draft Checklist](../../.bmad-core/checklists/story-draft-checklist.md)
- [Story DoD Checklist](../../.bmad-core/checklists/story-dod-checklist.md)

---

**Last Updated**: 2026-02-22
