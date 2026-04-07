import test from "node:test";
import assert from "node:assert/strict";

import { splitCommand } from "../../../dist/utils/command.js";

test("splitCommand parses quoted arguments", () => {
  const command =
    "pnpx create-next-app@latest TARGET_DIR --typescript --import-alias '@/*'";
  const parsed = splitCommand(command);

  assert.deepEqual(parsed, [
    "pnpx",
    "create-next-app@latest",
    "TARGET_DIR",
    "--typescript",
    "--import-alias",
    "@/*",
  ]);
});

test("splitCommand parses nested quotes inside double-quoted eval body", () => {
  const command = "node -e \"console.log('hello world')\"";
  const parsed = splitCommand(command);

  assert.deepEqual(parsed, ["node", "-e", "console.log('hello world')"]);
});

test("splitCommand throws on unterminated quote", () => {
  assert.throws(
    () => splitCommand("pnpm add \"@types/node"),
    /Unterminated quote/
  );
});
