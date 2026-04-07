export type {
  FrameworkMeta,
  FrameworkSource,
  TemplateId,
  TemplateRegistry,
  VariantMeta,
  VariantSetupMode,
} from "./types.js";

export {
  createTemplateRegistry,
  findFrameworkMeta,
  findVariantMeta,
  getVariantsByFrameworkId,
  isTemplateId,
  REGISTRY_FRAMEWORKS,
  REGISTRY_TEMPLATE_IDS,
  REGISTRY_VARIANTS,
  TEMPLATE_REGISTRY,
} from "./registry.js";
