import fs from "node:fs";
import path from "node:path";

type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function writeJsonFile(filePath: string, value: unknown): void {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

export function mergeJson<T extends JsonObject>(
  target: T,
  patch: Partial<T>
): T {
  const next = { ...target } as JsonObject;

  for (const [key, patchValue] of Object.entries(patch)) {
    const currentValue = next[key];

    if (isPlainObject(currentValue) && isPlainObject(patchValue)) {
      next[key] = mergeJson(currentValue, patchValue);
      continue;
    }

    next[key] = patchValue;
  }

  return next as T;
}

export function mergeJsonFile<T extends JsonObject>(
  filePath: string,
  patch: Partial<T>
): T {
  const current = readJsonFile<T>(filePath);
  const merged = mergeJson(current, patch);
  writeJsonFile(filePath, merged);
  return merged;
}

export function mergePackageJson<T extends JsonObject>(
  root: string,
  patch: Partial<T>
): T {
  return mergeJsonFile<T>(path.join(root, "package.json"), patch);
}

export function updatePackageJson<T extends JsonObject>(
  root: string,
  updater: (current: T) => T
): T {
  const filePath = path.join(root, "package.json");
  const current = readJsonFile<T>(filePath);
  const next = updater(current);
  writeJsonFile(filePath, next);
  return next;
}

export function removePaths(root: string, relativePaths: string[]): void {
  for (const relativePath of relativePaths) {
    const targetPath = path.join(root, relativePath);
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  }
}
