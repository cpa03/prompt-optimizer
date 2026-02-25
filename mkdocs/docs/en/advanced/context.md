# Context Management (Advanced Mode)

Context management is one of the core features of advanced mode, allowing you to precisely control multi-turn conversation context and implement complex AI interaction scenarios.

## 💬 Multi-turn Conversation Overview

### What is Context Management

Context management allows you to:

- Edit any message in conversation history
- Add, delete, and rearrange conversation messages
- Use variable replacement in messages
- Simulate complex conversation scenarios
- Test AI performance in long conversations

### Differences from Basic Mode

| Feature                 | Basic Mode           | Advanced Mode                     |
| ----------------------- | -------------------- | --------------------------------- |
| Message Editing         | ❌                   | ✅ Full editing features          |
| Variable Replacement    | ❌                   | ✅ Message-level variable support |
| Multi-turn Testing      | ✅ Simple multi-turn | ✅ Complex scenario simulation    |
| Conversation Management | ❌                   | ✅ History message management     |

## 🎛️ Session Editor (ContextEditor)

### Message Types

#### 1. System Message (System)

Sets AI's role, behavior norms, and working mode:

```
You are a professional {{role}}, specializing in {{expertise}}.
Please follow these principles:
1. Provide accurate, professional advice
2. Maintain a {{tone}} communication style
3. Focus on issues in the {{focus}} area
```

#### 2. User Message (User)

Simulates user input and questions:

```
I need advice about {{topic}}, specifically:
{{situation}}

Please help me analyze how to handle this.
```

#### 3. Assistant Message (Assistant)

AI's replies and responses, can be preset or edited:

```
Based on the {{situation}} you described, I recommend the following strategy:

1. First {{step1}}
2. Then {{step2}}
3. Finally {{step3}}

The reason for this is...
```

### Message Editing Operations

#### Adding Messages

1. **Select Insert Position**
   - Click "Add Message" button at target position
   - Choose to add at conversation start, middle, or end

2. **Select Message Type**
   - System - For setting AI role and rules
   - User - Simulate user input
   - Assistant - Preset AI reply

3. **Write Message Content**
   - Support plain text and Markdown format
   - Can use variable placeholders
   - Provide real-time variable preview

#### Editing Existing Messages

1. **Message Selection**
   - Click the message to edit
   - Message enters edit mode
   - Display message type and number

2. **Content Modification**
   - Modify message text content
   - Change message type (if needed)
   - Adjust variable placeholders

3. **Save Changes / Persistence**
   - Save in real-time and write to ContextRepo (recoverable after refresh)
   - Automatically update variable preview and missing statistics
   - Validate message format

#### Message Management Operations

1. **Delete Messages**
   - Select message to delete
   - Confirm deletion operation
   - Automatically adjust message numbering

2. **Copy Messages**
   - Copy message content to clipboard
   - Copy to other positions in conversation
   - Use as new message template

3. **Reorder**
   - Drag to adjust message order
   - Automatically update message numbers
   - Maintain conversation logic coherence

## 🔄 Using Variables in Sessions

### Message-Level Variable Replacement

#### Basic Syntax

Use `{{variable_name}}` to insert variables in messages:

```
System: You are a {{role}}, working at {{company}}
User: Please help me solve this {{problem}} issue
Assistant: Based on {{role}}'s experience, for {{problem}}, I suggest...
```

#### Variable Scope

1. **Global Variables** - Defined in variable manager, apply to all conversations
2. **Session Variables** - Temporarily defined for current session
3. **Message Variables** - Valid only in specific messages

#### Variable Merging and Priority

finalVars = global variables ∪ context variable override; context override takes priority for same names; predefined variable names cannot be overridden.

### Dynamic Variable Updates

#### Real-time Preview

- Real-time update of message preview when editing variables
- Highlight variable replacement positions
- Display current variable values

#### Batch Replacement

- Update variables in multiple messages at once
- Support regular expression matching
- Provide preview confirmation before replacement

#### Variable History

- Record variable value modification history
- Support rollback to previous variable states
- Compare differences between versions

### Missing Variable Handling

#### Automatic Detection

System automatically detects and marks missing variables:

- 🔴 Undefined variable - Red marker
- 🟡 Empty value variable - Yellow marker
- 🟢 Normal variable - Green marker

#### Smart Suggestions

- Automatically suggest similar defined variables
- Provide variable naming convention suggestions
- Recommend appropriate variable values based on context

#### Quick Create

- Click missing variable to create directly
- Auto-fill recommended variable values
- Batch create multiple missing variables

## 📤 Import/Export and Quantity Badges

### Export (Standard Format)

- Export single context from "Export → Standard Format" in ContextEditor
- Structure includes: `messages[]`, `metadata.variables`, `tools[]`

