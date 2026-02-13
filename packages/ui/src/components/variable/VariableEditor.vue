<template>
    <NModal
        v-model:show="localVisible"
        preset="card"
        :title="
            isEditing
                ? t('variables.editor.editTitle')
                : t('variables.editor.addTitle')
        "
        size="medium"
        :segmented="{ content: true }"
        :style="modalStyle"
        @after-leave="onAfterLeave"
        :mask-closable="true"
    >
        <NForm
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-placement="top"
        >
            <!-- Variable Name with Smart Validation -->
            <NFormItem
                path="name"
                :label="t('variables.editor.variableName')"
                required
            >
                <div class="variable-input-wrapper">
                    <NInput
                        v-model:value="formData.name"
                        :placeholder="t('variables.editor.variableNamePlaceholder')"
                        :disabled="isEditing || loading"
                        clearable
                        :status="nameInputStatus"
                        @input="handleNameInput"
                        @blur="handleNameBlur"
                        @focus="handleNameFocus"
                        :class="['variable-name-input', { 'has-fix-suggestions': showFixSuggestions }]"
                    />
                    <!-- Real-time validation indicator -->
                    <div class="validation-indicator" v-if="nameValidationState.show">
                        <transition name="fade-scale" mode="out-in">
                            <div v-if="nameValidationState.isValid" class="indicator-success" key="success">
                                <NIcon :size="18" color="#18a058">
                                    <Check />
                                </NIcon>
                            </div>
                            <div v-else-if="nameValidationState.hasError" class="indicator-error" key="error">
                                <NIcon :size="18" color="#d03050">
                                    <AlertCircle />
                                </NIcon>
                            </div>
                        </transition>
                    </div>
                </div>
                
                <!-- Smart fix suggestions -->
                <transition name="slide-down">
                    <div v-if="showFixSuggestions && fixSuggestions.length > 0" class="fix-suggestions">
                        <span class="suggestion-label">{{ t('variables.editor.fixSuggestions.label') }}:</span>
                        <NTag
                            v-for="(suggestion, index) in fixSuggestions"
                            :key="index"
                            size="small"
                            type="info"
                            class="fix-suggestion-tag"
                            @click="applyFix(suggestion.fix)"
                        >
                            <template #icon>
                                <NIcon :size="14">
                                    <Star />
                                </NIcon>
                            </template>
                            {{ suggestion.label }}
                        </NTag>
                    </div>
                </transition>

                <template #feedback>
                    <div class="variable-name-feedback">
                        <NText
                            depth="3"
                            :style="{ fontSize: FONT_SIZES.XS + 'px' }"
                        >
                            {{ t("variables.editor.variableNameHelp") }}
                        </NText>
                        <!-- Character count indicator -->
                        <transition name="fade">
                            <NText
                                v-if="formData.name.length > 0"
                                :depth="nameLengthStatus.depth"
                                :style="{ fontSize: FONT_SIZES.XS + 'px', transition: 'color 0.2s ease' }"
                                :class="['char-count', nameLengthStatus.class]"
                            >
                                {{ formData.name.length }}/50
                            </NText>
                        </transition>
                    </div>
                </template>
            </NFormItem>

            <!-- Variable Value with Smart Features -->
            <NFormItem
                path="value"
                :label="t('variables.editor.variableValue')"
                required
            >
                <div class="variable-value-wrapper">
                    <NInput
                        ref="valueInputRef"
                        v-model:value="formData.value"
                        type="textarea"
                        :placeholder="
                            t('variables.editor.variableValuePlaceholder')
                        "
                        :disabled="loading"
                        :autosize="{ minRows: 4, maxRows: 8 }"
                        clearable
                        :status="valueInputStatus"
                        @input="handleValueInput"
                        class="variable-value-input"
                    />
                    <!-- Value length indicator -->
                    <transition name="fade">
                        <div 
                            v-if="formData.value.length > 0" 
                            class="value-length-indicator"
                            :class="{ 'near-limit': isValueNearLimit, 'at-limit': isValueAtLimit }"
                        >
                            <span class="length-text">{{ formatValueLength }}</span>
                            <NProgress
                                v-if="formData.value.length > 1000"
                                :percentage="valueLengthPercentage"
                                :show-indicator="false"
                                :height="3"
                                :status="valueProgressStatus"
                                class="length-progress"
                            />
                        </div>
                    </transition>
                </div>
                <template #feedback>
                    <div class="value-feedback">
                        <NText
                            depth="3"
                            :style="{ fontSize: FONT_SIZES.XS + 'px' }"
                        >
                            {{ t("variables.editor.variableValueHelp") }}
                        </NText>
                    </div>
                </template>
            </NFormItem>

            <!-- Preview Section with Animation -->
            <transition name="fade-slide">
                <div v-if="showPreview" class="variable-preview-section">
                    <NDivider style="margin: 12px 0">
                        <NText depth="3" style="font-size: 12px">
                            {{ t('variables.editor.preview') }}
                        </NText>
                    </NDivider>
                    <div class="preview-content">
                        <div class="preview-row">
                            <span class="preview-label">{{ t('variables.editor.usage') }}:</span>
                            <NCode class="preview-code">{{ previewUsage }}</NCode>
                            <NButton
                                text
                                size="tiny"
                                class="copy-btn"
                                @click="copyUsage"
                            >
                                <template #icon>
                                    <NIcon><Copy /></NIcon>
                                </template>
                            </NButton>
                        </div>
                        <div class="preview-row" v-if="formData.value">
                            <span class="preview-label">{{ t('variables.editor.resolvedValue') }}:</span>
                            <NText class="preview-value">{{ formData.value }}</NText>
                        </div>
                    </div>
                </div>
            </transition>
        </NForm>

        <template #footer>
            <NSpace justify="end">
                <NButton @click="cancel" :disabled="loading">
                    {{ t("common.cancel") }}
                </NButton>
                <NButton
                    type="primary"
                    @click="save"
                    :disabled="!isValid || loading"
                    :loading="loading"
                >
                    {{ isEditing ? t("common.save") : t("common.add") }}
                </NButton>
            </NSpace>
        </template>
    </NModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

