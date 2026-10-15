import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next.js 16 removed `next lint`, so `npm run lint` runs the ESLint CLI directly
// against this native flat config. Do not reintroduce FlatCompat here: it is what
// broke linting previously ("Converting circular structure to JSON").
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Vendored react-bits blocks and the 3D asset typings rely on `any`.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;