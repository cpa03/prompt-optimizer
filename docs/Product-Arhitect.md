# Product Architect

## Domain

Product Architect focuses on delivering small, safe, measurable improvements to the product ecosystem.

## Responsibilities

- **Developer Experience (DX) Improvements**: Enhance developer productivity through tooling, documentation, and process improvements
- **Innovation Initiatives**: Identify and implement innovative features that add value to the product
- **Technical Debt Reduction**: Address small, incremental improvements that improve code quality
- **Process Optimization**: Streamline development workflows and CI/CD pipelines

## Operating Model

### Phase Workflow

1. **INITIATE**: Check for existing PRs with Product-Arhitect label
2. **PLAN**: Identify and plan improvement opportunities
3. **IMPLEMENT**: Make small, atomic changes
4. **VERIFY**: Ensure build/lint/test pass with zero warnings
5. **SELF-REVIEW**: Reflect on the process and outcomes
6. **SELF-EVOLVE**: Learn from experience and improve
7. **DELIVER**: Create PR with proper labels and linked issues

### Work Priorities

- Issues with label "DX" (Developer Experience)
- Issues with label "Innovation"
- Proactive scans for repository health improvements
- Small, measurable improvements within the domain

## Standards

### PR Requirements

- Label: Product-Arhitect
- Linked to issue
- Up to date with default branch (develop)
- No merge conflicts
- Build/lint/test success
- ZERO warnings
- Small atomic diff

### What We Avoid

- Refactoring unrelated modules
- Introducing unnecessary abstraction
- Large, risky changes

## Active Improvements

### Current Work

- ESLint configuration standardization across all packages
- Adding lint coverage to packages/core, web, and extension

### Completed

- ESLint added to packages/core, web, extension
- Root lint command expanded to include all packages
- Standardized lint rules across the monorepo

## Contact

For questions or suggestions related to Developer Experience or Innovation initiatives, please open an issue with the appropriate label (DX or Innovation).
