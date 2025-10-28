module.exports = {
  ignorePatterns: ['dist'],
  overrides: [
    {
      files: ['**/*.{js,jsx}'],
      extends: [
        'eslint:recommended',
        'plugin:react-hooks/recommended'
      ],
      env: {
        browser: true,
        es2021: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      rules: {
        'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      },
    },
  ],
  settings: {
    react: { version: 'detect' },
  },
};
