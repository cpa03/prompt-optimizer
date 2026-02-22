#!/usr/bin/env node

/**
 * Story Creation Helper Script
 *
 * This script helps create new user story files following the project's
 * story template and naming conventions.
 *
 * Usage: node scripts/create-story.js <epic>.<story> "<title>"
 * Example: node scripts/create-story.js 1.4 "User Authentication"
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const STORIES_DIR = path.join(__dirname, '..', 'docs', 'stories')
const TEMPLATE_PATH = path.join(
  __dirname,
  '..',
  'docs',
  'workspace-template',
  'user-story-template.md'
)

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseStoryId(id) {
  const match = id.match(/^(\d+)\.(\d+)$/)
  if (!match) {
    throw new Error('Invalid story ID format. Expected format: <epic>.<story> (e.g., 1.4)')
  }
  return {
    epic: parseInt(match[1], 10),
    story: parseInt(match[2], 10),
  }
}

function getStoryFilePath(epic, story, titleSlug) {
  return path.join(STORIES_DIR, `${epic}.${story}.${titleSlug}.md`)
}

function checkStoryExists(filePath) {
  return fs.existsSync(filePath)
}

function getNextStoryNumber(epic) {
  const files = fs.readdirSync(STORIES_DIR)
  const epicFiles = files.filter((f) => f.startsWith(`${epic}.`))

  if (epicFiles.length === 0) {
    return 1
  }

  const storyNumbers = epicFiles.map((f) => parseInt(f.split('.')[1], 10)).filter((n) => !isNaN(n))

  return Math.max(...storyNumbers) + 1
}

function generateStoryContent(epic, story, title) {
  const today = new Date().toISOString().split('T')[0]

  return `# Story ${epic}.${story}: ${title}

**Status**: Draft

**Priority**: P2-Medium

**Story Points**: 3

## Story

> **As a** [user role],
> **I want** [action/capability],
> **so that** [benefit/value].

## Acceptance Criteria

1. [Criterion 1 - specific, measurable outcome]
2. [Criterion 2 - specific, measurable outcome]
3. [Criterion 3 - specific, measurable outcome]

## Tasks / Subtasks

- [ ] Task 1 (AC: #)
  - [ ] Subtask 1.1
  - [ ] Subtask 1.2
- [ ] Task 2 (AC: #)
  - [ ] Subtask 2.1
- [ ] Task 3 (AC: #)
  - [ ] Subtask 3.1

## Dev Notes

### Source Tree

\`\`\`
packages/web/src/
├── components/
│   └── [ComponentName].vue
├── services/
│   └── [ServiceName].ts
└── composables/
    └── [ComposableName].ts
\`\`\`

### Key Information

- **Data Models**: 
  - [Model]: [description]
  - [Source: docs/architecture/...]
  
- **API Contracts**:
  - [Endpoint]: [description]
  - [Source: packages/core/src/services/...]

- **Components**: 
  - [Component]: [description]
  - [Source: ...]

- **Dependencies**: 
  - [Dependency]: [reason]

- **Constraints**:
  - [Constraint]: [description]

### Testing Standards

- **Test Location**: \`packages/web/tests/unit/\` or \`packages/core/tests/unit/\`
- **Framework**: Vitest
- **Coverage Target**: >80%
- **Patterns**: Follow existing test patterns in codebase
- **Reference**: [Testing Guide](../developer/technical-development-guide.md)

## Dependencies

### Prerequisites

| Story ID | Type     | Description                    | Status |
| -------- | -------- | ------------------------------ | ------ |
| [To be identified] | Required/Optional | [Description] | [Status] |

### Blocked By

| Story ID | Description                    |
| -------- | ------------------------------ |
| [To be identified] | [Reason for blocking] |

### Blocks

| Story ID | Description                    |
| -------- | ------------------------------ |
| [To be identified] | [What is blocked by this story] |

## Testing

### Test Scenarios

1. **[Feature] Tests**
   - [Scenario 1]
   - [Scenario 2]

## File List

| File | Action | Description |
| ---- | ------ | ----------- |
| [To be filled during implementation] | | |

## Change Log

| Date       | Version | Description   | Author              |
| ---------- | ------- | ------------- | ------------------- |
| ${today}   | 1.0     | Initial draft | user-story-engineer |

## Dev Agent Record

### Agent Model Used

- **Model**: [To be filled during implementation]
- **Date**: [To be filled during implementation]

### Debug Log References

- [To be filled during implementation]

### Completion Notes List

- [To be filled during implementation]

### File List

| File | Action | Description |
| ---- | ------ | ----------- |
| [To be filled during implementation] | | |

## QA Results

### Review Date

- **Date**: [To be filled during review]
- **Reviewer**: [To be filled during review]

### Quality Assessment

- **Code Quality**: [To be assessed]
- **Test Coverage**: [To be assessed]
- **Standards Compliance**: [To be assessed]

### Issues Found

| ID  | Severity | Description | Resolution |
| --- | -------- | ----------- | ---------- |
| [To be filled during review] | | | |

### Final Status

- [ ] **Approved**: Ready for merge
- [ ] **Changes Requested**: Needs fixes before merge
- [ ] **Blocked**: Waiting on dependencies
`
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  const args = process.argv.slice(2)

  log('\n📝 Story Creation Helper\n', 'bright')

  // Parse arguments
  let epicNum, storyNum, title

  if (args.length === 0) {
    log('Usage: node create-story.js <epic>.<story> "<title>"', 'yellow')
    log('   or: node create-story.js <epic> "<title>" (auto-assign story number)\n', 'yellow')
    process.exit(1)
  }

  try {
    if (args[0].includes('.')) {
      // Format: epic.story "title"
      const { epic, story } = parseStoryId(args[0])
      epicNum = epic
      storyNum = story
      title = args[1]
    } else {
      // Format: epic "title"
      epicNum = parseInt(args[0], 10)
      if (isNaN(epicNum)) {
        throw new Error('Epic number must be a valid integer')
      }
      storyNum = null
      title = args[1]
    }

    if (!title) {
      log('Error: Story title is required', 'red')
      process.exit(1)
    }

    // Auto-assign story number if not provided
    if (storyNum === null) {
      storyNum = getNextStoryNumber(epicNum)
      log(`Auto-assigning story number: ${storyNum}`, 'blue')
    }

    // Generate file path
    const titleSlug = slugify(title)
    const filePath = getStoryFilePath(epicNum, storyNum, titleSlug)

    // Check if story already exists
    if (checkStoryExists(filePath)) {
      log(`Error: Story file already exists: ${filePath}`, 'red')
      process.exit(1)
    }

    // Generate content
    log(`\nCreating story ${epicNum}.${storyNum}: "${title}"`, 'green')
    const content = generateStoryContent(epicNum, storyNum, title)

    // Write file
    fs.writeFileSync(filePath, content, 'utf8')
    log(`✅ Story created successfully: ${filePath}\n`, 'green')

    // Next steps
    log('Next steps:', 'bright')
    log('1. Review and update the story statement (As a... I want... so that...)', 'blue')
    log('2. Define specific, testable acceptance criteria', 'blue')
    log('3. Break down into tasks with AC references', 'blue')
    log('4. Add technical context with source references in Dev Notes', 'blue')
    log('5. Run story-draft-checklist validation', 'blue')
    log('6. Request PO approval\n', 'blue')
  } catch (error) {
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }
}

main()
