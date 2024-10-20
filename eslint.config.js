import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintConfigPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import "eslint-import-resolver-typescript";

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ignores: [
      "**/node_modules/",
      "build/",
      ".react-router",
      "test-results",
      "playwright-report",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
      react: {
        createClass: "createReactClass", // Regex for Component Factory to use,
        // default to "createReactClass"
        pragma: "React", // Pragma to use, default to "React"
        fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
        version: "detect", // React version. "detect" automatically picks the version you have installed.
        // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
        // Defaults to the "defaultVersion" setting and warns if missing, and to "detect" in the future
        defaultVersion: "18.3.1", // Default React version to use when the version you have installed cannot be detected.
        // If not provided, defaults to the latest React version.
      },
      formComponents: [
        // Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
        "Form",
      ],
      linkComponents: [{ name: "Link", linkAttribute: "to" }],
    },
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          groups: [
            "builtin",
            "external",
            "type",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          distinctGroup: false,
        },
      ],
    },
  },
  eslintConfigPrettierRecommended,
  // Turn off rules that conflict with prettier
  eslintConfigPrettier,
];
