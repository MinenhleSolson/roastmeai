import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "@typescript-eslint/ban-ts-comment": "off",             // Allow @ts-ignore and others
      "@typescript-eslint/ban-types": "off",                  // Allow use of `Function`, `object`, etc.
      "@typescript-eslint/consistent-type-assertions": "off", // Loosen type assertion rules
      "@typescript-eslint/explicit-module-boundary-types": "off", // Allow implicit return types
      "@typescript-eslint/no-unsafe-assignment": "off",       // Allow unsafe values to be assigned
      "@typescript-eslint/no-unsafe-member-access": "off",    // Allow accessing properties on unknown
      "@typescript-eslint/no-unsafe-call": "off",             // Allow calling possibly unsafe values
      "@typescript-eslint/no-unsafe-argument": "off",         // Allow unsafe function args
    },
  },
];

export default eslintConfig;
