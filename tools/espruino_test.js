// Simple Espruino test helper for FSMPlus scenarios.
// Usage:
//   node tools/espruino_test.js upload <scenario> --port /dev/ttyACM0
//   node tools/espruino_test.js prep <scenario>
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
  console.log('');
  console.log('Examples:');
  console.log('  node tools/espruino_test.js upload greenhouse --port /dev/ttyACM0');
  console.log('  node tools/espruino_test.js prep greenhouse');
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

  moduleMap.forEach(function (item) {
    console.log('Uploading', item.file, 'as', item.name);
    var args = [toolsCli, '-p', port, '--storage', item.name, item.file];
    var result = child.spawnSync('node', args, { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status);
  });
}

function prepResults(name) {
  var resultsDir = path.join(root, 'projects', 'xstate-fsmPlus', 'tests', 'results', 'espruino');
  var resultsPath = path.join(resultsDir, name + '.trace.txt');
  fs.mkdirSync(resultsDir, { recursive: true });
  if (!fs.existsSync(resultsPath)) {
    fs.writeFileSync(resultsPath, '# Paste TRACE lines here (between TRACE BEGIN/END)\n');
  }
  console.log('Prepared:', resultsPath);
}

if (cmd === 'upload') {
  uploadScenario(scenario);
} else if (cmd === 'prep') {
  prepResults(scenario);
} else {
  usage();
  process.exit(1);
}
