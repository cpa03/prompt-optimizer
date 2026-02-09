/**
 * Image Parameters Configuration Module
 * Eliminates hardcoded image generation parameter values
 * Flexy loves modularity! All parameter definitions centralized.
 */

import { getEnvString, getEnvInt, getEnvFloat, getEnvBoolean } from './env';
import { IMAGE_SIZE_PRESETS, IMAGE_DEFAULTS } from './defaults';
import type { ImageParameterDefinition } from '../services/image/types';

// ============================================================================
// OpenAI Image Parameters
// ============================================================================

/** OpenAI image quality options */
export const OPENAI_QUALITY_OPTIONS = {
  /** Available quality values */
  values: (getEnvString(
    'VITE_OPENAI_QUALITY_OPTIONS',
    'auto,high,medium,low'
  ).split(',')) as string[],
  /** Default quality value */
  default: getEnvString('VITE_OPENAI_QUALITY_DEFAULT', 'auto'),
} as const;

/** OpenAI image background options */
export const OPENAI_BACKGROUND_OPTIONS = {
  /** Available background values */
  values: (getEnvString(
    'VITE_OPENAI_BACKGROUND_OPTIONS',
    'auto,transparent,opaque'
  ).split(',')) as string[],
  /** Default background value */
  default: getEnvString('VITE_OPENAI_BACKGROUND_DEFAULT', 'auto'),
} as const;

/**
 * Get OpenAI image parameter definitions
 * @returns Array of parameter definitions for OpenAI
 */
export function getOpenAIParameterDefinitions(): ImageParameterDefinition[] {
  return [
    {
      name: 'size',
      labelKey: 'image.params.size.label',
      descriptionKey: 'image.params.size.description',
      type: 'string',
      defaultValue: IMAGE_SIZE_PRESETS.openai.default,
      allowedValues: [...IMAGE_SIZE_PRESETS.openai.available],
    },
    {
      name: 'quality',
      labelKey: 'image.params.quality.label',
      descriptionKey: 'image.params.quality.description',
      type: 'string',
      defaultValue: OPENAI_QUALITY_OPTIONS.default,
      allowedValues: [...OPENAI_QUALITY_OPTIONS.values],
    },
    {
      name: 'background',
      labelKey: 'image.params.background.label',
      descriptionKey: 'image.params.background.description',
      type: 'string',
      defaultValue: OPENAI_BACKGROUND_OPTIONS.default,
      allowedValues: [...OPENAI_BACKGROUND_OPTIONS.values],
    },
  ];
}

/**
 * Get OpenAI default parameter values
 * @returns Default values object
 */
export function getOpenAIDefaultParameterValues(): Record<string, unknown> {
  return {
    size: IMAGE_SIZE_PRESETS.openai.default,
    quality: OPENAI_QUALITY_OPTIONS.default,
    background: OPENAI_BACKGROUND_OPTIONS.default,
  };
}

// ============================================================================
// SiliconFlow Image Parameters
// ============================================================================

/** SiliconFlow Kolors model parameter ranges */
export const SILICONFLOW_KOLORS_PARAMS = {
  /** Steps configuration */
  steps: {
    min: getEnvInt('VITE_SILICONFLOW_STEPS_MIN', 1),
    max: getEnvInt('VITE_SILICONFLOW_STEPS_MAX', 100),
    default: IMAGE_DEFAULTS.siliconflow.steps,
  },
  /** Guidance scale configuration */
  guidanceScale: {
    min: getEnvFloat('VITE_SILICONFLOW_GUIDANCE_MIN', 1.0),
    max: getEnvFloat('VITE_SILICONFLOW_GUIDANCE_MAX', 20.0),
    step: getEnvFloat('VITE_SILICONFLOW_GUIDANCE_STEP', 0.5),
    default: IMAGE_DEFAULTS.siliconflow.guidanceScale,
  },
  /** Seed range */
  seed: {
    min: 0,
    max: 9999999999,
  },
} as const;