### Quantity Badges

- "Variable count/Missing count" and "Tool count" badges displayed in conversation area for overview

## 🎭 Conversation Scenario Simulation

### Complete Conversation Testing

#### 1. Scenario Design

**Role-Play Scenario**

```
System: You are a senior product manager with 10 years of internet product experience
User: Our APP user retention rate is declining, what do you think might be the reasons?
Assistant: [Let AI analyze and respond]
User: Data shows mainly new users churning heavily in the first week
Assistant: [Let AI provide solutions]
```

**Technical Support Scenario**

```
System: You are {{company}}'s technical support expert, skilled at solving {{product}} related issues
User: My {{product}} is showing {{error_message}} error
Assistant: [AI diagnoses the problem]
User: After following your steps, now there's a new issue...
Assistant: [AI provides further support]
```

#### 2. Execute Conversation Test

**Step-by-Step Execution Mode**

- Send messages one by one for testing
- Observe AI response quality in each round
- Record conversation flow and key nodes

**Batch Execution Mode**

- Send complete conversation sequence at once
- Test AI's understanding of complete context
- Evaluate conversation coherence and logic

#### 3. Result Analysis

**Response Quality Assessment**

- Content accuracy and relevance
- Response professionalism and depth
- Whether role consistency is maintained

**Context Understanding Analysis**

- Whether conversation history is correctly understood
- Ability to reference previous conversation content
- Whether conversation logic is coherent

**User Experience Evaluation**

- Whether conversation flows naturally
- Whether responses meet user expectations
- Overall interaction experience

### Advanced Testing Features

#### Conversation Branch Testing

- Create branches at key conversation nodes
- Test AI responses to different user replies
- Compare conversation effects across different paths

#### Scenario Change Testing

- Change system settings mid-conversation
- Test AI adaptability to role transitions
- Verify context switching handling capability

#### Stress Testing

- Test handling of extremely long conversations
- Verify understanding of complex nested conversations
- Evaluate performance under information overload

## 📊 Conversation Management and Analysis

### Conversation Saving and Reuse

#### Scenario Templates

- Save quality conversations as templates
- Support variablized scenario reuse
- Build template library for common scenarios

#### History Management

- Complete saving of conversation edit history
- Support conversation version comparison
- Quick rollback to previous states

#### Import/Export Features

- Export conversations as JSON or text format
- Import external conversations for testing
- Share test scenarios with team members

### Batch Test Management

#### Test Suites

- Create test suites containing multiple conversation scenarios
- Batch execute tests for different scenarios
- Unified management of related test cases

#### Result Comparison

- Compare same scenario performance across different models
- Analyze impact of different parameter configurations
- Generate detailed performance comparison reports

#### Automated Testing

- Set up regularly executed regression tests
- Automatically detect conversation quality changes
- Alert on performance degradation or abnormal behavior

### Collaboration and Sharing

#### Team Collaboration

- Share test scenarios and results
- Collaboratively edit complex conversation scenarios
- Build team knowledge base

#### Version Control

- Track modification history of conversation scenarios
- Support version management for multi-person collaboration
- Merge modifications from different versions

## 💡 Best Practice Guide

### Conversation Design Principles

#### 1. Progressive Complexity

- Start testing with simple conversations
- Gradually increase conversation complexity
- Identify boundaries of AI capabilities

#### 2. Real Scenario Simulation

- Design conversations close to real usage scenarios
- Include common user behavior patterns
- Consider edge cases and boundary situations

#### 3. Context Coherence

- Ensure conversation logic coherence
- Avoid abrupt topic transitions
- Maintain consistency of character settings

### Variable Usage Tips

#### 1. Reasonable Variable Granularity

- Avoid over-segmenting variables
- Maintain semantic integrity of variables
- Balance flexibility and complexity

#### 2. Descriptive Naming

- Use clear variable names
- Follow consistent naming conventions
- Add necessary usage instructions

#### 3. Default Value Settings

- Provide reasonable default values for variables
- Ensure functionality works when variables are missing
- Provide variable usage examples

### Testing Strategy Recommendations

#### 1. Comprehensive Testing

- Cover different types of conversation scenarios
- Test various variable combinations
- Include normal and abnormal situations

#### 2. Reproducibility

- Ensure test results are reproducible
- Record test environment and conditions
- Establish standardized testing processes

#### 3. Continuous Optimization

- Continuously improve based on test results
- Collect feedback from actual usage
- Periodically update test scenarios

---

**Related Links**:

- [Variable Management](variables.md) - Deep dive into the variable system
- [Tool Calling](tools.md) - Using tool calls in conversations
- [Use Cases](../examples/creative-writing.md) - Context management cases in creative writing
