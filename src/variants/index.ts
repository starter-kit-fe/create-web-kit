import type { VariantDefinition } from "../core/contracts.js";
import { astroContentVariantDefinition } from "./astro-content.js";
import { astroBlogVariantDefinition } from "./astro-blog.js";
import { browserExtensionReactVariantDefinition } from "./browser-extension-react.js";
import { nuxt3VariantDefinition } from "./nuxt3.js";
import { reactViteVariantDefinition } from "./react-vite.js";
import { electronReactVariantDefinition } from "./electron-react.js";
import { electronVueVariantDefinition } from "./electron-vue.js";
import { nextjsCsrVariantDefinition } from "./nextjs-csr.js";
import { nextjsSsrVariantDefinition } from "./nextjs-ssr.js";
import { USERSCRIPT_VARIANT } from "./userscript.js";
import { vue3VariantDefinition } from "./vue3.js";
import { wxtReactVariantDefinition } from "./wxt-react.js";

const STRUCTURED_VARIANT_DEFINITIONS = [
  astroContentVariantDefinition,
  astroBlogVariantDefinition,
  browserExtensionReactVariantDefinition,
  electronReactVariantDefinition,
  electronVueVariantDefinition,
  nextjsCsrVariantDefinition,
  nextjsSsrVariantDefinition,
  nuxt3VariantDefinition,
  reactViteVariantDefinition,
  USERSCRIPT_VARIANT,
  vue3VariantDefinition,
  wxtReactVariantDefinition,
] as const satisfies readonly VariantDefinition[];

const STRUCTURED_VARIANT_MAP = new Map<string, VariantDefinition>(
  STRUCTURED_VARIANT_DEFINITIONS.map((definition) => [definition.id, definition])
);

export function findStructuredVariantDefinition(
  templateId: string
): VariantDefinition | undefined {
  return STRUCTURED_VARIANT_MAP.get(templateId);
}

export const structuredVariantDefinitions = STRUCTURED_VARIANT_DEFINITIONS;

export {
  astroContentVariantDefinition,
  astroBlogVariantDefinition,
  browserExtensionReactVariantDefinition,
  electronReactVariantDefinition,
  electronVueVariantDefinition,
  nextjsCsrVariantDefinition,
  nextjsSsrVariantDefinition,
  nuxt3VariantDefinition,
  reactViteVariantDefinition,
  USERSCRIPT_VARIANT,
  vue3VariantDefinition,
  wxtReactVariantDefinition,
};
