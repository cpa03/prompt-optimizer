# Platform Engineer: CI/CD Workflow Changes

## Status

**Blocked by GitHub App workflow permission** - Requires manual application or different auth method.

## Required Changes

### test.yml

```diff
--- a/.github/workflows/test.yml
+++ b/.github/workflows/test.yml
@@ -2,12 +2,12 @@ name: test
 on:
   push:
-    branches: [ main, master ]
+    branches: [ main, master, develop ]
     paths-ignore:
       - '**.md'
       - 'docs/**'
   pull_request:
-    branches: [ main, master ]
+    branches: [ main, master, develop ]
     paths-ignore:
       - '**.md'
       - 'docs/**'
@@ -25,7 +25,7 @@ jobs:
       - name: 安装 pnpm
         uses: pnpm/action-setup@v2
         with:
-          version: 10.5.2
+          version: 10.6.1
           run_install: false
```

### docker.yml

```diff
--- a/.github/workflows/docker.yml
+++ b/.github/workflows/docker.yml
@@ -17,7 +17,7 @@ env:
 jobs:
   build:
-    if: ${{ github.event_name == 'workflow_dispatch' || (github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && (github.event.workflow_run.head_branch == 'main' || github.event.workflow_run.head_branch == 'master')) }}
+    if: ${{ github.event_name == 'workflow_dispatch' || (github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && (github.event.workflow_run.head_branch == 'main' || github.event.workflow_run.head_branch == 'master' || github.event.workflow_run.head_branch == 'develop')) }}
     runs-on: ubuntu-latest
```

### parallel.yml

```diff
--- a/.github/workflows/parallel.yml
+++ b/.github/workflows/parallel.yml
@@ -4,6 +4,7 @@ on:
   push:
     branches:
       - main
+      - develop
   schedule:
     - cron: "0 */4 * * *"
   workflow_dispatch:
```

## Summary

1. **test.yml**: Add `develop` branch to push/PR triggers, update pnpm to 10.6.1
2. **docker.yml**: Add `develop` branch to build triggers  
3. **parallel.yml**: Add `develop` branch to push triggers

## Acceptance Criteria

- [x] test.yml triggers on develop branch
- [x] docker.yml triggers on develop branch  
- [x] parallel.yml triggers on develop branch
- [x] pnpm version consistent across workflows