/** SiliconFlow Qwen-Image model parameter ranges */
export const SILICONFLOW_QWEN_PARAMS = {
  /** Available sizes for Qwen-Image */
  sizes: (getEnvString(
    'VITE_SILICONFLOW_QWEN_SIZES',
    '1328x1328,1664x928,928x1664,1472x1140,1140x1472,1584x1056,1056x1584'
  ).split(',')) as string[],
  /** Default size */
  defaultSize: getEnvString('VITE_SILICONFLOW_QWEN_SIZE_DEFAULT', '1328x1328'),
  /** Inference steps */
  steps: {
    min: 1,
    max: 100,
    default: IMAGE_DEFAULTS.siliconflow.numInferenceSteps,
  },
  /** CFG (Classifier Free Guidance) scale */
  cfg: {
    min: getEnvFloat('VITE_SILICONFLOW_QWEN_CFG_MIN', 0.1),
    max: getEnvFloat('VITE_SILICONFLOW_QWEN_CFG_MAX', 20.0),
    step: getEnvFloat('VITE_SILICONFLOW_QWEN_CFG_STEP', 0.1),
    default: IMAGE_DEFAULTS.siliconflow.strength,
  },
} as const;

/**
 * Get SiliconFlow Kolors parameter definitions
 * @returns Array of parameter definitions for Kolors model
 */
export function getSiliconFlowKolorsParameterDefinitions(): ImageParameterDefinition[] {
  const { steps, guidanceScale } = SILICONFLOW_KOLORS_PARAMS;
  
  return [
    {
      name: 'image_size',
      labelKey: 'params.imageSize.label',
      descriptionKey: 'params.imageSize.description',
      type: 'string',
      defaultValue: IMAGE_SIZE_PRESETS.siliconflow.default,
      allowedValues: IMAGE_SIZE_PRESETS.siliconflow.available,
    },
    {
      name: 'num_inference_steps',
      labelKey: 'params.steps.label',
      descriptionKey: 'params.steps.description',
      type: 'integer',
      defaultValue: steps.default,
      minValue: steps.min,
      maxValue: steps.max,
    },
    {
      name: 'guidance_scale',
      labelKey: 'params.guidance.label',
      descriptionKey: 'params.guidance.description',
      type: 'number',
      defaultValue: guidanceScale.default,
      minValue: guidanceScale.min,
      maxValue: guidanceScale.max,
      step: guidanceScale.step,
    },
    {
      name: 'seed',
      labelKey: 'params.seed.label',
      descriptionKey: 'params.seed.description',
      type: 'integer',
      minValue: SILICONFLOW_KOLORS_PARAMS.seed.min,
      maxValue: SILICONFLOW_KOLORS_PARAMS.seed.max,
    },
    {
      name: 'negative_prompt',
      labelKey: 'params.negativePrompt.label',
      descriptionKey: 'params.negativePrompt.description',
      type: 'string',
    },
  ];
}

/**
 * Get SiliconFlow Qwen-Image parameter definitions
 * @returns Array of parameter definitions for Qwen-Image model
 */
export function getSiliconFlowQwenParameterDefinitions(): ImageParameterDefinition[] {
  const { steps, cfg, sizes, defaultSize } = SILICONFLOW_QWEN_PARAMS;
  
  return [
    {
      name: 'image_size',
      labelKey: 'params.imageSize.label',
      descriptionKey: 'params.imageSize.description',
      type: 'string',
      defaultValue: defaultSize,
      allowedValues: sizes,
    },
    {
      name: 'num_inference_steps',
      labelKey: 'params.steps.label',
      descriptionKey: 'params.steps.description',
      type: 'integer',
      defaultValue: steps.default,
      minValue: steps.min,
      maxValue: steps.max,
    },
    {
      name: 'cfg',
      labelKey: 'params.cfg.label',
      descriptionKey: 'params.cfg.description',
      type: 'number',
      defaultValue: cfg.default,
      minValue: cfg.min,
      maxValue: cfg.max,
      step: cfg.step,
    },
  ];
}

