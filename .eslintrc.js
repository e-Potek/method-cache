module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['import', 'jsx-a11y', 'meteor', 'react', 'flowtype', 'cypress'],
  extends: [
    'airbnb',
    'plugin:meteor/recommended',
    'plugin:react/recommended',
    'plugin:flowtype/recommended',
    'plugin:cypress/recommended'
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    'cypress/globals': true
  },
  globals: {},
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true
    }
  },
  rules: {
    // eslint default rules
    'class-methods-use-this': 'off',
    indent: [1, 2],
    'max-len': [
      'error',
      { code: 80, ignoreStrings: true, ignoreUrls: true, ignoreComments: true }
    ],
    'no-underscore-dangle': ['off'],
    // The most sane value, allows objects to stay on a single line if possible
    'object-curly-newline': ['error', { multiline: true, consistent: true }],
    'object-property-newline': [
      'error',
      { allowMultiplePropertiesPerLine: true }
    ],
    'multiline-ternary': ['error', 'always-multiline'],
    'no-debugger': 'off',
    'no-nested-ternary': 'off',
    'newline-per-chained-call': [2, { ignoreChainWithDepth: 3 }],

    // UPDATE: This math issue appears to be fixed, try it out for a while
    // and then remove these comments
    // Use "functions"  instead of "all" to avoid this issue:
    // https://github.com/prettier/prettier-eslint/issues/180
    // 'no-extra-parens': [
    //   'error',
    //   'functions',
    //   { nestedBinaryExpressions: false },
    // ],
    'no-mixed-operators': ['error', { allowSamePrecedence: false }],
    'function-paren-newline': ['error', 'multiline'],
    'implicit-arrow-linebreak': 'off',
    'func-names': 'off',
    curly: 'error',
    'global-require': 'off',
    'consistent-return': 'off',
    // They're very useful for confirming things, and much more performant than Dialogs
    'no-alert': 'off',

    // eslint-plugin-import rules

    // Good rule, but requires too many exceptions:
    // * core/ module (any any imports in core/, because no good package.json)
    // * /imports modules
    // * meteor/* modules
    'import/no-unresolved': 'off',
    // This rule also complains about /imports
    'import/no-absolute-path': 'off',
    // Keep an eye on this issue for a fix that allows this rule to be turned
    // on for meteor packages:
    // https://github.com/benmosher/eslint-plugin-import/issues/479
    'import/no-extraneous-dependencies': 'off',
    // FIXME: Require extensions for all files except .js and .jsx
    // this rule is being worked on:
    // https://github.com/benmosher/eslint-plugin-import/issues/984
    'import/extensions': 'off',
    // This rule is annoying when you are thinking about extending a file, so
    // you don't export default even with a single export
    'import/prefer-default-export': 'off',
    // When you wrap a module in a container before exporting you cannot access
    // the original module during tests.
    // So for testing, importing the same module as named is helpful
    'import/no-named-as-default': 'off',

    // eslint-plugin-jsx-a11y rules

    // Adding onClick handlers on non-buttons is useful
    'jsx-a11y/no-static-element-interactions': 'off',

    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',

    // eslint-plugin-react rules

    // Lots of objects are being passed around in this repo,
    // this rule makes it inconvenient to do that
    'react/forbid-prop-types': 'off',
    'react/sort-prop-types': [
      'error',
      {
        callbacksLast: false,
        ignoreCase: true,
        requiredFirst: false,
        sortShapeProp: false
      }
    ],
    // Causes bugs: https://github.com/yannickcr/eslint-plugin-react/issues/1775
    // And not always practical
    'react/jsx-one-expression-per-line': [2, { allow: 'single-child' }],
    'react/display-name': 'off',

    // Session makes perfect sense sometimes and we can use it with cookies easily
    'meteor/no-session': 'off'
  }
};
