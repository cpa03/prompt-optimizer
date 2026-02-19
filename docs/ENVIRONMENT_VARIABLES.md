# Environment Variables Configuration

This document lists all the environment variables that can be used to customize the behavior of the prompt-optimizer application without modifying code.

## Overview

**Flexy's Philosophy**: All hardcoded values have been eliminated in favor of environment-configurable options. This allows for easy customization, A/B testing, and deployment-specific configurations without code changes.

## UI Configuration (VITE\_ prefixed)

These variables are used in the UI package and should be prefixed with `VITE_` when using in `.env` files for Vite-based builds.

### Time Constants

| Variable                                | Default | Description                                 |
| --------------------------------------- | ------- | ------------------------------------------- |
| `VITE_TOAST_DURATION`                   | 3000    | Toast notification duration in milliseconds |
| `VITE_CACHE_EXPIRY_MINUTES`             | 5       | Cache expiration time in minutes            |
| `VITE_SESSION_TIMEOUT_MS`               | 5000    | Session timeout in milliseconds             |
| `VITE_SESSION_RETRY_DELAY_MS`           | 50      | Delay between session retries               |
| `VITE_SESSION_INIT_DELAY_MS`            | 0       | Initial session delay                       |
| `VITE_DEFAULT_DEBOUNCE_MS`              | 150     | Default debounce time                       |
| `VITE_DEFAULT_THROTTLE_MS`              | 1000    | Default throttle time                       |
| `VITE_THROTTLE_RESET_MS`                | 10000   | Throttle reset time                         |
| `VITE_GC_DELAY_MS`                      | 0       | Garbage collection delay                    |
| `VITE_MEMORY_CHECK_INTERVAL_MS`         | 5000    | Memory check interval                       |
| `VITE_PERSISTENCE_DEBOUNCE_MS`          | 1000    | Data persistence debounce                   |
| `VITE_INPUT_HISTORY_MERGE_THRESHOLD_MS` | 1000    | Input history merge threshold               |
| `VITE_UPDATE_CHECK_DELAY_MS`            | 3000    | Update check delay                          |
| `VITE_CACHE_MAX_AGE_DAYS`               | 7       | Maximum cache age in days                   |

### Variable Constraints

| Variable                           | Default | Description                     |
| ---------------------------------- | ------- | ------------------------------- |
| `VITE_VARIABLE_MAX_NAME_LENGTH`    | 50      | Maximum variable name length    |
| `VITE_VARIABLE_MAX_VALUE_LENGTH`   | 10000   | Maximum variable value length   |
| `VITE_VARIABLE_MAX_DISPLAY_LENGTH` | 5000    | Maximum variable display length |
| `VITE_VARIABLE_MAX_HISTORY_ITEMS`  | 50      | Maximum variable history items  |

### UI Constants

| Variable                      | Default | Description                        |
| ----------------------------- | ------- | ---------------------------------- |
| `VITE_ANIMATION_DURATION_MS`  | 300     | Animation duration in milliseconds |
| `VITE_FEEDBACK_DURATION_MS`   | 1000    | Feedback duration in milliseconds  |
| `VITE_MAX_DESCRIPTION_LENGTH` | 100     | Maximum description length         |
| `VITE_DEFAULT_ROWS`           | 3       | Default number of rows             |
| `VITE_MAX_ROWS`               | 20      | Maximum number of rows             |
| `VITE_MOBILE_BREAKPOINT_PX`   | 768     | Mobile breakpoint in pixels        |
| `VITE_TABLET_BREAKPOINT_PX`   | 1024    | Tablet breakpoint in pixels        |

### Template Processing

| Variable                         | Default | Description                                       |
| -------------------------------- | ------- | ------------------------------------------------- |
| `VITE_HIGH_COMPLEXITY_THRESHOLD` | 80      | High complexity threshold (0-100, divided by 100) |
| `VITE_HIGH_LENGTH_THRESHOLD`     | 1000    | High length threshold                             |

### Z-Index Scale

