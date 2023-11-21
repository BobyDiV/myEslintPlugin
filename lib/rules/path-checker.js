'use strict';

/** @type {import('eslint').Rule.RuleModule} */

const path = require('path');
const { isPathRelative } = require('../helpers');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description:
        'Relative path checker for a project with Feature-Sliced-Design architecture',
      category: 'Fill me in',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    return {
      ImportDeclaration(node) {
        // example: app/entities/Articlr
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        // Полный путь до файла, который мы хотим проверить
        // example: /home/bobydiv/Newproject/src/entities/Article/index.ts
        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({
            node: node,
            message:
              'В рамках одного слайса все пути должны быть относительными!',
          });
        }
      },
    };
  },
};

const layers = {
  entities: 'entities',
  features: 'features',
  shared: 'shared',
  pages: 'pages',
  widgets: 'widgets',
};

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false;
  }
  // относительный путь
  // example: entities/Article

  const toArray = to.split('/');
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  // Полный путь до файла, который мы хотим проверить
  // example: /home/bobydiv/Newproject/src/entities/Article/index.ts

  const normalizePath = path.toNamespacedPath(from);

  const projectFrom = normalizePath.split('src')[1];
  const fromArray = projectFrom.split(/\\|\//); //используем регулярное выражение для определения разделитетя в OS(windows | ubuntu | linux)

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

/**
 * консоли ниже для проверки срабатывания функции shouldBeRelative
 */

// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article',
//     'entities/Article/fasfasfas'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article',
//     'entities/ASdasd/fasfasfas'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article',
//     'features/Article/fasfasfas'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\features\\Article',
//     'features/Article/fasfasfas'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article',
//     'app/index.tsx'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:/Users/tim/Desktop/javascript/GOOD_COURSE_test/src/entities/Article',
//     'entities/Article/asfasf/asfasf'
//   )
// );
// console.log(
//   shouldBeRelative(
//     'C:\\Users\\tim\\Desktop\\javascript\\GOOD_COURSE_test\\src\\entities\\Article',
//     '../../model/selectors/getSidebarItems'
//   )
// );
