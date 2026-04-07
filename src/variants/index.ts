import type { VariantDefinition } from "../core/contracts.js";
import { electronReactVariantDefinition } from "./electron-react.js";
import { electronVueVariantDefinition } from "./electron-vue.js";
import { nextjsCsrVariantDefinition } from "./nextjs-csr.js";
import { nextjsSsrVariantDefinition } from "./nextjs-ssr.js";
import { USERSCRIPT_VARIANT } from "./userscript.js";
import { vue3VariantDefinition } from "./vue3.js";

const STRUCTURED_VARIANT_DEFINITIONS = [
  electronReactVariantDefinition,
  electronVueVariantDefinition,
  nextjsCsrVariantDefinition,
  nextjsSsrVariantDefinition,
  USERSCRIPT_VARIANT,
  vue3VariantDefinition,
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
  electronReactVariantDefinition,
  electronVueVariantDefinition,
  nextjsCsrVariantDefinition,
  nextjsSsrVariantDefinition,
  USERSCRIPT_VARIANT,
  vue3VariantDefinition,
};