| Variable                     | Default | Description            |
| ---------------------------- | ------- | ---------------------- |
| `VITE_Z_INDEX_BASE`          | 1       | Base z-index           |
| `VITE_Z_INDEX_DROPDOWN`      | 100     | Dropdown z-index       |
| `VITE_Z_INDEX_STICKY`        | 200     | Sticky element z-index |
| `VITE_Z_INDEX_MODAL`         | 1000    | Modal z-index          |
| `VITE_Z_INDEX_POPOVER`       | 2000    | Popover z-index        |
| `VITE_Z_INDEX_TOOLTIP`       | 3000    | Tooltip z-index        |
| `VITE_Z_INDEX_TOAST`         | 4000    | Toast z-index          |
| `VITE_Z_INDEX_FOCUS_OVERLAY` | 10000   | Focus overlay z-index  |

### Performance Thresholds

| Variable                           | Default | Description                        |
| ---------------------------------- | ------- | ---------------------------------- |
| `VITE_TARGET_FPS_MS`               | 16      | Target FPS timing (16ms for 60fps) |
| `VITE_MAX_RENDER_TIME_MS`          | 32      | Maximum render time                |
| `VITE_MEMORY_WARNING_MB`           | 50      | Memory warning threshold in MB     |
| `VITE_MEMORY_CRITICAL_MB`          | 100     | Memory critical threshold in MB    |
| `VITE_UPDATE_COUNT_WARNING`        | 50      | Update count warning threshold     |
| `VITE_UPDATE_COUNT_CRITICAL`       | 100     | Update count critical threshold    |
| `VITE_UPDATE_RENDER_RATIO_WARNING` | 10      | Update render ratio warning        |
| `VITE_API_TIMEOUT_MS`              | 5000    | API timeout in milliseconds        |
| `VITE_LONG_OPERATION_TIMEOUT_MS`   | 10000   | Long operation timeout             |

### Responsive Breakpoints

| Variable                  | Default | Description                       |
| ------------------------- | ------- | --------------------------------- |
| `VITE_BREAKPOINT_MOBILE`  | 640     | Mobile breakpoint in pixels       |
| `VITE_BREAKPOINT_TABLET`  | 768     | Tablet breakpoint in pixels       |
| `VITE_BREAKPOINT_DESKTOP` | 1024    | Desktop breakpoint in pixels      |
| `VITE_BREAKPOINT_LARGE`   | 1200    | Large screen breakpoint in pixels |

### File Size Limits

| Variable                         | Default | Description                      |
| -------------------------------- | ------- | -------------------------------- |
| `VITE_MAX_VARIABLE_FILE_SIZE_MB` | 10      | Maximum variable file size in MB |
| `VITE_MAX_IMAGE_FILE_SIZE_MB`    | 10      | Maximum image file size in MB    |
| `VITE_MAX_CACHE_SIZE_MB`         | 50      | Maximum cache size in MB         |

### Layout Constants

| Variable                            | Default | Description                   |
| ----------------------------------- | ------- | ----------------------------- |
| `VITE_TEST_COLUMN_DEFAULT_COUNT`    | 2       | Default test column count     |
| `VITE_TEST_COLUMN_MIN_COUNT`        | 2       | Minimum test column count     |
| `VITE_TEST_COLUMN_MAX_COUNT`        | 4       | Maximum test column count     |
| `VITE_SPLIT_PANEL_DEFAULT_LEFT_PCT` | 50      | Default left panel percentage |
| `VITE_SPLIT_PANEL_MIN_LEFT_PCT`     | 20      | Minimum left panel percentage |
| `VITE_SPLIT_PANEL_MAX_LEFT_PCT`     | 80      | Maximum left panel percentage |

### Component Constants

