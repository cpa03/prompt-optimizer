#!/usr/bin/env node

import { execSync } from 'child_process'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

function isRealSkip(content) {
  const trimmed = content.trim()

  if (trimmed.includes('.skipIf(')) return false
  if (trimmed.includes('skipIf(')) return false
  if (trimmed.includes('skipped++')) return false
  if (trimmed.includes('skipped =')) return false
  if (trimmed.includes('skipped:')) return false
  if (trimmed.includes('.skipped')) return false
  if (trimmed.includes('result.skipped')) return false
  if (trimmed.includes('// skip')) return false

  const skipPatterns = [
    /\btest\.skip\(\s*\)/,
    /\bit\.skip\(\s*\)/,
    /\bdescribe\.skip\(\s*['"]/,
    /\btest\.skip\(\s*\)/,
    /\bit\.skip\(\s*\)/,
    /\btest\.skip\(\s*true\s*,/,
    /\bit\.skip\(\s*true\s*,/,
  ]

  return skipPatterns.some((pattern) => pattern.test(trimmed))
}

function findSkippedTests() {
  const result = {
    unit: [],
    e2e: [],
    integration: [],
    total: 0,
  }

  try {
    const grepResult = execSync(
      'grep -rn "\\.skip\\|it\\.skip\\|test\\.skip\\|describe\\.skip" --include="*.ts" --include="*.js" --include="*.spec.ts" --include="*.test.ts" --include="*.spec.js" --include="*.test.js" packages/ tests/ 2>/dev/null || true',
      {
        cwd: rootDir,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      }
    )

    if (!grepResult.trim()) {
      return result
    }

    const lines = grepResult.trim().split('\n')

    for (const line of lines) {
      if (!line.trim()) continue

      const match = line.match(/^([^:]+):(\d+):(.*)$/)
      if (!match) continue

      const [, filePath, lineNum, content] = match

      if (!isRealSkip(content)) continue

      const relativePath = relative(rootDir, filePath)

      const skipInfo = {
        file: relativePath,
        line: parseInt(lineNum, 10),
        content: content.trim().substring(0, 80),
      }

      if (relativePath.includes('/e2e/') || relativePath.includes('e2e.')) {
        result.e2e.push(skipInfo)
      } else if (relativePath.includes('/integration/')) {
        result.integration.push(skipInfo)
      } else if (
        relativePath.includes('/tests/') ||
        relativePath.includes('.test.') ||
        relativePath.includes('.spec.')
      ) {
        result.unit.push(skipInfo)
      }

      result.total++
    }
  } catch (error) {
    console.error('Error scanning for skipped tests:', error.message)
  }

  return result
}

function printReport(result) {
  console.log('\n' + colorize('🔍 Skipped Tests Detection Report', 'bold') + '\n')
  console.log('━'.repeat(60) + '\n')

  if (result.total === 0) {
    console.log(colorize('✅ No skipped tests found!', 'green'))
    return
  }

  const printSection = (title, items, color) => {
    if (items.length === 0) return

    console.log(colorize(`\n${title} (${items.length})`, color))
    console.log('─'.repeat(50))

    items.slice(0, 20).forEach((item) => {
      console.log(`  ${colorize(item.file, 'cyan')}:${colorize(item.line, 'gray')}`)
      console.log(`    ${colorize(item.content, 'gray')}`)
    })

    if (items.length > 20) {
      console.log(`  ${colorize(`... and ${items.length - 20} more`, 'gray')}`)
    }
  }

  printSection('📋 Unit Tests', result.unit, 'yellow')
  printSection('🌐 E2E Tests', result.e2e, 'yellow')
  printSection('🔗 Integration Tests', result.integration, 'yellow')

  console.log('\n' + '━'.repeat(60))
  console.log(colorize('\n📊 Summary', 'bold'))
  console.log(`   Unit:        ${result.unit.length}`)
  console.log(`   E2E:         ${result.e2e.length}`)
  console.log(`   Integration: ${result.integration.length}`)
  console.log(
    `   ${colorize('Total:', 'bold')}        ${colorize(result.total, result.total > 10 ? 'red' : 'yellow')}`
  )

  if (result.total > 0) {
    console.log(
      `\n💡 ${colorize('Tip:', 'cyan')} Consider reviewing skipped tests to improve test coverage.`
    )
    console.log(`   Run ${colorize('pnpm test:skipped', 'cyan')} to see this report anytime.\n`)
  }
}

function main() {
  console.log(colorize('\n🧪 Detecting skipped tests...', 'cyan'))

  const result = findSkippedTests()
  printReport(result)

  if (result.total > 0) {
    console.log(colorize(`\nℹ️  Found ${result.total} skipped tests`, 'yellow'))
  }

  process.exit(0)
}

main()