/**
 * Get SiliconFlow default parameter values based on model
 * @param modelId - The model ID
 * @returns Default values object
 */
export function getSiliconFlowDefaultParameterValues(modelId: string): Record<string, unknown> {
  const modelName = modelId.toLowerCase();
  
  // Qwen-Image defaults
  if (modelName.includes('qwen')) {
    return {
      image_size: SILICONFLOW_QWEN_PARAMS.defaultSize,
      num_inference_steps: SILICONFLOW_QWEN_PARAMS.steps.default,
      cfg: SILICONFLOW_QWEN_PARAMS.cfg.default,
    };
  }
  
  // Kolors defaults
  if (modelName.includes('kolors')) {
    return {
      image_size: IMAGE_SIZE_PRESETS.siliconflow.default,
      num_inference_steps: SILICONFLOW_KOLORS_PARAMS.steps.default,
      guidance_scale: SILICONFLOW_KOLORS_PARAMS.guidanceScale.default,
    };
  }
  
  // Generic defaults
  return {
    image_size: IMAGE_SIZE_PRESETS.siliconflow.default,
    num_inference_steps: SILICONFLOW_KOLORS_PARAMS.steps.default,
  };
}

// ============================================================================
// DashScope (Qwen) Image Parameters
// ============================================================================

/** DashScope Qwen-Image parameter configurations */
export const DASHSCOPE_PARAMS = {
  /** Available image sizes */
  sizes: (getEnvString(
    'VITE_DASHSCOPE_SIZES',
    '1664*928,1472*1140,1328*1328,1140*1472,928*1664'
  ).split(',')) as string[],
  /** Default size */
  defaultSize: getEnvString('VITE_DASHSCOPE_SIZE_DEFAULT', '1328*1328'),
  /** Seed range */
  seed: {
    min: 0,
    max: 2147483647,
  },
  /** Default parameter values */
  defaults: {
    promptExtend: getEnvBoolean('VITE_DASHSCOPE_PROMPT_EXTEND_DEFAULT', true),
    watermark: getEnvBoolean('VITE_DASHSCOPE_WATERMARK_DEFAULT', false),
  },
} as const;

/**
 * Get DashScope Qwen-Image parameter definitions
 * @returns Array of parameter definitions
 */
export function getDashScopeParameterDefinitions(): ImageParameterDefinition[] {
  return [
    {
      name: 'size',
      labelKey: 'image.params.size.label',
      descriptionKey: 'image.params.size.description',
      type: 'string',
      defaultValue: DASHSCOPE_PARAMS.defaultSize,
      allowedValues: [...DASHSCOPE_PARAMS.sizes],
    },
    {
      name: 'negative_prompt',
      labelKey: 'image.params.negativePrompt.label',
      descriptionKey: 'image.params.negativePrompt.description',
      type: 'string',
      defaultValue: '',
    },
    {
      name: 'prompt_extend',
      labelKey: 'image.params.promptExtend.label',
      descriptionKey: 'image.params.promptExtend.description',
      type: 'boolean',
      defaultValue: DASHSCOPE_PARAMS.defaults.promptExtend,
    },
    {
      name: 'watermark',
      labelKey: 'image.params.watermark.label',
      descriptionKey: 'image.params.watermark.description',
      type: 'boolean',
      defaultValue: DASHSCOPE_PARAMS.defaults.watermark,
    },
    {
      name: 'seed',
      labelKey: 'image.params.seed.label',
      descriptionKey: 'image.params.seed.description',
      type: 'integer',
      minValue: DASHSCOPE_PARAMS.seed.min,
      maxValue: DASHSCOPE_PARAMS.seed.max,
    },
  ];
}

/**
 * Get DashScope Qwen-Image-Edit parameter definitions
 * @returns Array of parameter definitions for image editing
 */
