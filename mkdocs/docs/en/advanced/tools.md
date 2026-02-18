# Tool Calling Feature (Advanced Mode)

The tool calling feature enables AI models to call external functions to complete specific tasks, greatly expanding AI's capabilities. Supports mathematical calculations, data queries, API calls, and other complex operations.

## 🔧 Tool Calling Overview

Tool calling (Function Calling) is an advanced feature of modern AI models that allows AI to proactively call predefined external tools to obtain information, perform calculations, or complete complex tasks.

### Core Advantages

- **Capability Extension** - Let AI break through pure text generation limitations
- **Real-time Information** - Get latest data and dynamic content
- **Precise Calculations** - Execute complex mathematical operations and data processing
- **External Integration** - Connect to various APIs and external services

## 📋 Supported Models

### Mainstream Model Support

- **OpenAI** - GPT-4, GPT-3.5-turbo and other models supporting function calling
- **Gemini** - Gemini Pro and other models supporting function calling
- **DeepSeek** - DeepSeek models supporting function calling
- **Custom Models** - Models conforming to OpenAI function calling standards

### Compatibility Check

Before enabling tool calling, the system automatically checks if the current model supports function calling. Incompatible models will display appropriate prompts.

## 🛠️ Tool Definition and Configuration (In Context Editor)

### Creating Tool Definitions

#### 1. Access Tool Management

- Find "Tool Management" entry in advanced mode
- Or access tool configuration through settings page
- Click "New Tool" to start creating

#### 2. Define Tool Function

```json
{
  "name": "get_weather",
  "description": "Get weather information for specified city",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "City name"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "description": "Temperature unit"
      }
    },
    "required": ["city"]
  }
}
```

#### 3. Tool Implementation Configuration

- **Execution Endpoint** - Define actual execution logic for the tool
- **Authentication Settings** - Configure API keys or authentication information
- **Timeout Configuration** - Set timeout for tool calls
- **Error Handling** - Define handling strategy for failures

### Quantity Badge and Export Structure

- Tool count badge (toolCount) displayed at top of conversation area
- JSON exported from "Context Editor → Export (Standard Format)" includes `tools[]`

### Built-in Tool Templates

#### Common Tool Templates

**Mathematical Calculator**

```json
{
  "name": "calculate",
  "description": "Execute mathematical operations",
  "parameters": {
    "type": "object",
    "properties": {
      "expression": {
        "type": "string",
        "description": "Mathematical expression, e.g.: 2+3*4"
      }
    }
  }
}
```

**Time and Date Tool**

```json
{
  "name": "get_current_time",
  "description": "Get current time",
  "parameters": {
    "type": "object",
    "properties": {
      "format": {
        "type": "string",
        "description": "Time format, e.g.: YYYY-MM-DD HH:mm:ss"
      },
      "timezone": {
        "type": "string",
        "description": "Timezone, e.g.: America/New_York"
      }
    }
  }
}
```

**Text Processing Tool**

```json
{
  "name": "text_analyzer",
  "description": "Analyze text content",
  "parameters": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Text content to analyze"
      },
      "analysis_type": {
        "type": "string",
        "enum": ["sentiment", "keywords", "summary"],
        "description": "Analysis type"
      }
    }
  }
}
```

## 🎯 Tool Calling Testing (Advanced Mode)

### Using Tools in Conversations

#### 1. Prepare Tool Calling Prompt

```
You are an intelligent assistant that can call tools to get information and complete tasks.
Please help me check the weather in Beijing, and calculate what the temperature would be in Fahrenheit if it's in Celsius.
```

#### 2. Enable Tool Calling Feature

In model configuration:

- ✅ Enable function calling feature
- Select tool sets to use
- Configure tool calling parameters
- Set concurrent call limits

#### 3. Execute and Monitor

- Send prompt containing tool calling needs
- Observe how AI analyzes and selects appropriate tools
- View tool call parameter passing
- Monitor tool execution results and AI's subsequent responses

### Tool Calling Process

#### Complete Call Process

1. **Requirement Recognition** - AI analyzes user request, identifies tools to call
2. **Parameter Extraction** - AI extracts required parameters from user input
3. **Tool Call** - System executes tool and returns result
4. **Result Integration** - AI integrates tool results into final response

#### Call Example

```
User: Help me check the weather in Shanghai tomorrow

AI Analysis: Need to call weather query tool
↓
Tool Call: get_weather(city="Shanghai", date="tomorrow")
↓
Tool Returns: {"temperature": 25, "condition": "Sunny", "humidity": 60}
↓
AI Response: According to the query results, Shanghai tomorrow will be sunny, temperature 25°C, humidity 60%...
```

## 🐛 Tool Calling Debugging

### Call Logs

#### Detailed Log Recording

- **Call Time** - Precise call timestamp
- **Tool Name** - Called tool identifier
- **Input Parameters** - Complete parameters passed to tool
- **Output Results** - Result data returned by tool
- **Execution Time** - Tool execution duration statistics
- **Error Information** - Detailed error description on failure

#### Log Viewing and Analysis

- Real-time viewing of call process
- Filter by time, tool, status
- Export logs for deep analysis
- Set log retention policy

### Parameter Validation

#### Automatic Validation Mechanism

- **Type Checking** - Verify parameter types are correct
- **Required Validation** - Check if required parameters are provided
- **Format Validation** - Verify parameter formats meet requirements
- **Range Checking** - Verify numeric values are within allowed ranges

#### Validation Error Handling

- Detailed error prompt information
- Suggested correction plans
- Automatic parameter formatting (optional)
- Smart default value filling

### Error Handling

#### Common Error Types

1. **Network Error** - Tool service unreachable
2. **Authentication Failed** - API key invalid or expired
3. **Parameter Error** - Passed parameters don't meet requirements
4. **Timeout Error** - Tool execution time too long
5. **Permission Error** - No permission to call specific tool

#### Error Handling Strategies

- **Automatic Retry** - Retry for temporary errors
- **Graceful Degradation** - Use alternative tools or methods
- **User Notification** - Report errors to users and provide suggestions
- **Log Recording** - Record error details for later analysis

### Performance Monitoring

#### Key Indicators

- **Success Rate** - Percentage of successful tool calls
- **Average Response Time** - Average execution time of tools
- **Concurrent Calls** - Number of tool calls executing simultaneously
- **Resource Utilization** - CPU, memory and other resource consumption

#### Performance Optimization Recommendations

- Avoid frequently calling time-consuming tools
- Implement tool result caching mechanism
- Optimize tool concurrent execution strategy
- Regularly clean up expired call records

## 💡 Best Practices

### Tool Design Principles

#### 1. Single Responsibility

- Each tool focuses on completing one specific task
- Avoid overly complex "universal tools"
- Keep tool interfaces concise and clear

#### 2. Reusability

- Design highly versatile tool parameters
- Support multiple usage scenarios
- Provide flexible configuration options

#### 3. Robustness

- Comprehensive error handling mechanisms
- Strict input data validation
- Graceful exception recovery strategies

### Security Considerations

#### Permission Control

- Restrict tool access permissions
- Verify caller identity
- Audit sensitive operation records

#### Data Protection

- Avoid passing sensitive information between tools
- Encrypt API calls during transmission
- Regularly clean up temporary data

#### Resource Limits

- Set tool call frequency limits
- Control concurrent call count
- Monitor resource usage

---

**Related Links**:

- [Variable Management](variables.md) - Using variables in tool calls
- [Context Management](context.md) - Managing tool call context in multi-turn conversations
- [Use Cases](../examples/creative-writing.md) - Tool calling cases in creative writing