| Variable                               | Default | Description                     |
| -------------------------------------- | ------- | ------------------------------- |
| `VITE_UPLOAD_AREA_PADDING`             | 24      | Upload area padding             |
| `VITE_UPLOAD_ICON_SIZE`                | 48      | Upload icon size                |
| `VITE_UPLOAD_ICON_MARGIN_BOTTOM`       | 12      | Upload icon margin bottom       |
| `VITE_MONOSPACE_FONT_SIZE`             | 13      | Monospace font size             |
| `VITE_HELP_TEXT_FONT_SIZE`             | 12      | Help text font size             |
| `VITE_PREVIEW_MAX_HEIGHT`              | 240     | Preview max height              |
| `VITE_TEXT_MODEL_EDIT_MODAL_MAX_WIDTH` | 1000    | Text model edit modal max width |
| `VITE_SECTION_TITLE_FONT_SIZE`         | 14      | Section title font size         |
| `VITE_MODAL_PADDING_SMALL`             | 12      | Modal small padding             |
| `VITE_MODAL_PADDING_MEDIUM`            | 16      | Modal medium padding            |
| `VITE_MODAL_PADDING_LARGE`             | 24      | Modal large padding             |
| `VITE_MODAL_GAP_SMALL`                 | 8       | Modal small gap                 |
| `VITE_MODAL_GAP_MEDIUM`                | 12      | Modal medium gap                |
| `VITE_MODAL_GAP_LARGE`                 | 16      | Modal large gap                 |
| `VITE_WORKSPACE_PANEL_MIN_HEIGHT`      | 200     | Workspace panel min height      |
| `VITE_WORKSPACE_FONT_SIZE_HEADER`      | 18      | Workspace font size header      |
| `VITE_WORKSPACE_FONT_SIZE_LABEL`       | 12      | Workspace font size label       |
| `VITE_WORKSPACE_BUTTON_WIDTH`          | 92      | Workspace button width          |
| `VITE_CATEGORY_MANAGER_SEARCH_WIDTH`   | 200     | Category manager search width   |
| `VITE_SCORE_BADGE_SMALL_MIN_WIDTH`     | 32      | Score badge small min width     |
| `VITE_SCORE_BADGE_SMALL_HEIGHT`        | 22      | Score badge small height        |
| `VITE_SCORE_BADGE_SMALL_PADDING`       | 6       | Score badge small padding       |
| `VITE_SCORE_BADGE_SMALL_FONT_SIZE`     | 12      | Score badge small font size     |
| `VITE_SCORE_BADGE_MEDIUM_MIN_WIDTH`    | 40      | Score badge medium min width    |
| `VITE_SCORE_BADGE_MEDIUM_HEIGHT`       | 28      | Score badge medium height       |
| `VITE_SCORE_BADGE_MEDIUM_PADDING`      | 8       | Score badge medium padding      |
| `VITE_SCORE_BADGE_MEDIUM_FONT_SIZE`    | 14      | Score badge medium font size    |
| `VITE_CODEMIRROR_TOOLTIP_MAX_WIDTH`    | 420     | CodeMirror tooltip max width    |
| `VITE_LAYOUT_PANEL_MIN_HEIGHT`         | 200     | Layout panel min height         |
| `VITE_LAYOUT_BUTTON_MIN_WIDTH`         | 48      | Layout button min width         |

## Core Configuration (Non-prefixed)

These variables are used in the core package and don't require a prefix.

### Template Configuration

| Variable                               | Default       | Description                          |
| -------------------------------------- | ------------- | ------------------------------------ |
| `TEMPLATE_BUILTIN_TIMESTAMP`           | 1704067200000 | Built-in template timestamp          |
| `TEMPLATE_IMAGE_TIMESTAMP`             | 1736208000000 | Image template timestamp             |
| `DJB2_HASH_SEED`                       | 5381          | DJB2 hash algorithm seed             |
| `TEMPLATE_VERSION_CONTEXT`             | 1.0.0         | Context template version             |
| `TEMPLATE_VERSION_IMAGE`               | 1.0.0         | Image template version               |
| `TEMPLATE_VERSION_EVALUATION`          | 3.0.0         | Evaluation template version          |
| `TEMPLATE_VERSION_ITERATE`             | 3.0.0         | Iterate template version             |
| `TEMPLATE_VERSION_OPTIMIZE_GENERAL`    | 1.3.0         | Optimize general template version    |
| `TEMPLATE_VERSION_OPTIMIZE_ANALYTICAL` | 2.1.0         | Optimize analytical template version |
| `TEMPLATE_VERSION_USER_OPTIMIZE`       | 2.0.0         | User optimize template version       |

### Model Context Limits

