# Image Mode

Image mode provides Text-to-Image (T2I) and Image-to-Image (I2I, single local image) capabilities. Output is unified as base64 (default image/png), and multiple images are generated sequentially.

## Feature Scope

- Text-to-Image: Text prompts only
- Image-to-Image: Single local image + text prompt (png/jpeg only, ≤10MB)
- Output: base64 (default image/png)
- Number of images: 1-4 (sequential, not concurrent)
- Not yet supported: Multi-image fusion, image groups, mask/local editing, upscale, history, image templates

## Built-in Image Models & Environment Variables

- Gemini (image-gemini)
  - provider: `gemini`
  - defaultModel: `gemini-2.5-flash-image-preview`
  - apiKey: reuses `VITE_GEMINI_API_KEY`
- Seedream (image-seedream)
  - provider: `seedream`
  - defaultModel: `doubao-seedream-4-0-250828`
  - apiKey: reads `VITE_SEEDREAM_API_KEY` | `VITE_ARK_API_KEY` (or `process.env.ARK_API_KEY`)

> Tip: After configuring the above environment variables, built-in image models will be automatically injected and enabled as needed.

## Usage (Web)

1. Change "Advanced Mode" in the top navigation to a dropdown: select "Image Mode".
2. Enter prompts on the left; optionally select a local image (for Image-to-Image); set the number of images to generate (1-4).
3. Select an image model (from the image model manager).
4. Click "Generate", the right side displays single image base64 preview, supports download and copy.

## Model Management

- Model manager adds a new tab: "Text Models | Image Models".
- Image models page supports: Add, Edit, Enable/Disable, Delete.
- Connectivity test: Currently not available on the image page (may consider quick small image validation later).

## Validation & Limitations

- Local images: Only `image/png` or `image/jpeg`; size ≤ 10MB (validated on both frontend and backend).
- count: 1-4, sequential execution.
- Seedream requests have group image generation disabled (`sequential_image_generation='disabled'`), returns `b64_json`.

## Developer Notes

- Core layer: `ImageService` + adapters (Gemini/Seedream/OpenAI), adapter registry routes by provider.
- UI: `ImageWorkspace.vue` is the image mode workspace; calls `ImageService` through `useImageGeneration`.
- Proxy & Network: Currently only supports direct access to model providers. If you encounter CORS restrictions in browser environments, please use the desktop version or configure your own reverse proxy.
