# DevContainer Configuration

This directory contains the development container configuration for Prompt Optimizer, enabling a consistent and fully-configured development environment with a single click.

## What's Included

### Base Image
- Node.js 20 (LTS)
- TypeScript support
- pnpm 10.6.1 (project-required version)

### Pre-installed VS Code Extensions
- **Vue.volar** - Vue 3 language support
- **dbaeumer.vscode-eslint** - ESLint integration
- **esbenp.prettier-vscode** - Code formatting
- **editorconfig.editorconfig** - EditorConfig support
- **vitest.explorer** - Vitest test explorer
- **ms-playwright.playwright** - Playwright test support
- **ms-vscode.vscode-typescript-next** - Latest TypeScript
- **yzhang.markdown-all-in-one** - Markdown enhancements
- **eamodio.gitlens** - Git supercharged
- **GitHub.copilot** - AI pair programming
- **GitHub.vscode-pull-request-github** - GitHub PR integration
- **streetsidesoftware.code-spell-checker** - Spelling checker
- **oderwat.indent-rainbow** - Indentation visualization
- **naumovs.color-highlight** - CSS color highlighting
- **antfu.iconify** - Icon preview

### Pre-configured Settings
- 2-space indentation
- Format on save
- ESLint auto-fix on save
- TypeScript inlay hints
- File exclusions for node_modules, dist, .vite

### Ports Forwarded
| Port | Purpose |
|------|---------|
| 5173 | Web development server |
| 5174 | Extension development server |
| 3000 | MCP server |

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Using the DevContainer

1. **Open in DevContainer:**
   ```bash
   # Clone the repository
   git clone https://github.com/linshenkx/prompt-optimizer.git
   cd prompt-optimizer
   
   # Open in VS Code
   code .
   ```

2. **When prompted, click "Reopen in Container"**
   - Or use Command Palette (Ctrl/Cmd+Shift+P) → "Dev Containers: Reopen in Container"

3. **Wait for container to build**
   - First build takes a few minutes to download the image and install extensions

4. **Start developing:**
   ```bash
   # Install dependencies (auto-run on container creation)
   pnpm install
   
   # Start development server
   pnpm dev
   ```

## Post-Create Commands

The DevContainer automatically runs these commands on first creation:

1. `pnpm install` - Install all project dependencies
2. `pnpm build:core` - Build the core package (required for type-checking)

## Volume Mounts

To improve performance and persist data across container rebuilds:

| Volume | Purpose |
|--------|---------|
| `prompt-optimizer-node_modules` | Persist node_modules |
| `prompt-optimizer-pnpm-store` | Persist pnpm cache |

## Troubleshooting

### Container won't start
1. Ensure Docker Desktop is running
2. Check if you have enough disk space
3. Try rebuilding: Command Palette → "Dev Containers: Rebuild Container"

### Extensions not loading
1. Wait for extension installation to complete
2. Reload VS Code window: Command Palette → "Developer: Reload Window"

### pnpm not found
The container includes pnpm. If you encounter issues:
```bash
npm install -g pnpm@10.6.1
```

### Performance issues
1. Allocate more resources to Docker Desktop
2. Use the volume mounts (enabled by default)
3. Exclude large directories from real-time scanning

## Customization

To customize the DevContainer:

1. Edit `.devcontainer/devcontainer.json`
2. Rebuild the container

### Adding Extensions

Add new extensions to the `customizations.vscode.extensions` array:
```json
"extensions": [
  "your.extension-id"
]
```

### Adding Features

Add DevContainer features to install additional tools:
```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {}
}
```

See [DevContainer Features](https://containers.dev/features) for available options.

## Resources

- [DevContainer Documentation](https://containers.dev/)
- [VS Code DevContainer Guide](https://code.visualstudio.com/docs/devcontainers/containers)
- [Project Contributing Guide](../CONTRIBUTING.md)