| Variable                       | Default | Description                 |
| ------------------------------ | ------- | --------------------------- |
| `MODEL_CONTEXT_DEFAULT`        | 4096    | Default model context limit |
| `MODEL_CONTEXT_SMALL`          | 8192    | Small model context limit   |
| `MODEL_CONTEXT_GPT4O`          | 128000  | GPT-4O context limit        |
| `MODEL_CONTEXT_GEMINI`         | 1000000 | Gemini context limit        |
| `MODEL_CONTEXT_CLAUDE`         | 200000  | Claude context limit        |
| `MODEL_CONTEXT_DEEPSEEK`       | 64000   | DeepSeek context limit      |
| `MODEL_CONTEXT_ZHIPU`          | 128000  | Zhipu context limit         |
| `MODEL_CONTEXT_OPENAI_DEFAULT` | 1000000 | OpenAI default context      |
| `MODEL_CONTEXT_GEMINI_DEFAULT` | 200000  | Gemini default context      |
| `MODEL_CONTEXT_OTHER_DEFAULT`  | 64000   | Other default context       |

### Retry Configuration

| Variable                      | Default | Description                     |
| ----------------------------- | ------- | ------------------------------- |
| `RETRY_MAX_POLL_ATTEMPTS`     | 60      | Maximum poll attempts           |
| `RETRY_DEFAULT_POLL_ATTEMPTS` | 120     | Default poll attempts           |
| `RETRY_STREAM_REDUCTION`      | 3       | Stream retry reduction factor   |
| `RETRY_STANDARD_REDUCTION`    | 2       | Standard retry reduction factor |

### Error Configuration

| Variable                   | Default | Description                  |
| -------------------------- | ------- | ---------------------------- |
| `ERROR_MAX_MESSAGE_LENGTH` | 200     | Maximum error message length |

### Config Versions

| Variable                 | Default | Description            |
| ------------------------ | ------- | ---------------------- |
| `CONFIG_VERSION_CONTEXT` | 1.0.0   | Context config version |

### Validation Constraints

| Variable                                      | Default | Description                     |
| --------------------------------------------- | ------- | ------------------------------- |
| `VALIDATION_KEY_MAX_LENGTH`                   | 50      | Maximum key length              |
| `VALIDATION_KEY_MIN_LENGTH`                   | 1       | Minimum key length              |
| `VALIDATION_VALUE_MAX_LENGTH`                 | 1000    | Maximum value length            |
| `VALIDATION_VARIABLE_NAME_MAX_LENGTH`         | 50      | Maximum variable name length    |
| `VALIDATION_VARIABLE_VALUE_MAX_LENGTH`        | 10000   | Maximum variable value length   |
| `VALIDATION_VARIABLE_DISPLAY_MAX_LENGTH`      | 5000    | Maximum variable display length |
| `VALIDATION_VARIABLE_HISTORY_MAX_ITEMS`       | 50      | Maximum variable history items  |
| `VALIDATION_MAX_CACHE_SIZE`                   | 100     | Maximum cache size              |
| `VALIDATION_INPUT_HISTORY_MAX_ITEMS`          | 50      | Maximum input history items     |
| `VALIDATION_INPUT_HISTORY_MERGE_THRESHOLD_MS` | 1000    | Input history merge threshold   |
| `VALIDATION_MAX_DESCRIPTION_LENGTH`           | 200     | Maximum description length      |

### Storage Constraints

| Variable                        | Default | Description               |
| ------------------------------- | ------- | ------------------------- |
| `STORAGE_WRITE_DELAY_MS`        | 500     | Storage write delay       |
| `STORAGE_MAX_FLUSH_TIME_MS`     | 3000    | Maximum flush time        |
| `STORAGE_LARGE_VALUE_THRESHOLD` | 10000   | Large value threshold     |
| `STORAGE_MAX_CONCURRENT_WRITES` | 3       | Maximum concurrent writes |

### Prompt Constraints

| Variable                           | Default | Description                       |
| ---------------------------------- | ------- | --------------------------------- |
| `PROMPT_MAX_DISPLAY_LENGTH`        | 200     | Maximum prompt display length     |
| `PROMPT_HIGH_COMPLEXITY_THRESHOLD` | 80      | High complexity threshold (0-100) |
| `PROMPT_HIGH_LENGTH_THRESHOLD`     | 1000    | High length threshold             |

