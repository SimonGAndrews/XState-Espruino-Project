import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createMachine, interpret } from "xstate";

const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));
assert.equal(packageMetadata.version, "4.38.3");

let sequence = 0;
let passed = true;
const caseId = "XFC-CF-COMPAT-006";
function emit(kind, fields = {}) {
  const record = {
    schema: "xfc.trace", version: 1, case: caseId, sequence: sequence++, kind
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) record[key] = value;
  }
  console.log(JSON.stringify(record));
}
function check(name, ok, actual, expected) {
  if (!ok) passed = false;
  emit("assertion", { name, pass: Boolean(ok), actual, expected });
}

emit("case", {
  name: "retained XState 4.38.3 migration aliases",
  classification: "differential"
});
emit("context", { point: "reference", value: {
  engine: "xstate",
  version: "4.38.3",
  adaptations: ["actor lifecycle API", "imports and module wrapper"]
}});

let observed = [];
const mark = (name) => (_context, event) => {
  observed.push(name);
  emit("action", { name, eventType: event.type });
};
const machine = createMachine({
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: "Active",
  states: {
    Active: {
      entry: mark("entry"),
      exit: mark("exit"),
      on: {
        CHECK: { cond: "allowed", actions: mark("checked") },
        REENTER: { target: "Active", internal: false, actions: mark("external") },
        PRESERVE: { target: "Active", internal: true, actions: mark("internal") }
      }
    }
  }
}, { guards: { allowed: () => true } });
const service = interpret(machine).start();
observed = [];
service.send("CHECK");
service.send("REENTER");
service.send("PRESERVE");
emit("snapshot", { point: "migration result", status: "active", value: service.state.value });
check("cond and internal aliases",
  observed.join("|") === "checked|exit|external|entry|internal",
  observed.join("|"), "checked|exit|external|entry|internal");
emit("result", { pass: passed });
if (!passed) process.exitCode = 1;
