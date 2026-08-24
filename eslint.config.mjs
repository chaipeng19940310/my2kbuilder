// Flat ESLint config — Next.js 15.5 (eslint-config-next) + typescript.
// `next lint` is deprecated in 15.5; run via `npx eslint .` (see package.json "lint").
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
    ignores: ["node_modules/**", ".next/**", ".open-next/**", "out/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
