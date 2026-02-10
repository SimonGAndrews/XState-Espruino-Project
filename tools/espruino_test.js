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
// Preps a results file for pasting TRACE output from Espruino.
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

function scenarioFiles(name) {
  return {
    engine: path.join(root, 'projects', 'xstate-fsmPlus', 'src', 'xstate_fsmPlus.js'),
    machine: path.join(root, 'examples', name, name + '.machine.js'),
    events: path.join(root, 'examples', name, name + '.events.js'),
    expected: path.join(root, 'examples', name, name + '.expected.js'),
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

  var moduleMap = [
    { file: files.engine, name: 'xstate_fsmPlus' },
    { file: files.machine, name: name + '.machine' },
    { file: files.events, name: name + '.events' },
    { file: files.expected, name: name + '.expected' },
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
  fs.mkdirSync(resultsDir, { recursive: true });
  if (fs.existsSync(resultsPath)) {
    var stamped = path.join(resultsDir, name + '.' + timestamp() + '.trace.txt');
    console.warn('Warning: results file already exists, creating new file:', stamped);
    fs.writeFileSync(stamped, '# Paste TRACE lines here (between TRACE BEGIN/END)\n');
    return;
  }
  fs.writeFileSync(resultsPath, '# Paste TRACE lines here (between TRACE BEGIN/END)\n');
  console.log('Prepared:', resultsPath);
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
