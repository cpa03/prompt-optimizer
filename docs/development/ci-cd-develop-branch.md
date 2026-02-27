# Platform Engineer: CI/CD Workflow Changes

## Status

**Changes applied in develop branch** - Ready for verification.

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
```

### docker.yml

```diff
--- a/.github/workflows/docker.yml
+++ b/.github/workflows/docker.yml
@@ -5,6 +5,10 @@ on:
     workflows: [ test ]
     types: [ completed ]
   workflow_dispatch:
+  push:
+    branches:
+      - main
+      - develop

...
@@ -17,7 +21,7 @@ env:
 jobs:
   build:
-    if: ${{ github.event_name == 'workflow_dispatch' || (github.event.workflow_run.conclusion == 'success' && github.event.workflow_run.event == 'push' && (github.event.workflow_run.head_branch == 'main' || github.event.workflow_run.head_branch == 'master')) }}
+    if: ${{ github.event_name == 'workflow_dispatch' || github.event_name == 'push' || (github.event.workflow_run.conclusion == 'success' && (github.event.workflow_run.event == 'push' || github.event.workflow_run.event == 'pull_request') && (github.event.workflow_run.head_branch == 'main' || github.event.workflow_run.head_branch == 'master' || github.event.workflow_run.head_branch == 'develop')) }}
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
```

## Summary

1. **test.yml**: Add `develop` branch to push/PR triggers
2. **docker.yml**: Add `develop` push trigger and updated condition
3. **parallel.yml**: Add `develop` branch to push triggers

## Acceptance Criteria

- [x] test.yml triggers on develop branch
- [x] docker.yml triggers on develop branch  
- [x] parallel.yml triggers on develop branch
