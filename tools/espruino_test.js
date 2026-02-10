// Simple Espruino test helper for FSMPlus scenarios.
// Usage:
//   node tools/espruino_test.js upload <scenario> --port /dev/ttyACM0
//   node tools/espruino_test.js prep <scenario>
//   node tools/espruino_test.js run <scenario> --port /dev/ttyACM0
//
// Uploads to storage:
//   - xstate_fsmPlus
//   - <scenario>.machine
//   - <scenario>.events
//   - <scenario>.expected
//   - run_<scenario>
//
// Note: Espruino Storage has filename length limits. Some scenarios use
// short storage prefixes to keep module names within bounds.
//
// Preps a results file for pasting TRACE output from Espruino.
// If a results file already exists, a timestamped filename is created and printed.
//
// Requires EspruinoTools CLI. Set ESPRUINO_CLI to the cli path if needed.
// Example: ESPRUINO_CLI=../EspruinoTools/bin/espruino-cli.js

'use strict';

var path = require('path');
var fs = require('fs');
var child = require('child_process');

function usage() {
  console.log('Usage:');
  console.log('  node tools/espruino_test.js upload <scenario> --port <serial>');
  console.log('  node tools/espruino_test.js prep <scenario>');
  console.log('  node tools/espruino_test.js run <scenario> --port <serial>');
  console.log('');
  console.log('Examples:');
  console.log('  node tools/espruino_test.js upload greenhouse --port /dev/ttyACM0');
  console.log('  node tools/espruino_test.js prep greenhouse');
  console.log('  node tools/espruino_test.js run greenhouse --port /dev/ttyACM0');
}

function argValue(args, name) {
  var idx = args.indexOf(name);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

var args = process.argv.slice(2);
var cmd = args[0];
var scenario = args[1];

if (!cmd || !scenario) {
  usage();
  process.exit(1);
}

var root = process.cwd();
var toolsCli = process.env.ESPRUINO_CLI || 'espruino-cli';

var storagePrefixOverrides = {
  guarded_multi_parent: 'gmp'
};

function storagePrefix(name) {
  return storagePrefixOverrides[name] || name;
}

function resolveScenarioDir(name) {
  var direct = path.join(root, 'examples', name);
  if (fs.existsSync(direct)) return name;
  var dashed = name.replace(/_/g, '-');
  var dashedPath = path.join(root, 'examples', dashed);
  if (fs.existsSync(dashedPath)) return dashed;
  return null;
}

function scenarioFiles(name) {
  var dirName = resolveScenarioDir(name);
  if (!dirName) {
    console.error('Missing scenario folder for:', name);
    process.exit(1);
  }
  return {
    engine: path.join(root, 'projects', 'xstate-fsmPlus', 'src', 'xstate_fsmPlus.js'),
    machine: path.join(root, 'examples', dirName, name + '.machine.js'),
    events: path.join(root, 'examples', dirName, name + '.events.js'),
    expected: path.join(root, 'examples', dirName, name + '.expected.js'),
    runner: path.join(root, 'projects', 'xstate-fsmPlus', 'tests', 'espruino', 'run_' + name + '.js')
  };
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('Missing file:', filePath);
    process.exit(1);
  }
}

function uploadScenario(name) {
  var port = argValue(args, '--port') || process.env.ESPRUINO_PORT;
  if (!port) {
    console.error('Port is required. Use --port or set ESPRUINO_PORT.');
    process.exit(1);
  }

  var files = scenarioFiles(name);
  Object.keys(files).forEach(function (key) {
    ensureFileExists(files[key]);
  });

  var prefix = storagePrefix(name);
  var moduleMap = [
    { file: files.engine, name: 'xstate_fsmPlus' },
    { file: files.machine, name: prefix + '.machine' },
    { file: files.events, name: prefix + '.events' },
    { file: files.expected, name: prefix + '.expected' },
    { file: files.runner, name: 'run_' + name }
  ];

  var cliArgs = [toolsCli, '-p', port, '--no-ble'];
  moduleMap.forEach(function (item) {
    console.log('Uploading', item.file, 'as', item.name);
    cliArgs.push('--storage', item.name + ':' + item.file);
  });

  var result = child.spawnSync('node', cliArgs, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status);
}

function timestamp() {
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var d = new Date();
  return d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + '_' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds());
}

function prepResults(name) {
  var resultsDir = path.join(root, 'projects', 'xstate-fsmPlus', 'tests', 'results', 'espruino');
  var resultsPath = path.join(resultsDir, name + '.trace.txt');
  var relativeBase = path.relative(root, resultsDir);
  fs.mkdirSync(resultsDir, { recursive: true });
  if (fs.existsSync(resultsPath)) {
    var stamped = path.join(resultsDir, name + '.' + timestamp() + '.trace.txt');
    console.warn('Warning: results file already exists, creating new file:');
    fs.writeFileSync(stamped, '# Paste TRACE lines here (between TRACE BEGIN/END)\n');
    console.log('Prepared:', path.join(relativeBase, path.basename(stamped)));
    return stamped;
  }
  fs.writeFileSync(resultsPath, '# Paste TRACE lines here (between TRACE BEGIN/END)\n');
  console.log('Prepared:', path.join(relativeBase, path.basename(resultsPath)));
  return resultsPath;
}

if (cmd === 'upload') {
  uploadScenario(scenario);
} else if (cmd === 'prep') {
  prepResults(scenario);
} else if (cmd === 'run') {
  uploadScenario(scenario);
  prepResults(scenario);
} else {
  usage();
  process.exit(1);
}