import { useI18n } from "vue-i18n";
import {
    NModal,
    NForm,
    NFormItem,
    NInput,
    NButton,
    NSpace,
    NText,
    NIcon,
    NTag,
    NDivider,
    NCode,
    NProgress,
    type FormInst,
    type FormRules,
} from "naive-ui";
import { Check, AlertCircle, Star, Copy } from '@vicons/tabler'
import { UI_DIMENSIONS, FONT_SIZES } from "../../config/constants";
import { useToast } from '../../composables/ui/useToast'

const { t } = useI18n();
const toast = useToast();

interface VariableItem {
    name: string;
    value: string;
}

interface Props {
    variable?: VariableItem | null;
    existingNames: string[];
    show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variable: null,
    show: true,
});

interface Emits {
    (e: "save", variable: { name: string; value: string }): void;
    (e: "cancel"): void;
    (e: "update:show", value: boolean): void;
}
const emit = defineEmits<Emits>();

// Display control
const localVisible = computed({
    get: () => props.show ?? true,
    set: (val: boolean) => emit("update:show", val),
});

const modalStyle = { width: UI_DIMENSIONS.MODAL_WIDTH_SMALL, maxWidth: "90vw" };

// State management
const loading = ref(false);
const formRef = ref<FormInst>();
const valueInputRef = ref<InstanceType<typeof NInput> | null>(null);
const formData = ref({
    name: "",
    value: "",
});

// Smart validation state
const nameValidationState = ref({
    show: false,
    isValid: false,
    hasError: false,
    errorType: '' as '' | 'invalid' | 'predefined' | 'exists'
});
const showFixSuggestions = ref(false);
const isNameFocused = ref(false);

// Computed properties
const isEditing = computed(() => !!props.variable);

