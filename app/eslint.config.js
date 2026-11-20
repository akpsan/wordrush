import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * Layer rules from docs/app-architecture.md, enforced with the built-in `no-restricted-imports`.
 *
 * Imports between src/ folders are relative, so a folder is matched by a regex on the import
 * specifier: one or more `../` followed by the folder name. That catches `../ai` from
 * engine/x.ts and `../../ai` from engine/__tests__/x.ts alike, and never flags an import that
 * stays inside a folder (`../model/x`, `./styles/x.css`), because those do not start with
 * `../<top-level src folder>`.
 *
 * ESLint does not merge `no-restricted-imports` options between config objects (the last match
 * wins), so each override below states its complete list, built from the helpers.
 */
const DOC = 'See docs/app-architecture.md.'
const up = '^(\\.\\./)+'

const reactBan = (layer) => ({
  regex: '^react(-dom)?(/|$)',
  message: `${layer} must not import React (it is pure TypeScript). ${DOC}`,
})
const folderBan = (folder, layer) => ({
  regex: `${up}${folder}(/|$)`,
  message: `${layer} must not import from ${folder}/ (layers only depend on the ones below them). ${DOC}`,
})
const appBan = {
  regex: `${up}app(/|$)`,
  message: `Only app/ and main.tsx may import from app/: features report what happened and the app decides what comes next. ${DOC}`,
}
const rule = (...patterns) => ['error', { patterns }]
const bans = (layer, { react = false, folders }) => [
  ...(react ? [reactBan(layer)] : []),
  ...folders.map((f) => folderBan(f, layer)),
]

const FEATURES = ['game', 'menu', 'settings', 'setup', 'tutorial']

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // The code writes `arr[i]!` on purpose: it documents "this index exists", as it would have to
      // read under `noUncheckedIndexedAccess`. That compiler flag is off, so the rule would call
      // every such `!` unnecessary. Whether to turn the flag on is left to the owner.
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Plain JS/MJS scripts are not in any tsconfig: lint them without type information.
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.{js,mjs}'],
  },

  // ---- Layer rules (src/ only) ----
  {
    // Everything except app/ and main.tsx may not import app/. The folder-specific blocks below
    // replace this rule, so each of them includes the app ban itself.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**', 'src/main.tsx'],
    rules: { 'no-restricted-imports': rule(appBan) },
  },
  {
    files: ['src/engine/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': rule(
        ...bans('engine/', { react: true, folders: ['ai', 'dictionary', 'copy', 'theme', 'ui', 'platform', 'features', 'app'] }),
      ),
    },
  },
  {
    // Engine tests load a real lexicon through dictionary/, which engine code itself may not do.
    files: ['src/engine/**/__tests__/**', 'src/engine/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': rule(
        ...bans('engine/', { react: true, folders: ['ai', 'copy', 'theme', 'ui', 'platform', 'features', 'app'] }),
      ),
    },
  },
  {
    files: ['src/ai/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': rule(
        ...bans('ai/', { react: true, folders: ['copy', 'theme', 'ui', 'platform', 'features', 'app'] }),
      ),
    },
  },
  {
    files: ['src/dictionary/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': rule(
        ...bans('dictionary/', { folders: ['ai', 'copy', 'theme', 'ui', 'platform', 'features', 'app'] }),
      ),
    },
  },
  ...['copy', 'theme', 'ui', 'platform'].map((layer) => ({
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': rule(...bans(`${layer}/`, { folders: ['features', 'app'] })),
    },
  })),
  // A feature may use another feature only through its index.ts (`../settings`), never its internals.
  ...FEATURES.map((name) => {
    const others = FEATURES.filter((f) => f !== name)
    return {
      files: [`src/features/${name}/**/*.{ts,tsx}`],
      rules: {
        'no-restricted-imports': rule(appBan, {
          regex: `${up}(${others.join('|')})/(?!index(\\.ts)?$).+`,
          message: `features/${name}/ must not import another feature's internals; import the feature's index.ts (for example '../settings'). ${DOC}`,
        }),
      },
    }
  }),
)