### LLM Constraints

| Variable                         | Default | Description                    |
| -------------------------------- | ------- | ------------------------------ |
| `LLM_DEFAULT_MAX_TOKENS`         | 8192    | Default max tokens             |
| `LLM_MIN_THINKING_BUDGET_TOKENS` | 1024    | Minimum thinking budget tokens |
| `LLM_MAX_CONTEXT_LENGTH_CLAUDE`  | 128000  | Claude max context length      |
| `LLM_MAX_CONTEXT_LENGTH_GEMINI`  | 1000000 | Gemini max context length      |
| `LLM_MAX_CONTEXT_LENGTH_GPT4`    | 200000  | GPT-4 max context length       |
| `LLM_MAX_CONTEXT_LENGTH_DEFAULT` | 8192    | Default max context length     |

### Image Constraints

| Variable                         | Default                                   | Description                          |
| -------------------------------- | ----------------------------------------- | ------------------------------------ |
| `IMAGE_DEFAULT_POLL_INTERVAL_MS` | 2000                                      | Default poll interval                |
| `IMAGE_MAX_SIZE_MB`              | 10                                        | Maximum image size in MB             |
| `IMAGE_SUPPORTED_MIME_TYPES`     | image/png,image/jpeg,image/webp,image/gif | Comma-separated supported MIME types |

### Session Constraints

| Variable                           | Default | Description                   |
| ---------------------------------- | ------- | ----------------------------- |
| `SESSION_INIT_TIMEOUT_MS`          | 5000    | Session init timeout          |
| `SESSION_RETRY_DELAY_MS`           | 50      | Session retry delay           |
| `SESSION_INIT_DELAY_MS`            | 0       | Session init delay            |
| `SESSION_GC_DELAY_MS`              | 0       | Session GC delay              |
| `SESSION_MEMORY_CHECK_INTERVAL_MS` | 5000    | Session memory check interval |

### API Constraints

| Variable                        | Default | Description                |
| ------------------------------- | ------- | -------------------------- |
| `API_DEFAULT_TIMEOUT_MS`        | 5000    | API default timeout        |
| `API_LONG_OPERATION_TIMEOUT_MS` | 10000   | API long operation timeout |
| `API_MIN_REQUEST_DELAY_MS`      | 100     | API min request delay      |
| `API_MAX_REQUEST_DELAY_MS`      | 1000    | API max request delay      |
| `API_DEFAULT_PAGE_SIZE`         | 100     | API default page size      |

### MCP Server Configuration

| Variable                       | Default | Description                                        |
| ------------------------------ | ------- | -------------------------------------------------- |
| `MCP_ALLOWED_ORIGINS`          | `*`     | Comma-separated list of allowed CORS origins       |
| `MCP_DNS_REBINDING_PROTECTION` | `false` | Enable DNS rebinding protection for HTTP transport |

## Usage Examples

### Basic .env file

```bash
# UI Configuration
VITE_TOAST_DURATION=5000
VITE_CACHE_EXPIRY_MINUTES=10
VITE_API_TIMEOUT_MS=10000

# Core Configuration
MODEL_CONTEXT_GPT4O=256000
LLM_DEFAULT_MAX_TOKENS=16384
API_DEFAULT_TIMEOUT_MS=15000
```

### Docker Compose

```yaml
services:
  app:
    environment:
      - VITE_TOAST_DURATION=5000
      - MODEL_CONTEXT_GPT4O=256000
```

### Kubernetes ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prompt-optimizer-config
data:
  VITE_TOAST_DURATION: '5000'
  MODEL_CONTEXT_GPT4O: '256000'
```

## Notes

1. **Flexy's Rule**: Never hardcode, always configure!
2. All integer values are parsed using base 10
3. Float values are parsed using standard JavaScript parseFloat
4. Boolean values accept: 'true', '1', 'yes' (case-insensitive)
5. Array values (like MIME types) use comma-separated strings
6. Default values are used when environment variables are not set or invalid
