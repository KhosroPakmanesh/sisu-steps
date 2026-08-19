export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    'color-hex-length': 'long',
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    'selector-class-pattern': null,
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['text-rendering', /^--.*font-family$/],
      },
    ],
  },
};