const isValid = computed(() => {
    return (
        formData.value.name.trim() !== "" && 
        formData.value.value.trim() !== "" &&
        isValidVariableName(formData.value.name.trim()) &&
        !isPredefinedVariable(formData.value.name.trim()) &&
        !isDuplicateName(formData.value.name.trim())
    );
});

const nameInputStatus = computed(() => {
    if (!nameValidationState.value.show) return undefined;
    return nameValidationState.value.hasError ? 'error' : 
           (nameValidationState.value.isValid ? 'success' : undefined);
});

const valueInputStatus = computed(() => {
    if (formData.value.value.length > 5000) return 'error';
    if (formData.value.value.length > 4500) return 'warning';
    return undefined;
});

const nameLengthStatus = computed(() => {
    const len = formData.value.name.length;
    if (len > 50) return { depth: 3, class: 'exceeded' };
    if (len > 40) return { depth: 2, class: 'warning' };
    return { depth: 3, class: 'normal' };
});

const isValueNearLimit = computed(() => formData.value.value.length > 4000);
const isValueAtLimit = computed(() => formData.value.value.length >= 5000);
const valueLengthPercentage = computed(() => Math.min((formData.value.value.length / 5000) * 100, 100));
const valueProgressStatus = computed(() => {
    if (formData.value.value.length >= 5000) return 'error';
    if (formData.value.value.length > 4500) return 'warning';
    return 'success';
});
const formatValueLength = computed(() => {
    const len = formData.value.value.length;
    if (len >= 1000) {
        return `${(len / 1000).toFixed(1)}k / 5k`;
    }
    return `${len} / 5000`;
});

const showPreview = computed(() => {
    return formData.value.name.trim() !== '' && isValidVariableName(formData.value.name.trim());
});

const previewUsage = computed(() => {
    return `{{${formData.value.name.trim()}}}`;
});

// Fix suggestions based on common errors
const fixSuggestions = computed(() => {
    const name = formData.value.name;
    const suggestions: { label: string; fix: string }[] = [];
    
    // Check for spaces
    if (name.includes(' ')) {
        suggestions.push({
            label: t('variables.editor.fixSuggestions.removeSpaces'),
            fix: name.replace(/\s+/g, '_')
        });
    }
    
    // Check for special characters
    if (/[^a-zA-Z0-9_\s]/.test(name)) {
        suggestions.push({
            label: t('variables.editor.fixSuggestions.removeSpecialChars'),
            fix: name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_')
        });
    }
    
    // Check for leading numbers
    if (/^\d/.test(name)) {
        suggestions.push({
            label: t('variables.editor.fixSuggestions.addPrefix'),
            fix: 'var_' + name.replace(/^\d+/, '')
        });
    }
    
    // Check for camelCase (convert to snake_case suggestion)
    if (/[a-z][A-Z]/.test(name) && !name.includes('_')) {
        suggestions.push({
            label: t('variables.editor.fixSuggestions.toSnakeCase'),
            fix: name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
        });
    }
    
    return suggestions.slice(0, 2); // Show max 2 suggestions
});

// Helper functions
function isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

function isPredefinedVariable(name: string): boolean {
    const predefinedNames = [
        "originalPrompt",
        "lastOptimizedPrompt",
        "iterateInput",
        "currentPrompt",
        "userQuestion",
        "conversationContext",
        "toolsContext",
    ];
    return predefinedNames.includes(name);
}

function isDuplicateName(name: string): boolean {
    const existingNames = props.existingNames.filter((n) =>
        isEditing.value ? n !== props.variable?.name : true,
    );
    return existingNames.includes(name);
}

// Smart validation handlers
function handleNameInput(value: string) {
    // Debounced validation
    nextTick(() => {
        validateName(value);
    });
}

function handleNameBlur() {
    isNameFocused.value = false;
    validateName(formData.value.name);
}

function handleNameFocus() {
    isNameFocused.value = true;
}

function handleValueInput() {
    // Real-time validation for value
    nextTick(() => {
        // Value validation is handled by computed properties
    });
}

