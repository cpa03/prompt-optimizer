# DevOps CI/CD Improvements

## Status: Recommended

This document outlines recommended improvements to the CI/CD pipeline that require repository administrator approval to implement.

## Critical Issues

### 1. Missing Default Branch in CI Triggers

**Current State:** The `test.yml` workflow only triggers on `main` and `master` branches.

**Problem:** The repository's default branch is `develop`, meaning:

- PRs merging to `develop` don't trigger CI tests
- Direct pushes to `develop` don't trigger CI tests
- This is a significant CI gap

**Recommended Fix:**

```yaml
# .github/workflows/test.yml
on:
  push:
    branches: [main, master, develop] # Add develop
    paths-ignore:
      - '**.md'
      - 'docs/**'
  pull_request:
    branches: [main, master, develop] # Add develop
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### 2. Missing Concurrency Control

**Current State:** No concurrency control in workflows, leading to:

- Duplicate workflow runs on the same ref
- Wasted CI minutes
- Potential race conditions

**Recommended Fix:**

```yaml
# Add to test.yml, docker.yml, and release.yml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # Use false for release.yml
```

### 3. Missing Docker Build Attestations

**Current State:** Docker images are pushed without provenance or SBOM attestations.

**Problem:**

- No supply chain security verification
- Cannot verify image authenticity
- Missing vulnerability tracking for dependencies

**Recommended Fix:**

```yaml
# .github/workflows/docker.yml - in build-push-action
- name: Build and push Docker image
  uses: docker/build-push-action@v6
  with:
    # ... existing config ...
    provenance: true
    sbom: true
```

## Performance Improvements

### 4. Missing pnpm Store Caching

**Current State:** The `test.yml` workflow only uses Node.js module caching but doesn't cache the pnpm store.

**Problem:**

- Slower dependency installation on each run
- Wasted CI minutes downloading packages repeatedly
- Inconsistent build times

**Recommended Fix:**

```yaml
# .github/workflows/test.yml
- name: 安装 pnpm
  uses: pnpm/action-setup@v4  # Upgrade from v2
  with:
    version: ${{ env.PNPM_VERSION }}

- name: 设置 Node.js 环境
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'pnpm'

- name: 获取 pnpm store 目录
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_OUTPUT
  id: pnpm-cache

- name: 设置 pnpm store 缓存
  uses: actions/cache@v4
  with:
    path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
    key: pnpm-store-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      pnpm-store-${{ runner.os }}-
```

### 5. Missing Docker Layer Caching

**Current State:** Docker builds only use GitHub Actions cache which has size limits and retention issues.

**Problem:**

- Slower Docker builds
- GitHub Actions cache is limited to 10GB total
- Cache eviction can cause inconsistent build times

**Recommended Fix:**

```yaml
# .github/workflows/docker.yml
- name: Docker layer 缓存
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: docker-${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      docker-${{ runner.os }}-buildx-

- name: 构建并推送Docker镜像
  uses: docker/build-push-action@v6
  with:
    context: .
    platforms: linux/amd64,linux/arm64
    push: ${{ github.event_name != 'pull_request' }}
    tags: |
      ${{ env.DOCKERHUB_REGISTRY }}/${{ env.DOCKERHUB_IMAGE_NAME }}:${{ steps.version.outputs.version }}
      ${{ env.DOCKERHUB_REGISTRY }}/${{ env.DOCKERHUB_IMAGE_NAME }}:latest
    cache-from: |
      type=local,src=/tmp/.buildx-cache
      type=gha
    cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

- name: 清理 Docker 缓存
  run: |
    rm -rf /tmp/.buildx-cache
    mv /tmp/.buildx-cache-new /tmp/.buildx-cache
```

### 6. Missing Step-Level Timeouts

**Current State:** No step-level timeouts in workflows.

**Problem:**

- Runaway steps can waste CI minutes
- No early failure detection
- Difficult to identify slow steps

**Recommended Fix:**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 45  # Job-level timeout
    
    steps:
      - name: 安装依赖
        run: pnpm install --frozen-lockfile
        timeout-minutes: 10

      - name: 运行门禁（不含 E2E）
        run: pnpm test:gate
        timeout-minutes: 15

      - name: 安装 Playwright 浏览器
        run: pnpm exec playwright install --with-deps chromium
        timeout-minutes: 10

      - name: 运行门禁 E2E（关键用例，VCR 回放模式）
        run: pnpm test:gate:e2e
        timeout-minutes: 20
```

### 7. Upgrade pnpm/action-setup

**Current State:** Using `pnpm/action-setup@v2`.

**Problem:**

- v4 has better performance and features
- v2 may have deprecated features

**Recommended Fix:**

```yaml
- name: 安装 pnpm
  uses: pnpm/action-setup@v4
  with:
    version: ${{ env.PNPM_VERSION }}
```

## Implementation

These changes require a user with `workflows` permission to apply. To implement:

1. Create a branch from `develop`
2. Apply the changes to `.github/workflows/test.yml`
3. Apply the changes to `.github/workflows/docker.yml`
4. Apply the changes to `.github/workflows/release.yml`
5. Create a PR with label `devops-engineer`

## Benefits

| Improvement             | Benefit                                    | Estimated Savings |
| ----------------------- | ------------------------------------------ | ----------------- |
| Develop branch triggers | Full CI coverage on default branch         | N/A               |
| Concurrency control     | Reduced CI costs, faster feedback          | 20-30% CI minutes |
| Build attestations      | Supply chain security, SBOM for auditing   | N/A               |
| pnpm store caching      | Faster dependency installs                 | 30-60s per run    |
| Docker layer caching    | Faster image builds                        | 2-5 min per build |
| Step timeouts           | Early failure detection, cost control      | Variable          |
| pnpm/action-setup@v4    | Better performance, latest features        | ~10s per run      |

## Current DevOps Strengths

The repository already has excellent DevOps practices:

- Well-structured GitHub Actions workflows
- Comprehensive dependabot configuration (npm, docker, github-actions)
- Proper .dockerignore configuration
- Multi-platform Docker builds (amd64, arm64)
- Docker Hub and Aliyun registry support
- Kubernetes deployment manifests with:
  - Pod Security Standards (restricted)
  - Network Policies
  - Resource Quotas
  - Horizontal Pod Autoscaler
  - Pod Disruption Budget
- Proper docker-compose with resource limits and security hardening

## Related Files

- `.github/workflows/test.yml`
- `.github/workflows/docker.yml`
- `.github/workflows/release.yml`
- `.github/dependabot.yml`
- `Dockerfile`
- `docker-compose.yml`
- `k8s/deployment.yaml`
