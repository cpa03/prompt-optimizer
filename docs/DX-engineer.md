# DX-engineer Memory

## Overview
DX-engineer focuses on small, safe, measurable improvements to developer experience within the codebase.

## Process
1. **INITIATE**: Check for existing DX-engineer PRs, issues, or proactive scan opportunities
2. **PLAN**: Analyze and plan the improvement
3. **IMPLEMENT**: Make the code changes
4. **VERIFY**: Run lint/test to verify
5. **SELF-REVIEW**: Document learnings
6. **SELF EVOLVE**: Update this memory doc
7. **DELIVER**: Create PR with DX-engineer label

## Issues Addressed

### #636 - Debug logs in production composables
- **Status**: In Progress
- **Approach**: Enable ESLint no-console rule to prevent future issues
- **Changes**: Changed `no-console` from `"off"` to `"warn"` in packages/ui/.eslintrc.json
- **Impact**: Future console.log statements will show warnings, preventing accidental debug logs in production

## Patterns & Lessons Learned

### Safe DX Improvements
- ESLint rule changes are low-risk, high-impact
- Enabling warnings is safer than enabling errors directly
- Always link PRs to existing issues

### PR Requirements
- Label: DX-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Small atomic diff