function validateName(name: string) {
    const trimmed = name.trim();
    
    if (trimmed === '') {
        nameValidationState.value = { show: false, isValid: false, hasError: false, errorType: '' };
        showFixSuggestions.value = false;
        return;
    }
    
    nameValidationState.value.show = true;
    
    // Check for various errors
    if (!isValidVariableName(trimmed)) {
        nameValidationState.value.hasError = true;
        nameValidationState.value.isValid = false;
        nameValidationState.value.errorType = 'invalid';
        showFixSuggestions.value = true;
        return;
    }
    
    if (isPredefinedVariable(trimmed)) {
        nameValidationState.value.hasError = true;
        nameValidationState.value.isValid = false;
        nameValidationState.value.errorType = 'predefined';
        showFixSuggestions.value = false;
        return;
    }
    
    if (isDuplicateName(trimmed)) {
        nameValidationState.value.hasError = true;
        nameValidationState.value.isValid = false;
        nameValidationState.value.errorType = 'exists';
        showFixSuggestions.value = false;
        return;
    }
    
    // All validations passed
    nameValidationState.value.hasError = false;
    nameValidationState.value.isValid = true;
    nameValidationState.value.errorType = '';
    showFixSuggestions.value = false;
}

function applyFix(fixedName: string) {
    formData.value.name = fixedName;
    validateName(fixedName);
    toast.success(t('variables.editor.fixApplied'));
}

async function copyUsage() {
    try {
        await navigator.clipboard.writeText(previewUsage.value);
        toast.success(t('common.copySuccess'));
    } catch {
        toast.error(t('common.copyFailed'));
    }
}

// Form validation rules
const formRules: FormRules = {
    name: [
        {
            required: true,
            message: () => t("variables.editor.errors.nameRequired"),
            trigger: ["input", "blur"],
        },
        {
            validator: (_rule: unknown, value: string) => {
                if (value && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
                    return new Error(t("variables.editor.errors.nameInvalid"));
                }
            },
            trigger: ["input", "blur"],
        },
        {
            validator: (_rule: unknown, value: string) => {
                const predefinedNames = [
                    "originalPrompt",
                    "lastOptimizedPrompt",
                    "iterateInput",
                    "currentPrompt",
                    "userQuestion",
                    "conversationContext",
                    "toolsContext",
                ];
                if (value && predefinedNames.includes(value.trim())) {
                    return new Error(
                        t("variables.editor.errors.namePredefined"),
                    );
                }
            },
            trigger: ["input", "blur"],
        },
        {
            validator: (_rule: unknown, value: string) => {
                const existingNames = props.existingNames.filter((n) =>
                    isEditing.value ? n !== props.variable?.name : true,
                );
                if (value && existingNames.includes(value.trim())) {
                    return new Error(t("variables.editor.errors.nameExists"));
                }
            },
            trigger: ["input", "blur"],
        },
    ],
    value: [
        {
            required: true,
            message: () => t("variables.editor.errors.valueRequired"),
            trigger: ["input", "blur"],
        },
        {
            validator: (_rule: unknown, value: string) => {
                if (value && value.trim().length > 5000) {
                    return new Error(t("variables.editor.errors.valueTooLong"));
                }
            },
            trigger: ["input", "blur"],
        },
    ],
};

// Event handlers
const save = async () => {
    if (!formRef.value) return;

    try {
        await formRef.value.validate();
        loading.value = true;
        emit("save", {
            name: formData.value.name.trim(),
            value: formData.value.value.trim(),
        });
    } catch (error: unknown) {
        console.error("[VariableEditor] Validation error:", error);
    } finally {
        loading.value = false;
    }
};

const onAfterLeave = () => {
    emit("cancel");
};

const cancel = () => {
    localVisible.value = false;
};

