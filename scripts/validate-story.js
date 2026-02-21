#!/usr/bin/env node

/**
 * Story Validation Script
 *
 * This script validates user story files against the story draft checklist
 * to ensure stories have sufficient context for implementation.
 *
 * Usage: node scripts/validate-story.js <story-file>
 * Example: node scripts/validate-story.js docs/stories/1.1.prompt-optimization-core.md
 * 
 * Or validate all stories: node scripts/validate-story.js --all
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
  /\[TBD\]/gi,
  /\[To be filled/gi,
  /\[To be assessed\]/gi,
  /\[To be reviewed\]/gi,
  /\[user role\]/gi,
  /\[action\/capability\]/gi,
  /\[benefit\/value\]/gi,
  /\[Criterion \d+/gi,
  /\[Scenario \d+/gi,
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

  const taskMatches = content.matchAll(/^-\s*\[([ x])\]\s*Task\s*(\d+)(?:\s*\(AC:\s*([\d,\s]+)\))?/gm)
  result.tasks = Array.from(taskMatches).map((m) => ({
    number: parseInt(m[2]),
    completed: m[1] === 'x',
    acReferences: m[3] ? m[3].split(',').map((n) => parseInt(n.trim())) : [],
  }))

  const sourceRefs = content.matchAll(/\[Source:\s*([^\]]+)\]/gi)
  result.sourceReferences = Array.from(sourceRefs).map((m) => m[1].trim())

  const placeholders = []
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      placeholders.push({
        text: match[0],
        position: match.index,
      })
    }
  }
  result.placeholders = placeholders

  return result
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
    for (const p of parsed.placeholders) {
      warnings.push(`Placeholder text found: "${p.text}"`)
    }
  }

  const devNotesMatch = content.match(/##\s*Dev\s*Notes([\s\S]*?)(?=##|$)/i)
  if (devNotesMatch) {
    const devNotes = devNotesMatch[1]
    if (devNotes.includes('Source Tree') || devNotes.includes('```')) {
      passed.push('Dev Notes contains source tree')
    }
    if (devNotes.includes('Data Models')) {
      passed.push('Dev Notes contains data models')
    }
    if (devNotes.includes('API Contracts')) {
      passed.push('Dev Notes contains API contracts')
    }
    if (devNotes.includes('Dependencies')) {
      passed.push('Dev Notes contains dependencies')
    }
    if (devNotes.includes('Constraints')) {
      passed.push('Dev Notes contains constraints')
    }
  }

  const testMatch = content.match(/##\s*Testing([\s\S]*?)(?=##|$)/i)
  if (testMatch) {
    const testSection = testMatch[1]
    if (testSection.includes('Test') || testSection.includes('test')) {
      passed.push('Testing section contains test scenarios')
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

function printReport(parsed) {
  const score = calculateScore(parsed)

  log('\n' + '='.repeat(60), 'bright')
  log(`Story Validation Report: ${parsed.fileName}`, 'bright')
  log('='.repeat(60), 'bright')

  log(`\nStatus: ${parsed.status || 'Not defined'}`, parsed.status ? 'cyan' : 'red')
  log(`Validation Score: ${score}/100`, score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red')

  if (parsed.passed.length > 0) {
    log('\n✓ Passed Checks:', 'green')
    for (const item of parsed.passed) {
      log(`  ✓ ${item}`, 'green')
    }
  }

  if (parsed.warnings.length > 0) {
    log('\n⚠ Warnings:', 'yellow')
    for (const item of parsed.warnings) {
      log(`  ⚠ ${item}`, 'yellow')
    }
  }

  if (parsed.issues.length > 0) {
    log('\n✗ Issues:', 'red')
    for (const item of parsed.issues) {
      log(`  ✗ ${item}`, 'red')
    }
  }

  log('\n' + '-'.repeat(60), 'bright')

  if (score >= 80) {
    log('Assessment: READY - Story provides sufficient context for implementation', 'green')
  } else if (score >= 50) {
    log('Assessment: NEEDS REVISION - Address warnings and issues above', 'yellow')
  } else {
    log('Assessment: BLOCKED - Critical information missing', 'red')
  }

  log('')

  return score
}

function validateAllStories() {
  const files = fs.readdirSync(STORIES_DIR)
  const storyFiles = files.filter((f) => f.match(/^\d+\.\d+\..+\.md$/))

  if (storyFiles.length === 0) {
    log('No story files found in docs/stories/', 'yellow')
    return
  }

  log(`\nValidating ${storyFiles.length} story files...\n`, 'bright')

  let totalScore = 0
  const results = []

  for (const file of storyFiles) {
    const filePath = path.join(STORIES_DIR, file)
    const parsed = parseStoryFile(filePath)
    validateStory(parsed)
    const score = calculateScore(parsed)
    totalScore += score
    results.push({ file, score, issues: parsed.issues.length, warnings: parsed.warnings.length })
  }

  log('Story Validation Summary', 'bright')
  log('='.repeat(60), 'bright')
  log('')

  const table = results.map((r) => ({
    file: r.file,
    score: `${r.score}/100`,
    issues: r.issues,
    warnings: r.warnings,
    status: r.score >= 80 ? 'READY' : r.score >= 50 ? 'NEEDS REVISION' : 'BLOCKED',
  }))

  console.table(table)

  const avgScore = Math.round(totalScore / storyFiles.length)
  log(`\nAverage Score: ${avgScore}/100`, avgScore >= 80 ? 'green' : 'yellow')

  const readyCount = results.filter((r) => r.score >= 80).length
  log(`Ready for Development: ${readyCount}/${storyFiles.length}`, readyCount > 0 ? 'green' : 'yellow')
}

function main() {
  const args = process.argv.slice(2)

  log('\n📋 Story Validation Tool\n', 'bright')

  if (args.length === 0) {
    log('Usage: node validate-story.js <story-file>', 'yellow')
    log('   or: node validate-story.js --all\n', 'yellow')
    process.exit(1)
  }

  if (args[0] === '--all') {
    validateAllStories()
    return
  }

  const storyPath = args[0]

  if (!fs.existsSync(storyPath)) {
    log(`Error: Story file not found: ${storyPath}`, 'red')
    process.exit(1)
  }

  const parsed = parseStoryFile(storyPath)
  validateStory(parsed)
  const score = printReport(parsed)

  process.exit(score >= 50 ? 0 : 1)
}

main()
