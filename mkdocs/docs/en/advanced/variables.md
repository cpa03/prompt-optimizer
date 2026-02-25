# Variable Management (Advanced Mode)

The variable management system is at the core of Prompt Optimizer's advanced features, allowing you to create reusable prompt templates.

## 🧰 Variable System Overview

The variable system allows you to use placeholders in prompts and centrally manage the values of these variables through the variable manager. This is very useful for creating reusable prompt templates.

## 📝 Variable Types

### Predefined Variables (Protected)

System built-in special variables that automatically fill related content:

- `currentPrompt` - Current prompt content being optimized
- `originalPrompt` - Original unoptimized prompt
- `lastOptimizedPrompt` - Result from the last optimization
- `iterateInput` - Input instruction for iterative optimization
- `userQuestion` - User's question
- `conversationContext` - Conversation context information

Note: The above "predefined variable names" cannot be saved as overrides (UI will disable or prompt); they are also automatically removed when importing context bundles (counted as predefinedVariablesRemoved).

### Custom Variables

User-created variables:

- Can be any name (cannot conflict with predefined variables)
- Support text, number, JSON and other formats
- Can be reused across multiple prompts
- Support dynamic updates and batch management

## ⚙️ Variable Management Operations

### Creating and Editing Variables

1. **Open Variable Manager**
   - Click the "Variable Management" button on the main interface
   - Or access through the settings page

2. **Add New Variable**
   - Click "New Variable" button
   - Enter variable name (e.g., `userName`, `role`, `scenario`)
   - Enter variable value
   - Optionally add description explaining variable purpose

3. **Edit Existing Variables**
   - Click the variable to edit in the variable list
   - Modify variable name or value
   - Save changes

4. **Delete Variables**
   - Select the variable to delete
   - Click delete button and confirm deletion

### Variable Usage Syntax

Syntax for using variables in prompts:

```
Hello {{userName}}, your role is {{role}}.
Current scenario: {{scenario}}
Please respond based on the following requirements: {{userQuestion}}
```

### Variable Preview Feature

- **Real-time Preview** - See variable replacement effect in real-time while editing prompts
- **Missing Detection** - Automatically detect undefined variables in prompts
- **Smart Suggestions** - Auto-suggest available variables when typing `{{`
- Consistency: Preview and "missing variable statistics" both use finalVars as reference (finalVars = global variables ∪ context override, predefined names removed; context override takes priority for same names)

## 🔄 Context Variable Override

Advanced features support overriding global variables in specific conversation contexts:

1. **Global Variables** - Defined in variable manager, apply to all scenarios
2. **Context Override** - Set in "Context Editor → Variables" tab, temporarily override global variables
3. **Priority/Merge** - finalVars = global variables ∪ context override; context override takes priority for same names; predefined names cannot be overridden

### Override Example

```
Global Variable: role = "Assistant"
Context Override: role = "Professional Translator"
Final Result: In current conversation, {{role}} will display as "Professional Translator"
```

## 📤 Variable Import/Export

### Export Variables

- Export variable configuration as JSON file
- Support selective export of partial variables
- Convenient for syncing between different devices

### Import Variables

- Import variable configuration from JSON file
- Support batch import
- Choose to overwrite or retain existing variables

### Context Bundle

- Export/import "context bundle" from "Data Management" (replace mode), import statistics show: imported/skipped/predefinedVariablesRemoved
- Export single context from "Context Editor → Export (Standard Format)" (includes messages/metadata.variables/tools)

## 💡 Best Practices

### Variable Naming Conventions

1. **Descriptive Naming** - Use clear, descriptive variable names
2. **CamelCase** - Such as `userName`, `projectName`
3. **Avoid Conflicts** - Don't use the same names as predefined variables
4. **Category Management** - Group variables by function or scenario

### Variable Design Recommendations

1. **Single Responsibility** - Each variable focuses on one data item
2. **Reasonable Defaults** - Set reasonable default values for variables
3. **Documentation** - Add usage instructions for complex variables
4. **Regular Cleanup** - Delete outdated variables no longer in use

---

**Related Links**:

- [Tool Calling](tools.md) - Using variables in tool calls
- [Context Management](context.md) - Managing variables in conversation context
- [Creative Writing Examples](../examples/creative-writing.md) - Variable management in creative writing