// Initialization
onMounted(() => {
    if (props.variable) {
        formData.value = {
            name: props.variable.name,
            value: props.variable.value,
        };
        if ((props.variable.value ?? "") === "") {
            nextTick(() => {
                valueInputRef.value?.focus();
            });
        }
    } else {
        // Add mode: auto-focus to value input for convenience
        nextTick(() => {
            valueInputRef.value?.focus();
        });
    }
});

// Watch for props changes
watch(
    () => props.variable,
    (newVariable) => {
        if (newVariable) {
            formData.value = {
                name: newVariable.name,
                value: newVariable.value,
            };
            if ((newVariable.value ?? "") === "") {
                nextTick(() => {
                    valueInputRef.value?.focus();
                });
            }
        } else {
            formData.value = {
                name: "",
                value: "",
            };
            nameValidationState.value = { show: false, isValid: false, hasError: false, errorType: '' };
            showFixSuggestions.value = false;
        }
    },
);
</script>

<style scoped>
/* Variable Input Wrapper */
.variable-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.variable-name-input {
    flex: 1;
    transition: all 0.2s ease;
}

.variable-name-input.has-fix-suggestions {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

/* Validation Indicator */
.validation-indicator {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    pointer-events: none;
    z-index: 1;
}

.indicator-success,
.indicator-error {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: popIn 0.2s ease;
}

@keyframes popIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Fix Suggestions */
.fix-suggestions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--n-color-modal);
    border: 1px solid var(--n-border-color);
    border-top: none;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    margin-top: -1px;
    animation: slideDown 0.2s ease;
}

.suggestion-label {
    font-size: 12px;
    color: var(--n-text-color-3);
    white-space: nowrap;
}

.fix-suggestion-tag {
    cursor: pointer;
    transition: all 0.2s ease;
}

.fix-suggestion-tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Variable Name Feedback */
.variable-name-feedback {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.char-count {
    transition: color 0.2s ease;
}

.char-count.warning {
    color: #f0a020;
}

.char-count.exceeded {
    color: #d03050;
    font-weight: 500;
}

/* Variable Value Wrapper */
.variable-value-wrapper {
    position: relative;
}

.variable-value-input {
    transition: all 0.2s ease;
}

.value-length-indicator {
    position: absolute;
    bottom: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 8px;
    background: var(--n-color-modal);
    border-radius: 4px;
    font-size: 11px;
    color: var(--n-text-color-3);
    transition: all 0.2s ease;
}

.value-length-indicator.near-limit {
    color: #f0a020;
    background: rgba(240, 160, 32, 0.1);
}

.value-length-indicator.at-limit {
    color: #d03050;
    background: rgba(208, 48, 80, 0.1);
    font-weight: 500;
}

.length-text {
    white-space: nowrap;
}

.length-progress {
    width: 60px;
}

/* Preview Section */
.variable-preview-section {
    margin-top: 8px;
    animation: fadeSlide 0.3s ease;
}

@keyframes fadeSlide {
    from {
        opacity: 0;
        transform: translateY(-12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.preview-content {
    padding: 12px;
    background: var(--n-color-embedded);
    border-radius: 6px;
}

.preview-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
}

.preview-row:last-child {
    margin-bottom: 0;
}

.preview-label {
    font-size: 12px;
    color: var(--n-text-color-3);
    white-space: nowrap;
    min-width: 80px;
}

.preview-code {
    flex: 1;
    font-family: monospace;
    font-size: 13px;
    color: var(--n-primary-color);
    background: var(--n-color-modal);
    padding: 2px 6px;
    border-radius: 3px;
}

.preview-value {
    flex: 1;
    font-size: 13px;
    color: var(--n-text-color);
    word-break: break-word;
}

.copy-btn {
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.copy-btn:hover {
    opacity: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .variable-name-input,
    .variable-value-input,
    .fix-suggestion-tag,
    .value-length-indicator,
    .copy-btn {
        transition: none;
    }
    
    .indicator-success,
    .indicator-error {
        animation: none;
    }
    
    .fix-suggestions {
        animation: none;
    }
    
    .variable-preview-section {
        animation: none;
    }
}
</style>
