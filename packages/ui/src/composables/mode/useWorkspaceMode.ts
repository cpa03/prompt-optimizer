/**
 * Workspace Mode Management Composable
 * 
 * Centralizes function mode state management to reduce coupling
 * between workspace components and provide consistent mode handling.
 * 
 * @phase2-hardening - Extracted from PromptOptimizerApp.vue and related components
 * to eliminate duplication and strengthen mode contract
 */

import { ref, readonly, type Ref, computed } from 'vue'
import type { AppServices } from '../../types/services'
import { usePreferences } from '../storage/usePreferenceManager'
import { UI_SETTINGS_KEYS } from '@prompt-optimizer/core'

export type FunctionMode = 'basic' | 'pro' | 'image' | 'context'
export type BasicSubMode = 'user' | 'system'
export type ProSubMode = 'user' | 'system' | 'context-user' | 'context-system'
export type ImageSubMode = 'text2image' | 'image2image'

export interface WorkspaceModeState {
  functionMode: FunctionMode
  basicSubMode: BasicSubMode
  proSubMode: ProSubMode
  imageSubMode: ImageSubMode
}

export interface UseWorkspaceModeApi {
  // State (readonly)
  functionMode: Ref<FunctionMode>
  basicSubMode: Ref<BasicSubMode>
  proSubMode: Ref<ProSubMode>
  imageSubMode: Ref<ImageSubMode>
  
  // Computed
  isBasicMode: Ref<boolean>
  isProMode: Ref<boolean>
  isImageMode: Ref<boolean>
  isContextMode: Ref<boolean>
  currentWorkspace: Ref<string>
  
  // Actions
  setFunctionMode: (mode: FunctionMode) => Promise<void>
  setBasicSubMode: (mode: BasicSubMode) => Promise<void>
  setProSubMode: (mode: ProSubMode) => Promise<void>
  setImageSubMode: (mode: ImageSubMode) => Promise<void>
  
  // Convenience methods
  switchToBasic: (subMode?: BasicSubMode) => Promise<void>
  switchToPro: (subMode?: ProSubMode) => Promise<void>
  switchToImage: (subMode?: ImageSubMode) => Promise<void>
  switchToContext: (type: 'user' | 'system') => Promise<void>
  
  // Initialization
  ensureInitialized: () => Promise<void>
  
  // Validation
  isValidFunctionMode: (mode: unknown) => mode is FunctionMode
  isValidBasicSubMode: (mode: unknown) => mode is BasicSubMode
  isValidProSubMode: (mode: unknown) => mode is ProSubMode
  isValidImageSubMode: (mode: unknown) => mode is ImageSubMode
}

// Singleton state
let singletonState: {
  initialized: boolean
  initializing: Promise<void> | null
  functionMode: Ref<FunctionMode>
  basicSubMode: Ref<BasicSubMode>
  proSubMode: Ref<ProSubMode>
  imageSubMode: Ref<ImageSubMode>
} | null = null

const VALID_FUNCTION_MODES: FunctionMode[] = ['basic', 'pro', 'image', 'context']
const VALID_BASIC_SUB_MODES: BasicSubMode[] = ['user', 'system']
const VALID_PRO_SUB_MODES: ProSubMode[] = ['user', 'system', 'context-user', 'context-system']
const VALID_IMAGE_SUB_MODES: ImageSubMode[] = ['text2image', 'image2image']

