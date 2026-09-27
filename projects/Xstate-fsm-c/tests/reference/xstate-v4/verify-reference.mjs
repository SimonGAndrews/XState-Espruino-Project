import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createMachine, interpret } from "xstate";

const expectedVersion = "4.38.3";
const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));

assert.equal(packageMetadata.version, expectedVersion);

const trace = [];
const machine = createMachine({
  predictableActionArguments: true,
  preserveActionOrder: true,
  initial: "Active",
  states: {
    Active: {
      entry: "entry",
      exit: "exit",
      on: {
        CHECK: { cond: "allowed", actions: "checked" },
        REENTER: { target: "Active", internal: false, actions: "external" },
        PRESERVE: { target: "Active", internal: true, actions: "internal" }
      }
    }
  }
}, {
  actions: Object.fromEntries([
    "entry", "exit", "checked", "external", "internal"
  ].map((name) => [name, () => trace.push(name)])),
  guards: { allowed: () => true },
  services: {},
  delays: {}
});

const service = interpret(machine).start();
trace.length = 0;
service.send("CHECK");
service.send("REENTER");
service.send("PRESERVE");

assert.deepEqual(trace, [
  "checked", "exit", "external", "entry", "internal"
]);

console.log(JSON.stringify({
  reference: "xstate",
  version: packageMetadata.version,
  migrationTrace: trace,
  state: service.state.value
}));