export function getDashScopeEditParameterDefinitions(): ImageParameterDefinition[] {
  return [
    {
      name: 'negative_prompt',
      labelKey: 'image.params.negativePrompt.label',
      descriptionKey: 'image.params.negativePrompt.description',
      type: 'string',
      defaultValue: '',
    },
    {
      name: 'prompt_extend',
      labelKey: 'image.params.promptExtend.label',
      descriptionKey: 'image.params.promptExtend.description',
      type: 'boolean',
      defaultValue: DASHSCOPE_PARAMS.defaults.promptExtend,
    },
    {
      name: 'watermark',
      labelKey: 'image.params.watermark.label',
      descriptionKey: 'image.params.watermark.description',
      type: 'boolean',
      defaultValue: DASHSCOPE_PARAMS.defaults.watermark,
    },
    {
      name: 'seed',
      labelKey: 'image.params.seed.label',
      descriptionKey: 'image.params.seed.description',
      type: 'integer',
      minValue: DASHSCOPE_PARAMS.seed.min,
      maxValue: DASHSCOPE_PARAMS.seed.max,
    },
  ];
}

/**
 * Get DashScope default parameter values
 * @param isEditModel - Whether this is the image editing model
 * @returns Default values object
 */
export function getDashScopeDefaultParameterValues(isEditModel: boolean): Record<string, unknown> {
  if (isEditModel) {
    return {
      prompt_extend: DASHSCOPE_PARAMS.defaults.promptExtend,
      watermark: DASHSCOPE_PARAMS.defaults.watermark,
    };
  }
  
  return {
    size: DASHSCOPE_PARAMS.defaultSize,
    prompt_extend: DASHSCOPE_PARAMS.defaults.promptExtend,
    watermark: DASHSCOPE_PARAMS.defaults.watermark,
  };
}

// ============================================================================
// Gemini Image Parameters
// ============================================================================

/** Gemini output MIME type options */
export const GEMINI_OUTPUT_TYPES = {
  /** Available output MIME types */
  values: (getEnvString(
    'VITE_GEMINI_OUTPUT_TYPES',
    'image/png,image/jpeg,image/webp'
  ).split(',')) as string[],
  /** Default output type */
  default: getEnvString('VITE_GEMINI_OUTPUT_DEFAULT', 'image/png'),
} as const;

/**
 * Get Gemini default parameter values
 * @returns Default values object
 */
export function getGeminiDefaultParameterValues(): Record<string, unknown> {
  return {
    outputMimeType: GEMINI_OUTPUT_TYPES.default,
  };
}

// ============================================================================
// SeaDream Image Parameters
// ============================================================================

/** SeaDream model parameter configurations */
export const SEEDREAM_PARAMS = {
  /** Available aspect ratios/sizes */
  sizes: IMAGE_SIZE_PRESETS.seedream.available,
  /** Default size */
  defaultSize: IMAGE_SIZE_PRESETS.seedream.default,
  /** CFG scale */
  cfg: {
    min: getEnvFloat('VITE_SEEDREAM_CFG_MIN', 1.0),
    max: getEnvFloat('VITE_SEEDREAM_CFG_MAX', 20.0),
    step: getEnvFloat('VITE_SEEDREAM_CFG_STEP', 0.5),
    default: IMAGE_DEFAULTS.seedream.cfg,
  },
  /** Generation steps */
  steps: {
    min: getEnvInt('VITE_SEEDREAM_STEPS_MIN', 1),
    max: getEnvInt('VITE_SEEDREAM_STEPS_MAX', 50),
    default: IMAGE_DEFAULTS.seedream.steps,
  },
  /** Seed */
  seed: {
    default: IMAGE_DEFAULTS.seedream.seed,
  },
  /** Sample method */
  sampleMethod: {
    values: (getEnvString(
      'VITE_SEEDREAM_SAMPLE_METHODS',
      'default,euler,euler_cfg,heun,heun_cfg,dpm2,dpm2_cfg,dpmpp_2m_sde,dpmpp_2m_sde_cfg,dpmpp_3m_sde,dpmpp_3m_sde_cfg'
    ).split(',')) as string[],
    default: IMAGE_DEFAULTS.seedream.sampleMethod,
  },
} as const;
