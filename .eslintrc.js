module.exports = {
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-console": "off",
    "prefer-const": "warn",
    "no-var": "error",
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      rules: {
        "no-unused-vars": "off",
      },
    },
    {
      files: ["app/middleware/*.js"],
      rules: {
        "no-unused-vars": "warn",
      },
    },
  ],
};
