/**
 * kill-dev v2 - Ultimate Safe Process Cleanup Script
 *
 * Strategy:
 * 1. Clean up processes occupying ports (most critical)
 * 2. Wait 2 seconds for parent processes to exit naturally
 * 3. Check ports again to ensure complete cleanup
 *
 * About "missed processes":
 * - Parent processes (pnpm) usually exit automatically after child processes terminate
 * - vite build --watch doesn't occupy ports, exits with parent process
 * - Even if missed, they don't occupy ports and won't block new starts
 */

const { execSync } = require('child_process')
const os = require('os')
const path = require('path')

// Import configuration (supports both ESM and CommonJS)
const configPath = path.join(__dirname, 'config', 'constants.js')
let SERVER_CONFIG
try {
  const config = require(configPath)
  SERVER_CONFIG = config.SERVER_CONFIG
} catch (e) {
  // Fallback if config not available
  SERVER_CONFIG = {
    DEFAULT_PORT: 18181,
    KILL_DEV_WAIT_MS: 2000,
  }
}

console.log('🧹 Safely cleaning up project development processes...\n')

// Limit to project-specific ports so we do not kill other apps using defaults like 5173
const PORTS = [SERVER_CONFIG.DEFAULT_PORT]

/**
 * Cross-platform non-blocking sleep
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function killByPorts(round = 1) {
  const platform = os.platform()
  let killedCount = 0
  const killedPids = new Set()

  console.log(`🔍 Round ${round}: Checking port occupation...`)

  if (platform === 'win32') {
    for (const port of PORTS) {
      try {
        const output = execSync(`netstat -ano | findstr ":${port}"`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        })

        // Windows uses \r\n, so split by \n and trim each line
        const lines = output
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
        lines.forEach((line) => {
          const match = line.match(/LISTENING\s+(\d+)/)
          if (match && !killedPids.has(match[1])) {
            const pid = match[1]
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' })
              console.log(`  ✓ Killed process on port ${port} (PID: ${pid})`)
              killedPids.add(pid)
              killedCount++
            } catch (e) {
              // Process may have already exited
            }
          }
        })
      } catch (error) {
        // Port not occupied or command failed
      }
    }
  } else {
    for (const port of PORTS) {
      try {
        const output = execSync(`lsof -ti :${port}`, {
          encoding: 'utf-8',
          stdio: 'pipe',
        })

        const pids = output
          .split('\n')
          .map((pid) => pid.trim())
          .filter(Boolean)
        pids.forEach((pid) => {
          if (!killedPids.has(pid)) {
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'pipe' })
              console.log(`  ✓ Killed process on port ${port} (PID: ${pid})`)
              killedPids.add(pid)
              killedCount++
            } catch (e) {
              // Process may have already exited
            }
          }
        })
      } catch (error) {
        // Port not occupied or command failed
      }
    }
  }

  if (killedCount === 0) {
    console.log('  ℹ️  No processes found occupying ports')
  }

  return killedCount
}

async function main() {
  try {
    // First round cleanup
    let totalKilled = killByPorts(1)

    if (totalKilled > 0) {
      // Wait for parent processes to exit naturally (cross-platform)
      const waitMs = SERVER_CONFIG.KILL_DEV_WAIT_MS
      console.log(
        `\n⏳ Waiting ${waitMs / 1000} seconds for parent processes to exit naturally...\n`
      )
      await wait(waitMs)

      // Second round cleanup (ensure no missed processes)
      const round2Killed = killByPorts(2)
      totalKilled += round2Killed

      if (round2Killed > 0) {
        console.log('\n💡 Found and cleaned up missed processes')
      } else {
        console.log('\n✅ Confirmed: All processes completely cleaned up')
      }
    }

    console.log(`\n📊 Total cleaned: ${totalKilled} process(es)`)

    if (totalKilled > 0) {
      console.log('✅ Cleanup complete! You can now run pnpm dev:fresh')
    } else {
      console.log('ℹ️  No processes found that need cleanup')
    }

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message)
    console.error('\n💡 Please try:')
    console.error('   1. Run this script again')
    console.error('   2. Or manually terminate related processes in Task Manager')
    process.exit(1)
  }
}

main()
