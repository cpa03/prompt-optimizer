#!/usr/bin/env node

/**
 * Story Validation Script
 *
 * Validates user story files against the story draft checklist to ensure
 * stories have sufficient context for implementation.
 *
 * Usage:
 *   node scripts/validate-story.js <story-file>
 *   node scripts/validate-story.js --all
 *   node scripts/validate-story.js --all --json
 *
 * Exit codes:
 *   0 - All stories pass validation (score >= 80)
 *   1 - Validation failed or errors occurred
 */

const fs = require('fs')
const path = require('path')

const STORIES_DIR = path.join(__dirname, '..', 'docs', 'stories')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const REQUIRED_SECTIONS = [
  { name: 'Status', pattern: /^\*\*Status\*\*:?\s*\w+/im },
  { name: 'Story', pattern: /^##\s*Story$/im },
  { name: 'Acceptance Criteria', pattern: /^##\s*Acceptance\s*Criteria$/im },
  { name: 'Tasks/Subtasks', pattern: /^##\s*Tasks\s*\/?\s*Subtasks$/im },
  { name: 'Dev Notes', pattern: /^##\s*Dev\s*Notes$/im },
  { name: 'Testing', pattern: /^##\s*Testing$/im },
  { name: 'Change Log', pattern: /^##\s*Change\s*Log$/im },
]

const VALID_STATUSES = ['Draft', 'Approved', 'InProgress', 'Review', 'Done']

const PLACEHOLDER_PATTERNS = [
  { pattern: /\[TBD\]/gi, description: 'To be determined' },
  { pattern: /\[To be filled/gi, description: 'To be filled' },
  { pattern: /\[To be assessed\]/gi, description: 'To be assessed' },
  { pattern: /\[To be reviewed\]/gi, description: 'To be reviewed' },
  { pattern: /\[user role\]/gi, description: 'User role placeholder' },
  { pattern: /\[action\/capability\]/gi, description: 'Action placeholder' },
  { pattern: /\[benefit\/value\]/gi, description: 'Benefit placeholder' },
  { pattern: /\[Criterion \d+/gi, description: 'Criterion placeholder' },
  { pattern: /\[Scenario \d+/gi, description: 'Scenario placeholder' },
]

function parseStoryFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const fileName = path.basename(filePath)

  const result = {
    fileName,
    filePath,
    content,
    sections: {},
    issues: [],
    warnings: [],
    passed: [],
    metadata: {},
  }

  for (const section of REQUIRED_SECTIONS) {
    const match = content.match(section.pattern)
    result.sections[section.name] = match ? true : false
  }

  const statusMatch = content.match(/\*\*Status\*\*:?\s*(\w+)/im)
  result.status = statusMatch ? statusMatch[1] : null

  const storyMatch = content.match(/>\s*\*\*As a\*\*\s*(.+?),/is)
  result.userRole = storyMatch ? storyMatch[1].trim() : null

  const wantMatch = content.match(/\*\*I want\*\*\s*(.+?),/is)
  result.action = wantMatch ? wantMatch[1].trim() : null

  const soThatMatch = content.match(/\*\*so that\*\*\s*(.+?)\./is)
  result.benefit = soThatMatch ? soThatMatch[1].trim() : null

  const acMatches = content.matchAll(/^(\d+)\.\s+(.+)$/gm)
  result.acceptanceCriteria = Array.from(acMatches).map((m) => ({
    number: parseInt(m[1]),
    text: m[2].trim(),
  }))

  const taskMatches = content.matchAll(/^-\s*\[([ x])\]\s*Task\s*(\d+):.*?(?:\(AC:\s*([\d,\s]+)\))?\s*$/gm)
  result.tasks = Array.from(taskMatches).map((m) => ({
    number: parseInt(m[2]),
    completed: m[1] === 'x',
    acReferences: m[3] ? m[3].split(',').map((n) => parseInt(n.trim())) : [],
  }))

  const sourceRefs = content.matchAll(/\[Source:\s*([^\]]+)\]/gi)
  result.sourceReferences = Array.from(sourceRefs).map((m) => m[1].trim())

  const placeholders = []
  for (const { pattern, description } of PLACEHOLDER_PATTERNS) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      placeholders.push({
        text: match[0],
        position: match.index,
        description,
      })
    }
  }
  result.placeholders = placeholders

  return result
}

function validateFileName(fileName) {
  const issues = []
  const passed = []

  const validNamePattern = /^(\d+)\.(\d+)\.[a-z0-9-]+\.md$/
  if (validNamePattern.test(fileName)) {
    passed.push('File name follows convention: {epic}.{story}.{title}.md')
  } else {
    issues.push(`Invalid file name format: "${fileName}". Expected: {{epic}}.{{story}}.{{title}}.md`)
  }

  return { issues, passed }
}

function validateStory(parsed) {
  const { content, sections, issues, warnings, passed } = parsed

  for (const [name, found] of Object.entries(sections)) {
    if (found) {
      passed.push(`Section "${name}" found`)
    } else {
      issues.push(`Missing required section: "${name}"`)
    }
  }

  if (parsed.status) {
    if (VALID_STATUSES.includes(parsed.status)) {
      passed.push(`Valid status: "${parsed.status}"`)
    } else {
      issues.push(`Invalid status: "${parsed.status}". Must be one of: ${VALID_STATUSES.join(', ')}`)
    }
  } else {
    issues.push('No status defined')
  }

  if (parsed.userRole && parsed.action && parsed.benefit) {
    passed.push('Story statement follows "As a... I want... so that..." format')
  } else {
    if (!parsed.userRole) warnings.push('Story missing user role (As a...)')
    if (!parsed.action) warnings.push('Story missing action (I want...)')
    if (!parsed.benefit) warnings.push('Story missing benefit (so that...)')
  }

  if (parsed.acceptanceCriteria.length >= 1) {
    passed.push(`Found ${parsed.acceptanceCriteria.length} acceptance criteria`)

    const hasMeasurable = parsed.acceptanceCriteria.some((ac) =>
      /\b(can|should|must|will|displays?|shows?|handles?|validates?|supports?)\b/i.test(ac.text)
    )
    if (hasMeasurable) {
      passed.push('Acceptance criteria contain action verbs')
    } else {
      warnings.push('Acceptance criteria should start with action verbs (can, should, displays, etc.)')
    }
  } else {
    issues.push('No acceptance criteria defined')
  }

  if (parsed.tasks.length >= 1) {
    passed.push(`Found ${parsed.tasks.length} tasks`)

    const tasksWithAC = parsed.tasks.filter((t) => t.acReferences.length > 0)
    if (tasksWithAC.length > 0) {
      passed.push(`${tasksWithAC.length} tasks reference acceptance criteria`)
    } else {
      warnings.push('No tasks reference acceptance criteria (use "Task N (AC: X)" format)')
    }

    const uncompletedTasks = parsed.tasks.filter((t) => !t.completed)
    if (parsed.status === 'Done' && uncompletedTasks.length > 0) {
      issues.push(`Story is "Done" but has ${uncompletedTasks.length} uncompleted tasks`)
    }
  } else {
    issues.push('No tasks defined')
  }

  if (parsed.sourceReferences.length >= 1) {
    passed.push(`Found ${parsed.sourceReferences.length} source references in Dev Notes`)
  } else {
    warnings.push('No source references found in Dev Notes (e.g., [Source: docs/...])')
  }

  if (parsed.placeholders.length === 0) {
    passed.push('No placeholder text found')
  } else {
    const groupedPlaceholders = {}
    for (const p of parsed.placeholders) {
      const key = p.description
      if (!groupedPlaceholders[key]) {
        groupedPlaceholders[key] = 0
      }
      groupedPlaceholders[key]++
    }
    for (const [description, count] of Object.entries(groupedPlaceholders)) {
      warnings.push(`Placeholder text found (${count}x): ${description}`)
    }
  }

  const devNotesMatch = content.match(/##\s*Dev\s*Notes\n([\s\S]+?)(?=\n## \w)/)
  if (devNotesMatch) {
    const devNotes = devNotesMatch[1]
    if (devNotes.includes('Source Tree') || devNotes.includes('```')) {
      passed.push('Dev Notes contains source tree')
    }
    if (devNotes.includes('Data Models')) {
      passed.push('Dev Notes contains data models')
    }
    if (devNotes.includes('API Contracts') || devNotes.includes('API')) {
      passed.push('Dev Notes contains API contracts')
    }
    if (devNotes.includes('Dependencies')) {
      passed.push('Dev Notes contains dependencies')
    }
    if (devNotes.includes('Constraints')) {
      passed.push('Dev Notes contains constraints')
    }

    const devNotesLength = devNotes.trim().length
    if (devNotesLength < 200) {
      warnings.push(`Dev Notes section seems sparse (${devNotesLength} chars). Consider adding more context.`)
    }
  }

  const testMatch = content.match(/##\s*Testing\n([\s\S]+?)(?=\n## \w)/)
  if (testMatch) {
    const testSection = testMatch[1]
    if (testSection.includes('Test') || testSection.includes('test')) {
      passed.push('Testing section contains test scenarios')
    }
    if (testSection.includes('Coverage') || testSection.includes('coverage')) {
      passed.push('Testing section mentions coverage targets')
    }
  }

  return parsed
}

function calculateScore(parsed) {
  let score = 100

  for (const _ of parsed.issues) {
    score -= 15
  }
  for (const _ of parsed.warnings) {
    score -= 5
  }

  const sectionScore = Object.values(parsed.sections).filter(Boolean).length * 3
  score = Math.min(score + sectionScore, 100)

  return Math.max(0, Math.min(100, score))
}

function printReport(parsed, jsonOutput = false) {
  const score = calculateScore(parsed)

  if (jsonOutput) {
    const jsonResult = {
      file: parsed.fileName,
      filePath: parsed.filePath,
      status: parsed.status,
      score,
      assessment:
        score >= 80 ? 'READY' : score >= 50 ? 'NEEDS_REVISION' : 'BLOCKED',
      passed: parsed.passed,
      warnings: parsed.warnings,
      issues: parsed.issues,
      metadata: {
        userRole: parsed.userRole,
        action: parsed.action,
        benefit: parsed.benefit,
        acceptanceCriteriaCount: parsed.acceptanceCriteria.length,
        tasksCount: parsed.tasks.length,
        sourceReferencesCount: parsed.sourceReferences.length,
        placeholdersCount: parsed.placeholders.length,
      },
    }
    return JSON.stringify(jsonResult, null, 2)
  }

  let output = ''

  output += '\n' + '='.repeat(60) + '\n'
  output += `Story Validation Report: ${parsed.fileName}\n`
  output += '='.repeat(60) + '\n'

  output += `\nStatus: ${parsed.status || 'Not defined'}\n`
  output += `Validation Score: ${score}/100\n`

  if (parsed.passed.length > 0) {
    output += '\n✓ Passed Checks:\n'
    for (const item of parsed.passed) {
      output += `  ✓ ${item}\n`
    }
  }

  if (parsed.warnings.length > 0) {
    output += '\n⚠ Warnings:\n'
    for (const item of parsed.warnings) {
      output += `  ⚠ ${item}\n`
    }
  }

  if (parsed.issues.length > 0) {
    output += '\n✗ Issues:\n'
    for (const item of parsed.issues) {
      output += `  ✗ ${item}\n`
    }
  }

  output += '\n' + '-'.repeat(60) + '\n'

  if (score >= 80) {
    output += 'Assessment: READY - Story provides sufficient context for implementation\n'
  } else if (score >= 50) {
    output += 'Assessment: NEEDS REVISION - Address warnings and issues above\n'
  } else {
    output += 'Assessment: BLOCKED - Critical information missing\n'
  }

  output += '\n'

  return output
}

function validateAllStories(jsonOutput = false) {
  if (!fs.existsSync(STORIES_DIR)) {
    if (jsonOutput) {
      return JSON.stringify({ error: 'Stories directory not found', path: STORIES_DIR }, null, 2)
    }
    log(`Stories directory not found: ${STORIES_DIR}`, 'red')
    return null
  }

  const files = fs.readdirSync(STORIES_DIR)
  const storyFiles = files.filter((f) => f.match(/^\d+\.\d+\..+\.md$/))

  if (storyFiles.length === 0) {
    if (jsonOutput) {
      return JSON.stringify({ error: 'No story files found', path: STORIES_DIR }, null, 2)
    }
    log('No story files found in docs/stories/', 'yellow')
    return null
  }

  if (!jsonOutput) {
    log(`\nValidating ${storyFiles.length} story files...\n`, 'bright')
  }

  let totalScore = 0
  const results = []

  for (const file of storyFiles) {
    const filePath = path.join(STORIES_DIR, file)
    const parsed = parseStoryFile(filePath)

    const fileValidation = validateFileName(file)
    parsed.issues.push(...fileValidation.issues)
    parsed.passed.push(...fileValidation.passed)

    validateStory(parsed)
    const score = calculateScore(parsed)
    totalScore += score
    results.push({
      file,
      score,
      issues: parsed.issues.length,
      warnings: parsed.warnings.length,
      status: parsed.status,
      assessment:
        score >= 80 ? 'READY' : score >= 50 ? 'NEEDS_REVISION' : 'BLOCKED',
    })
  }

  if (jsonOutput) {
    const avgScore = Math.round(totalScore / storyFiles.length)
    const readyCount = results.filter((r) => r.score >= 80).length
    return JSON.stringify(
      {
        summary: {
          totalStories: storyFiles.length,
          averageScore: avgScore,
          readyForDevelopment: readyCount,
          results,
        },
      },
      null,
      2
    )
  }

  log('Story Validation Summary', 'bright')
  log('='.repeat(60), 'bright')
  log('')

  console.table(
    results.map((r) => ({
      File: r.file,
      Score: `${r.score}/100`,
      Issues: r.issues,
      Warnings: r.warnings,
      Status: r.status || 'N/A',
      Assessment: r.assessment,
    }))
  )

  const avgScore = Math.round(totalScore / storyFiles.length)
  log(`\nAverage Score: ${avgScore}/100`, avgScore >= 80 ? 'green' : 'yellow')

  const readyCount = results.filter((r) => r.score >= 80).length
  log(`Ready for Development: ${readyCount}/${storyFiles.length}`, readyCount > 0 ? 'green' : 'yellow')

  return { avgScore, readyCount, total: storyFiles.length }
}

function main() {
  const args = process.argv.slice(2)
  const jsonOutput = args.includes('--json')
  const allMode = args.includes('--all')
  const showHelp = args.includes('--help') || args.includes('-h')

  if (!jsonOutput) {
    log('\n📋 Story Validation Tool\n', 'bright')
  }

  if (showHelp) {
    log('Usage:', 'cyan')
    log('  node scripts/validate-story.js <story-file>     Validate a specific story')
    log('  node scripts/validate-story.js --all            Validate all stories')
    log('  node scripts/validate-story.js --all --json     JSON output for CI')
    log('')
    log('NPM Scripts:', 'cyan')
    log('  pnpm story:validate <file>                      Validate a story')
    log('  pnpm story:validate:all                        Validate all stories')
    log('')
    log('Examples:', 'cyan')
    log('  node scripts/validate-story.js docs/stories/1.1.prompt-optimization-core.md')
    log('  node scripts/validate-story.js --all')
    log('  node scripts/validate-story.js --all --json > validation-report.json')
    log('')
    log('Exit Codes:', 'cyan')
    log('  0 - Validation passed (score >= 80 for --all, or >= 50 for single file)')
    log('  1 - Validation failed or errors occurred')
    process.exit(0)
  }

  if (args.length === 0 || (args.length === 1 && jsonOutput)) {
    if (!jsonOutput) {
      log('Usage: node validate-story.js <story-file>', 'yellow')
      log('   or: node validate-story.js --all', 'yellow')
      log('   or: node validate-story.js --all --json', 'yellow')
      log('   or: node validate-story.js --help\n', 'yellow')
    }
    process.exit(1)
  }

  if (allMode) {
    const result = validateAllStories(jsonOutput)
    if (typeof result === 'string') {
      console.log(result)
    } else if (result) {
      process.exit(result.avgScore >= 80 ? 0 : 1)
    }
    return
  }

  const storyPath = args[0]

  if (!fs.existsSync(storyPath)) {
    if (jsonOutput) {
      console.log(JSON.stringify({ error: 'Story file not found', path: storyPath }, null, 2))
    } else {
      log(`Error: Story file not found: ${storyPath}`, 'red')
    }
    process.exit(1)
  }

  const parsed = parseStoryFile(storyPath)

  const fileValidation = validateFileName(parsed.fileName)
  parsed.issues.push(...fileValidation.issues)
  parsed.passed.push(...fileValidation.passed)

  validateStory(parsed)
  const score = calculateScore(parsed)

  if (jsonOutput) {
    console.log(printReport(parsed, true))
  } else {
    log(printReport(parsed, false))
  }

  process.exit(score >= 50 ? 0 : 1)
}

main()
