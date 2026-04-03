#!/usr/bin/env node

/**
 * Test script to verify IE HTML file reading functionality
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🧪 Testing IE HTML file reading...\n");

const ieHtmlPath = path.join(__dirname, "src/assets/html/ie.html");
console.log("IE HTML file path:", ieHtmlPath);

let hasFailure = false;

if (fs.existsSync(ieHtmlPath)) {
  console.log("✅ IE HTML file exists");

  const content = fs.readFileSync(ieHtmlPath, "utf-8");
  console.log("📄 File content length:", content.length, "characters");
  console.log("🎯 File starts with:", content.substring(0, 50) + "...");

  if (!content.startsWith("<!DOCTYPE html>")) {
    console.log("❌ IE HTML file does not start with <!DOCTYPE html>");
    hasFailure = true;
  }
} else {
  console.log("❌ IE HTML file not found");
  hasFailure = true;
}

const generatorPath = path.join(
  path.dirname(new URL("./src/generators/project.ts", import.meta.url).pathname),
  "../assets/html/ie.html"
);
console.log("\nGenerator resolved path:", generatorPath);

if (generatorPath !== ieHtmlPath) {
  console.log("❌ Generator path does not match expected IE HTML path");
  hasFailure = true;
}

console.log("\n✅ Test completed!");

if (hasFailure) {
  process.exit(1);
}
