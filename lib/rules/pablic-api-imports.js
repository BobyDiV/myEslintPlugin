/**
 * @fileoverview Used to check the correctness of the paths to the public API
 * @author BobyDiV
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */

const { isPathRelative } = require('../helpers');
const micromatch = require('micromatch');
const path = require('path');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description:
        'Used to check the correctness of the paths to the public API',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    // Add a schema if the rule has options
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          testFilesPatterns: {
            type: 'array',
          },
        },
      },
    ],
  },

  create(context) {
    const { alias = '', testFilesPatterns = [] } = context.options[0] ?? {};

    const checkingLayers = {
      entities: 'entities',
      features: 'features',
      pages: 'pages',
      widgets: 'widgets',
    };

    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        if (isPathRelative(importTo)) {
          return;
        }

        // [entities, article, model, types]
        const segments = importTo.split('/');
        const layer = segments[0];

        if (!checkingLayers[layer]) {
          return;
        }

        const isImportNotFromPublicApi = segments.length > 2;
        // [entities, article, testing]
        const isTestingPublicApi =
          segments[2] === 'testing' && segments.length < 4;

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report(
            node,
            'Абсолютный импорт разрешен только из Public API (index.ts)'
          );
        }

        if (isTestingPublicApi) {
          const currentFilePath = context.getFilename();
          const normalizedPath = path.toNamespacedPath(currentFilePath).replace(/\\/g, '/');

          const isCurrentFileTesting = testFilesPatterns.some((pattern) =>
            micromatch.isMatch(normalizedPath, pattern)
          );

          if (!isCurrentFileTesting) {
            context.report(
              node,
              'Тестовые данные необходимо импортировать из publicApi/testing.ts!'
            );
          }
        }
      },
    };
  },
};