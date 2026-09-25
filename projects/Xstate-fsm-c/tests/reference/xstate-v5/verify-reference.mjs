import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createActor, createMachine } from "xstate";

const expectedVersion = "5.33.2";
const packagePath = new URL("node_modules/xstate/package.json", import.meta.url);
const packageMetadata = JSON.parse(await readFile(packagePath, "utf8"));

assert.equal(packageMetadata.version, expectedVersion);

const machine = createMachine({
  initial: "idle",
  states: {
    idle: {
      on: {
        GO: "done"
      }
    },
    done: {}
  }
});

const observedStates = [];
const actor = createActor(machine);
actor.subscribe((snapshot) => observedStates.push(snapshot.value));
actor.start();
actor.send({ type: "GO" });

assert.deepEqual(observedStates, ["idle", "done"]);

console.log(JSON.stringify({
  reference: "xstate",
  version: packageMetadata.version,
  observedStates
}));