export function useWorkspaceMode(services: Ref<AppServices | null>): UseWorkspaceModeApi {
  // Initialize singleton on first call
  if (!singletonState) {
    singletonState = {
      initialized: false,
      initializing: null,
      functionMode: ref<FunctionMode>('basic'),
      basicSubMode: ref<BasicSubMode>('user'),
      proSubMode: ref<ProSubMode>('user'),
      imageSubMode: ref<ImageSubMode>('text2image')
    }
  }

  const { getPreference, setPreference } = usePreferences(services)

  // Validation functions
  const isValidFunctionMode = (mode: unknown): mode is FunctionMode =>
    typeof mode === 'string' && VALID_FUNCTION_MODES.includes(mode as FunctionMode)

  const isValidBasicSubMode = (mode: unknown): mode is BasicSubMode =>
    typeof mode === 'string' && VALID_BASIC_SUB_MODES.includes(mode as BasicSubMode)

  const isValidProSubMode = (mode: unknown): mode is ProSubMode =>
    typeof mode === 'string' && VALID_PRO_SUB_MODES.includes(mode as ProSubMode)

  const isValidImageSubMode = (mode: unknown): mode is ImageSubMode =>
    typeof mode === 'string' && VALID_IMAGE_SUB_MODES.includes(mode as ImageSubMode)

  // Computed properties
  const isBasicMode = computed(() => singletonState!.functionMode.value === 'basic')
  const isProMode = computed(() => singletonState!.functionMode.value === 'pro')
  const isImageMode = computed(() => singletonState!.functionMode.value === 'image')
  const isContextMode = computed(() => singletonState!.functionMode.value === 'context')

  const currentWorkspace = computed(() => {
    const mode = singletonState!.functionMode.value
    switch (mode) {
      case 'basic':
        return `basic-${singletonState!.basicSubMode.value}`
      case 'pro':
        return `pro-${singletonState!.proSubMode.value}`
      case 'image':
        return `image-${singletonState!.imageSubMode.value}`
      case 'context':
        return 'context'
      default:
        return 'basic-user'
    }
  })

  // Initialization with retry logic
  const ensureInitialized = async (): Promise<void> => {
    if (singletonState!.initialized) return
    if (singletonState!.initializing) {
      await singletonState!.initializing
      return
    }

    singletonState!.initializing = (async () => {
      try {
        // Load all mode preferences
        const [
          savedFunctionMode,
          savedBasicSubMode,
          savedProSubMode,
          savedImageSubMode
        ] = await Promise.all([
          getPreference<FunctionMode>(UI_SETTINGS_KEYS.FUNCTION_MODE, 'basic'),
          getPreference<BasicSubMode>('basic-sub-mode', 'user'),
          getPreference<ProSubMode>('pro-sub-mode', 'user'),
          getPreference<ImageSubMode>('image-sub-mode', 'text2image')
        ])

        // Validate and set function mode
        if (isValidFunctionMode(savedFunctionMode)) {
          singletonState!.functionMode.value = savedFunctionMode
        } else {
          singletonState!.functionMode.value = 'basic'
          await setPreference(UI_SETTINGS_KEYS.FUNCTION_MODE, 'basic')
        }

        // Validate and set sub-modes
        singletonState!.basicSubMode.value = isValidBasicSubMode(savedBasicSubMode)
          ? savedBasicSubMode
          : 'user'
        
        singletonState!.proSubMode.value = isValidProSubMode(savedProSubMode)
          ? savedProSubMode
          : 'user'
        
        singletonState!.imageSubMode.value = isValidImageSubMode(savedImageSubMode)
          ? savedImageSubMode
          : 'text2image'

        singletonState!.initialized = true
      } catch (error) {
        // Reset initialization lock on failure
        singletonState!.initialized = false
        throw error
      } finally {
        singletonState!.initializing = null
      }
    })()

    await singletonState!.initializing
  }

  // Mode setters with validation
  const setFunctionMode = async (mode: FunctionMode): Promise<void> => {
    if (!isValidFunctionMode(mode)) {
      throw new Error(`Invalid function mode: ${mode}`)
    }
    
    await ensureInitialized()
    singletonState!.functionMode.value = mode
    await setPreference(UI_SETTINGS_KEYS.FUNCTION_MODE, mode)
  }

  const setBasicSubMode = async (mode: BasicSubMode): Promise<void> => {
    if (!isValidBasicSubMode(mode)) {
      throw new Error(`Invalid basic sub-mode: ${mode}`)
    }
    
    await ensureInitialized()
    singletonState!.basicSubMode.value = mode
    await setPreference('basic-sub-mode', mode)
  }

  const setProSubMode = async (mode: ProSubMode): Promise<void> => {
    if (!isValidProSubMode(mode)) {
      throw new Error(`Invalid pro sub-mode: ${mode}`)
    }
    
    await ensureInitialized()
    singletonState!.proSubMode.value = mode
    await setPreference('pro-sub-mode', mode)
  }

  const setImageSubMode = async (mode: ImageSubMode): Promise<void> => {
    if (!isValidImageSubMode(mode)) {
      throw new Error(`Invalid image sub-mode: ${mode}`)
    }
    
    await ensureInitialized()
    singletonState!.imageSubMode.value = mode
    await setPreference('image-sub-mode', mode)
  }

  // Convenience methods
  const switchToBasic = async (subMode: BasicSubMode = 'user'): Promise<void> => {
    await setFunctionMode('basic')
    await setBasicSubMode(subMode)
  }

  const switchToPro = async (subMode: ProSubMode = 'user'): Promise<void> => {
    await setFunctionMode('pro')
    await setProSubMode(subMode)
  }

  const switchToImage = async (subMode: ImageSubMode = 'text2image'): Promise<void> => {
    await setFunctionMode('image')
    await setImageSubMode(subMode)
  }

  const switchToContext = async (type: 'user' | 'system'): Promise<void> => {
    const subMode: ProSubMode = type === 'user' ? 'context-user' : 'context-system'
    await switchToPro(subMode)
  }

  return {
    // State (readonly)
    functionMode: readonly(singletonState.functionMode) as Ref<FunctionMode>,
    basicSubMode: readonly(singletonState.basicSubMode) as Ref<BasicSubMode>,
    proSubMode: readonly(singletonState.proSubMode) as Ref<ProSubMode>,
    imageSubMode: readonly(singletonState.imageSubMode) as Ref<ImageSubMode>,
    
    // Computed
    isBasicMode: readonly(isBasicMode) as Ref<boolean>,
    isProMode: readonly(isProMode) as Ref<boolean>,
    isImageMode: readonly(isImageMode) as Ref<boolean>,
    isContextMode: readonly(isContextMode) as Ref<boolean>,
    currentWorkspace: readonly(currentWorkspace) as Ref<string>,
    
    // Actions
    setFunctionMode,
    setBasicSubMode,
    setProSubMode,
    setImageSubMode,
    
    // Convenience methods
    switchToBasic,
    switchToPro,
    switchToImage,
    switchToContext,
    
    // Initialization
    ensureInitialized,
    
    // Validation
    isValidFunctionMode,
    isValidBasicSubMode,
    isValidProSubMode,
    isValidImageSubMode
  }
}

// For non-Vue contexts (e.g., router guards)
export function getCurrentWorkspaceMode(): WorkspaceModeState | null {
  if (!singletonState) return null
  return {
    functionMode: singletonState.functionMode.value,
    basicSubMode: singletonState.basicSubMode.value,
    proSubMode: singletonState.proSubMode.value,
    imageSubMode: singletonState.imageSubMode.value
  }
}
