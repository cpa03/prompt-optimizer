# Technical Writer Agent Documentation

## Overview
This document serves as the long-term memory for the technical-writer agent, documenting patterns, procedures, and learnings.

## Domain
- **Focus**: Documentation improvements, fixes, and enhancements
- **Scope**: Small, safe, measurable improvements strictly within documentation domain

## Execution Mode
1. Check for open PR with label `technical-writer` → update, review, fix if needed
2. If Issue exists → execute → create/update PR
3. If none → proactive scan limited to domain → create/update PR
4. If nothing valuable → proactive scan repository health/efficiency

## Procedures

### PR Updates
- Always rebase onto latest `develop` branch
- Ensure clean, atomic diffs
- Run lint/tests before finalizing
- Comment on PR with status

### Common Fixes
- Markdown formatting issues
- Broken links
- Escaped characters in headings
- Documentation consistency

## History

### 2026-02-26
- **PR #XXX**: Added missing Electron API Best Practices reference to docs/index.md
  - Added reference to `docs/guides/electron-api-best-practices.md` in Developer Documentation section
  - Issue: Guide file existed but was not linked from documentation index
  - Resolution: Added link with description, updated date stamp

### 2026-02-25
- **PR #XXX**: Fixed broken link placeholders in documentation
  - Fixed `docs/user/README.md`: Replaced broken link to FAQ with placeholder note
  - Fixed `docs/project/README.md`: Replaced broken link to feature-requirements.md with placeholder note
  - Issue: Links with "（待创建）" appeared as broken links to non-existent files
  - Resolution: Rebased onto latest develop, clean atomic diff

### 2026-02-25
- **PR #648**: Fixed broken links in `docs/archives/124-navigation-optimization/README.md`
  - Removed 4 broken references to deleted workspace files
  - Files removed: navigation-optimization-record.md, component-usage-guide.md, language-extension-guide.md, README.md
  - Resolution: Rebased onto latest develop, clean atomic diff

### 2026-02-24
- **PR #600**: Fixed escaped underscore in `docs/ENVIRONMENT_VARIABLES.md` heading
  - Changed: `VITE\_ prefixed` → `VITE_ prefixed`
  - Issue: Backslash was incorrectly displayed in rendered markdown
  - Resolution: Rebased onto latest develop, force-pushed clean branch
