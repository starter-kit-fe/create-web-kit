import test from "node:test";
import assert from "node:assert/strict";

import { getPostSetupNotes } from "../../../dist/core/runner.js";

test("getPostSetupNotes returns no messages when all optional behaviors are enabled", () => {
  const notes = getPostSetupNotes({
    noInstall: false,
    noGit: false,
  });

  assert.deepEqual(notes, []);
});

test("getPostSetupNotes describes no-install and no-git flags", () => {
  const notes = getPostSetupNotes({
    noInstall: true,
    noGit: true,
  });

  assert.equal(
    notes.includes(
      "Additional dependency install steps were skipped because --no-install is enabled."
    ),
    true
  );
  assert.equal(
    notes.includes("Git-specific setup was skipped because --no-git is enabled."),
    true
  );
});
