import type { VariantDefinition } from "./contracts.js";
import { findStructuredVariantDefinition } from "../variants/index.js";

export function resolveVariantDefinition(
  templateId: string
): VariantDefinition | undefined {
  return findStructuredVariantDefinition(templateId);
}
