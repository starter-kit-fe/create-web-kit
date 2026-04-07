import type { ColorFunc } from "../types/index.js";

export type TemplateId = string;

export type VariantSetupMode = "multi-step" | "custom-command" | "template";

export interface FrameworkMeta {
  id: string;
  displayName: string;
  color: ColorFunc;
  variantIds: readonly TemplateId[];
}

export interface VariantMeta {
  id: TemplateId;
  frameworkId: string;
  displayName: string;
  color: ColorFunc;
  setupMode: VariantSetupMode;
  customCommand?: string;
  stepCount?: number;
}

export interface TemplateRegistry {
  frameworks: readonly FrameworkMeta[];
  variants: readonly VariantMeta[];
  templateIds: readonly TemplateId[];
  frameworkMap: ReadonlyMap<string, FrameworkMeta>;
  variantMap: ReadonlyMap<TemplateId, VariantMeta>;
  variantsByFrameworkId: ReadonlyMap<string, readonly VariantMeta[]>;
}

export interface FrameworkSource {
  id: string;
  displayName: string;
  color: ColorFunc;
}
