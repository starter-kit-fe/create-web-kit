import colors from "picocolors";
import type { VariantDefinition } from "../core/contracts.js";
import {
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
} from "../variants/index.js";
import type {
  FrameworkMeta,
  FrameworkSource,
  TemplateId,
  TemplateRegistry,
  VariantMeta,
  VariantSetupMode,
} from "./types.js";

const { blue, cyan, green, magenta, yellow } = colors;
const EMPTY_VARIANTS: readonly VariantMeta[] = Object.freeze([]);

const FRAMEWORK_SOURCES = Object.freeze([
  Object.freeze({
    id: "nextjs",
    displayName: "Next.js",
    color: cyan,
  }),
  Object.freeze({
    id: "react",
    displayName: "React",
    color: cyan,
  }),
  Object.freeze({
    id: "vue",
    displayName: "Vue",
    color: green,
  }),
  Object.freeze({
    id: "nuxt",
    displayName: "Nuxt",
    color: green,
  }),
  Object.freeze({
    id: "electron",
    displayName: "Electron",
    color: magenta,
  }),
  Object.freeze({
    id: "browser-extension",
    displayName: "Browser Extension",
    color: yellow,
  }),
  Object.freeze({
    id: "userscript",
    displayName: "Userscript",
    color: yellow,
  }),
  Object.freeze({
    id: "astro",
    displayName: "Astro",
    color: blue,
  }),
] as const satisfies readonly FrameworkSource[]);

const STRUCTURED_VARIANT_SOURCES = Object.freeze([
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
] as const satisfies readonly VariantDefinition[]);

function inferSetupMode(variant: VariantDefinition): VariantSetupMode {
  if (variant.operations && variant.operations.length > 0) {
    return "multi-step";
  }
  if (variant.customCommand) {
    return "custom-command";
  }
  return "template";
}

function toVariantMeta(variant: VariantDefinition): VariantMeta {
  return Object.freeze({
    id: variant.id,
    frameworkId: variant.framework,
    displayName: variant.displayName,
    color: variant.color,
    setupMode: inferSetupMode(variant),
    customCommand: variant.customCommand,
    stepCount: variant.operations?.length,
  });
}

function toFrameworkMeta(
  frameworkId: string,
  frameworkDisplay: string,
  frameworkColor: FrameworkMeta["color"],
  variantIds: TemplateId[]
): FrameworkMeta {
  return Object.freeze({
    id: frameworkId,
    displayName: frameworkDisplay,
    color: frameworkColor,
    variantIds: Object.freeze([...variantIds]),
  });
}

export function createTemplateRegistry(
  frameworksSource: readonly FrameworkSource[],
  variantsSource: readonly VariantDefinition[]
): TemplateRegistry {
  const frameworks: FrameworkMeta[] = [];
  const variants: VariantMeta[] = [];

  const frameworkMap = new Map<string, FrameworkMeta>();
  const variantMap = new Map<TemplateId, VariantMeta>();
  const variantsByFrameworkId = new Map<string, readonly VariantMeta[]>();

  for (const framework of frameworksSource) {
    if (frameworkMap.has(framework.id)) {
      throw new Error(`Duplicate framework id in registry: ${framework.id}`);
    }

    frameworkMap.set(
      framework.id,
      Object.freeze({
        id: framework.id,
        displayName: framework.displayName,
        color: framework.color,
        variantIds: Object.freeze([]),
      })
    );
  }

  for (const variantDefinition of variantsSource) {
    if (!frameworkMap.has(variantDefinition.framework)) {
      throw new Error(
        `Variant "${variantDefinition.id}" references unknown framework: ${variantDefinition.framework}`
      );
    }

    if (variantMap.has(variantDefinition.id)) {
      throw new Error(`Duplicate template id in registry: ${variantDefinition.id}`);
    }

    const variantMeta = toVariantMeta(variantDefinition);
    variants.push(variantMeta);
    variantMap.set(variantMeta.id, variantMeta);
  }

  for (const framework of frameworksSource) {
    const frameworkVariantMetas = variants.filter(
      (variant) => variant.frameworkId === framework.id
    );
    const variantIds = frameworkVariantMetas.map((variant) => variant.id);
    const frameworkMeta = toFrameworkMeta(
      framework.id,
      framework.displayName,
      framework.color,
      variantIds
    );

    frameworks.push(frameworkMeta);
    frameworkMap.set(frameworkMeta.id, frameworkMeta);
    variantsByFrameworkId.set(
      frameworkMeta.id,
      Object.freeze([...frameworkVariantMetas])
    );
  }

  const templateIds = Object.freeze(variants.map((variant) => variant.id));

  return Object.freeze({
    frameworks: Object.freeze([...frameworks]),
    variants: Object.freeze([...variants]),
    templateIds,
    frameworkMap,
    variantMap,
    variantsByFrameworkId,
  });
}

export const TEMPLATE_REGISTRY = createTemplateRegistry(
  FRAMEWORK_SOURCES,
  STRUCTURED_VARIANT_SOURCES
);

export const REGISTRY_FRAMEWORKS = TEMPLATE_REGISTRY.frameworks;
export const REGISTRY_VARIANTS = TEMPLATE_REGISTRY.variants;
export const REGISTRY_TEMPLATE_IDS = TEMPLATE_REGISTRY.templateIds;

export function findFrameworkMeta(frameworkId: string): FrameworkMeta | undefined {
  return TEMPLATE_REGISTRY.frameworkMap.get(frameworkId);
}

export function findVariantMeta(templateId: string): VariantMeta | undefined {
  return TEMPLATE_REGISTRY.variantMap.get(templateId);
}

export function getVariantsByFrameworkId(
  frameworkId: string
): readonly VariantMeta[] {
  return TEMPLATE_REGISTRY.variantsByFrameworkId.get(frameworkId) ?? EMPTY_VARIANTS;
}

export function isTemplateId(templateId: string): boolean {
  return TEMPLATE_REGISTRY.variantMap.has(templateId);
}
