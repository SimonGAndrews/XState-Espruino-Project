'use strict';

// Stub adapter for Stately Studio exports.
// This file defines the import boundary described in ADR-0007.
// TODO: Implement normalization from tooling export -> FSMPlus config.

function importMachine(toolingExport) {
  if (!toolingExport) {
    throw new Error('importMachine: toolingExport is required');
  }

  // Placeholder: return the input for now to avoid breaking callers
  return toolingExport;
}

module.exports = {
  importMachine: importMachine
};
